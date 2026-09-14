<?php

namespace App\Models\InventoryManagement;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InventoryAuditLog extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'inventory_audit_logs';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'inventory_item_id',
        'batch_id',
        'transaction_reference',
        'action',
        'source',
        'quantity_change',
        'stock_before',
        'stock_after',
        'reason_reference',
        'performed_by'
    ];

    public function inventory_item()
    {
        return $this->belongsTo(
            InventoryItem::class,
            'inventory_item_id',
            'id'
        );
    }

    public function inventory_batch()
    {
        return $this->belongsTo(
            InventoryBatch::class,
            'batch_id',
            'id'
        );
    }

    public function performer()
    {
        // User currently represents the profiles table.
        return $this->belongsTo(
            User::class,
            'performed_by',
            'id'
        );
    }
}
