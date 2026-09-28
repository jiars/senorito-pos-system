<?php

namespace App\Http\Controllers\Api\MenuManagement\Orchestrators;

use App\Http\Controllers\Api\MenuManagement\Addons\AddonCategoryController;
use App\Http\Controllers\Api\MenuManagement\Addons\AddonRecipeController;
use App\Http\Controllers\Api\MenuManagement\RecipeStatuses\RecipeStatusController;
use App\Http\Controllers\Controller;
use App\Models\MenuManagement\Addon;
use App\Models\MenuManagement\AddonCategory;
use App\Models\MenuManagement\AddonRecipe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AddonEditController extends Controller
{
    public function sync(Request $request, string $id)
    {
        $request->validate([
            'base_info.addon_name' => 'required|string|unique:addons,addon_name,' . $id,
        ], [
            'base_info.addon_name.unique' => 'This add-on already exists.',
        ]);

        DB::transaction(function () use ($request, $id) {
            // 1. UPDATE BASE ADD-ON
            $addon = Addon::findOrFail($id);
            $addon->update($request->input('base_info'));

            // 2. SORT CATEGORIES INTO BUCKETS (Array Diffing!)
            $incomingCategories = $request->input('categories', []);

            $existingCategories = AddonCategory::where('addon_id', $id)
                ->pluck('menu_category_id')
                ->toArray();

            $categoriesToInsert = array_diff($incomingCategories, $existingCategories);
            $categoriesToDelete = array_diff($existingCategories, $incomingCategories);

            $categoryController = app(AddonCategoryController::class);

            if (!empty($categoriesToInsert))  $categoryController->storeMany($categoriesToInsert, $id);
            if (!empty($categoriesToDelete)) $categoryController->destroyMany($categoriesToDelete, $id);


            // 3. SORT RECIPES INTO BUCKETS
            $recipes = $request->input('recipes', []);
            $recipesToInsert = [];
            $recipesToUpdate = [];
            $providedRecipeIds = [];

            foreach ($recipes as $recipe) {
                if (isset($recipe['id']) && Str::isUuid($recipe['id'])) {
                    $recipesToUpdate[] = $recipe;
                    $providedRecipeIds[] = $recipe['id'];
                } else $recipesToInsert[] = $recipe;
            }

            $recipesToDelete = AddonRecipe::where('addon_id', $id)
                ->whereNotIn('id', $providedRecipeIds)
                ->pluck('id')
                ->toArray();

            // 4. CALL RECIPE CONTROLLER
            $recipeController = app(AddonRecipeController::class);
            if (!empty($recipesToInsert)) $recipeController->storeMany($recipesToInsert, $id);
            if (!empty($recipesToUpdate)) $recipeController->updateMany($recipesToUpdate);
            if (!empty($recipesToDelete)) $recipeController->destroyMany($recipesToDelete);

            // Recalculate after recipe synchronization is complete.
            app(RecipeStatusController::class)
                ->syncAddon($id);
        });

        return response()->json(['message' => 'Add-on Synced via Orchestrator!']);
    }
}
