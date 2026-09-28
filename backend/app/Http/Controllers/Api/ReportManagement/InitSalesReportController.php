<?php

namespace App\Http\Controllers\Api\ReportManagement;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\ReportManagement\Inventory\WastageCostController;
use App\Http\Controllers\Api\ReportManagement\Sales\OrderSalesController;
use App\Models\MenuManagement\MenuCategory;
use Illuminate\Http\Request;

class InitSalesReportController extends Controller
{
    public function index(Request $request)
    {
        // Gather filtered Report data from separated controllers.
        $orders = app(OrderSalesController::class)->fetch($request);
        $wastageRecords = app(WastageCostController::class)->fetch($request);

        $categories = MenuCategory::select([
            'id',
            'category_name',
        ])
            ->orderBy('category_name', 'asc')
            ->get();

        return response()->json([
            'orders' => $orders,
            'wastageRecords' => $wastageRecords,
            'categories' => $categories,
        ]);
    }
}
