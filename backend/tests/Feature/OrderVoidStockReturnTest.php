<?php

namespace Tests\Feature;

use App\Http\Controllers\Api\InventoryManagement\AuditLogs\InventoryAuditLogController;
use App\Models\InventoryManagement\InventoryAuditLog;
use App\Models\InventoryManagement\InventoryBatch;
use App\Models\InventoryManagement\InventoryItem;
use App\Models\OrderManagement\Order;
use App\Models\OrderManagement\OrderVoidRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class OrderVoidStockReturnTest extends TestCase
{
    private User $owner;
    private User $cashier;

    protected function setUp(): void
    {
        parent::setUp();
        // Replace all connections before touching fixtures; never use cafe data.
        config([
            'database.default' => 'void_stock_test',
            'database.connections' => ['void_stock_test' => [
                'driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '',
                'foreign_key_constraints' => true,
            ]],
            'cache.default' => 'array',
            'app.business_timezone' => 'Asia/Manila',
        ]);
        DB::purge('void_stock_test');
        $this->assertSame('sqlite', DB::getDriverName());
        $this->assertSame(':memory:', DB::connection()->getDatabaseName());
        $this->createTables();
        (require database_path('migrations/2026_10_27_000001_create_order_void_requests_table.php'))->up();
        (require database_path('migrations/2026_10_29_000001_link_checkout_stock_deductions_to_orders.php'))->up();
        $this->returnMigration()->up();
        $this->owner = $this->createStaff('Owner');
        $this->cashier = $this->createStaff('Cashier');
        Sanctum::actingAs($this->owner);
    }

    public function test_return_restores_original_batches_once_and_records_owner_audit(): void
    {
        $sale = $this->createSale();
        // Include database defaults and raw stored types before comparing receipts.
        $before = $sale['order']->fresh()->getAttributes();
        $batchMetadata = $sale['item']->inventory_batches()->orderBy('received_date')->get(['id', 'expiration_date', 'unit_cost'])->toArray();
        $this->approve($sale)->assertOk()->assertJsonPath('void_request.stock_handling', 'return_stock');
        $returns = InventoryAuditLog::where('action', 'Void Stock Return')->orderBy('stock_before')->get();

        $this->assertCount(2, $returns);
        $this->assertEqualsCanonicalizing([40, 20], $returns->pluck('quantity_change')->all());
        $runningStock = 90;
        foreach ($returns as $log) {
            $this->assertEquals($runningStock, $log->stock_before);
            $runningStock += (float) $log->quantity_change;
            $this->assertEquals($runningStock, $log->stock_after);
        }
        $this->assertEquals(150, $runningStock);
        $this->assertSame(1, $returns->pluck('transaction_reference')->unique()->count());
        $this->assertEquals(150, $sale['item']->fresh()->current_stock);
        $this->assertEquals(0.1, $sale['item']->fresh()->cost_per_unit);
        $this->assertEquals([100, 50], $sale['item']->inventory_batches()->orderBy('received_date')->pluck('quantity')->all());
        $this->assertSame($batchMetadata, $sale['item']->inventory_batches()->orderBy('received_date')->get(['id', 'expiration_date', 'unit_cost'])->toArray());
        foreach ($returns as $log) {
            $original = InventoryAuditLog::findOrFail($log->original_deduction_id);
            $this->assertSame($original->batch_id, $log->batch_id);
            $this->assertSame($sale['order']->id, $log->order_id);
            $this->assertSame($sale['request']->id, $log->void_request_id);
            $this->assertSame($this->owner->id, $log->performed_by);
            $this->assertSame('Order Void', $log->source);
            $this->assertStringContainsString($sale['order']->order_number, $log->reason_reference);
        }
        $after = $sale['order']->fresh()->getAttributes();
        $this->assertSame('Voided', $after['status']);
        unset($before['status'], $after['status']);
        $this->assertEquals($before, $after);
        $this->assertSame(2, $sale['order']->stock_deductions()->count());
        $this->assertSame(0, InventoryAuditLog::where('action', 'Purchase')->count());
        $this->getJson('/api/order-management/init')->assertOk()
            ->assertJsonPath('orders.0.void_requests.0.stock_handling', 'return_stock');
    }

    public function test_keep_deducted_voids_without_any_stock_movement(): void
    {
        $sale = $this->createSale(false);
        $this->approve($sale, 'keep_deducted')->assertOk();
        $this->assertSame('Voided', $sale['order']->fresh()->status);
        $this->assertEquals(90, $sale['item']->fresh()->current_stock);
        $this->assertSame(2, InventoryAuditLog::count());
        $this->assertSame('keep_deducted', $sale['request']->fresh()->stock_handling);
    }

    public function test_rejection_ignores_stock_choice_and_leaves_sale_unchanged(): void
    {
        $sale = $this->createSale();
        $this->patchJson($this->url($sale), [
            'decision' => 'rejected', 'review_reason' => 'Receipt is correct.', 'stock_handling' => 'return_stock',
        ])->assertOk()->assertJsonPath('void_request.stock_handling', null);
        $this->assertSame('Completed', $sale['order']->fresh()->status);
        $this->assertEquals(90, $sale['item']->fresh()->current_stock);
        $this->assertSame(2, InventoryAuditLog::count());
    }

    public function test_approval_requires_an_explicit_valid_stock_choice(): void
    {
        $sale = $this->createSale();
        foreach ([null, '', 'partial', 'restock'] as $choice) {
            $this->approve($sale, $choice)->assertUnprocessable()->assertJsonValidationErrors('stock_handling');
        }
        $this->assertSame('pending', $sale['request']->fresh()->status);
        $this->assertEquals(90, $sale['item']->fresh()->current_stock);
    }

    public function test_legacy_and_empty_deduction_sets_cannot_return_stock(): void
    {
        $legacy = $this->createSale(false);
        $this->approve($legacy)->assertUnprocessable()->assertJsonValidationErrors('stock_handling');
        $empty = $this->createSale();
        InventoryAuditLog::where('order_id', $empty['order']->id)->delete();
        $this->approve($empty)->assertUnprocessable()->assertJsonValidationErrors('stock_handling');
        $this->assertSame('Completed', $legacy['order']->fresh()->status);
        $this->assertSame('Completed', $empty['order']->fresh()->status);
    }

    public function test_expired_batch_fails_the_whole_return_without_reviving_stock(): void
    {
        $sale = $this->createSale();
        $sale['batches'][1]->update(['expiration_date' => now('Asia/Manila')->toDateString()]);
        $this->approve($sale)->assertUnprocessable()->assertJsonValidationErrors('stock_handling');
        $this->assertUnchanged($sale);
        $this->approve($sale, 'keep_deducted')->assertOk();
    }

    public function test_missing_batch_fails_without_creating_a_replacement_batch(): void
    {
        $sale = $this->createSale();
        $sale['batches'][1]->delete();
        $this->approve($sale)->assertUnprocessable()->assertJsonValidationErrors('stock_handling');
        $this->assertEquals(90, $sale['item']->fresh()->current_stock);
        $this->assertEquals(60, $sale['batches'][0]->fresh()->quantity);
        $this->assertSame(1, InventoryBatch::count());
        $this->assertSame(2, InventoryAuditLog::count());
        $this->assertSame('pending', $sale['request']->fresh()->status);
    }

    public function test_archived_ingredient_cannot_be_returned_but_can_stay_deducted(): void
    {
        $sale = $this->createSale();
        $sale['item']->update(['archived' => true]);
        $this->approve($sale)->assertUnprocessable()->assertJsonValidationErrors('stock_handling');
        $this->assertUnchanged($sale);
        $this->approve($sale, 'keep_deducted')->assertOk();
    }

    public function test_same_decision_retry_is_read_only_and_cannot_change_stock_choice(): void
    {
        $sale = $this->createSale();
        $this->approve($sale)->assertOk();
        $before = $sale['request']->fresh()->getAttributes();
        $this->approve($sale)->assertOk()->assertJsonPath('already_reviewed', true);
        $this->assertSame($before, $sale['request']->fresh()->getAttributes());
        $this->approve($sale, 'keep_deducted')->assertConflict();
        $this->assertEquals(150, $sale['item']->fresh()->current_stock);
        $this->assertSame(4, InventoryAuditLog::count());
    }

    public function test_cashier_clerk_and_other_owner_cannot_replay_an_approval(): void
    {
        $sale = $this->createSale();
        foreach ([$this->cashier, $this->createStaff('Inventory Clerk')] as $staff) {
            Sanctum::actingAs($staff);
            $this->approve($sale)->assertForbidden();
        }
        Sanctum::actingAs($this->owner);
        $this->approve($sale)->assertOk();
        Sanctum::actingAs($this->createStaff('Owner'));
        $this->approve($sale)->assertConflict();
        $this->assertSame(4, InventoryAuditLog::count());
    }

    public function test_audit_failure_rolls_back_all_stock_and_review_writes(): void
    {
        $sale = $this->createSale();
        $realAudit = new InventoryAuditLogController();
        $attempt = 0;
        $audit = Mockery::mock(InventoryAuditLogController::class);
        $audit->shouldReceive('store')->twice()->andReturnUsing(function (array $data) use ($realAudit, &$attempt) {
            $attempt++;
            if ($attempt === 2) throw new RuntimeException('Simulated return audit failure.');
            return $realAudit->store($data);
        });
        $this->app->instance(InventoryAuditLogController::class, $audit);
        $this->approve($sale)->assertServerError();
        $this->assertUnchanged($sale);
    }

    public function test_order_write_failure_rolls_back_stock_return_and_review(): void
    {
        $sale = $this->createSale();
        $dispatcher = Order::getEventDispatcher();
        Order::setEventDispatcher(clone $dispatcher);
        Order::updating(function ($order) {
            if ($order->status === 'Voided') throw new RuntimeException('Simulated order write failure.');
        });
        try {
            $this->approve($sale)->assertServerError();
        } finally {
            Order::setEventDispatcher($dispatcher);
        }
        $this->assertUnchanged($sale);
    }

    public function test_database_allows_only_one_return_per_original_deduction(): void
    {
        $sale = $this->createSale();
        $this->approve($sale)->assertOk();
        $return = InventoryAuditLog::whereNotNull('original_deduction_id')->firstOrFail()->getAttributes();
        unset($return['id'], $return['created_at']);
        $this->expectException(QueryException::class);
        InventoryAuditLog::create($return);
    }

    public function test_previously_returned_deductions_block_another_return_even_if_request_is_pending(): void
    {
        $sale = $this->createSale();
        $this->approve($sale)->assertOk();
        // Corrupt only disposable fixtures to exercise the independent audit safeguard.
        // The HTTP request updated different model instances; reload before resetting.
        $sale['request']->refresh()->update(['status' => 'pending']);
        $sale['order']->refresh()->update(['status' => 'Completed']);
        $this->assertSame('pending', $sale['request']->fresh()->status);
        $this->assertSame('Completed', $sale['order']->fresh()->status);
        $this->approve($sale)->assertConflict();
        $this->assertEquals(150, $sale['item']->fresh()->current_stock);
        $this->assertSame(4, InventoryAuditLog::count());
    }

    private function approve(array $sale, ?string $choice = 'return_stock')
    {
        return $this->patchJson($this->url($sale), ['decision' => 'approved', 'stock_handling' => $choice]);
    }

    private function url(array $sale): string
    {
        return '/api/order-management/void-requests/' . $sale['request']->id . '/review';
    }

    private function assertUnchanged(array $sale): void
    {
        $this->assertSame('Completed', $sale['order']->fresh()->status);
        $this->assertSame('pending', $sale['request']->fresh()->status);
        $this->assertNull($sale['request']->fresh()->stock_handling);
        $this->assertNull($sale['request']->fresh()->reviewed_by);
        $this->assertEquals(90, $sale['item']->fresh()->current_stock);
        $this->assertEquals([60, 30], $sale['item']->inventory_batches()->orderBy('received_date')->pluck('quantity')->all());
        $this->assertSame(2, InventoryAuditLog::count());
    }

    private function createStaff(string $roleName): User
    {
        $role = Role::firstOrCreate(['role_name' => $roleName]);
        return User::create(['role_id' => $role->id, 'status' => 'Active', 'first_name' => 'Test', 'last_name' => $roleName]);
    }

    private function createSale(bool $tracked = true): array
    {
        $order = Order::create([
            'order_number' => 'TEST-' . Str::uuid(), 'cashier_id' => $this->cashier->id,
            'order_datetime' => now('UTC')->toISOString(), 'status' => 'Completed', 'total' => 100,
        ]);
        $order->forceFill(['stock_deductions_recorded' => $tracked])->save();
        $request = OrderVoidRequest::create([
            'order_id' => $order->id, 'requested_by' => $this->cashier->id,
            'reason' => 'Duplicate order. Nothing prepared.', 'status' => 'pending',
        ]);
        $item = InventoryItem::create([
            'item_name' => 'Test milk', 'base_unit' => 'ml', 'current_stock' => 90,
            'cost_per_unit' => 0.9, 'track_expiry' => true, 'archived' => false,
        ]);
        $batches = [];
        $runningStock = 150;
        foreach ([40, 20] as $index => $quantity) {
            $batch = InventoryBatch::create([
                'inventory_item_id' => $item->id, 'batch_number' => 'TEST-' . $index,
                'quantity' => [60, 30][$index], 'unit_cost' => [0.1, 0.2][$index],
                'expiration_date' => now('Asia/Manila')->addDays(5 + $index)->toDateString(),
                'received_date' => '2026-10-0' . ($index + 1), 'created_at' => now('UTC')->toISOString(),
            ]);
            InventoryAuditLog::create([
                'inventory_item_id' => $item->id, 'batch_id' => $batch->id,
                'order_id' => $tracked ? $order->id : null,
                'action' => 'POS Sale', 'source' => 'POS Checkout', 'quantity_change' => -$quantity,
                'stock_before' => $runningStock, 'stock_after' => $runningStock - $quantity,
                'performed_by' => $this->cashier->id,
            ]);
            $runningStock -= $quantity;
            $batches[] = $batch;
        }
        return ['order' => $order, 'request' => $request, 'item' => $item, 'batches' => $batches];
    }

    private function returnMigration()
    {
        return require database_path('migrations/2026_10_29_000002_add_void_stock_return_tracking.php');
    }

    private function createTables(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->uuid('id')->primary(); $table->string('role_name');
        });
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary(); $table->uuid('role_id'); $table->string('status');
            $table->string('first_name'); $table->string('last_name');
        });
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary(); $table->string('order_number');
            $table->uuid('cashier_id'); $table->uuid('uploaded_by')->nullable();
            $table->timestampTz('order_datetime'); $table->string('status'); $table->decimal('total', 14, 4);
        });
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->uuid('id')->primary(); $table->string('item_name'); $table->string('base_unit');
            $table->decimal('current_stock', 14, 4); $table->decimal('cost_per_unit', 14, 4);
            $table->boolean('track_expiry'); $table->boolean('archived');
        });
        Schema::create('inventory_batches', function (Blueprint $table) {
            $table->uuid('id')->primary(); $table->uuid('inventory_item_id'); $table->string('batch_number');
            $table->decimal('quantity', 14, 4); $table->decimal('unit_cost', 14, 4);
            $table->date('expiration_date')->nullable(); $table->date('received_date'); $table->timestampTz('created_at');
        });
        Schema::create('inventory_audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary(); $table->uuid('inventory_item_id'); $table->uuid('batch_id')->nullable();
            $table->uuid('transaction_reference')->nullable(); $table->string('action'); $table->string('source');
            $table->decimal('quantity_change', 14, 4); $table->decimal('stock_before', 14, 4); $table->decimal('stock_after', 14, 4);
            $table->text('reason_reference')->nullable(); $table->uuid('performed_by')->nullable();
            $table->timestampTz('created_at')->useCurrent();
        });
    }
}
