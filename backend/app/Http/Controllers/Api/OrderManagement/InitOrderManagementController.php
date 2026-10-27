<?php

namespace App\Http\Controllers\Api\OrderManagement;

use App\Http\Controllers\Controller;
use App\Models\OrderManagement\Order;
use Illuminate\Http\Request;

class InitOrderManagementController extends Controller
{
    public function index(Request $request)
    {
        // Include only the staff identity fields needed by Order History.
        $orders = Order::visibleTo($request->user())->with([
            'cashier:id,first_name,last_name',
            'uploader:id,first_name,last_name',
            'void_requests:id,order_id,requested_by,reason,status,requested_at,reviewed_by,reviewed_at,review_reason',
            'void_requests.requester:id,first_name,last_name',
            'void_requests.reviewer:id,first_name,last_name',
        ])
            ->orderBy('order_datetime', 'desc')
            ->get();

        // Reuse the loaded history instead of querying pending requests again.
        foreach ($orders as $order) {
            $order->setRelation('pending_void_request', $order->void_requests->firstWhere('status', 'pending'));
        }

        return response()->json([
            'orders' => $orders,
        ])->header('Cache-Control', 'private, no-store');
    }
}
