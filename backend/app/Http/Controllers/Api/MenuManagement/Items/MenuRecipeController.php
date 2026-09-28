<?php

namespace App\Http\Controllers\Api\MenuManagement\Items;

use App\Http\Controllers\Controller;
use App\Models\MenuManagement\MenuRecipe;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MenuRecipeController extends Controller
{
    public function storeMany(array $recipes, string $menuItemId, string $priceId)
    {
        $insertData = [];
        foreach ($recipes as $recipe) {
            $insertData[] = [
                'id' => Str::uuid(),
                'menu_item_id' => $menuItemId,
                'menu_item_price_id' => $priceId,
                'inventory_item_id' => $recipe['inventory_item_id'],
                'quantity' => $recipe['quantity'],
                'unit' => $recipe['unit'],
                'estimated_cost' => $recipe['estimated_cost'] ?? 0,
            ];
        }

        // This is where the magic happens: 1 single SQL Insert for ALL recipes!
        if (!empty($insertData)) {
            MenuRecipe::insert($insertData);
        }
    }

    public function updateMany(array $recipes)
    {
        foreach ($recipes as $recipe) {
            MenuRecipe::where('id', $recipe['id'])->update([
                'inventory_item_id' => $recipe['inventory_item_id'],
                'quantity' => $recipe['quantity'],
                'unit' => $recipe['unit'],
                'estimated_cost' => $recipe['estimated_cost'] ?? 0,
            ]);
        }
    }

    public function destroyMany(array $ids)
    {
        MenuRecipe::whereIn('id', $ids)->delete();
    }
}
