<?php

namespace App\Http\Controllers\Api\MenuManagement\Orchestrators;

use App\Http\Controllers\Api\MenuManagement\Items\MenuItemPriceController;
use App\Http\Controllers\Controller;
use App\Models\MenuManagement\MenuItem;
use App\Models\MenuManagement\MenuItemPrice;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MenuEditController extends Controller
{
    public function sync(Request $request, string $id)
    {
        // Keep the current basic duplicate-name validation.
        $request->validate([
            'base_info.item_name' =>
            'required|string|unique:menu_items,item_name,' . $id,
        ], [
            'base_info.item_name.unique' =>
            'This menu item already exists.',
        ]);

        DB::transaction(function () use ($request, $id) {
            // Update the main Menu Item.
            $menuItem = MenuItem::findOrFail($id);
            $menuItem->update($request->input('base_info'));

            $prices = $request->input('prices', []);
            $pricesToInsert = [];
            $pricesToUpdate = [];
            $providedPriceIds = [];

            // Separate new prices from existing prices.
            foreach ($prices as $price) {
                if (
                    isset($price['id']) &&
                    Str::isUuid($price['id'])
                ) {
                    $pricesToUpdate[] = $price;
                    $providedPriceIds[] = $price['id'];
                } else {
                    $price['menu_item_id'] = $id;
                    $pricesToInsert[] = $price;
                }
            }

            // Prices missing from the request will be removed.
            $pricesToDelete = MenuItemPrice::where(
                'menu_item_id',
                $id
            )
                ->whereNotIn('id', $providedPriceIds)
                ->pluck('id')
                ->toArray();

            $priceController = app(
                MenuItemPriceController::class
            );

            // Trust the prices and calculations sent by React for now.
            if (!empty($pricesToInsert)) {
                $priceController->storeMany(
                    $pricesToInsert,
                    $id
                );
            }

            if (!empty($pricesToUpdate)) {
                $priceController->updateMany(
                    $pricesToUpdate,
                    $id
                );
            }

            if (!empty($pricesToDelete)) {
                $priceController->destroyMany(
                    $pricesToDelete
                );
            }
        });

        return response()->json([
            'message' => 'Menu Item updated successfully.'
        ]);
    }
}
