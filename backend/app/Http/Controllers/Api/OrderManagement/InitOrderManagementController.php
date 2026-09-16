<?php

namespace App\Http\Controllers\Api\OrderManagement;

use App\Http\Controllers\Controller;
use App\Models\OrderManagement\Order;

class InitOrderManagementController extends Controller
{
    public function index()
    {
        // Fetch the receipt list with its cashier.
        $orders = Order::with([
            'cashier:id,first_name,last_name',
        ])
            ->orderBy('order_datetime', 'desc')
            ->get();

        return response()->json([
            'orders' => $orders,
        ]);
    }
}
