<?php

namespace App\Http\Controllers\Api\OrderManagement;

use App\Http\Controllers\Controller;
use App\Models\OrderManagement\Order;

class InitOrderManagementController extends Controller
{
    public function index()
    {
        // Include only the staff identity fields needed by Order History.
        $orders = Order::with([
            'cashier:id,first_name,last_name',
            'uploader:id,first_name,last_name',
        ])
            ->orderBy('order_datetime', 'desc')
            ->get();

        return response()->json([
            'orders' => $orders,
        ]);
    }
}
