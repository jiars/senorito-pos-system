<?php

namespace App\Http\Controllers\Api\InventoryManagement\AuditLogs;

use App\Models\InventoryManagement\InventoryAuditLog;
use App\Http\Controllers\Controller;

class InventoryAuditLogController extends Controller
{
    public function index()
    {
        // Return complete audit records with their related item, batch, and performer.
        $auditLogs = InventoryAuditLog::with([
            'inventory_item:id,item_name,base_unit',
            'inventory_batch:id,batch_number',
            'performer:id,first_name,last_name',
        ])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($auditLogs);
    }

    public function store(array $auditData)
    {
        // Audit records are permanent and insert-only.
        return InventoryAuditLog::create([
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
        ]);
    }
}
