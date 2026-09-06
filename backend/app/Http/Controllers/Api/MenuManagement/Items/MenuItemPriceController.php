<?php

namespace App\Http\Controllers\Api\MenuManagement\Items;

use App\Http\Controllers\Api\MenuManagement\Items\MenuRecipeController;
use App\Http\Controllers\Controller;
use App\Models\MenuManagement\MenuItemPrice;
use App\Models\MenuManagement\MenuRecipe;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MenuItemPriceController extends Controller
{
    public function storeMany(array $prices, string $menuItemId)
    {
        $recipeController = app(MenuRecipeController::class);
        foreach ($prices as $priceData) {
            $newPrice = MenuItemPrice::create([
                'menu_item_id' => $menuItemId,
                'variant_name' => $priceData['variant_name'],
                'selling_price' => $priceData['selling_price'],
                'estimated_cost' => $priceData['estimated_cost'] ?? 0,
                'profit' => $priceData['profit'] ?? 0,
                'margin' => $priceData['margin'] ?? 0,
                'item_code' => $priceData['item_code'] ?? null,
                'pos_status' => $priceData['pos_status'] ?? 'Available'
            ]);
            // Pass the recipes down to the Recipe Controller!
            if (!empty($priceData['recipes'])) {
                $recipeController->storeMany($priceData['recipes'], $menuItemId, $newPrice->id);
            }
        }
    }

    public function updateMany(array $prices, string $menuItemId)
    {
        $recipeController = app(MenuRecipeController::class);
        foreach ($prices as $priceData) {
            MenuItemPrice::where('id', $priceData['id'])->update([
                'variant_name' => $priceData['variant_name'],
                'selling_price' => $priceData['selling_price'],
                'estimated_cost' => $priceData['estimated_cost'] ?? 0,
                'profit' => $priceData['profit'] ?? 0,
                'margin' => $priceData['margin'] ?? 0,
                'item_code' => $priceData['item_code'] ?? null,
                'pos_status' => $priceData['pos_status'] ?? 'Available'
            ]);
            // Sort recipes for this specific price
            $recipesToInsert = [];
            $recipesToUpdate = [];
            $providedRecipeIds = [];
            foreach ($priceData['recipes'] ?? [] as $recipe) {
                if (isset($recipe['id']) && Str::isUuid($recipe['id'])) {
                    $recipesToUpdate[] = $recipe;
                    $providedRecipeIds[] = $recipe['id'];
                } else {
                    $recipesToInsert[] = $recipe;
                }
            }
            $recipesToDelete = MenuRecipe::where('menu_item_price_id', $priceData['id'])
                ->whereNotIn('id', $providedRecipeIds)
                ->pluck('id')
                ->toArray();
            // Pass the recipe buckets down to the Recipe Controller!
            if (!empty($recipesToInsert))
                $recipeController->storeMany($recipesToInsert, $menuItemId, $priceData['id']);
            if (!empty($recipesToUpdate))
                $recipeController->updateMany($recipesToUpdate);
            if (!empty($recipesToDelete))
                $recipeController->destroyMany($recipesToDelete);
        }
    }

    public function destroyMany(array $ids)
    {
        MenuItemPrice::whereIn('id', $ids)->delete();
    }
}
