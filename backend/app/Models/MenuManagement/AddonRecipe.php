<?php

namespace App\Models\MenuManagement;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\InventoryManagement\InventoryItem;

class AddonRecipe extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'addon_recipes';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'addon_id',
        'inventory_item_id',
        'quantity',
        'unit',
        'estimated_cost'
    ];

    public function addon()
    {
        return $this->belongsTo(Addon::class, 'addon_id', 'id');
    }

    public function inventory_items()
    {
        return $this->belongsTo(
            InventoryItem::class,
            'inventory_item_id',
            'id'
        );
    }
}
