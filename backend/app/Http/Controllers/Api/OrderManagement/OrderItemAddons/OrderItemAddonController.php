<?php

namespace App\Http\Controllers\Api\OrderManagement\OrderItemAddons;

use App\Http\Controllers\Controller;
use App\Models\OrderManagement\OrderItemAddon;

class OrderItemAddonController extends Controller
{
    public function storeMany(array $addonsData, string $orderItemId)
    {
        $createdAddons = [];

        // Save every selected add-on under its Order Item.
        foreach ($addonsData as $addonData) {
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
