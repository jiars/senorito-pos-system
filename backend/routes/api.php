<?php

use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MenuCategoryController;
use App\Http\Controllers\Api\MenuItemController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// dashboard api routes
Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('auth:sanctum');

// menu api routes
Route::apiResource('menu-categories', MenuCategoryController::class)->middleware('auth:sanctum');
Route::apiResource('menu-items', MenuItemController::class)->middleware('auth:sanctum');
