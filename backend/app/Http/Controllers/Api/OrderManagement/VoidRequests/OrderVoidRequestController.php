<?php

namespace App\Http\Controllers\Api\OrderManagement\VoidRequests;

use App\Http\Controllers\Controller;
use App\Models\OrderManagement\Order;
use App\Models\OrderManagement\OrderVoidRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderVoidRequestController extends Controller
{
    public function store(Request $request, string $orderId)
    {
        $cashier = $request->user();
        abort_unless($cashier->status === 'Active', 403, 'This account is deactivated.');

        if (is_string($request->input('reason'))) {
            $request->merge(['reason' => trim($request->input('reason'))]);
        }
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $result = DB::transaction(function () use ($cashier, $orderId, $validated) {
            // Serialize requests for this order and enforce original-cashier ownership.
            $order = Order::visibleTo($cashier)->whereKey($orderId)->lockForUpdate()->firstOrFail();
            abort_unless($order->status === 'Completed', 409, 'Only completed orders can be requested for void.');

            $pending = $order->pending_void_request()->first();
            if ($pending) {
                return ['request' => $pending, 'created' => false];
            }

            $voidRequest = OrderVoidRequest::create([
                'order_id' => $order->id,
                'requested_by' => $cashier->id,
                'reason' => $validated['reason'],
                'status' => OrderVoidRequest::STATUS_PENDING,
                'requested_at' => now('UTC'),
            ]);
            $voidRequest->refresh();

            // A request does not change sales, payment or inventory.
            return ['request' => $voidRequest, 'created' => true];
        });

        $status = $result['created'] ? 201 : 200;
        return response()->json([
            'void_request' => $result['request'],
            'already_requested' => !$result['created'],
        ], $status)->header('Cache-Control', 'private, no-store');
    }
}
