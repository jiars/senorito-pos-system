<?php

namespace App\Models\InventoryManagement;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'inventory_items';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'item_name',
        'category_id',
        'base_unit',
        'minimum_level',
        'supplier',
        'cost_per_unit',
        'current_stock',
        'track_expiry',
        'archived',
        'archived_by',
        'item_code',
        'created_at'
    ];

    public function inventory_categories()
    {
        return $this->belongsTo(InventoryCategory::class, 'category_id', 'id');
    }

    public function inventory_batches()
    {
        return $this->hasMany(InventoryBatch::class, 'inventory_item_id', 'id');
    }

    public function inventory_conversion_units()
    {
        return $this->hasMany(InventoryConversionUnit::class, 'inventory_item_id', 'id');
    }
}
