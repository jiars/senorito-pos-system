<?php

namespace App\Models\InventoryManagement;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryConversionUnit extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'inventory_conversion_units';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'inventory_item_id',
        'converted_unit',
        'equivalent_base_amount'
    ];

    public function inventory_item()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id', 'id');
    }
}
