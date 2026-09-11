<?php

namespace App\Http\Controllers\Api\InventoryManagement\Orchestrators;

use App\Http\Controllers\Api\InventoryManagement\ConversionUnits\InventoryConversionUnitController;
use App\Models\InventoryManagement\InventoryConversionUnit;
use App\Models\InventoryManagement\InventoryItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class InventoryEditController extends Controller
{
    public function sync(Request $request, string $id)
    {
        $request->validate([
            'itemData.minimum_level' => 'required|numeric|min:1',
            'itemData.category_id' => 'required|exists:inventory_categories,id',
            'itemData.supplier' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($request, $id) {
            $item = InventoryItem::findOrFail($id);
            $itemData = $request->input('itemData');
            $conversions = $request->input('conversionsData', []);

            // Name, base unit, stock, and item code stay unchanged.
            $item->update([
                'category_id' => $itemData['category_id'],
                'minimum_level' => $itemData['minimum_level'],
                'supplier' => $itemData['supplier'] ?? null,
            ]);

            // Cost is editable only when the item has no batches.
            if (!$item->inventory_batches()->exists()) {
                $item->update([
                    'cost_per_unit' => $itemData['cost_per_unit'],
                ]);
            }

            $existingIds = InventoryConversionUnit::where(
                'inventory_item_id',
                $item->id
            )->pluck('id')->toArray();

            $toInsert = [];
            $toUpdate = [];
            $providedIds = [];

            foreach ($conversions as $conversion) {
                if (
                    !empty($conversion['id']) &&
                    Str::isUuid($conversion['id'])
                ) {
                    $toUpdate[] = $conversion;
                    $providedIds[] = $conversion['id'];
                } else {
                    $toInsert[] = $conversion;
                }
            }

            // Only IDs missing from the payload are removed.
            $toDelete = array_diff($existingIds, $providedIds);

            $conversionController = app(
                InventoryConversionUnitController::class
            );

            if (!empty($toInsert)) {
                $conversionController->storeMany(
                    $toInsert,
                    $item->id
                );
            }

            if (!empty($toUpdate)) {
                $conversionController->updateMany(
                    $toUpdate,
                    $item->id
                );
            }

            if (!empty($toDelete)) {
                $conversionController->destroyMany(
                    $toDelete,
                    $item->id
                );
            }
        });

        return response()->json([
            'message' => 'Inventory item updated successfully.'
        ]);
    }
}
