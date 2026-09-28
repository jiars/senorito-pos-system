<?php

namespace App\Http\Controllers\Api\MenuManagement\Addons;

use App\Http\Controllers\Controller;
use App\Models\MenuManagement\AddonRecipe;

class AddonRecipeController extends Controller
{
    public function storeMany(array $recipes, string $addonId)
    {
        foreach ($recipes as $recipeData) {
            AddonRecipe::create([
                'addon_id' => $addonId,
                'inventory_item_id' => $recipeData['inventory_item_id'],
                'quantity' => $recipeData['quantity'],
                'unit' => $recipeData['unit'],
                'estimated_cost' => $recipeData['estimated_cost'] ?? 0
            ]);
        }
    }

    public function updateMany(array $recipes)
    {
        foreach ($recipes as $recipeData) {
            AddonRecipe::where('id', $recipeData['id'])->update([
                'inventory_item_id' => $recipeData['inventory_item_id'],
                'quantity' => $recipeData['quantity'],
                'unit' => $recipeData['unit'],
                'estimated_cost' => $recipeData['estimated_cost'] ?? 0
            ]);
        }
    }

    public function destroyMany(array $ids)
    {
        AddonRecipe::whereIn('id', $ids)->delete();
    }
}
