<?php

namespace App\Models\MenuManagement;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'menu_items';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'item_name',
        'category_id',
        'recipe_status',
        'pos_status',
        'pricing_type',
        'image_url',
        'archived'
    ];

    public function menu_categories()
    {
        return $this->belongsTo(MenuCategory::class, 'category_id', 'id');
    }

    public function menu_recipes()
    {
        return $this->hasMany(MenuRecipe::class, 'menu_item_id', 'id');
    }

    public function menu_prices()
    {
        return $this->hasMany(MenuItemPrice::class, 'menu_item_id', 'id');
    }
}
