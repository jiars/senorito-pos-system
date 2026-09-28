<?php

namespace App\Models\InventoryManagement;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;

class InventoryPurchaseHistory extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'inventory_purchase_history';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'inventory_item_id',
        'batch_id',
        'quantity_purchased',
        'purchase_unit',
        'total_cost',
        'cost_per_unit',
        'supplier',
        'purchased_at',
        'created_by'
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

    public function creator()
    {
        // User currently represents the profiles table.
        return $this->belongsTo(
            User::class,
            'created_by',
            'id'
        );
    }
}
