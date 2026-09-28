<?php

namespace App\Http\Controllers\Api\OrderManagement\Orders;

use App\Http\Controllers\Controller;
use App\Models\OrderManagement\Order;

class OrderController extends Controller
{
    public function store(array $orderData)
    {
        // Create the main receipt using trusted Checkout values.
        return Order::create([
            'order_number' => $orderData['order_number'],
            'cashier_id' => $orderData['cashier_id'],
            'client_transaction_id' => $orderData['client_transaction_id'],
            'order_datetime' => $orderData['order_datetime'],
            'order_source' => $orderData['order_source'],
            'payment_method' => $orderData['payment_method'],
            'discount_type' => $orderData['discount_type'],
            'subtotal' => $orderData['subtotal'],
            'discount_amount' => $orderData['discount_amount'],
            'total' => $orderData['total'],
            'amount_paid' => $orderData['amount_paid'],
            'change_amount' => $orderData['change_amount'],
            'status' => 'Completed',
        ]);
    }
}
