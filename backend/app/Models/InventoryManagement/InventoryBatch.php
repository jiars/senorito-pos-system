<?php

namespace App\Models\InventoryManagement;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryBatch extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'inventory_batches';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'inventory_item_id',
        'batch_number',
        'quantity',
        'expiration_date',
        'received_date',
        'source',
        'status',
        'unit_cost',
        'created_at'
    ];

    public function inventory_item()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id', 'id');
    }
}
