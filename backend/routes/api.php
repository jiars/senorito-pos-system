<?php

use App\Http\Controllers\Api\InventoryManagement\Categories\InventoryCategoryController;
use App\Http\Controllers\Api\InventoryManagement\InitInventoryManagementController;
use App\Http\Controllers\Api\InventoryManagement\Items\InventoryItemController;
use App\Http\Controllers\Api\InventoryManagement\Stock\InventoryRestockController;
use App\Http\Controllers\Api\InventoryManagement\Stock\InventoryWastageController;
use App\Http\Controllers\Api\InventoryManagement\Stock\InventoryCorrectionController;
use App\Http\Controllers\Api\InventoryManagement\AuditLogs\InventoryAuditLogController;
use App\Http\Controllers\Api\InventoryManagement\Reports\InventoryValuationController;
use App\Http\Controllers\Api\ExpenseManagement\Categories\ExpenseCategoryController;
use App\Http\Controllers\Api\MenuManagement\Addons\AddonController;
use App\Http\Controllers\Api\MenuManagement\Categories\MenuCategoryController;
use App\Http\Controllers\Api\MenuManagement\Items\MenuItemController;
use App\Http\Controllers\Api\MenuManagement\Orchestrators\AddonAddController;
use App\Http\Controllers\Api\MenuManagement\Orchestrators\AddonEditController;
use App\Http\Controllers\Api\MenuManagement\Orchestrators\MenuAddController;
use App\Http\Controllers\Api\MenuManagement\Orchestrators\MenuEditController;
use App\Http\Controllers\Api\InventoryManagement\Orchestrators\InventoryAddController;
use App\Http\Controllers\Api\InventoryManagement\Orchestrators\InventoryEditController;
use App\Http\Controllers\Api\MenuManagement\InitMenuManagementController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    // Auth related
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::prefix('menu-management')->group(function () {
        // 1. Unified Data Fetch for Menu Management
        Route::get('/init', [InitMenuManagementController::class, 'index']);

        // 2. Categories (Fetch, Add, Edit, Delete)
        Route::apiResource('categories', MenuCategoryController::class)->only(['index', 'store', 'update', 'destroy']);

        // 3. Menu Items (Fetch, Archive, Add Orchestrator, Edit Orchestrator)
        Route::apiResource('items', MenuItemController::class)->only(['index', 'destroy']);
        Route::post('items', [MenuAddController::class, 'store']);
        Route::put('items/{id}/sync', [MenuEditController::class, 'sync']);

        // 4. Add-ons (Fetch, Archive, Add Orchestrator, Edit Orchestrator)
        Route::apiResource('addons', AddonController::class)->only(['index', 'destroy']);
        Route::post('addons', [AddonAddController::class, 'store']);
        Route::put('addons/{id}/sync', [AddonEditController::class, 'sync']);
    });

    Route::prefix('inventory-management')->group(function () {
        // 1. Unified Data Fetch for Inventory Management
        Route::get('/init', [InitInventoryManagementController::class, 'index']);

        // 2. Categories (Fetch, Add, Edit, Delete)
        Route::apiResource('categories', InventoryCategoryController::class)->only(['index', 'store', 'update', 'destroy']);

        // 3. Inventory Items
        Route::post('items', [InventoryAddController::class, 'store']);
        Route::put('items/{id}/sync', [InventoryEditController::class, 'sync']);
        Route::delete('items/{id}', [InventoryItemController::class, 'destroy']);

        // Restock, Wastage and Correction
        Route::post('items/{id}/restock', [InventoryRestockController::class, 'store',]);
        Route::post('items/{id}/wastage', [InventoryWastageController::class, 'store',]);
        Route::post('items/{id}/correction', [InventoryCorrectionController::class, 'store']);

        // Read-only Inventory Audit Log
        Route::get('audit-logs', [InventoryAuditLogController::class, 'index']);

        // Menu Items and Add-ons affected by an ingredient
        Route::get('items/{id}/affected', [InventoryItemController::class, 'affected']);

        // Restore an archived Inventory Item
        Route::patch('items/{id}/unarchive', [InventoryItemController::class, 'unarchive']);

        // Read-only Inventory Valuation report
        Route::get('reports/valuation', [InventoryValuationController::class, 'index',]);
    });

    Route::prefix('expense-management')->group(function () {
        // 1. Categories (Fetch, Add, Edit, Delete)
        Route::apiResource('categories', ExpenseCategoryController::class)->only(['index', 'store', 'update', 'destroy',]);
    });
});
