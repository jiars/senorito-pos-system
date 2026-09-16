<?php

namespace App\Http\Controllers\Api\ReportManagement\Inventory;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\InventoryManagement\InventoryAuditLog;
use Carbon\Carbon;

class WastageCostController extends Controller
{
    public function fetch(Request $request)
    {
        // Wastage is an Inventory loss, not a cash Expense.
        $query = InventoryAuditLog::select([
            'id',
            'batch_id',
            'quantity_change',
            'created_at',
        ])
            ->with([
                'inventory_batch:id,unit_cost',
            ])
            ->where('action', 'Wastage');

        if ($request->filled('from_date')) {
            $startDate = Carbon::createFromFormat(
                'Y-m-d',
                $request->query('from_date'),
                'Asia/Manila'
            )->startOfDay()->utc();

            $query->where('created_at', '>=', $startDate);
        }

        if ($request->filled('to_date')) {
            $endDate = Carbon::createFromFormat(
                'Y-m-d',
                $request->query('to_date'),
                'Asia/Manila'
            )->endOfDay()->utc();

            $query->where('created_at', '<=', $endDate);
        }

        return $query
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
