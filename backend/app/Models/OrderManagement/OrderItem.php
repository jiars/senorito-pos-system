<?php

namespace App\Models\OrderManagement;

use App\Models\MenuManagement\MenuItem;
use App\Models\MenuManagement\MenuItemPrice;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderItem extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'order_items';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'order_id',
        'menu_item_id',
        'price_id',
        'quantity',
        'unit_price',
        'subtotal',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }

    // Names match the existing Order History response.
    public function menu_item()
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id', 'id');
    }

    public function variant()
    {
        return $this->belongsTo(MenuItemPrice::class, 'price_id', 'id');
    }

    public function addons()
    {
        return $this->hasMany(OrderItemAddon::class, 'order_item_id', 'id');
    }
}
