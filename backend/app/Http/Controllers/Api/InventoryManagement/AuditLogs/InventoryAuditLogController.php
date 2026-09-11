<?php

namespace App\Http\Controllers\Api\InventoryManagement\AuditLogs;

use App\Models\InventoryManagement\InventoryAuditLog;
use App\Http\Controllers\Controller;

class InventoryAuditLogController extends Controller
{
    public function store(array $auditData)
    {
        // Audit records are permanent and insert-only.
        return InventoryAuditLog::create([
            'inventory_item_id' => $auditData['inventory_item_id'],
            'batch_id' => $auditData['batch_id'] ?? null,
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
