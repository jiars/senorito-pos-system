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
        $request->validate([
            'base_info.item_name' => 'required|string|unique:menu_items,item_name',
        ], [
            'base_info.item_name.unique' => 'This menu item already exists.',
        ]);
        DB::transaction(function () use ($request) {
            // 1. CREATE BASE ITEM
            $item = MenuItem::create($request->input('base_info'));
            $newId = $item->id;

            // 2. PREPARE PRICES FOR INSERTION
            $prices = $request->input('prices', []);
            $pricesToInsert = [];

            foreach ($prices as $price) {
                $price['menu_item_id'] = $newId;  // Attach the newly generated parent ID!
                $pricesToInsert[] = $price;
            }

            // 3. CALL THE PRICE CONTROLLER (Only Insert!)
            if (!empty($pricesToInsert)) {
                $priceController = app(MenuItemPriceController::class);
                $priceController->storeMany($pricesToInsert, $newId);
            }
        });

        return response()->json(['message' => 'Menu Item Created Perfectly!'], 201);
    }
}
