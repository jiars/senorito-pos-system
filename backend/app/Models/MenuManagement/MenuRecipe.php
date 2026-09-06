<?php

namespace App\Models\MenuManagement;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuRecipe extends Model
{
    use HasFactory;

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
}
