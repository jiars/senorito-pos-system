<?php

namespace App\Models\MenuManagement;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\InventoryManagement\InventoryItem;

class MenuRecipe extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'menu_recipes';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'menu_item_id',
        'menu_item_price_id',
        'inventory_item_id',
        'quantity',
        'estimated_cost',
        'unit'
    ];

    public function menu_item()
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id', 'id');
    }

    // Get the Inventory ingredient used by this recipe.
    public function inventory_items()
    {
        return $this->belongsTo(
            InventoryItem::class,
            'inventory_item_id',
            'id'
        );
    }
}
