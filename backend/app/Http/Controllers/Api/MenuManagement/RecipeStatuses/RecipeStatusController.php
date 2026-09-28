<?php

namespace App\Http\Controllers\Api\MenuManagement\RecipeStatuses;

use App\Http\Controllers\Controller;
use App\Models\MenuManagement\Addon;
use App\Models\MenuManagement\AddonRecipe;
use App\Models\MenuManagement\MenuItemPrice;
use App\Models\MenuManagement\MenuRecipe;

class RecipeStatusController extends Controller
{
    public function syncMenuPrice(string $priceId): string
    {
        $price = MenuItemPrice::findOrFail($priceId);

        // Include recipes assigned to this price and shared recipes.
        $recipes = MenuRecipe::query()
            ->where('menu_item_id', $price->menu_item_id)
            ->where(function ($query) use ($price) {
                $query
                    ->where('menu_item_price_id', $price->id)
                    ->orWhereNull('menu_item_price_id');
            });

        $status = $this->resolveStatus($recipes);

        $price->update([
            'recipe_status' => $status,
        ]);

        return $status;
    }

    public function syncMenuPrices(array $priceIds): void
    {
        foreach (array_unique($priceIds) as $priceId) {
            $this->syncMenuPrice($priceId);
        }
    }

    public function syncAddon(string $addonId): string
    {
        $addon = Addon::findOrFail($addonId);

        $recipes = AddonRecipe::query()
            ->where('addon_id', $addon->id);

        $status = $this->resolveStatus($recipes);

        $addon->update([
            'recipe_status' => $status,
        ]);

        return $status;
    }

    private function resolveStatus($recipes): string
    {
        $hasRecipe = (clone $recipes)->exists();

        if (!$hasRecipe)
            return 'Incomplete';


        $hasArchivedIngredient = (clone $recipes)
            ->whereHas('inventory_items', function ($query) {
                $query->where('archived', true);
            })
            ->exists();

        if ($hasArchivedIngredient)
            return 'On Hold';

        return 'Complete';
    }

    public function syncAffectedByInventoryItem(string $inventoryItemId): array
    {
        // Prices directly using this ingredient.
        $priceIds = MenuRecipe::query()
            ->where('inventory_item_id', $inventoryItemId)
            ->whereNotNull('menu_item_price_id')
            ->pluck('menu_item_price_id');

        // Shared recipes affect every price under their Menu Item.
        $sharedMenuItemIds = MenuRecipe::query()
            ->where('inventory_item_id', $inventoryItemId)
            ->whereNull('menu_item_price_id')
            ->pluck('menu_item_id');

        if ($sharedMenuItemIds->isNotEmpty()) {
            $sharedPriceIds = MenuItemPrice::query()
                ->whereIn('menu_item_id', $sharedMenuItemIds)
                ->pluck('id');

            $priceIds = $priceIds->merge($sharedPriceIds);
        }

        $priceIds = $priceIds
            ->filter()
            ->unique()
            ->values()
            ->all();

        // Find affected Add-ons.
        $addonIds = AddonRecipe::query()
            ->where('inventory_item_id', $inventoryItemId)
            ->pluck('addon_id')
            ->filter()
            ->unique()
            ->values()
            ->all();

        $this->syncMenuPrices($priceIds);

        foreach ($addonIds as $addonId) {
            $this->syncAddon($addonId);
        }

        return [
            'menuPriceIds' => $priceIds,
            'addonIds' => $addonIds,
        ];
    }
}
