<?php

namespace Tests\Feature;

use App\Http\Controllers\Api\ExpenseManagement\Expenses\ExpenseController;
use App\Models\ExpenseManagement\Expense;
use App\Models\ExpenseManagement\ExpenseArchiveRun;
use App\Services\ExpenseManagement\ExpenseYearlyArchiveService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use RuntimeException;
use Tests\TestCase;

class ExpenseYearlyArchiveTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Never use the cafe database, even when a local config is cached.
        config([
            'database.default' => 'expense_archive_test',
            'database.connections' => [
                'expense_archive_test' => [
                    'driver' => 'sqlite',
                    'database' => ':memory:',
                    'prefix' => '',
                    'foreign_key_constraints' => true,
                ],
            ],
            'app.business_timezone' => 'Asia/Manila',
            'cache.default' => 'array',
        ]);
        DB::purge('expense_archive_test');
        $this->assertSame('sqlite', DB::getDriverName());
        $this->assertSame(':memory:', DB::connection()->getDatabaseName());

        Schema::create('expense_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('category_name');
            $table->boolean('auto_archive_yearly')->default(false);
        });
        Schema::create('expenses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('category_id')->nullable();
            $table->string('description');
            $table->decimal('amount', 12, 2);
            $table->date('expense_date');
            $table->uuid('recorded_by')->nullable();
            $table->boolean('archived')->default(false);
            $table->uuid('archived_by')->nullable();
            $table->timestampTz('archived_at')->nullable();
        });
        $this->trackingMigration()->up();
        $this->travelTo(Carbon::parse('2026-12-31 16:10:00', 'UTC'));
    }

    protected function tearDown(): void
    {
        ExpenseArchiveRun::flushEventListeners();
        $this->travelBack();
        parent::tearDown();
    }

    public function test_only_enabled_previous_year_expenses_are_archived(): void
    {
        $enabled = $this->category('Rent', true);
        $disabled = $this->category('Salary', false);
        // Even a direct database edit must not make purchases eligible.
        $purchase = $this->category(' inventory PURCHASE ', true);
        $old = $this->expense($enabled, '2026-12-31');
        $older = $this->expense($enabled, '2025-01-01');
        $current = $this->expense($enabled, '2027-01-01');
        $future = $this->expense($enabled, '2028-01-01');
        $off = $this->expense($disabled, '2026-01-01');
        $inventory = $this->expense($purchase, '2026-01-01');
        $uncategorized = $this->expense(null, '2026-01-01');
        $manual = $this->expense($enabled, '2026-01-01', [
            'archived' => true,
            'archived_by' => (string) Str::uuid(),
            'archived_at' => '2026-12-15 00:00:00',
        ]);
        $originalManual = $manual->fresh()->getAttributes();

        $result = app(ExpenseYearlyArchiveService::class)->archive();
        $run = ExpenseArchiveRun::firstOrFail();

        $this->assertSame(2027, $result['business_year']);
        $this->assertSame(2, $result['archived_count']);
        $this->assertFalse($result['already_completed']);
        $this->assertNotNull($run->completed_at);
        foreach ([$old, $older] as $expense) {
            $saved = $expense->fresh();
            $this->assertTrue((bool) $saved->archived);
            $this->assertSame($run->id, $saved->yearly_archive_run_id);
            $this->assertNull($saved->archived_by);
            $this->assertEquals($expense->amount, $saved->amount);
            $this->assertSame($expense->recorded_by, $saved->recorded_by);
        }
        foreach ([$current, $future, $off, $inventory, $uncategorized] as $expense) {
            $this->assertFalse((bool) $expense->fresh()->archived);
        }
        $this->assertSame($originalManual, $manual->fresh()->getAttributes());
    }

    public function test_preview_is_read_only_and_command_defaults_to_preview(): void
    {
        $expense = $this->expense($this->category('Rent', true), '2026-12-31');
        $preview = app(ExpenseYearlyArchiveService::class)->preview();
        $this->assertSame('2027-01-01', $preview['cutoff_date']);
        $this->assertSame(1, $preview['eligible_count']);
        $this->assertFalse($preview['already_completed']);
        $this->artisan('expenses:archive-yearly')
            ->expectsOutputToContain('Preview only. No records changed.')
            ->expectsOutputToContain('Eligible active expenses: 1')
            ->assertSuccessful();
        $this->assertSame(0, ExpenseArchiveRun::count());
        $this->assertFalse((bool) $expense->fresh()->archived);
    }

    public function test_apply_is_blocked_before_manila_new_year(): void
    {
        $this->travelTo(Carbon::parse('2026-12-31 15:59:59', 'UTC'));
        $expense = $this->expense($this->category('Rent', true), '2025-12-31');
        $this->artisan('expenses:archive-yearly --apply')
            ->expectsOutputToContain('January 1, Philippine time')
            ->assertFailed();
        $this->assertSame(0, ExpenseArchiveRun::count());
        $this->assertFalse((bool) $expense->fresh()->archived);
    }

    public function test_retry_does_not_rearchive_restored_or_new_backdated_records(): void
    {
        $category = $this->category('Rent', true);
        $expense = $this->expense($category, '2026-12-31');
        $service = app(ExpenseYearlyArchiveService::class);
        $service->archive();
        app(ExpenseController::class)->unarchive($expense->id);
        $this->assertNull($expense->fresh()->yearly_archive_run_id);
        $this->assertNull($expense->fresh()->archived_at);
        $newBackdated = $this->expense($category, '2026-01-01');

        $again = $service->archive();
        $this->assertTrue($again['already_completed']);
        $this->assertSame(1, ExpenseArchiveRun::count());
        $this->assertFalse((bool) $expense->fresh()->archived);
        $this->assertFalse((bool) $newBackdated->fresh()->archived);

        $this->travelTo(Carbon::parse('2028-01-01 00:10:00', 'Asia/Manila'));
        $nextYear = $service->archive();
        $this->assertFalse($nextYear['already_completed']);
        $this->assertSame(2, $nextYear['archived_count']);
        $this->assertSame(2, ExpenseArchiveRun::count());
    }

    public function test_failed_completion_rolls_back_expenses_and_run_then_can_retry(): void
    {
        $expense = $this->expense($this->category('Rent', true), '2026-12-31');
        ExpenseArchiveRun::saving(function ($run) {
            if ($run->completed_at !== null) throw new RuntimeException('Simulated failure');
        });
        try {
            app(ExpenseYearlyArchiveService::class)->archive();
            $this->fail('Expected completion failure.');
        } catch (RuntimeException $exception) {
            $this->assertSame('Simulated failure', $exception->getMessage());
        } finally {
            ExpenseArchiveRun::flushEventListeners();
        }
        $this->assertSame(0, ExpenseArchiveRun::count());
        $this->assertFalse((bool) $expense->fresh()->archived);
        $this->assertNull($expense->fresh()->yearly_archive_run_id);
        $this->assertSame(1, app(ExpenseYearlyArchiveService::class)->archive()['archived_count']);
    }

    public function test_zero_record_run_is_still_completed_once(): void
    {
        $service = app(ExpenseYearlyArchiveService::class);
        $this->assertSame(0, $service->archive()['archived_count']);
        $this->assertNotNull(ExpenseArchiveRun::firstOrFail()->completed_at);
        $expense = $this->expense($this->category('Rent', true), '2026-01-01');
        $this->assertTrue($service->archive()['already_completed']);
        $this->assertFalse((bool) $expense->fresh()->archived);
    }

    public function test_manual_archive_after_restore_clears_automatic_attribution(): void
    {
        $expense = $this->expense($this->category('Rent', true), '2026-12-31');
        app(ExpenseYearlyArchiveService::class)->archive();
        $controller = app(ExpenseController::class);
        $controller->unarchive($expense->id);
        $actorId = (string) Str::uuid();
        $request = Request::create('/test', 'DELETE');
        $request->setUserResolver(function () use ($actorId) {
            return (object) ['id' => $actorId];
        });
        $controller->destroy($request, $expense->id);
        $saved = $expense->fresh();
        $this->assertSame($actorId, $saved->archived_by);
        $this->assertNull($saved->yearly_archive_run_id);
    }

    public function test_apply_command_and_yearly_schedule_are_registered(): void
    {
        $this->expense($this->category('Rent', true), '2026-12-31');
        $this->artisan('expenses:archive-yearly --apply')
            ->expectsOutputToContain('1 expense(s) archived for 2027.')
            ->assertSuccessful();
        $this->artisan('expenses:archive-yearly --apply')
            ->expectsOutputToContain('already completed for 2027')
            ->assertSuccessful();
        $this->artisan('schedule:list')
            ->expectsOutputToContain('expenses:archive-yearly --apply')
            ->assertSuccessful();
    }

    public function test_tracking_migration_can_roll_back_without_removing_expenses(): void
    {
        $this->trackingMigration()->down();
        $this->assertTrue(Schema::hasTable('expenses'));
        $this->assertFalse(Schema::hasColumn('expenses', 'yearly_archive_run_id'));
        $this->assertFalse(Schema::hasTable('expense_archive_runs'));
    }

    public function test_maintenance_endpoints_reject_missing_or_invalid_secrets(): void
    {
        $this->mock(ExpenseYearlyArchiveService::class, function ($mock) {
            $mock->shouldNotReceive('preview');
            $mock->shouldNotReceive('archive');
        });
        config(['services.maintenance.token' => 'expense-maintenance-test-secret']);
        $this->getJson('/api/maintenance/expenses/archive-yearly/preview')->assertUnauthorized();
        $this->postJson('/api/maintenance/expenses/archive-yearly')->assertUnauthorized();
        $this->withToken('not-a-maintenance-token')
            ->postJson('/api/maintenance/expenses/archive-yearly')->assertUnauthorized();

        config(['services.maintenance.token' => '']);
        $this->getJson('/api/maintenance/expenses/archive-yearly/preview')->assertStatus(503);
        $this->postJson('/api/maintenance/expenses/archive-yearly')->assertStatus(503);
        $this->assertSame(0, ExpenseArchiveRun::count());
    }

    public function test_protected_http_preview_never_changes_records(): void
    {
        config(['services.maintenance.token' => 'expense-maintenance-test-secret']);
        $expense = $this->expense($this->category('Rent', true), '2026-12-31');
        $this->withToken('expense-maintenance-test-secret')
            ->getJson('/api/maintenance/expenses/archive-yearly/preview')
            ->assertOk()
            ->assertExactJson([
                'business_year' => 2027,
                'cutoff_date' => '2027-01-01',
                'eligible_count' => 1,
                'already_completed' => false,
            ]);
        $this->assertSame(0, ExpenseArchiveRun::count());
        $this->assertFalse((bool) $expense->fresh()->archived);
    }

    public function test_http_trigger_preserves_completed_year_and_restore_guards(): void
    {
        config(['services.maintenance.token' => 'expense-maintenance-test-secret']);
        $expense = $this->expense($this->category('Rent', true), '2026-12-31');
        $this->withToken('expense-maintenance-test-secret')
            ->postJson('/api/maintenance/expenses/archive-yearly', ['year' => 2099])
            ->assertOk()
            ->assertExactJson([
                'business_year' => 2027,
                'already_completed' => false,
                'archived_count' => 1,
            ]);
        app(ExpenseController::class)->unarchive($expense->id);
        $this->withToken('expense-maintenance-test-secret')
            ->postJson('/api/maintenance/expenses/archive-yearly')
            ->assertOk()
            ->assertJsonPath('already_completed', true);
        $this->assertSame(1, ExpenseArchiveRun::count());
        $this->assertFalse((bool) $expense->fresh()->archived);
    }

    public function test_http_trigger_rejects_dates_outside_manila_january_first(): void
    {
        config(['services.maintenance.token' => 'expense-maintenance-test-secret']);
        $this->travelTo(Carbon::parse('2026-12-31 15:59:59', 'UTC'));
        $this->withToken('expense-maintenance-test-secret')
            ->postJson('/api/maintenance/expenses/archive-yearly', ['year' => 2027])
            ->assertStatus(409)
            ->assertJsonPath('message', 'Yearly archiving can only be applied on January 1, Philippine time.');
        $this->assertSame(0, ExpenseArchiveRun::count());
    }

    public function test_maintenance_requests_are_rate_limited(): void
    {
        config(['services.maintenance.token' => 'expense-maintenance-test-secret']);
        for ($attempt = 0; $attempt < 6; $attempt++) {
            $this->withToken('expense-maintenance-test-secret')
                ->getJson('/api/maintenance/expenses/archive-yearly/preview')->assertOk();
        }
        $this->withToken('expense-maintenance-test-secret')
            ->getJson('/api/maintenance/expenses/archive-yearly/preview')->assertStatus(429);
        $this->assertSame(0, ExpenseArchiveRun::count());
    }

    public function test_maintenance_failures_report_without_exposing_private_details(): void
    {
        config(['services.maintenance.token' => 'expense-maintenance-test-secret']);
        $this->mock(ExpenseYearlyArchiveService::class, function ($mock) {
            $mock->shouldReceive('preview')->once()->andThrow(new RuntimeException('Private database detail'));
            $mock->shouldReceive('archive')->once()->andThrow(new RuntimeException('Private database detail'));
        });
        $this->mock(\Illuminate\Contracts\Debug\ExceptionHandler::class, function ($mock) {
            $mock->shouldReceive('report')->twice();
        });
        $this->withToken('expense-maintenance-test-secret')
            ->getJson('/api/maintenance/expenses/archive-yearly/preview')
            ->assertStatus(500)
            ->assertExactJson(['message' => 'Unable to preview yearly expense archiving. Please retry.']);
        $this->withToken('expense-maintenance-test-secret')
            ->postJson('/api/maintenance/expenses/archive-yearly')
            ->assertStatus(500)
            ->assertExactJson(['message' => 'Unable to complete yearly expense archiving. Please retry.']);
        $this->assertSame(0, ExpenseArchiveRun::count());
    }

    private function category(string $name, bool $enabled): string
    {
        $id = (string) Str::uuid();
        DB::table('expense_categories')->insert([
            'id' => $id,
            'category_name' => $name,
            'auto_archive_yearly' => $enabled,
        ]);

        return $id;
    }

    private function expense(?string $categoryId, string $date, array $extra = []): Expense
    {
        return Expense::create(array_merge([
            'category_id' => $categoryId,
            'description' => 'Test expense',
            'amount' => 100,
            'expense_date' => $date,
            'recorded_by' => (string) Str::uuid(),
        ], $extra));
    }

    private function trackingMigration()
    {
        return require database_path('migrations/2026_10_26_000003_add_expense_yearly_archive_tracking.php');
    }
}
