<?php

namespace Tests\Feature;

use App\Models\OrderManagement\Order;
use App\Models\OrderManagement\OrderVoidRequest;
use App\Models\Role;
use App\Models\User;
use App\Http\Controllers\Api\ReportManagement\Sales\OrderSalesController;
use App\Http\Controllers\Api\DashboardManagement\Metrics\TodayMetricsController;
use App\Http\Controllers\Api\DashboardManagement\Sales\WeeklySalesController;
use App\Http\Controllers\Api\DashboardManagement\Sales\TopSellingItemsController;
use Illuminate\Http\Request;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderHistoryAccessTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Use disposable fixtures only; never migrate or connect to cafe data.
        config([
            'database.default' => 'order_history_test',
            'database.connections' => [
                'order_history_test' => [
                    'driver' => 'sqlite',
                    'database' => ':memory:',
                    'prefix' => '',
                    'foreign_key_constraints' => true,
                ],
            ],
            'cache.default' => 'array',
            'app.business_timezone' => 'Asia/Manila',
        ]);
        DB::purge('order_history_test');
        $this->assertSame('sqlite', DB::getDriverName());
        $this->assertSame(':memory:', DB::connection()->getDatabaseName());

        Schema::create('roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('role_name');
        });
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('role_id')->nullable();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('status');
        });
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('order_number');
            $table->uuid('cashier_id')->nullable();
            $table->uuid('uploaded_by')->nullable();
            $table->timestamp('order_datetime');
            $table->decimal('total', 12, 2);
            $table->decimal('subtotal', 12, 2)->default(169);
            $table->string('order_source')->default('In-Store');
            $table->string('status');
        });
        $migration = require database_path('migrations/2026_10_27_000001_create_order_void_requests_table.php');
        $migration->up();
        Schema::create('inventory_audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
        });
        $stockMigration = require database_path('migrations/2026_10_29_000002_add_void_stock_return_tracking.php');
        $stockMigration->up();
        Schema::create('menu_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('item_name');
            $table->uuid('category_id')->nullable();
            $table->text('image_url')->nullable();
            $table->boolean('archived')->default(false);
        });
        Schema::create('menu_item_prices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('variant_name');
        });
        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('order_id');
            $table->uuid('menu_item_id');
            $table->uuid('price_id');
            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('subtotal', 12, 2);
        });
        Schema::create('addons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('addon_name');
        });
        Schema::create('order_item_addons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('order_item_id');
            $table->uuid('addon_id');
            $table->integer('quantity');
            $table->decimal('price', 12, 2);
        });
    }

    public function test_guests_cannot_read_history_or_receipts(): void
    {
        $this->getJson('/api/order-management/init')->assertUnauthorized();
        $this->getJson($this->receiptUrl((string) Str::uuid()))->assertUnauthorized();
    }

    public function test_cashier_sees_only_original_sales_even_when_another_person_uploaded_them(): void
    {
        $cashier = $this->createUser('Cashier');
        $other = $this->createUser('Cashier');
        $owner = $this->createUser('Owner');
        $own = $this->createOrder($cashier, $cashier);
        $uploadedByOwner = $this->createOrder($cashier, $owner);
        $this->createOrder($other, $cashier);
        $this->createOrder($owner, $owner);
        $this->createOrder(null, $cashier);
        Sanctum::actingAs($cashier);

        $response = $this->getJson('/api/order-management/init');
        $response->assertOk()->assertJsonCount(2, 'orders');
        $this->assertEqualsCanonicalizing(
            [$own->id, $uploadedByOwner->id],
            array_column($response->json('orders'), 'id'),
        );
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
    }

    public function test_query_parameters_cannot_override_the_authenticated_cashier(): void
    {
        $cashier = $this->createUser('Cashier');
        $other = $this->createUser('Cashier');
        $own = $this->createOrder($cashier);
        $this->createOrder($other);
        Sanctum::actingAs($cashier);

        $this->getJson('/api/order-management/init?cashier_id='.$other->id.'&role=Owner')
            ->assertOk()->assertJsonCount(1, 'orders')->assertJsonPath('orders.0.id', $own->id);
    }

    public function test_owner_sees_all_history_including_deactivated_cashiers_and_unassigned_sales(): void
    {
        $owner = $this->createUser('Owner');
        $cashier = $this->createUser('Cashier');
        $cashier->update(['status' => 'Deactivated']);
        $this->createOrder($owner);
        $this->createOrder($cashier);
        $this->createOrder(null);
        Sanctum::actingAs($owner);

        $this->getJson('/api/order-management/init')->assertOk()->assertJsonCount(3, 'orders');
    }

    public function test_cashier_can_read_own_receipt_with_variants_and_addons(): void
    {
        $cashier = $this->createUser('Cashier');
        $owner = $this->createUser('Owner');
        $order = $this->createOrder($cashier, $owner);
        $this->createReceiptItems($order);
        Sanctum::actingAs($cashier);

        $response = $this->getJson($this->receiptUrl($order->id));
        $response->assertOk()->assertJsonCount(1, 'items')
            ->assertJsonPath('items.0.menu_item.item_name', 'Test Latte')
            ->assertJsonPath('items.0.variant.variant_name', '16oz')
            ->assertJsonPath('items.0.addons.0.addon.addon_name', 'Extra shot');
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
    }

    public function test_cashier_cannot_read_another_cashiers_receipt_even_if_they_uploaded_it(): void
    {
        $cashier = $this->createUser('Cashier');
        $other = $this->createUser('Cashier');
        $order = $this->createOrder($other, $cashier);
        $this->createReceiptItems($order);
        Sanctum::actingAs($cashier);

        $this->getJson($this->receiptUrl($order->id))->assertNotFound()->assertJsonMissingPath('items');
        $this->getJson($this->receiptUrl((string) Str::uuid()))->assertNotFound();
    }

    public function test_owner_can_read_other_cashiers_and_unassigned_receipts(): void
    {
        $owner = $this->createUser('Owner');
        $other = $this->createUser('Cashier');
        Sanctum::actingAs($owner);

        foreach ([$this->createOrder($other), $this->createOrder(null)] as $order) {
            $this->createReceiptItems($order);
            $this->getJson($this->receiptUrl($order->id))->assertOk()->assertJsonCount(1, 'items');
        }
    }

    public function test_other_roles_and_missing_roles_cannot_read_orders(): void
    {
        $order = $this->createOrder($this->createUser('Cashier'));

        foreach (['Inventory Clerk', 'Unexpected Role', null] as $role) {
            $user = $this->createUser($role);
            Sanctum::actingAs($user);
            $this->getJson('/api/order-management/init')->assertForbidden();
            $this->getJson($this->receiptUrl($order->id))->assertForbidden();
            $this->assertSame(0, Order::visibleTo($user)->count());
        }
    }

    public function test_malformed_receipt_ids_return_not_found_instead_of_database_errors(): void
    {
        Sanctum::actingAs($this->createUser('Owner'));
        $this->getJson($this->receiptUrl('not-a-uuid'))->assertNotFound();
    }

    public function test_cashier_without_orders_gets_an_empty_list(): void
    {
        $this->createOrder($this->createUser('Cashier'));
        Sanctum::actingAs($this->createUser('Cashier'));
        $this->getJson('/api/order-management/init')->assertOk()->assertExactJson(['orders' => []]);
    }

    public function test_history_keeps_existing_statuses_and_reads_do_not_rewrite_sales(): void
    {
        $cashier = $this->createUser('Cashier');
        $order = $this->createOrder($cashier);
        $order->update(['status' => 'Cancelled']);
        $before = $order->fresh()->getAttributes();
        Sanctum::actingAs($cashier);

        $this->getJson('/api/order-management/init')->assertOk()->assertJsonPath('orders.0.status', 'Cancelled');
        $this->getJson($this->receiptUrl($order->id))->assertOk()->assertExactJson(['items' => [], 'order_status' => 'Cancelled']);
        $this->assertSame($before, $order->fresh()->getAttributes());
    }

    public function test_cashier_can_request_a_void_without_changing_the_original_sale(): void
    {
        $cashier = $this->createUser('Cashier');
        $owner = $this->createUser('Owner');
        $order = $this->createOrder($cashier, $owner);
        $before = $order->fresh()->getAttributes();
        Sanctum::actingAs($cashier);

        $response = $this->postJson($this->voidRequestUrl($order->id), [
            'reason' => '  Duplicate checkout.  ',
            'requested_by' => $owner->id,
            'status' => 'approved',
            'reviewed_by' => $owner->id,
        ]);
        $response->assertCreated()
            ->assertJsonPath('already_requested', false)
            ->assertJsonPath('void_request.order_id', $order->id)
            ->assertJsonPath('void_request.requested_by', $cashier->id)
            ->assertJsonPath('void_request.reason', 'Duplicate checkout.')
            ->assertJsonPath('void_request.status', 'pending')
            ->assertJsonPath('void_request.reviewed_by', null);
        $this->assertSame($before, $order->fresh()->getAttributes());
        $this->assertDatabaseCount('order_void_requests', 1);
    }

    public function test_repeated_request_returns_the_same_pending_record_without_overwriting_its_reason(): void
    {
        $cashier = $this->createUser('Cashier');
        $order = $this->createOrder($cashier);
        Sanctum::actingAs($cashier);
        $first = $this->postJson($this->voidRequestUrl($order->id), ['reason' => 'Wrong item.']);
        $first->assertCreated();
        $this->postJson($this->voidRequestUrl($order->id), ['reason' => 'Different retry reason.'])
            ->assertOk()->assertJsonPath('already_requested', true)
            ->assertJsonPath('void_request.id', $first->json('void_request.id'))
            ->assertJsonPath('void_request.reason', 'Wrong item.');
        $this->assertDatabaseCount('order_void_requests', 1);
    }

    public function test_cashier_cannot_request_a_void_for_another_cashiers_uploaded_sale(): void
    {
        $cashier = $this->createUser('Cashier');
        $other = $this->createUser('Cashier');
        $order = $this->createOrder($other, $cashier);
        Sanctum::actingAs($cashier);
        $this->postJson($this->voidRequestUrl($order->id), ['reason' => 'Wrong item.'])->assertNotFound();
        $this->assertDatabaseCount('order_void_requests', 0);
    }

    public function test_request_creation_is_cashier_only_and_requires_a_session(): void
    {
        $order = $this->createOrder($this->createUser('Cashier'));
        $this->postJson($this->voidRequestUrl($order->id), ['reason' => 'Duplicate.'])->assertUnauthorized();
        foreach (['Owner', 'Inventory Clerk', 'Unexpected Role'] as $role) {
            Sanctum::actingAs($this->createUser($role));
            $this->postJson($this->voidRequestUrl($order->id), ['reason' => 'Duplicate.'])->assertForbidden();
        }
        $this->assertDatabaseCount('order_void_requests', 0);
    }

    public function test_reason_is_required_trimmed_and_limited_to_500_characters(): void
    {
        $cashier = $this->createUser('Cashier');
        $order = $this->createOrder($cashier);
        Sanctum::actingAs($cashier);
        foreach ([[], ['reason' => '   '], ['reason' => str_repeat('a', 501)], ['reason' => ['invalid']]] as $body) {
            $this->postJson($this->voidRequestUrl($order->id), $body)
                ->assertUnprocessable()->assertJsonValidationErrors('reason');
        }
        $this->assertDatabaseCount('order_void_requests', 0);
        $this->postJson($this->voidRequestUrl($order->id), ['reason' => str_repeat('a', 500)])->assertCreated();
    }

    public function test_inactive_cashier_and_noncompleted_orders_cannot_submit(): void
    {
        $cashier = $this->createUser('Cashier');
        $order = $this->createOrder($cashier);
        Sanctum::actingAs($cashier);
        $order->update(['status' => 'Cancelled']);
        $this->postJson($this->voidRequestUrl($order->id), ['reason' => 'Duplicate.'])->assertConflict();
        $order->update(['status' => 'Completed']);
        $cashier->update(['status' => 'Deactivated']);
        $this->postJson($this->voidRequestUrl($order->id), ['reason' => 'Duplicate.'])->assertForbidden();
        $this->assertDatabaseCount('order_void_requests', 0);
    }

    public function test_pending_request_appears_only_in_the_authorized_order_history(): void
    {
        $cashier = $this->createUser('Cashier');
        $other = $this->createUser('Cashier');
        $owner = $this->createUser('Owner');
        $order = $this->createOrder($cashier);
        Sanctum::actingAs($cashier);
        $this->postJson($this->voidRequestUrl($order->id), ['reason' => 'Duplicate.'])->assertCreated();
        $this->getJson('/api/order-management/init')->assertOk()
            ->assertJsonPath('orders.0.status', 'Completed')
            ->assertJsonPath('orders.0.pending_void_request.reason', 'Duplicate.');
        Sanctum::actingAs($owner);
        $this->getJson('/api/order-management/init')->assertOk()
            ->assertJsonPath('orders.0.pending_void_request.status', 'pending');
        Sanctum::actingAs($other);
        $this->getJson('/api/order-management/init')->assertOk()->assertJsonCount(0, 'orders');
    }

    public function test_database_blocks_a_second_pending_request_for_the_same_order(): void
    {
        $cashier = $this->createUser('Cashier');
        $order = $this->createOrder($cashier);
        $data = ['order_id' => $order->id, 'requested_by' => $cashier->id, 'reason' => 'Duplicate.'];
        OrderVoidRequest::create($data);
        $this->expectException(\Illuminate\Database\QueryException::class);
        OrderVoidRequest::create($data);
    }

    public function test_rejected_request_is_retained_when_a_new_request_is_created(): void
    {
        $cashier = $this->createUser('Cashier');
        $order = $this->createOrder($cashier);
        $earlier = OrderVoidRequest::create([
            'order_id' => $order->id, 'requested_by' => $cashier->id,
            'reason' => 'Earlier reason.', 'status' => 'rejected',
        ]);
        Sanctum::actingAs($cashier);
        $this->postJson($this->voidRequestUrl($order->id), ['reason' => 'New information.'])->assertCreated();
        $this->assertDatabaseCount('order_void_requests', 2);
        $this->assertSame('Earlier reason.', $earlier->fresh()->reason);
        $this->assertSame('pending', $order->fresh()->pending_void_request->status);
    }

    public function test_request_endpoint_rejects_missing_or_malformed_orders(): void
    {
        Sanctum::actingAs($this->createUser('Cashier'));
        $this->postJson($this->voidRequestUrl((string) Str::uuid()), ['reason' => 'Duplicate.'])->assertNotFound();
        $this->postJson($this->voidRequestUrl('not-a-uuid'), ['reason' => 'Duplicate.'])->assertNotFound();
        $this->assertDatabaseCount('order_void_requests', 0);
    }

    public function test_owner_approval_voids_order_but_preserves_receipt_values_and_audit(): void
    {
        $cashier = $this->createUser('Cashier');
        $owner = $this->createUser('Owner');
        $order = $this->createOrder($cashier);
        // Compare database-loaded values on both sides, including column defaults.
        $before = $order->fresh()->getAttributes();
        $request = $this->createVoidRequest($order, $cashier);
        Sanctum::actingAs($owner);
        $this->patchJson($this->reviewUrl($request->id), ['decision' => 'approved', 'stock_handling' => 'keep_deducted', 'reviewed_by' => $cashier->id])
            ->assertOk()->assertJsonPath('void_request.status', 'approved')
            ->assertJsonPath('void_request.reviewed_by', $owner->id)->assertJsonPath('already_reviewed', false);
        $after = $order->fresh()->getAttributes();
        $this->assertSame('Voided', $after['status']);
        unset($before['status'], $after['status']);
        $this->assertEquals($before, $after);
        $this->assertNotNull($request->fresh()->reviewed_at);
        $this->getJson($this->receiptUrl($order->id))->assertOk()->assertJsonPath('order_status', 'Voided');
        Sanctum::actingAs($cashier);
        $this->getJson('/api/order-management/init')->assertOk()
            ->assertJsonPath('orders.0.status', 'Voided')->assertJsonPath('orders.0.pending_void_request', null)
            ->assertJsonPath('orders.0.void_requests.0.reviewer.id', $owner->id);
    }

    public function test_rejection_requires_a_reason_and_keeps_sale_counted(): void
    {
        $cashier = $this->createUser('Cashier');
        $order = $this->createOrder($cashier);
        $request = $this->createVoidRequest($order, $cashier);
        Sanctum::actingAs($this->createUser('Owner'));
        $this->patchJson($this->reviewUrl($request->id), ['decision' => 'rejected', 'review_reason' => '   '])
            ->assertUnprocessable()->assertJsonValidationErrors('review_reason');
        $this->assertSame('pending', $request->fresh()->status);
        $this->patchJson($this->reviewUrl($request->id), ['decision' => 'rejected', 'review_reason' => '  Receipt is correct.  '])
            ->assertOk()->assertJsonPath('void_request.review_reason', 'Receipt is correct.');
        $this->assertSame('Completed', $order->fresh()->status);
        Sanctum::actingAs($cashier);
        $this->getJson('/api/order-management/init')->assertOk()
            ->assertJsonPath('orders.0.void_requests.0.status', 'rejected')
            ->assertJsonPath('orders.0.void_requests.0.review_reason', 'Receipt is correct.');
    }

    public function test_only_active_owner_can_review(): void
    {
        $cashier = $this->createUser('Cashier');
        $request = $this->createVoidRequest($this->createOrder($cashier), $cashier);
        $this->patchJson($this->reviewUrl($request->id), ['decision' => 'approved'])->assertUnauthorized();
        foreach (['Cashier', 'Inventory Clerk'] as $role) {
            Sanctum::actingAs($this->createUser($role));
            $this->patchJson($this->reviewUrl($request->id), ['decision' => 'approved'])->assertForbidden();
        }
        $owner = $this->createUser('Owner');
        $owner->update(['status' => 'Deactivated']);
        Sanctum::actingAs($owner);
        $this->patchJson($this->reviewUrl($request->id), ['decision' => 'approved'])->assertForbidden();
        $this->assertSame('pending', $request->fresh()->status);
    }

    public function test_repeat_review_is_idempotent_but_cannot_replace_the_first_decision(): void
    {
        $cashier = $this->createUser('Cashier');
        $request = $this->createVoidRequest($this->createOrder($cashier), $cashier);
        $owner = $this->createUser('Owner');
        Sanctum::actingAs($owner);
        $this->patchJson($this->reviewUrl($request->id), ['decision' => 'approved', 'stock_handling' => 'keep_deducted', 'review_reason' => 'Original note.'])->assertOk();
        $before = $request->fresh()->getAttributes();
        $this->patchJson($this->reviewUrl($request->id), ['decision' => 'approved', 'stock_handling' => 'keep_deducted', 'review_reason' => 'Retry note.'])
            ->assertOk()->assertJsonPath('already_reviewed', true);
        $this->assertSame($before, $request->fresh()->getAttributes());
        $this->patchJson($this->reviewUrl($request->id), ['decision' => 'rejected', 'review_reason' => 'Changed mind.'])->assertConflict();
        Sanctum::actingAs($this->createUser('Owner'));
        $this->patchJson($this->reviewUrl($request->id), ['decision' => 'approved', 'stock_handling' => 'keep_deducted'])->assertConflict();
    }

    public function test_invalid_decisions_and_noncompleted_order_are_rejected(): void
    {
        $cashier = $this->createUser('Cashier');
        $order = $this->createOrder($cashier);
        $request = $this->createVoidRequest($order, $cashier);
        Sanctum::actingAs($this->createUser('Owner'));
        $this->patchJson($this->reviewUrl($request->id), ['decision' => 'other'])->assertUnprocessable();
        $this->patchJson($this->reviewUrl($request->id), ['decision' => 'approved', 'stock_handling' => 'keep_deducted', 'review_reason' => str_repeat('a', 501)])->assertUnprocessable();
        $order->update(['status' => 'Cancelled']);
        $this->patchJson($this->reviewUrl($request->id), ['decision' => 'approved', 'stock_handling' => 'keep_deducted'])->assertConflict();
        $this->assertSame('pending', $request->fresh()->status);
        $this->patchJson($this->reviewUrl('not-a-uuid'), ['decision' => 'approved'])->assertNotFound();
    }

    public function test_failed_order_update_rolls_back_the_review_too(): void
    {
        $cashier = $this->createUser('Cashier');
        $order = $this->createOrder($cashier);
        $request = $this->createVoidRequest($order, $cashier);
        Sanctum::actingAs($this->createUser('Owner'));
        $dispatcher = Order::getEventDispatcher();
        Order::setEventDispatcher(clone $dispatcher);
        Order::updating(function ($updatedOrder) {
            if ($updatedOrder->status === 'Voided') throw new \RuntimeException('Simulated write failure');
        });
        try {
            $this->patchJson($this->reviewUrl($request->id), ['decision' => 'approved', 'stock_handling' => 'keep_deducted'])->assertServerError();
        } finally {
            Order::setEventDispatcher($dispatcher);
        }
        $this->assertSame('Completed', $order->fresh()->status);
        $this->assertSame('pending', $request->fresh()->status);
        $this->assertNull($request->fresh()->reviewed_by);
    }

    public function test_sales_and_dashboard_exclude_only_voided_and_cancelled_orders(): void
    {
        $this->travelTo(\Illuminate\Support\Carbon::parse('2026-10-27 06:00:00', 'UTC'));
        $cashier = $this->createUser('Cashier');
        $pendingSale = $this->createOrder($cashier);
        $this->createVoidRequest($pendingSale, $cashier);
        $rejectedSale = $this->createOrder($cashier);
        $this->createVoidRequest($rejectedSale, $cashier)->update(['status' => 'rejected']);
        $voided = $this->createOrder($cashier);
        $request = $this->createVoidRequest($voided, $cashier);
        Sanctum::actingAs($this->createUser('Owner'));
        $this->patchJson($this->reviewUrl($request->id), ['decision' => 'approved', 'stock_handling' => 'keep_deducted'])->assertOk();
        $cancelled = $this->createOrder($cashier);
        $cancelled->update(['status' => 'Cancelled']);

        $sales = app(OrderSalesController::class)->fetch(Request::create('/test'));
        $this->assertEqualsCanonicalizing([$pendingSale->id, $rejectedSale->id], $sales->pluck('id')->all());
        Schema::create('expenses', function (Blueprint $table) { $table->date('expense_date'); $table->decimal('amount'); });
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->boolean('archived'); $table->decimal('current_stock'); $table->decimal('minimum_level');
        });
        Schema::create('menu_categories', function (Blueprint $table) { $table->uuid('id')->primary(); $table->string('category_name'); });
        $metrics = app(TodayMetricsController::class)->fetch();
        $this->assertSame(2, $metrics['orderCount']);
        $this->assertEquals(338, $metrics['totalSales']);
        $weekly = app(WeeklySalesController::class)->fetch();
        $this->assertEquals(338, array_sum(array_column($weekly, 'value')));
        foreach ([$pendingSale, $rejectedSale, $voided, $cancelled] as $order) $this->createReceiptItems($order);
        $top = app(TopSellingItemsController::class)->fetch();
        $this->assertCount(2, $top);
        $this->assertEquals(2, $top->sum('sold'));
    }

    private function createVoidRequest(Order $order, User $cashier): OrderVoidRequest
    {
        return OrderVoidRequest::create([
            'order_id' => $order->id, 'requested_by' => $cashier->id,
            'reason' => 'Duplicate checkout.', 'status' => 'pending', 'requested_at' => now('UTC'),
        ]);
    }

    private function reviewUrl(string $requestId): string
    {
        return '/api/order-management/void-requests/'.$requestId.'/review';
    }

    private function voidRequestUrl(string $orderId): string
    {
        return '/api/order-management/orders/'.$orderId.'/void-requests';
    }

    private function createUser(?string $roleName): User
    {
        $role = null;
        if ($roleName) {
            $role = Role::firstOrCreate(['role_name' => $roleName]);
        }

        return User::create([
            'role_id' => $role ? $role->id : null,
            'first_name' => 'Test',
            'last_name' => 'Staff',
            'status' => 'Active',
        ]);
    }

    private function createOrder(?User $cashier, ?User $uploader = null): Order
    {
        return Order::create([
            'order_number' => 'TEST-'.Str::uuid(),
            'cashier_id' => $cashier ? $cashier->id : null,
            'uploaded_by' => $uploader ? $uploader->id : null,
            'order_datetime' => '2026-10-27 02:00:00',
            'total' => 169,
            'status' => 'Completed',
        ]);
    }

    private function createReceiptItems(Order $order): void
    {
        $menuId = (string) Str::uuid();
        $variantId = (string) Str::uuid();
        $itemId = (string) Str::uuid();
        $addonId = (string) Str::uuid();
        DB::table('menu_items')->insert(['id' => $menuId, 'item_name' => 'Test Latte']);
        DB::table('menu_item_prices')->insert(['id' => $variantId, 'variant_name' => '16oz']);
        DB::table('order_items')->insert([
            'id' => $itemId, 'order_id' => $order->id, 'menu_item_id' => $menuId,
            'price_id' => $variantId, 'quantity' => 1, 'unit_price' => 149, 'subtotal' => 149,
        ]);
        DB::table('addons')->insert(['id' => $addonId, 'addon_name' => 'Extra shot']);
        DB::table('order_item_addons')->insert([
            'id' => (string) Str::uuid(), 'order_item_id' => $itemId,
            'addon_id' => $addonId, 'quantity' => 1, 'price' => 20,
        ]);
    }

    private function receiptUrl(string $orderId): string
    {
        return '/api/order-management/orders/'.$orderId.'/items';
    }
}
