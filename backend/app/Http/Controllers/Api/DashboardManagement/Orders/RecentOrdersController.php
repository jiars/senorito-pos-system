<?php

namespace App\Http\Controllers\Api\DashboardManagement\Orders;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RecentOrdersController extends Controller
{
    // Get the six most recent orders.
    public function fetch()
    {
        return DB::table('orders')
            ->leftJoin('users', 'orders.cashier_id', '=', 'users.id')
            ->select(
                'orders.order_number',
                'orders.order_datetime',
                'orders.total',
                'orders.payment_method',
                'orders.status',
                'users.first_name',
                'users.last_name'
            )
            ->orderByDesc('orders.order_datetime')
            ->limit(6)
            ->get()
            ->map(function ($order) {
                $cashierName = $order->first_name && $order->last_name
                    ? "{$order->first_name} {$order->last_name}"
                    : 'Admin / System';

                return [
                    'orderNo' => $order->order_number,
                    'cashier' => $cashierName,
                    'total' => (float) $order->total,
                    'payment' => $order->payment_method,
                    'status' => $order->status ?? 'Completed',
                    'date' => Carbon::parse($order->order_datetime)
                        ->format('m/d/Y H:i'),
                ];
            });
    }
}
