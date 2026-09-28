<?php

namespace App\Http\Controllers\Api\DashboardManagement\Sales;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class TopSellingItemsController extends Controller
{
    // Get the five best-selling items from the last seven days.
    public function fetch()
    {
        $sevenDaysAgo = now()->subDays(7)->startOfDay();

        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->leftJoin(
                'menu_categories',
                'menu_items.category_id',
                '=',
                'menu_categories.id'
            )
            ->where('orders.order_datetime', '>=', $sevenDaysAgo)
            ->where('orders.status', '!=', 'Cancelled')
            ->select(
                'menu_items.id',
                'menu_items.item_name as name',
                'menu_items.image_url',
                'menu_categories.category_name as category',
                DB::raw('SUM(order_items.quantity) as sold'),
                DB::raw('SUM(order_items.subtotal) as price')
            )
            ->groupBy(
                'menu_items.id',
                'menu_items.item_name',
                'menu_items.image_url',
                'menu_categories.category_name'
            )
            ->orderByDesc('sold')
            ->limit(5)
            ->get()
            ->map(function ($item, $index) {
                return [
                    'id' => $item->id,
                    'rank' => $index + 1,
                    'category' => $item->category ?? 'Uncategorized',
                    'name' => $item->name,
                    'imageUrl' => $item->image_url,
                    'price' => (float) $item->price,
                    'sold' => (int) $item->sold,
                ];
            });
    }
}
