<?php

//auth
use App\Http\Controllers\Api\AuthManagement\AuthController;
use App\Http\Controllers\Api\AuthManagement\Orchestrators\ForgotPasswordController;
use App\Http\Controllers\Api\AuthManagement\Orchestrators\ResetPasswordController;
use App\Http\Controllers\Api\AuthManagement\Orchestrators\SetupPasswordController;
use App\Http\Controllers\Api\AuthManagement\Orchestrators\ApprovePasswordResetRequestController;
use App\Http\Controllers\Api\AuthManagement\Orchestrators\ResendPasswordResetLinkController;
use App\Http\Controllers\Api\AuthManagement\PasswordResetRequests\CancelPasswordResetRequestController;

// dashboard
use App\Http\Controllers\Api\DashboardManagement\InitDashboardController;

// inventory
use App\Http\Controllers\Api\InventoryManagement\InitInventoryManagementController;
use App\Http\Controllers\Api\InventoryManagement\Categories\InventoryCategoryController;
use App\Http\Controllers\Api\InventoryManagement\Items\InventoryItemController;
use App\Http\Controllers\Api\InventoryManagement\Stock\InventoryRestockController;
use App\Http\Controllers\Api\InventoryManagement\Stock\InventoryWastageController;
use App\Http\Controllers\Api\InventoryManagement\Stock\InventoryCorrectionController;
use App\Http\Controllers\Api\InventoryManagement\AuditLogs\InventoryAuditLogController;
use App\Http\Controllers\Api\InventoryManagement\Reports\InventoryValuationController;
use App\Http\Controllers\Api\InventoryManagement\Orchestrators\InventoryAddController;
use App\Http\Controllers\Api\InventoryManagement\Orchestrators\InventoryEditController;

// expense
use App\Http\Controllers\Api\ExpenseManagement\InitExpenseManagementController;
use App\Http\Controllers\Api\ExpenseManagement\Expenses\ExpenseController;
use App\Http\Controllers\Api\ExpenseManagement\Categories\ExpenseCategoryController;
use App\Http\Controllers\Api\ExpenseManagement\Orchestrators\ExpenseAddController;
use App\Http\Controllers\Api\ExpenseManagement\Orchestrators\ExpenseEditController;

// menu
use App\Http\Controllers\Api\MenuManagement\InitMenuManagementController;
use App\Http\Controllers\Api\MenuManagement\Addons\AddonController;
use App\Http\Controllers\Api\MenuManagement\Categories\MenuCategoryController;
use App\Http\Controllers\Api\MenuManagement\Items\MenuItemController;
use App\Http\Controllers\Api\MenuManagement\Orchestrators\AddonAddController;
use App\Http\Controllers\Api\MenuManagement\Orchestrators\AddonEditController;
use App\Http\Controllers\Api\MenuManagement\Orchestrators\MenuAddController;
use App\Http\Controllers\Api\MenuManagement\Orchestrators\MenuEditController;

// orders
use App\Http\Controllers\Api\OrderManagement\InitOrderManagementController;
use App\Http\Controllers\Api\OrderManagement\OrderItems\OrderItemController;

// reports
use App\Http\Controllers\Api\ReportManagement\InitSalesReportController;

// pos
use App\Http\Controllers\Api\PosManagement\InitPosManagementController;
use App\Http\Controllers\Api\PosManagement\Orchestrators\CheckoutOrchestrator;

// employees
use App\Http\Controllers\Api\EmployeeManagement\InitEmployeeManagementController;
use App\Http\Controllers\Api\EmployeeManagement\AccountSetup\ResendSetupPasswordController;
use App\Http\Controllers\Api\EmployeeManagement\Orchestrators\EmployeeAddController;
use App\Http\Controllers\Api\EmployeeManagement\Orchestrators\EmployeeEditController;
use App\Http\Controllers\Api\EmployeeManagement\Orchestrators\EmployeeDeactivateController;
use App\Http\Controllers\Api\EmployeeManagement\Orchestrators\EmployeeReactivateController;

use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::prefix('auth/password')->group(function () {
    Route::post('/forgot', [ForgotPasswordController::class, 'store'])->middleware('throttle:password-request');
    Route::post('/reset', [ResetPasswordController::class, 'store'])->middleware('throttle:password-reset');
    Route::post('/setup', [SetupPasswordController::class, 'store'])->middleware('throttle:password-reset');
});

Route::middleware('auth:sanctum')->group(function () {
    // Auth related
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('auth/password/requests')->middleware('role:Owner')->group(function () {
        Route::post('{id}/approve', [ApprovePasswordResetRequestController::class, 'store',]);
        Route::patch('{id}/cancel', [CancelPasswordResetRequestController::class, 'update',]);
        Route::post('{id}/resend', [ResendPasswordResetLinkController::class, 'store',])->middleware('throttle:password-resend');
    });

    // Dashboard
    Route::get('/dashboard', [InitDashboardController::class, 'index'])->middleware('role:Owner,Cashier,Inventory Clerk');

    Route::prefix('menu-management')->name('menu-management.')->middleware('role:Owner')->group(function () {
        // 1. Unified Data Fetch for Menu Management
        Route::get('/init', [InitMenuManagementController::class, 'index']);

        // 2. Categories (Fetch, Add, Edit, Delete)
        Route::apiResource('categories', MenuCategoryController::class)->only(['index', 'store', 'update', 'destroy']);

        // 3. Menu Items (Fetch, Archive, Add Orchestrator, Edit Orchestrator)
        Route::apiResource('items', MenuItemController::class)->only(['index', 'destroy']);
        Route::post('items', [MenuAddController::class, 'store']);
        Route::put('items/{id}/sync', [MenuEditController::class, 'sync']);
        Route::patch('items/{id}/unarchive', [MenuItemController::class, 'unarchive']);

        // 4. Add-ons (Fetch, Archive, Add Orchestrator, Edit Orchestrator)
        Route::apiResource('addons', AddonController::class)->only(['index', 'destroy']);
        Route::post('addons', [AddonAddController::class, 'store']);
        Route::put('addons/{id}/sync', [AddonEditController::class, 'sync']);
        Route::patch('addons/{id}/unarchive', [AddonController::class, 'unarchive']);
    });

    Route::prefix('inventory-management')->name('inventory-management.')->middleware('role:Owner,Inventory Clerk')->group(function () {
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

    Route::prefix('expense-management')->name('expense-management.')->middleware('role:Owner')->group(function () {
        // Unified data fetch for the Expense Management page.
        Route::get('/init', [InitExpenseManagementController::class, 'index']);

        // Categories (Fetch, Add, Edit, Delete)
        Route::apiResource('categories', ExpenseCategoryController::class)->only(['index', 'store', 'update', 'destroy',]);

        // Expense Add and Edit orchestrators
        Route::post('expenses', [ExpenseAddController::class, 'store']);
        Route::put('expenses/{id}/sync', [ExpenseEditController::class, 'sync']);

        // Archive and restore Expense records.
        Route::delete('expenses/{id}', [ExpenseController::class, 'destroy']);
        Route::patch('expenses/{id}/unarchive', [ExpenseController::class, 'unarchive']);
    });

    Route::prefix('order-management')->middleware('role:Owner,Cashier')->group(function () {
        // Fetch the Order History page data.
        Route::get('/init', [InitOrderManagementController::class, 'index']);

        // Fetch the items and add-ons of one receipt.
        Route::get('/orders/{orderId}/items', [OrderItemController::class, 'index',]);
    });

    Route::prefix('report-management')->middleware('role:Owner')->group(function () {
        // Unified data fetch for Sales Reports.
        Route::get('/sales/init', [InitSalesReportController::class, 'index',]);
    });

    Route::prefix('pos-management')->middleware('role:Owner,Cashier')->group(function () {
        // Fetch everything required by the POS page.
        Route::get('/init', [InitPosManagementController::class, 'index']);
        Route::post('/checkout', [CheckoutOrchestrator::class, 'store',]);
    });

    Route::prefix('employee-management')->middleware('role:Owner')->group(function () {
        // Fetch everything required by Employee Management.
        Route::get('/init', [InitEmployeeManagementController::class, 'index',]);

        // Create an employee and send the setup-password link.
        Route::post('/employees', [EmployeeAddController::class, 'store']);

        // Resend setup for an active employee without a password.
        Route::post('/employees/{id}/setup-password/resend', [ResendSetupPasswordController::class, 'store']);

        // Update an employee's role and contact information.
        Route::put('/employees/{id}/sync', [EmployeeEditController::class, 'sync']);

        Route::patch('/employees/{id}/deactivate', [EmployeeDeactivateController::class, 'update']);
        Route::patch('/employees/{id}/reactivate', [EmployeeReactivateController::class, 'update']);
    });
});
