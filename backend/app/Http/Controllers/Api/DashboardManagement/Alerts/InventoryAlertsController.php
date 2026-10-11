<?php

namespace App\Http\Controllers\Api\DashboardManagement\Alerts;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InventoryAlertsController extends Controller
{
    // Get low-stock items and batches expiring within seven days.
    public function fetch()
    {
        $lowStockItems = DB::table('inventory_items')
            ->select(
                'item_name as name',
                'minimum_level as min',
                'current_stock as qty',
                'base_unit as unit'
            )
            ->where('archived', false)
            ->whereColumn('current_stock', '<=', 'minimum_level')
            ->orderBy('current_stock', 'desc')
            ->get()
            ->map(function ($item) {
                $item->level = $item->qty <= 0 ? 'critical' : 'warning';

                return $item;
            });

        $businessTimezone = config('app.business_timezone');
        $today = now($businessTimezone)->startOfDay();
        // expiration_date is a DATE column, not a timestamp to convert to UTC.
        $nextWeek = $today->copy()->addDays(7)->toDateString();

        $batches = DB::table('inventory_batches')
            ->join(
                'inventory_items',
                'inventory_batches.inventory_item_id',
                '=',
                'inventory_items.id'
            )
            ->select(
                'inventory_batches.batch_number as batch',
                'inventory_batches.expiration_date',
                'inventory_batches.quantity',
                'inventory_items.item_name',
                'inventory_items.base_unit'
            )
            ->where('inventory_items.archived', false)
            ->whereNotNull('inventory_batches.expiration_date')
            ->where('inventory_batches.expiration_date', '<=', $nextWeek)
            ->orderBy('inventory_batches.expiration_date', 'asc')
            ->get();

        $expiryItems = $batches->map(function ($batch) use ($today, $businessTimezone) {
            $expirationDate = Carbon::parse($batch->expiration_date, $businessTimezone)
                ->startOfDay();

            return [
                'name' => $batch->item_name,
                'batch' => $batch->batch,
                'size' => $batch->quantity . ' ' . $batch->base_unit,
                'exp' => $expirationDate->format('M d, Y'),
                // Both dates are Manila midnights, so this is a calendar-day count.
                'days_left' => (int) $today->diffInDays($expirationDate, false),
                'status' => $expirationDate->lt($today)
                    ? 'expired'
                    : 'expiring',
            ];
        });

        return [
            'lowStockItems' => $lowStockItems,
            'expiryItems' => $expiryItems,
        ];
    }
}
