<?php

namespace App\Http\Controllers\Api\InventoryManagement\ConversionUnits;

use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryConversionUnit;
use Illuminate\Support\Str;

class InventoryConversionUnitController extends Controller
{
    public function storeMany(array $conversions, string $inventoryItemId)
    {
        $insertData = [];

        foreach ($conversions as $conversion) {
            $insertData[] = [
                'id' => Str::uuid(),
                'inventory_item_id' => $inventoryItemId,
                'converted_unit' => $conversion['converted_unit'],
                'equivalent_base_amount' =>
                $conversion['equivalent_base_amount'],
            ];
        }

        // Save all conversion units using one database query.
        if (!empty($insertData)) {
            InventoryConversionUnit::insert($insertData);
        }
    }

    public function updateMany(array $conversions, string $inventoryItemId)
    {
        foreach ($conversions as $conversion) {
            InventoryConversionUnit::where('id', $conversion['id'])
                ->where('inventory_item_id', $inventoryItemId)
                ->update([
                    'converted_unit' =>
                    $conversion['converted_unit'],
                    'equivalent_base_amount' =>
                    $conversion['equivalent_base_amount'],
                ]);
        }
    }

    public function destroyMany(array $ids, string $inventoryItemId)
    {
        // Delete only conversions removed from the submitted form.
        InventoryConversionUnit::where('inventory_item_id', $inventoryItemId)
            ->whereIn('id', $ids)
            ->delete();
    }
}
