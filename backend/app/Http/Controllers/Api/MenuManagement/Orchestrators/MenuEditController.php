<?php

namespace App\Http\Controllers\Api\MenuManagement\Orchestrators;

use App\Http\Controllers\Api\MenuManagement\Items\MenuItemPriceController;
use App\Http\Controllers\Controller;
use App\Models\MenuManagement\MenuItem;
use App\Models\MenuManagement\MenuItemPrice;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

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
            $existingPrices = MenuItemPrice::where('menu_item_id', $id)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');
            $menuItem->update($request->input('base_info'));

            $prices = $request->input('prices', []);
            $pricesToInsert = [];
            $pricesToUpdate = [];
            $providedPriceIds = [];
            $finalActivePriceIds = $existingPrices
                ->filter(fn(MenuItemPrice $price) => !$price->archived)
                ->keys()
                ->all();

            // Separate new prices from existing prices.
            foreach ($prices as $price) {
                if (array_key_exists('id', $price) && $price['id'] !== null) {
                    if (!Str::isUuid($price['id'])) {
                        throw ValidationException::withMessages([
                            'prices' => 'Existing price variants must use a valid ID.',
                        ]);
                    }

                    if (!$existingPrices->has($price['id'])) {
                        throw ValidationException::withMessages([
                            'prices' => 'One or more price variants do not belong to this menu item.',
                        ]);
                    }

                    $pricesToUpdate[] = $price;
                    $providedPriceIds[] = $price['id'];

                    $existingPrice = $existingPrices->get($price['id']);
                    $isArchived = array_key_exists('archived', $price)
                        ? (bool) $price['archived']
                        : (bool) $existingPrice->archived;

                    if ($isArchived) {
                        $finalActivePriceIds = array_values(array_diff(
                            $finalActivePriceIds,
                            [$price['id']]
                        ));
                    } elseif (!in_array($price['id'], $finalActivePriceIds, true)) {
                        $finalActivePriceIds[] = $price['id'];
                    }
                } else {
                    if (!empty($price['archived'])) {
                        throw ValidationException::withMessages([
                            'prices' => 'New price variants cannot be archived before they are saved.',
                        ]);
                    }

                    $price['menu_item_id'] = $id;
                    $pricesToInsert[] = $price;
                    $finalActivePriceIds[] = 'new-' . count($pricesToInsert);
                }
            }

            // Saved variants missing from the request are archived, not deleted.
            $pricesToArchive = $existingPrices
                ->filter(
                    fn(MenuItemPrice $price) =>
                    !$price->archived &&
                        !in_array($price->id, $providedPriceIds, true)
                )
                ->keys()
                ->all();

            $finalActivePriceIds = array_values(array_diff(
                $finalActivePriceIds,
                $pricesToArchive
            ));

            if (empty($finalActivePriceIds)) {
                throw ValidationException::withMessages([
                    'prices' => 'At least one active price variant is required.',
                ]);
            }

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

            if (!empty($pricesToArchive)) {
                $priceController->destroyMany(
                    $pricesToArchive
                );
            }
        });

        return response()->json([
            'message' => 'Menu Item updated successfully.'
        ]);
    }
}
