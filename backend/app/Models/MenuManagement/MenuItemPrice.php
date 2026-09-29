<?php

namespace App\Models\MenuManagement;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItemPrice extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'menu_item_prices';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'menu_item_id',
        'variant_name',
        'selling_price',
        'estimated_cost',
        'profit',
        'margin',
        'item_code',
        'pos_status',
        'recipe_status',
        'archived'
    ];

    protected $casts = [
        'archived' => 'boolean',
    ];

    public function menu_item()
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id', 'id');
    }
}
