<?php

use App\Http\Controllers\Api\InventoryManagement\Categories\InventoryCategoryController;
use App\Http\Controllers\Api\InventoryManagement\InitInventoryManagementController;
use App\Http\Controllers\Api\MenuManagement\Addons\AddonController;
use App\Http\Controllers\Api\MenuManagement\Categories\MenuCategoryController;
use App\Http\Controllers\Api\MenuManagement\Items\MenuItemController;
use App\Http\Controllers\Api\MenuManagement\Orchestrators\AddonAddController;
use App\Http\Controllers\Api\MenuManagement\Orchestrators\AddonEditController;
use App\Http\Controllers\Api\MenuManagement\Orchestrators\MenuAddController;
use App\Http\Controllers\Api\MenuManagement\Orchestrators\MenuEditController;
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
    });
});
