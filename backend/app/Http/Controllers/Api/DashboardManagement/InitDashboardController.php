<?php

namespace App\Http\Controllers\Api\DashboardManagement;

use App\Http\Controllers\Api\DashboardManagement\Alerts\InventoryAlertsController;
use App\Http\Controllers\Api\DashboardManagement\Metrics\TodayMetricsController;
use App\Http\Controllers\Api\DashboardManagement\Orders\RecentOrdersController;
use App\Http\Controllers\Api\DashboardManagement\Sales\TopSellingItemsController;
use App\Http\Controllers\Api\DashboardManagement\Sales\WeeklySalesController;
use App\Http\Controllers\Controller;

class InitDashboardController extends Controller
{
    // Gather all Dashboard data into one response.
    public function index()
    {
        return response()->json([
            'metrics' => app(TodayMetricsController::class)->fetch(),
            'alerts' => app(InventoryAlertsController::class)->fetch(),
            'weeklySales' => app(WeeklySalesController::class)->fetch(),
            'topItems' => app(TopSellingItemsController::class)->fetch(),
            'recentOrders' => app(RecentOrdersController::class)->fetch(),
        ]);
    }
}
