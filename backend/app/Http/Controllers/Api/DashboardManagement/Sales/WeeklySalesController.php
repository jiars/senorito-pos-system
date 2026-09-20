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
        $startOfWeek = now()->startOfWeek(Carbon::SUNDAY);

        $orders = DB::table('orders')
            ->where('order_datetime', '>=', $startOfWeek)
            ->where('status', '!=', 'Cancelled')
            ->select('order_datetime', 'total')
            ->get();

        $weeklySales = [];

        for ($dayIndex = 0; $dayIndex < 7; $dayIndex++) {
            $currentDay = $startOfWeek->copy()->addDays($dayIndex);

            $dailyTotal = $orders
                ->filter(function ($order) use ($currentDay) {
                    return Carbon::parse($order->order_datetime)
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
