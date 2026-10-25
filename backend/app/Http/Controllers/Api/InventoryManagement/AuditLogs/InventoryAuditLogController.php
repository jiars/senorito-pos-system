<?php

namespace App\Http\Controllers\Api\InventoryManagement\AuditLogs;

use App\Models\InventoryManagement\InventoryAuditLog;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class InventoryAuditLogController extends Controller
{
    public function index(Request $request)
    {
        // add a page-size optiosn already available in the table
        $validated = $request->validate([
            'paginate' => ['sometimes', 'boolean'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'in:12,24,36,48'],
        ]);

        // Return complete audit records with their related item, batch, and performer.
        $query = InventoryAuditLog::with([
            'inventory_item:id,item_name,base_unit',
            'inventory_batch:id,batch_number',
            'performer:id,first_name,last_name',
        ])
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($request->boolean('paginate')) {
            $perPage = (int) ($validated['per_page'] ?? 12);

            return response()->json(
                $query->paginate($perPage)
            );
        }

        // Keep the current frontend working during the transition.
        return response()->json($query->get());
    }

    public function store(array $auditData)
    {
        // Audit records are permanent and insert-only.
        $attributes = [
            'inventory_item_id' => $auditData['inventory_item_id'],
            'batch_id' => $auditData['batch_id'] ?? null,
            'transaction_reference' => $auditData['transaction_reference'] ?? null,
            'action' => $auditData['action'],
            'source' => $auditData['source'],
            'quantity_change' => $auditData['quantity_change'],
            'stock_before' => $auditData['stock_before'],
            'stock_after' => $auditData['stock_after'],
            'reason_reference' =>
            $auditData['reason_reference'] ?? null,
            'performed_by' => $auditData['performed_by'],
        ];

        // Only the daily cleanup supplies this link; other actions stay unchanged.
        if (isset($auditData['cleanup_run_id'])) {
            $attributes['cleanup_run_id'] = $auditData['cleanup_run_id'];
        }

        return InventoryAuditLog::create($attributes);
    }
}
