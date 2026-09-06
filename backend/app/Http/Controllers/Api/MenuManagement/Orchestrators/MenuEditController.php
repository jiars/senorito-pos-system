<?php

namespace App\Http\Controllers\Api\MenuManagement\Orchestrators;

use App\Http\Controllers\Api\MenuManagement\Items\MenuItemPriceController;
use App\Http\Controllers\Controller;
use App\Models\MenuManagement\MenuItem;
use App\Models\MenuManagement\MenuItemPrice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MenuEditController extends Controller
{
    public function sync(Request $request, string $id)
    {
        $request->validate([
            'base_info.item_name' => 'required|string|unique:menu_items,item_name,' . $id,
        ], [
            'base_info.item_name.unique' => 'This menu item already exists.',
        ]);
        DB::transaction(function () use ($request, $id) {
            // 1. UPDATE BASE ITEM
            $item = MenuItem::findOrFail($id);
            $item->update($request->input('base_info'));

            // 2. SORT THE PRICES INTO BUCKETS
            $prices = $request->input('prices', []);
            $pricesToInsert = [];
            $pricesToUpdate = [];
            $providedPriceIds = [];

            foreach ($prices as $price) {
                if (isset($price['id']) && Str::isUuid($price['id'])) {
                    $pricesToUpdate[] = $price;
                    $providedPriceIds[] = $price['id'];
                } else {
                    $price['menu_item_id'] = $id;  // Attach parent ID
                    $pricesToInsert[] = $price;
                }
            }

            // Figure out which prices were deleted
            $pricesToDelete = MenuItemPrice::where('menu_item_id', $id)
                ->whereNotIn('id', $providedPriceIds)
                ->pluck('id')
                ->toArray();

            // 3. CALL THE PRICE CONTROLLER!
            $priceController = app(MenuItemPriceController::class);
            if (!empty($pricesToInsert))
                $priceController->storeMany($pricesToInsert, $id);
            if (!empty($pricesToUpdate))
                $priceController->updateMany($pricesToUpdate, $id);
            if (!empty($pricesToDelete))
                $priceController->destroyMany($pricesToDelete);
        });

        return response()->json(['message' => 'Menu Item Synced via Traffic Cop!']);
    }
}
