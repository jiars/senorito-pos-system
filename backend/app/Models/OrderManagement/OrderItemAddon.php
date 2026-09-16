<?php

namespace App\Models\OrderManagement;

use App\Models\MenuManagement\Addon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderItemAddon extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'order_item_addons';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'order_item_id',
        'addon_id',
        'quantity',
        'price',
    ];

    public function order_item()
    {
        return $this->belongsTo(OrderItem::class, 'order_item_id', 'id');
    }

    // Get the saved add-on information.
    public function addon()
    {
        return $this->belongsTo(Addon::class, 'addon_id', 'id');
    }
}
