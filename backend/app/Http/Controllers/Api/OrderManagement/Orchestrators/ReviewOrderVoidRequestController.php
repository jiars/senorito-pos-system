<?php

namespace App\Http\Controllers\Api\OrderManagement\Orchestrators;

use App\Http\Controllers\Controller;
use App\Models\OrderManagement\Order;
use App\Models\OrderManagement\OrderVoidRequest;
use App\Services\OrderManagement\OrderVoidStockReturnService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewOrderVoidRequestController extends Controller
{
    public function update(Request $request, string $requestId)
    {
        $owner = $request->user();
        abort_unless($owner->status === 'Active', 403, 'This account is deactivated.');
        if (is_string($request->input('review_reason'))) {
            $request->merge(['review_reason' => trim($request->input('review_reason'))]);
        }
        $validated = $request->validate([
            'decision' => ['required', 'in:approved,rejected'],
            'review_reason' => ['required_if:decision,rejected', 'nullable', 'string', 'max:500'],
            'stock_handling' => ['exclude_unless:decision,approved', 'required', 'in:keep_deducted,return_stock'],
        ]);
        $requestOrder = OrderVoidRequest::findOrFail($requestId);

        $result = DB::transaction(function () use ($requestOrder, $requestId, $owner, $validated) {
            // Match creation's lock order: receipt first, then the request.
            $order = Order::whereKey($requestOrder->order_id)->lockForUpdate()->firstOrFail();
            $voidRequest = OrderVoidRequest::whereKey($requestId)->lockForUpdate()->firstOrFail();
            if ($voidRequest->status !== OrderVoidRequest::STATUS_PENDING) {
                $sameDecision = $voidRequest->status === $validated['decision'];
                $sameReviewer = $voidRequest->reviewed_by === $owner->id;
                $sameStockHandling = $voidRequest->stock_handling === ($validated['stock_handling'] ?? null);
                abort_unless($sameDecision && $sameReviewer && $sameStockHandling, 409, 'This request has already been reviewed. Refresh Order History.');
                return ['request' => $voidRequest, 'already_reviewed' => true];
            }
            abort_unless($order->status === 'Completed', 409, 'This order is no longer completed. Refresh Order History.');

            $reviewReason = $validated['review_reason'] ?? null;
            if ($reviewReason === '') $reviewReason = null;
            $stockHandling = $validated['stock_handling'] ?? null;
            if ($stockHandling === OrderVoidRequest::RETURN_STOCK) {
                app(OrderVoidStockReturnService::class)->returnStock($order, $voidRequest, $owner->id);
            }
            $voidRequest->update([
                'status' => $validated['decision'],
                'reviewed_by' => $owner->id,
                'reviewed_at' => now('UTC'),
                'review_reason' => $reviewReason,
                'stock_handling' => $stockHandling,
            ]);
            if ($validated['decision'] === OrderVoidRequest::STATUS_APPROVED) {
                // Preserve receipt amounts/date; stock handling was recorded above.
                $order->update(['status' => 'Voided']);
            }
            return ['request' => $voidRequest, 'already_reviewed' => false];
        });

        return response()->json([
            'void_request' => $result['request'],
            'already_reviewed' => $result['already_reviewed'],
        ])->header('Cache-Control', 'private, no-store');
    }
}
