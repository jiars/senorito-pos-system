<?php

namespace App\Http\Controllers\Api\DashboardManagement\Metrics;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class TodayMetricsController extends Controller
{
    // Get today's sales, orders, expenses, and low-stock count.
    public function fetch()
    {
        $businessDay = now('Asia/Manila')->startOfDay();
        $today = $businessDay->toDateString();
        // Match the Philippine day against UTC order timestamps.
        $start = $businessDay->copy()->utc();
        $end = $businessDay->copy()->addDay()->utc();

        $orders = DB::table('orders')
            ->where('order_datetime', '>=', $start)
            ->where('order_datetime', '<', $end)
            ->where('status', '!=', 'Cancelled')
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
