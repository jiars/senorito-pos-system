<?php

namespace App\Models\OrderManagement;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'orders';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'order_number',
        'cashier_id',
        'client_transaction_id',
        'order_datetime',
        'order_source',
        'payment_method',
        'discount_type',
        'subtotal',
        'discount_amount',
        'total',
        'amount_paid',
        'change_amount',
        'status',
    ];

    // Connect the receipt to the cashier profile.
    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id', 'id');
    }

    // Get all purchased items under this receipt.
    public function order_items()
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'id');
    }
}
