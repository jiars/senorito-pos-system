<?php

namespace App\Http\Controllers\Api\DashboardManagement\Sales;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class WeeklySalesController extends Controller
{
    // Get sales totals from Sunday to Saturday.
    public function fetch()
    {
        $businessTimezone = config('app.business_timezone');
        $startOfWeek = now($businessTimezone)->startOfWeek(Carbon::SUNDAY);
        // Keep query boundaries unambiguous while grouping by Philippine days.
        $start = $startOfWeek->copy()->utc()->toISOString();
        $end = $startOfWeek->copy()->addWeek()->utc()->toISOString();

        $orders = DB::table('orders')
            ->where('order_datetime', '>=', $start)
            ->where('order_datetime', '<', $end)
            ->where('status', '!=', 'Cancelled')
            ->select('order_datetime', 'total')
            ->get();

        $weeklySales = [];

        for ($dayIndex = 0; $dayIndex < 7; $dayIndex++) {
            $currentDay = $startOfWeek->copy()->addDays($dayIndex);

            $dailyTotal = $orders
                ->filter(function ($order) use ($currentDay, $businessTimezone) {
                    return Carbon::parse($order->order_datetime, 'UTC')
                        ->setTimezone($businessTimezone)
                        ->isSameDay($currentDay);
                })
                ->sum('total');

            $weeklySales[] = [
                'day' => $currentDay->format('D'),
                'value' => $dailyTotal,
            ];
        }

        return $weeklySales;
    }
}
