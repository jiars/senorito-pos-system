<?php

namespace App\Http\Controllers\Api\OrderManagement\OrderItems;

use App\Http\Controllers\Controller;
use App\Models\MenuManagement\MenuItemPrice;
use App\Models\OrderManagement\OrderItem;
use Illuminate\Validation\ValidationException;

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
        $price = MenuItemPrice::query()
            ->whereKey($itemData['price_id'] ?? null)
            ->where('menu_item_id', $itemData['menu_item_id'] ?? null)
            ->where('archived', false)
            ->where('pos_status', 'Available')
            ->whereHas('menu_item', fn($query) => $query->where('archived', false))
            ->first();

        if (!$price) {
            throw ValidationException::withMessages([
                'items' => 'One or more selected menu variants are unavailable.',
            ]);
        }

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
