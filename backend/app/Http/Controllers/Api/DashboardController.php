<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    // Get the complete Dashboard Summary in ONE request (BFF Pattern)
    public function index(Request $request)
    {
        return response()->json([
            'metrics' => $this->calculateMetrics(),
            'alerts' => $this->calculateAlerts(),
            'weeklySales' => $this->calculateWeeklySales(),
            'topItems' => $this->calculateTopItems(),
            'recentOrders' => $this->calculateRecentOrders(),
        ]);
    }

    // Get Today's Metrics (Sales, Expenses, Orders, Low Stock)
    private function calculateMetrics()
    {
        // Get today's date in YYYY-MM-DD format
        $today = now()->toDateString();

        // 1. Today's Orders & Sales (Only grab orders that are not cancelled)
        $orders = DB::table('orders')
            ->whereDate('order_datetime', $today)
            ->where('status', '!=', 'Cancelled')
            ->get();

        $totalSales = $orders->sum('total');
        $orderCount = $orders->count();

        // 2. Today's Expenses
        $totalExpenses = DB::table('expenses')
            ->whereDate('expense_date', $today)
            ->sum('amount');

        // 3. Low Stock Count (Directly compare current_stock vs minimum_level in DB)
        $lowStockCount = DB::table('inventory_items')
            ->where('archived', false)
            ->whereColumn('current_stock', '<=', 'minimum_level')
            ->count();

        return [
            'totalSales' => $totalSales,
            'orderCount' => $orderCount,
            'totalExpenses' => $totalExpenses,
            'lowStockCount' => $lowStockCount
        ];
    }

    // Get Inventory Alerts (Low Stock & Expiry)
    private function calculateAlerts()
    {
        // 1. Low Stock Alert
        $lowStockItems = DB::table('inventory_items')
            ->select('item_name as name', 'minimum_level as min', 'current_stock as qty', 'base_unit as unit')
            ->where('archived', false)
            ->whereColumn('current_stock', '<=', 'minimum_level')
            ->orderBy('current_stock', 'desc')
            ->get()
            ->map(function ($item) {
                // Add the critical/warning level tag directly from the server
                $item->level = $item->qty <= 0 ? 'critical' : 'warning';
                return $item;
            });

        // 2. Near Expiry / Expired Batches
        $today = now()->startOfDay();
        $nextWeek = now()->addDays(7)->endOfDay();
        // Join the batches table with the items table to get the name and unit!
        $batches = DB::table('inventory_batches')
            ->join('inventory_items', 'inventory_batches.inventory_item_id', '=', 'inventory_items.id')
            ->select(
                'inventory_batches.batch_number as batch',
                'inventory_batches.expiration_date',
                'inventory_batches.quantity',
                'inventory_items.item_name',
                'inventory_items.base_unit'
            )
            ->where('inventory_items.archived', false)
            ->whereNotNull('inventory_batches.expiration_date')
            // Only grab items that expire before next week
            ->where('inventory_batches.expiration_date', '<=', $nextWeek)
            ->orderBy('inventory_batches.expiration_date', 'asc')
            ->get();
        $expiryItems = $batches->map(function ($batch) use ($today) {
            $expDate = \Carbon\Carbon::parse($batch->expiration_date);
            $isExpired = $expDate->lt($today);

            return [
                'name' => $batch->item_name,
                'batch' => $batch->batch,
                'size' => $batch->quantity . ' ' . $batch->base_unit,
                'exp' => $expDate->format('M d, Y'),
                'status' => $isExpired ? 'expired' : 'expiring',
            ];
        });

        return [
            'lowStockItems' => $lowStockItems,
            'expiryItems' => $expiryItems
        ];
    }

    // Get Weekly Sales Data (Sunday to Saturday)
    private function calculateWeeklySales()
    {
        // 1. Tell Carbon that our week starts on Sunday
        $startOfWeek = now()->startOfWeek(\Carbon\Carbon::SUNDAY);

        // 2. Fetch all successful orders from Sunday up to right now
        $orders = DB::table('orders')
            ->where('order_datetime', '>=', $startOfWeek)
            ->where('status', '!=', 'Cancelled')
            ->select('order_datetime', 'total')
            ->get();

        $data = [];

        // 3. Loop exactly 7 times (Sunday to Saturday)
        for ($i = 0; $i < 7; $i++) {
            // Calculate the exact day for this loop iteration
            $currentDay = $startOfWeek->copy()->addDays($i);

            // Format it to short name ("Sun", "Mon", "Tue")
            $dayName = $currentDay->format('D');

            // Sum all orders where the date matches this specific day
            $dailyTotal = $orders->filter(function ($order) use ($currentDay) {
                return \Carbon\Carbon::parse($order->order_datetime)->isSameDay($currentDay);
            })->sum('total');

            // Push it to our array
            $data[] = [
                'day' => $dayName,
                'value' => $dailyTotal
            ];
        }

        return $data;
    }

    // Get Top 5 Selling Items from the last 7 days
    private function calculateTopItems()
    {
        $sevenDaysAgo = now()->subDays(7)->startOfDay();

        // 1. Join 4 tables together and let Postgres do the Math!
        $topItems = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            // Use leftJoin for categories just in case an item has no category
            ->leftJoin('menu_categories', 'menu_items.category_id', '=', 'menu_categories.id')
            ->where('orders.order_datetime', '>=', $sevenDaysAgo)
            ->where('orders.status', '!=', 'Cancelled')
            // 2. Select the names and tell Postgres to SUM the quantity and subtotal
            ->select(
                'menu_items.id as id',
                'menu_items.item_name as name',
                'menu_items.image_url as image_url',
                'menu_categories.category_name as category',
                DB::raw('SUM(order_items.quantity) as sold'),
                DB::raw('SUM(order_items.subtotal) as price')
            )
            // Group them by item name
            ->groupBy(
                'menu_items.id',
                'menu_items.item_name',
                'menu_items.image_url',
                'menu_categories.category_name'
            )
            ->orderBy('sold', 'desc')
            // Only grab the top 5
            ->limit(5)
            ->get();

        // 3. Add the Rank number (1, 2, 3...)
        $rankedItems = $topItems->map(function ($item, $index) {
            return [
                'id' => $item->id,
                'rank' => $index + 1,
                'category' => $item->category ?? 'Uncategorized',
                'name' => $item->name,
                'imageUrl' => $item->image_url,
                'price' => (float) $item->price,
                'sold' => (int) $item->sold
            ];
        });

        return $rankedItems;
    }

    // Get 5 Most Recent Orders for the Table
    private function calculateRecentOrders()
    {
        // Join orders with profiles so we can get the cashier's First and Last Name
        $orders = DB::table('orders')
            ->leftJoin('profiles', 'orders.cashier_id', '=', 'profiles.id')
            ->select(
                'orders.id',
                'orders.order_number',
                'orders.order_datetime',
                'orders.total',
                'orders.payment_method',
                'orders.status',
                'profiles.first_name',
                'profiles.last_name'
            )
            ->orderBy('orders.order_datetime', 'desc')
            ->limit(5)
            ->get();

        // Format the data exactly how React expects it
        $formattedOrders = $orders->map(function ($order) {
            $cashierName = ($order->first_name && $order->last_name)
                ? "{$order->first_name} {$order->last_name}"
                : 'Admin / System';

            return [
                'orderNo' => $order->order_number,
                'cashier' => $cashierName,
                'total' => (float) $order->total,
                'payment' => $order->payment_method,
                'status' => $order->status ?? 'Completed',
                // Format the date exactly how Supabase did it
                'date' => \Carbon\Carbon::parse($order->order_datetime)->format('m/d/Y H:i')
            ];
        });

        return $formattedOrders;
    }
}
