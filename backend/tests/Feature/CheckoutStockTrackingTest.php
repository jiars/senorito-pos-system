<?php

namespace Tests\Feature;

use App\Http\Controllers\Api\InventoryManagement\AuditLogs\InventoryAuditLogController;
use App\Http\Controllers\Api\PosManagement\Orchestrators\CheckoutOrchestrator;
use App\Models\InventoryManagement\InventoryAuditLog;
use App\Models\InventoryManagement\InventoryBatch;
use App\Models\InventoryManagement\InventoryItem;
use App\Models\OrderManagement\Order;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class CheckoutStockTrackingTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Replace every configured connection before creating disposable fixtures.
        config([
            'database.default' => 'checkout_stock_test',
            'database.connections' => [
                'checkout_stock_test' => [
                    'driver' => 'sqlite',
                    'database' => ':memory:',
                    'prefix' => '',
                    'foreign_key_constraints' => true,
                ],
            ],
            'app.business_timezone' => 'Asia/Manila',
        ]);
        DB::purge('checkout_stock_test');
        $this->assertSame('sqlite', DB::getDriverName());
        $this->assertSame(':memory:', DB::connection()->getDatabaseName());
        $this->createFixtureTables();
        $this->trackingMigration()->up();
    }

    public function test_checkout_links_every_original_batch_and_marks_completion(): void
    {
        $cashier = $this->createStaff();
        $item = $this->createStock();
        $response = $this->checkout($cashier, $this->payload($item));
        $order = Order::firstOrFail();
        $logs = $order->stock_deductions()->orderByDesc('stock_before')->get();

        $this->assertSame(201, $response->getStatusCode());
        $this->assertTrue($order->stock_deductions_recorded);
        $this->assertCount(2, $logs);
        $this->assertEquals([-2, -1], $logs->pluck('quantity_change')->all());
        $this->assertEquals([7, 5], $logs->pluck('stock_before')->all());
        $this->assertEquals([5, 4], $logs->pluck('stock_after')->all());
        $this->assertSame(1, $logs->pluck('transaction_reference')->unique()->count());
        $this->assertEqualsCanonicalizing($item->inventory_batches()->pluck('id')->all(), $logs->pluck('batch_id')->all());
        foreach ($logs as $log) {
            $this->assertSame($order->id, $log->order->id);
            $this->assertSame($cashier->id, $log->performed_by);
            $this->assertSame('Sold in Order #' . $order->order_number, $log->reason_reference);
        }
        $this->assertEquals(4, $item->fresh()->current_stock);
        $this->assertEquals([0, 4], $item->inventory_batches()->orderBy('received_date')->pluck('quantity')->all());
        $this->assertSame('Completed', $order->status);
        $this->assertEquals(100, $order->total);
        $this->assertSame(1, $order->order_items()->count());
        $this->assertSame(1, $order->order_items()->firstOrFail()->addons()->count());
    }

    public function test_checkout_retry_does_not_repeat_deductions_or_audit_entries(): void
    {
        $cashier = $this->createStaff();
        $item = $this->createStock();
        $payload = $this->payload($item);
        $key = (string) Str::uuid();
        $this->checkout($cashier, $payload, $key);
        $response = $this->checkout($cashier, $payload, $key);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertTrue($response->getData(true)['already_processed']);
        $this->assertSame(1, Order::count());
        $this->assertSame(2, InventoryAuditLog::count());
        $this->assertEquals(4, $item->fresh()->current_stock);
        $this->assertTrue(Order::firstOrFail()->stock_deductions_recorded);
    }

    public function test_offline_upload_keeps_original_cashier_and_order_time(): void
    {
        $cashier = $this->createStaff();
        $owner = $this->createStaff('Owner');
        $payload = $this->payload($this->createStock());
        $payload['cashier_id'] = $cashier->id;
        $payload['offline_created_at'] = now('UTC')->subHour()->format('Y-m-d\TH:i:s.v\Z');
        $this->checkout($owner, $payload);
        $order = Order::firstOrFail();

        $this->assertSame($cashier->id, $order->cashier_id);
        $this->assertSame($owner->id, $order->uploaded_by);
        $this->assertSame($payload['offline_created_at'], $order->order_datetime);
        $this->assertSame([$cashier->id], $order->stock_deductions()->pluck('performed_by')->unique()->all());
    }

    public function test_audit_failure_rolls_back_order_stock_and_tracking_together(): void
    {
        $cashier = $this->createStaff();
        $item = $this->createStock();
        $realAudit = new InventoryAuditLogController();
        $attempt = 0;
        $audit = Mockery::mock(InventoryAuditLogController::class);
        $audit->shouldReceive('store')->twice()->andReturnUsing(function (array $data) use ($realAudit, &$attempt) {
            $attempt++;
            $this->assertFalse(Order::findOrFail($data['order_id'])->stock_deductions_recorded);
            if ($attempt === 2) throw new RuntimeException('Simulated audit failure.');
            return $realAudit->store($data);
        });
        $this->app->instance(InventoryAuditLogController::class, $audit);

        try {
            $this->checkout($cashier, $this->payload($item));
            $this->fail('Checkout must fail if an audit cannot be saved.');
        } catch (RuntimeException $exception) {
            $this->assertSame('Simulated audit failure.', $exception->getMessage());
        }

        $this->assertSame(0, Order::count());
        $this->assertSame(0, DB::table('order_items')->count());
        $this->assertSame(0, DB::table('order_item_addons')->count());
        $this->assertSame(0, InventoryAuditLog::count());
        $this->assertEquals(7, $item->fresh()->current_stock);
        $this->assertEquals([2, 5], $item->inventory_batches()->orderBy('received_date')->pluck('quantity')->all());
    }

    public function test_insufficient_stock_does_not_leave_a_tracked_receipt(): void
    {
        $cashier = $this->createStaff();
        $item = $this->createStock();
        $payload = $this->payload($item);
        $payload['inventory_deductions'][0]['quantity'] = 8;
        try {
            $this->checkout($cashier, $payload);
            $this->fail('Checkout must reject insufficient stock.');
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey('items', $exception->errors());
        }
        $this->assertSame(0, Order::count());
        $this->assertSame(0, InventoryAuditLog::count());
        $this->assertEquals(7, $item->fresh()->current_stock);
    }

    public function test_client_cannot_choose_the_audit_order_link_or_completion_marker(): void
    {
        $cashier = $this->createStaff();
        $payload = $this->payload($this->createStock());
        $payload['order']['id'] = (string) Str::uuid();
        $payload['order']['stock_deductions_recorded'] = false;
        $payload['inventory_deductions'][0]['order_id'] = (string) Str::uuid();
        $this->checkout($cashier, $payload);
        $order = Order::firstOrFail();

        $this->assertNotSame($payload['order']['id'], $order->id);
        $this->assertTrue($order->stock_deductions_recorded);
        $this->assertSame([$order->id], InventoryAuditLog::pluck('order_id')->unique()->all());
    }

    public function test_other_stock_actions_remain_unlinked_and_are_not_sale_deductions(): void
    {
        $cashier = $this->createStaff();
        $item = $this->createStock();
        $this->checkout($cashier, $this->payload($item));
        $order = Order::firstOrFail();
        $data = InventoryAuditLog::firstOrFail()->getAttributes();
        unset($data['id'], $data['order_id'], $data['created_at']);
        $data['action'] = 'Correction';
        $data['source'] = 'Inventory';
        $log = app(InventoryAuditLogController::class)->store($data);
        $this->assertNull($log->fresh()->order_id);

        $data['order_id'] = $order->id;
        $data['action'] = 'Void Stock Return';
        app(InventoryAuditLogController::class)->store($data);
        $this->assertSame(2, $order->stock_deductions()->count());
        $this->assertSame(4, InventoryAuditLog::count());
    }

    public function test_checkout_with_no_submitted_deductions_records_an_empty_completed_set(): void
    {
        $cashier = $this->createStaff();
        $payload = $this->payload($this->createStock());
        $payload['inventory_deductions'] = [];
        $this->checkout($cashier, $payload);

        // This marker tracks submitted deductions; it does not validate recipe completeness.
        $this->assertTrue(Order::firstOrFail()->stock_deductions_recorded);
        $this->assertSame(0, InventoryAuditLog::count());
    }

    public function test_order_link_rejects_unknown_orders_and_protects_linked_history(): void
    {
        $cashier = $this->createStaff();
        $this->checkout($cashier, $this->payload($this->createStock()));
        $log = InventoryAuditLog::firstOrFail();
        try {
            DB::table('inventory_audit_logs')->where('id', $log->id)->update(['order_id' => (string) Str::uuid()]);
            $this->fail('Unknown orders must not be accepted.');
        } catch (QueryException $exception) {
            $this->assertSame($log->order_id, $log->fresh()->order_id);
        }
        $this->expectException(QueryException::class);
        $log->order->delete();
    }

    public function test_migration_preserves_old_records_without_guessing_order_links(): void
    {
        $cashier = $this->createStaff();
        $item = $this->createStock();
        $payload = $this->payload($item);
        $key = (string) Str::uuid();
        $this->checkout($cashier, $payload, $key);
        $orderId = Order::firstOrFail()->id;
        $auditIds = InventoryAuditLog::pluck('id')->all();

        $this->trackingMigration()->down();
        $this->assertFalse(Schema::hasColumn('inventory_audit_logs', 'order_id'));
        $this->assertFalse(Schema::hasColumn('orders', 'stock_deductions_recorded'));
        $this->assertSame($auditIds, InventoryAuditLog::pluck('id')->all());
        $this->assertSame($orderId, Order::firstOrFail()->id);
        $this->assertEquals(4, $item->fresh()->current_stock);
        $this->trackingMigration()->up();

        $this->assertFalse(Order::firstOrFail()->stock_deductions_recorded);
        $this->assertSame(2, InventoryAuditLog::whereNull('order_id')->count());
        $this->checkout($cashier, $payload, $key);
        $this->assertFalse(Order::firstOrFail()->stock_deductions_recorded);
        $this->assertSame(2, InventoryAuditLog::count());
        $this->assertEquals(4, $item->fresh()->current_stock);
    }

    private function checkout(User $staff, array $payload, ?string $key = null)
    {
        $request = Request::create('/api/pos-management/checkout', 'POST', $payload);
        $request->headers->set('Idempotency-Key', $key ?? (string) Str::uuid());
        $request->setUserResolver(function () use ($staff) { return $staff; });
        return app(CheckoutOrchestrator::class)->store($request);
    }

    private function payload(InventoryItem $item): array
    {
        $menuId = (string) Str::uuid();
        $priceId = (string) Str::uuid();
        $addonId = (string) Str::uuid();
        DB::table('menu_items')->insert(['id' => $menuId, 'archived' => false]);
        DB::table('menu_item_prices')->insert([
            'id' => $priceId, 'menu_item_id' => $menuId,
            'archived' => false, 'pos_status' => 'Available',
        ]);
        DB::table('addons')->insert(['id' => $addonId, 'archived' => false, 'pos_status' => 'Available']);

        return [
            'order' => [
                'order_number' => 'TEST-' . Str::uuid(),
                'order_source' => 'In-Store', 'payment_method' => 'Cash',
                'subtotal' => 100, 'total' => 100, 'amount_paid' => 100, 'change_amount' => 0,
            ],
            'items' => [[
                'menu_item_id' => $menuId, 'price_id' => $priceId,
                'quantity' => 1, 'unit_price' => 90, 'subtotal' => 90,
                'addons' => [['addon_id' => $addonId, 'quantity' => 1, 'price' => 10]],
            ]],
            'inventory_deductions' => [['inventory_item_id' => $item->id, 'quantity' => 3]],
        ];
    }

    private function createStaff(string $roleName = 'Cashier'): User
    {
        $role = Role::firstOrCreate(['role_name' => $roleName]);
        return User::create(['role_id' => $role->id, 'status' => 'Active']);
    }

    private function createStock(): InventoryItem
    {
        $item = InventoryItem::create([
            'item_name' => 'Test milk', 'base_unit' => 'ml', 'current_stock' => 7,
            'cost_per_unit' => 2, 'track_expiry' => false, 'archived' => false,
        ]);
        foreach ([2, 5] as $index => $quantity) {
            InventoryBatch::create([
                'inventory_item_id' => $item->id, 'batch_number' => 'TEST-' . $index,
                'quantity' => $quantity, 'unit_cost' => 2,
                'received_date' => '2026-10-0' . ($index + 1),
                'created_at' => '2026-10-01 00:00:00',
            ]);
        }
        return $item;
    }

    private function trackingMigration()
    {
        return require database_path('migrations/2026_10_29_000001_link_checkout_stock_deductions_to_orders.php');
    }

    private function createFixtureTables(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('role_name');
        });
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('role_id');
            $table->string('status');
        });
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('order_number')->unique();
            $table->uuid('cashier_id');
            $table->uuid('uploaded_by');
            $table->uuid('client_transaction_id')->nullable()->unique();
            $table->string('order_datetime');
            $table->string('order_source');
            $table->string('payment_method');
            $table->string('discount_type');
            $table->string('status');
            foreach (['subtotal', 'discount_amount', 'total', 'amount_paid', 'change_amount'] as $column) {
                $table->decimal($column, 14, 4);
            }
        });
        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('order_id');
            $table->uuid('menu_item_id');
            $table->uuid('price_id');
            $table->integer('quantity');
            $table->decimal('unit_price', 14, 4);
            $table->decimal('subtotal', 14, 4);
        });
        Schema::create('menu_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->boolean('archived');
        });
        Schema::create('menu_item_prices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('menu_item_id');
            $table->boolean('archived');
            $table->string('pos_status');
        });
        Schema::create('addons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->boolean('archived');
            $table->string('pos_status');
        });
        Schema::create('order_item_addons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('order_item_id');
            $table->uuid('addon_id');
            $table->integer('quantity');
            $table->decimal('price', 14, 4);
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
            $table->decimal('unit_cost', 14, 4);
            $table->date('expiration_date')->nullable();
            $table->date('received_date');
            $table->timestampTz('created_at');
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
