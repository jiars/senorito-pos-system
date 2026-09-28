<?php

namespace App\Http\Controllers\Api\MenuManagement\Orchestrators;

use App\Http\Controllers\Api\MenuManagement\Items\MenuItemPriceController;
use App\Http\Controllers\Controller;
use App\Models\MenuManagement\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MenuAddController extends Controller
{
    public function store(Request $request)
    {
        // Keep only the current basic duplicate-name validation.
        $request->validate([
            'base_info.item_name' =>
            'required|string|unique:menu_items,item_name',
        ], [
            'base_info.item_name.unique' =>
            'This menu item already exists.',
        ]);

        DB::transaction(function () use ($request) {
            // Create the main Menu Item.
            $menuItem = MenuItem::create(
                $request->input('base_info')
            );

            $prices = $request->input('prices', []);
            $pricesToInsert = [];

            foreach ($prices as $price) {
                // Trust the calculations currently sent by React.
                $price['menu_item_id'] = $menuItem->id;
                $pricesToInsert[] = $price;
            }

            // Save prices and their recipes.
            if (!empty($pricesToInsert)) {
                $priceController = app(
                    MenuItemPriceController::class
                );

                $priceController->storeMany(
                    $pricesToInsert,
                    $menuItem->id
                );
            }
        });

        return response()->json([
            'message' => 'Menu Item created successfully.'
        ], 201);
    }
}
