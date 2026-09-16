<?php

namespace App\Http\Controllers\Api\OrderManagement\OrderItems;

use App\Http\Controllers\Controller;
use App\Models\OrderManagement\OrderItem;

class OrderItemController extends Controller
{
    public function index(string $orderId)
    {
        // Fetch the items, variants, and add-ons of one receipt.
        $items = OrderItem::with([
            'menu_item:id,item_name',
            'variant:id,variant_name',
            'addons:id,order_item_id,addon_id,quantity,price',
            'addons.addon:id,addon_name',
        ])
            ->where('order_id', $orderId)
            ->get();

        return response()->json([
            'items' => $items,
        ]);
    }

    public function store(array $itemData, string $orderId)
    {
        // Create one purchased Menu item under the receipt.
        return OrderItem::create([
            'order_id' => $orderId,
            'menu_item_id' => $itemData['menu_item_id'],
            'price_id' => $itemData['price_id'],
            'quantity' => $itemData['quantity'],
            'unit_price' => $itemData['unit_price'],
            'subtotal' => $itemData['subtotal'],
        ]);
    }
}
