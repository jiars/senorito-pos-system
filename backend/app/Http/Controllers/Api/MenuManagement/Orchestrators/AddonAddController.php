<?php

namespace App\Http\Controllers\Api\MenuManagement\Orchestrators;

use App\Http\Controllers\Api\MenuManagement\Addons\AddonCategoryController;
use App\Http\Controllers\Api\MenuManagement\Addons\AddonRecipeController;
use App\Http\Controllers\Controller;
use App\Models\MenuManagement\Addon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddonAddController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'base_info.addon_name' => 'required|string|unique:addons,addon_name',
        ], [
            'base_info.addon_name.unique' => 'This add-on already exists.',
        ]);

        DB::transaction(function () use ($request) {
            // 1. CREATE BASE ADDON
            $addon = Addon::create($request->input('base_info'));
            $newId = $addon->id;

            // 2. INSERT CATEGORIES
            $categories = $request->input('categories', []);
            if (!empty($categories)) {
                $categoryController = app(AddonCategoryController::class);
                $categoryController->storeMany($categories, $newId);
            }

            // 3. INSERT RECIPES
            $recipes = $request->input('recipes', []);
            if (!empty($recipes)) {
                $recipeController = app(AddonRecipeController::class);
                $recipeController->storeMany($recipes, $newId);
            }
        });

        return response()->json(['message' => 'Add-on Created Perfectly!'], 201);
    }
}
