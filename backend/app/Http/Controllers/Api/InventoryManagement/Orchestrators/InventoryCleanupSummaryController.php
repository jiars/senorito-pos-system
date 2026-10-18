<?php

namespace App\Http\Controllers\Api\InventoryManagement\Orchestrators;

use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryCleanupRun;
use App\Services\InventoryManagement\InventoryExpiryService;
use Illuminate\Http\Request;
use Throwable;

class InventoryCleanupSummaryController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->status !== 'Active') {
            return response()->json([
                'message' => 'Your account is not active.',
            ], 403);
        }

        try {
            $today = app(InventoryExpiryService::class)->today();
            $run = InventoryCleanupRun::where('business_date', $today)
                ->whereNotNull('completed_at')
                ->first();

            // Not completed is different from a successful cleanup with zero deductions.
            $summary = [
                'business_date' => $today,
                'completed' => false,
                'cleanup_run_id' => null,
                'cleaned_batch_count' => null,
                'completed_at' => null,
                'details_available' => false,
                'batches' => [],
            ];

            if (!$run) {
                return response()->json($summary)->header('Cache-Control', 'no-store');
            }

            // Read saved deductions, including archived items; never run cleanup here.
            $logs = $run->audit_logs()
                ->with([
                    'inventory_item:id,item_name,base_unit,archived',
                    'inventory_batch:id,batch_number,expiration_date',
                ])
                ->orderBy('created_at')
                ->orderBy('id')
                ->get();

            $summary['completed'] = true;
            $summary['cleanup_run_id'] = $run->id;
            $summary['cleaned_batch_count'] = (int) $run->cleaned_batch_count;
            $summary['completed_at'] = $run->completed_at;

            // Older runs have a saved count but may not have linked audit details.
            $summary['details_available'] = $logs->count() === (int) $run->cleaned_batch_count;

            if ($summary['details_available']) {
                foreach ($logs as $log) {
                    $summary['batches'][] = [
                        'audit_log_id' => $log->id,
                        'inventory_item_id' => $log->inventory_item_id,
                        'item_name' => $log->inventory_item->item_name ?? null,
                        'base_unit' => $log->inventory_item->base_unit ?? null,
                        'archived' => (bool) $log->inventory_item->archived,
                        'batch_id' => $log->batch_id,
                        'batch_number' => $log->inventory_batch->batch_number ?? null,
                        'expiration_date' => $log->inventory_batch->expiration_date ?? null,
                        // The batch may now be empty; the audit keeps the actual deduction.
                        'quantity_removed' => abs((float) $log->quantity_change),
                    ];
                }
            }

            return response()->json($summary)->header('Cache-Control', 'no-store');
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Unable to load the expiry check details. Please retry.',
            ], 500);
        }
    }
}
