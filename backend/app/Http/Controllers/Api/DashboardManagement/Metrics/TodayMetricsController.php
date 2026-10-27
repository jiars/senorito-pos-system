<?php

namespace App\Http\Controllers\Api\DashboardManagement\Metrics;

use App\Http\Controllers\Controller;
use App\Models\OrderManagement\Order;
use Illuminate\Support\Facades\DB;

class TodayMetricsController extends Controller
{
    // Get today's sales, orders, expenses, and low-stock count.
    public function fetch()
    {
        $businessDay = now(config('app.business_timezone'))->startOfDay();
        $today = $businessDay->toDateString();
        // ISO strings keep the UTC offset explicit in database query bindings.
        $start = $businessDay->copy()->utc()->toISOString();
        $end = $businessDay->copy()->addDay()->utc()->toISOString();

        $orders = DB::table('orders')
            ->where('order_datetime', '>=', $start)
            ->where('order_datetime', '<', $end)
            ->whereNotIn('status', Order::NON_SALE_STATUSES)
            ->get();

        $totalExpenses = DB::table('expenses')
            ->whereDate('expense_date', $today)
            ->sum('amount');

        $lowStockCount = DB::table('inventory_items')
            ->where('archived', false)
            ->whereColumn('current_stock', '<=', 'minimum_level')
            ->count();

        return [
            'totalSales' => $orders->sum('total'),
            'orderCount' => $orders->count(),
            'totalExpenses' => $totalExpenses,
            'lowStockCount' => $lowStockCount,
        ];
    }
}
