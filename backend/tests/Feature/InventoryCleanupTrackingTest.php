<?php

namespace Tests\Feature;

use App\Http\Controllers\Api\InventoryManagement\AuditLogs\InventoryAuditLogController;
use App\Http\Controllers\Api\InventoryManagement\Batches\InventoryBatchExpiryController;
use App\Http\Controllers\Api\InventoryManagement\Orchestrators\InventoryExpiryCleanupOrchestrator;
use App\Models\InventoryManagement\InventoryAuditLog;
use App\Models\InventoryManagement\InventoryBatch;
use App\Models\InventoryManagement\InventoryCleanupRun;
use App\Models\InventoryManagement\InventoryItem;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class InventoryCleanupTrackingTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // This suite cannot use the cafe database, even if local DB settings differ.
        config([
            'database.default' => 'cleanup_test',
            'database.connections' => [
                'cleanup_test' => [
                    'driver' => 'sqlite',
                    'database' => ':memory:',
                    'prefix' => '',
                    'foreign_key_constraints' => true,
                ],
            ],
            'app.business_timezone' => 'Asia/Manila',
        ]);
        DB::purge('cleanup_test');
        $this->assertSame('sqlite', DB::getDriverName());

        // SQLite equivalent of the existing PostgreSQL UUID default, for fixtures only.
        DB::connection()->getPdo()->sqliteCreateFunction('gen_random_uuid', function () {
            return (string) Str::uuid();
        });

        $this->travelTo(Carbon::parse('2026-10-18 09:00:00', 'Asia/Manila'));
        $this->createFixtureTables();
        $this->trackingMigration()->up();
        $this->removeViewsMigration()->up();
    }

    protected function tearDown(): void
    {
        $this->travelBack();
        parent::tearDown();
    }

    public function test_daily_cleanup_links_only_deducted_batches_and_preserves_usable_stock(): void
    {
        $item = $this->createItem([
            ['quantity' => 20, 'expiration_date' => '2026-10-17'],
            ['quantity' => 10, 'expiration_date' => '2026-10-18'],
            ['quantity' => 5, 'expiration_date' => '2026-10-19'],
            ['quantity' => 4, 'expiration_date' => null],
            ['quantity' => 0, 'expiration_date' => '2026-10-17'],
        ]);

        $result = app(InventoryExpiryCleanupOrchestrator::class)->cleanupDaily();
        $run = InventoryCleanupRun::firstOrFail();
        $logs = $run->audit_logs()->orderBy('stock_before', 'desc')->get();

        $this->assertFalse($result['already_completed']);
        $this->assertSame('2026-10-18', $result['business_date']);
        $this->assertSame(2, $result['cleaned_batch_count']);
        $this->assertNotNull($run->completed_at);
        $this->assertEquals(9, $item->fresh()->current_stock);
        $this->assertEquals([0, 0, 5, 4, 0], $item->inventory_batches()->orderBy('batch_number')->pluck('quantity')->all());
        $this->assertEquals([-20, -10], $logs->pluck('quantity_change')->all());
        $this->assertEquals([39, 19], $logs->pluck('stock_before')->all());
        $this->assertEquals([19, 9], $logs->pluck('stock_after')->all());
        $this->assertSame($run->id, $logs->first()->cleanup_run->id);

        $again = app(InventoryExpiryCleanupOrchestrator::class)->cleanupDaily();
        $this->assertTrue($again['already_completed']);
        $this->assertSame(2, $again['cleaned_batch_count']);
        $this->assertSame(2, InventoryAuditLog::count());
        $this->assertSame(1, InventoryCleanupRun::count());
        $this->assertEquals(9, $item->fresh()->current_stock);
    }

    public function test_zero_batch_cleanup_is_completed_and_later_calls_do_not_scan_batches(): void
    {
        $first = app(InventoryExpiryCleanupOrchestrator::class)->cleanupDaily();
        $run = InventoryCleanupRun::firstOrFail();

        $this->assertSame(0, $first['cleaned_batch_count']);
        $this->assertNotNull($run->completed_at);
        $this->assertSame(0, $run->audit_logs()->count());

        $this->mock(InventoryBatchExpiryController::class, function ($mock) {
            $mock->shouldNotReceive('getAffectedItemIds');
        });

        $again = app(InventoryExpiryCleanupOrchestrator::class)->cleanupDaily();
        $this->assertTrue($again['already_completed']);
        $this->assertSame(0, $again['cleaned_batch_count']);
        $this->assertSame($run->completed_at, $run->fresh()->completed_at);
    }

    public function test_archived_tracked_items_are_cleaned_but_untracked_items_are_not(): void
    {
        $archived = $this->createItem([
            ['quantity' => 8, 'expiration_date' => '2026-10-18'],
        ], true, true);
        $untracked = $this->createItem([
            ['quantity' => 12, 'expiration_date' => '2026-10-17'],
        ], false);

        $result = app(InventoryExpiryCleanupOrchestrator::class)->cleanupDaily();

        $this->assertSame(1, $result['cleaned_batch_count']);
        $this->assertEquals(0, $archived->fresh()->current_stock);
        $this->assertEquals(12, $untracked->fresh()->current_stock);
        $this->assertSame($archived->id, InventoryCleanupRun::firstOrFail()->audit_logs()->firstOrFail()->inventory_item_id);
    }

    public function test_failed_cleanup_rolls_back_links_stock_and_completion_then_can_retry(): void
    {
        $item = $this->createItem([
            ['quantity' => 20, 'expiration_date' => '2026-10-17'],
            ['quantity' => 10, 'expiration_date' => '2026-10-18'],
        ]);
        $writer = new InventoryAuditLogController();
        $written = 0;
        $mock = Mockery::mock(InventoryAuditLogController::class);
        $mock->shouldReceive('store')->andReturnUsing(function ($data) use ($writer, &$written) {
            $written++;
            if ($written === 2) {
                throw new RuntimeException('Simulated audit failure.');
            }

            return $writer->store($data);
        });
        $this->app->instance(InventoryAuditLogController::class, $mock);

        try {
            app(InventoryExpiryCleanupOrchestrator::class)->cleanupDaily();
            $this->fail('The simulated failure should stop cleanup.');
        } catch (RuntimeException $exception) {
            $this->assertSame('Simulated audit failure.', $exception->getMessage());
        }

        $this->assertEquals(30, $item->fresh()->current_stock);
        $this->assertEquals([20, 10], $item->inventory_batches()->orderBy('batch_number')->pluck('quantity')->all());
        $this->assertSame(0, InventoryAuditLog::count());
        $this->assertSame(0, InventoryCleanupRun::count());

        $this->app->forgetInstance(InventoryAuditLogController::class);
        $result = app(InventoryExpiryCleanupOrchestrator::class)->cleanupDaily();
        $this->assertSame(2, $result['cleaned_batch_count']);
        $this->assertSame(2, InventoryCleanupRun::firstOrFail()->audit_logs()->count());
    }

    public function test_targeted_cleanup_does_not_claim_a_daily_run(): void
    {
        $item = $this->createItem([
            ['quantity' => 3, 'expiration_date' => '2026-10-18'],
        ]);

        $count = app(InventoryExpiryCleanupOrchestrator::class)->cleanup($item->id);

        $this->assertSame(1, $count);
        $this->assertSame(0, InventoryCleanupRun::count());
        $this->assertNull(InventoryAuditLog::firstOrFail()->cleanup_run_id);
    }

    public function test_old_completed_runs_keep_their_count_without_inventing_linked_details(): void
    {
        $run = InventoryCleanupRun::create([
            'business_date' => '2026-10-18',
            'cleaned_batch_count' => 3,
            'completed_at' => now()->toIso8601String(),
        ]);
        $result = app(InventoryExpiryCleanupOrchestrator::class)->cleanupDaily();

        $this->assertTrue($result['already_completed']);
        $this->assertSame(3, $result['cleaned_batch_count']);
        $this->assertSame(0, $run->audit_logs()->count());
    }

    public function test_migration_rollback_preserves_existing_audits(): void
    {
        $item = $this->createItem([
            ['quantity' => 3, 'expiration_date' => '2026-10-18'],
        ]);
        app(InventoryExpiryCleanupOrchestrator::class)->cleanupDaily();
        $auditId = InventoryAuditLog::firstOrFail()->id;

        $this->removeViewsMigration()->down();
        $this->trackingMigration()->down();

        $this->assertFalse(Schema::hasTable('inventory_cleanup_views'));
        $this->assertFalse(Schema::hasColumn('inventory_audit_logs', 'cleanup_run_id'));
        $this->assertTrue(InventoryAuditLog::whereKey($auditId)->exists());
        $this->assertEquals(0, $item->fresh()->current_stock);

        $this->trackingMigration()->up();
        $this->removeViewsMigration()->up();
        $this->assertNull(InventoryAuditLog::findOrFail($auditId)->cleanup_run_id);
    }

    public function test_owner_and_clerk_can_repeatedly_read_saved_deductions_without_cleanup(): void
    {
        $run = $this->createCompletedRun('2026-10-18', 2);
        $firstLog = $this->createDeduction($run, 20, 'pcs', true);
        $secondLog = $this->createDeduction($run, 100, 'g');

        // A same-day manual log must not be mistaken for part of the daily cleanup.
        $unlinkedLog = $firstLog->replicate();
        $unlinkedLog->cleanup_run_id = null;
        $unlinkedLog->save();

        $this->mock(InventoryExpiryCleanupOrchestrator::class, function ($mock) {
            $mock->shouldNotReceive('cleanupDaily');
            $mock->shouldNotReceive('cleanup');
        });

        foreach (['Owner', 'Inventory Clerk'] as $role) {
            Sanctum::actingAs($this->createStaff($role));
            $response = $this->getJson('/api/inventory-management/cleanup-summary');

            $response->assertOk()
                ->assertJsonPath('completed', true)
                ->assertJsonPath('cleanup_run_id', $run->id)
                ->assertJsonPath('cleaned_batch_count', 2)
                ->assertJsonPath('details_available', true)
                ->assertJsonMissingPath('viewed_at')
                ->assertJsonCount(2, 'batches')
                ->assertJsonMissingPath('batches.0.cost_per_unit');

            // Reopening or signing in again reads the same saved result, without view tracking.
            $this->getJson('/api/inventory-management/cleanup-summary')->assertOk()
                ->assertExactJson($response->json());

            $batches = collect($response->json('batches'))->keyBy('audit_log_id');
            $this->assertEquals(20, $batches[$firstLog->id]['quantity_removed']);
            $this->assertSame('pcs', $batches[$firstLog->id]['base_unit']);
            $this->assertTrue($batches[$firstLog->id]['archived']);
            $this->assertEquals(100, $batches[$secondLog->id]['quantity_removed']);
            $this->assertSame('g', $batches[$secondLog->id]['base_unit']);
            $this->assertSame('2026-10-18', $batches[$secondLog->id]['expiration_date']);
            $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        }

        $this->assertSame(3, InventoryAuditLog::count());
        $this->assertEquals(0, InventoryBatch::sum('quantity'));
        $this->assertEquals(0, InventoryItem::sum('current_stock'));
        $this->assertSame($run->completed_at, $run->fresh()->completed_at);
    }

    public function test_summary_distinguishes_confirmed_zero_from_not_completed(): void
    {
        Sanctum::actingAs($this->createStaff('Owner'));

        // Reading a missing run must not create or execute one.
        $this->getJson('/api/inventory-management/cleanup-summary')->assertOk()
            ->assertJsonPath('business_date', '2026-10-18')
            ->assertJsonPath('completed', false)
            ->assertJsonPath('cleaned_batch_count', null)
            ->assertJsonPath('details_available', false);
        $this->assertSame(0, InventoryCleanupRun::count());

        $run = InventoryCleanupRun::create(['business_date' => '2026-10-18']);
        $this->getJson('/api/inventory-management/cleanup-summary')->assertOk()
            ->assertJsonPath('completed', false)
            ->assertJsonPath('cleanup_run_id', null);

        $run->update(['completed_at' => now()->toIso8601String()]);
        $this->getJson('/api/inventory-management/cleanup-summary')->assertOk()
            ->assertJsonPath('completed', true)
            ->assertJsonPath('cleaned_batch_count', 0)
            ->assertJsonPath('details_available', true)
            ->assertJsonMissingPath('viewed_at')
            ->assertJsonPath('batches', []);
    }

    public function test_historical_or_incomplete_details_are_not_reported_as_zero_loss(): void
    {
        Sanctum::actingAs($this->createStaff('Inventory Clerk'));
        $run = $this->createCompletedRun('2026-10-18', 3);

        $this->getJson('/api/inventory-management/cleanup-summary')->assertOk()
            ->assertJsonPath('completed', true)
            ->assertJsonPath('cleaned_batch_count', 3)
            ->assertJsonPath('details_available', false)
            ->assertJsonPath('batches', []);

        // Do not present a partial list as the complete daily result either.
        $this->createDeduction($run, 10);
        $this->getJson('/api/inventory-management/cleanup-summary')->assertOk()
            ->assertJsonPath('cleaned_batch_count', 3)
            ->assertJsonPath('details_available', false)
            ->assertJsonPath('batches', []);
    }

    public function test_guests_cannot_read_cleanup_results(): void
    {
        $this->createCompletedRun();
        $this->getJson('/api/inventory-management/cleanup-summary')->assertUnauthorized();
    }

    public function test_cashier_and_unapproved_roles_cannot_read_details(): void
    {
        $this->createCompletedRun();

        foreach (['Cashier', 'Unapproved Role'] as $role) {
            Sanctum::actingAs($this->createStaff($role));
            $this->getJson('/api/inventory-management/cleanup-summary')->assertForbidden()
                ->assertJsonMissingPath('batches');
        }
    }

    public function test_inactive_owner_and_clerk_cannot_read_results(): void
    {
        $this->createCompletedRun();

        foreach (['Owner', 'Inventory Clerk'] as $role) {
            Sanctum::actingAs($this->createStaff($role, 'Deactivated'));
            $this->getJson('/api/inventory-management/cleanup-summary')->assertForbidden();
        }
    }

    public function test_midnight_summary_uses_the_new_philippine_day(): void
    {
        $this->createCompletedRun();
        Sanctum::actingAs($this->createStaff('Owner'));

        $this->travelTo(Carbon::parse('2026-10-18 16:00:00', 'UTC'));
        $this->getJson('/api/inventory-management/cleanup-summary')->assertOk()
            ->assertJsonPath('business_date', '2026-10-19')
            ->assertJsonPath('completed', false);

        $today = $this->createCompletedRun('2026-10-19');
        $this->getJson('/api/inventory-management/cleanup-summary')->assertOk()
            ->assertJsonPath('cleanup_run_id', $today->id)
            ->assertJsonPath('completed', true)
            ->assertJsonMissingPath('viewed_at');
        $this->assertSame(2, InventoryCleanupRun::count());
    }

    public function test_database_failures_return_errors_instead_of_empty_success(): void
    {
        $this->createCompletedRun();
        Sanctum::actingAs($this->createStaff('Owner'));
        Log::spy();

        // Break only the private in-memory fixture to simulate a failed database request.
        Schema::rename('inventory_cleanup_runs', 'unavailable_cleanup_runs');
        $this->getJson('/api/inventory-management/cleanup-summary')->assertStatus(500)
            ->assertExactJson(['message' => 'Unable to load the expiry check details. Please retry.']);
    }

    public function test_view_removal_preserves_stock_audit_links_and_daily_completion(): void
    {
        $item = $this->createItem([
            ['quantity' => 3, 'expiration_date' => '2026-10-18'],
            ['quantity' => 5, 'expiration_date' => '2026-10-19'],
        ]);
        app(InventoryExpiryCleanupOrchestrator::class)->cleanupDaily();
        $run = InventoryCleanupRun::firstOrFail();
        $audit = $run->audit_logs()->firstOrFail();

        // Recreate the pre-removal state only in this isolated test database.
        $this->removeViewsMigration()->down();
        $owner = $this->createStaff('Owner');
        DB::table('inventory_cleanup_views')->insert([
            'id' => (string) Str::uuid(),
            'cleanup_run_id' => $run->id,
            'user_id' => $owner->id,
        ]);

        $this->removeViewsMigration()->up();
        $this->assertFalse(Schema::hasTable('inventory_cleanup_views'));
        $this->assertTrue(Schema::hasColumn('inventory_audit_logs', 'cleanup_run_id'));
        $this->assertEquals(5, $item->fresh()->current_stock);
        $this->assertEquals([0, 5], $item->inventory_batches()->orderBy('batch_number')->pluck('quantity')->all());
        $this->assertSame($run->id, $audit->fresh()->cleanup_run_id);
        $this->assertSame($run->completed_at, $run->fresh()->completed_at);
        $this->assertTrue(app(InventoryExpiryCleanupOrchestrator::class)->cleanupDaily()['already_completed']);
        $this->assertSame(1, InventoryAuditLog::count());

        // Rollback restores an empty viewing table, not the deleted viewing history.
        $this->removeViewsMigration()->down();
        $this->assertSame(0, DB::table('inventory_cleanup_views')->count());
        $this->assertSame($run->id, $audit->fresh()->cleanup_run_id);
        $this->removeViewsMigration()->up();
    }

    public function test_old_view_endpoint_is_removed(): void
    {
        $run = $this->createCompletedRun();
        Sanctum::actingAs($this->createStaff('Owner'));

        $this->postJson('/api/inventory-management/cleanup-runs/' . $run->id . '/view')
            ->assertNotFound();
        $this->assertFalse(Schema::hasTable('inventory_cleanup_views'));
    }

    private function createStaff(string $roleName, string $status = 'Active'): User
    {
        $role = Role::firstOrCreate(['role_name' => $roleName]);

        return User::create(['role_id' => $role->id, 'status' => $status]);
    }

    private function createCompletedRun(string $date = '2026-10-18', int $count = 0): InventoryCleanupRun
    {
        return InventoryCleanupRun::create([
            'business_date' => $date,
            'cleaned_batch_count' => $count,
            'completed_at' => now()->toIso8601String(),
        ]);
    }

    private function createDeduction(
        InventoryCleanupRun $run,
        float $quantity,
        string $unit = 'pcs',
        bool $archived = false
    ): InventoryAuditLog {
        $item = $this->createItem([
            ['quantity' => 0, 'expiration_date' => '2026-10-18'],
        ], true, $archived);
        $item->update(['base_unit' => $unit]);

        return InventoryAuditLog::create([
            'cleanup_run_id' => $run->id,
            'inventory_item_id' => $item->id,
            'batch_id' => $item->inventory_batches()->firstOrFail()->id,
            'action' => 'Expired',
            'source' => 'System',
            'quantity_change' => -$quantity,
            'stock_before' => $quantity,
            'stock_after' => 0,
            'performed_by' => null,
        ]);
    }

    private function removeViewsMigration()
    {
        return require database_path('migrations/2026_10_18_000002_remove_inventory_cleanup_views.php');
    }

    private function trackingMigration()
    {
        return require database_path('migrations/2026_10_18_000001_add_inventory_cleanup_tracking.php');
    }

    private function createItem(array $batches, bool $trackExpiry = true, bool $archived = false): InventoryItem
    {
        $item = InventoryItem::create([
            'item_name' => 'Cleanup test ingredient',
            'base_unit' => 'pcs',
            'current_stock' => array_sum(array_column($batches, 'quantity')),
            'cost_per_unit' => 10,
            'track_expiry' => $trackExpiry,
            'archived' => $archived,
        ]);

        foreach ($batches as $index => $batch) {
            InventoryBatch::create([
                'inventory_item_id' => $item->id,
                'batch_number' => 'TEST-B' . ($index + 1),
                'quantity' => $batch['quantity'],
                'expiration_date' => $batch['expiration_date'],
                'received_date' => '2026-10-01',
                'created_at' => '2026-10-01 00:00:00',
                'unit_cost' => 10,
            ]);
        }

        return $item;
    }

    private function createFixtureTables(): void
    {
        // Minimal existing tables for these tests, not the production migration chain.
        Schema::create('roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('role_name');
        });

        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('role_id')->nullable();
            $table->string('status')->default('Active');
        });

        Schema::create('inventory_cleanup_runs', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(gen_random_uuid())'));
            $table->date('business_date')->unique();
            $table->integer('cleaned_batch_count')->default(0);
            $table->timestampTz('completed_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();
        });

        Schema::create('inventory_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('item_name');
            $table->string('base_unit');
            $table->decimal('current_stock', 14, 4);
            $table->decimal('cost_per_unit', 14, 4);
            $table->boolean('track_expiry');
            $table->boolean('archived');
        });

        Schema::create('inventory_batches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('inventory_item_id');
            $table->string('batch_number');
            $table->decimal('quantity', 14, 4);
            $table->date('expiration_date')->nullable();
            $table->date('received_date');
            $table->timestampTz('created_at');
            $table->decimal('unit_cost', 14, 4);
        });

        Schema::create('inventory_audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('inventory_item_id');
            $table->uuid('batch_id')->nullable();
            $table->uuid('transaction_reference')->nullable();
            $table->string('action');
            $table->string('source');
            $table->decimal('quantity_change', 14, 4);
            $table->decimal('stock_before', 14, 4);
            $table->decimal('stock_after', 14, 4);
            $table->text('reason_reference')->nullable();
            $table->uuid('performed_by')->nullable();
            $table->timestampTz('created_at')->useCurrent();
        });
    }
}
