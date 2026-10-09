<?php

namespace App\Http\Controllers\Api\OrderManagement\OrderItemAddons;

use App\Http\Controllers\Controller;
use App\Models\MenuManagement\Addon;
use App\Models\OrderManagement\OrderItemAddon;
use Illuminate\Validation\ValidationException;

class OrderItemAddonController extends Controller
{
    public function storeMany(array $addonsData, string $orderItemId)
    {
        $createdAddons = [];

        // Save every selected add-on under its Order Item.
        foreach ($addonsData as $addonData) {
            // Check the database, not the cashier's cached Add-on list.
            $addon = Addon::query()
                ->whereKey($addonData['addon_id'] ?? null)
                ->where('archived', false)
                ->where('pos_status', 'Available')
                ->lockForUpdate()
                ->first();

            if (!$addon) {
                throw ValidationException::withMessages([
                    'items' => 'One or more selected add-ons are unavailable.',
                ]);
            }

            $createdAddons[] = OrderItemAddon::create([
                'order_item_id' => $orderItemId,
                'addon_id' => $addonData['addon_id'],
                'quantity' => $addonData['quantity'],
                'price' => $addonData['price'],
            ]);
        }

        return $createdAddons;
    }
}
