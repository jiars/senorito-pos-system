<?php

namespace App\Http\Controllers\Api\DashboardManagement\Metrics;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class TodayMetricsController extends Controller
{
    // Get today's sales, orders, expenses, and low-stock count.
    public function fetch()
    {
        $today = now()->toDateString();

        $orders = DB::table('orders')
            ->whereDate('order_datetime', $today)
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
