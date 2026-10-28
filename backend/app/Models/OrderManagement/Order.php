<?php

namespace App\Models\OrderManagement;

use App\Models\User;
use App\Models\InventoryManagement\InventoryAuditLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory, HasUuids;

    public const NON_SALE_STATUSES = ['Cancelled', 'Voided'];

    protected $table = 'orders';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'order_number',
        'cashier_id',
        'uploaded_by',
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

    protected $casts = [
        'stock_deductions_recorded' => 'boolean',
    ];

    public function stock_deductions(): HasMany
    {
        return $this->hasMany(InventoryAuditLog::class, 'order_id')
            ->where('action', 'POS Sale')
            ->where('source', 'POS Checkout');
    }

    // History and receipt reads use the original cashier, not the uploader.
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        $user->loadMissing('role:id,role_name');

        if ($user->role && $user->role->role_name === 'Owner') {
            return $query;
        }

        if ($user->role && $user->role->role_name === 'Cashier') {
            return $query->where('cashier_id', $user->id);
        }

        return $query->whereRaw('1 = 0');
    }

    // The database permits only one pending void request for an order.
    public function pending_void_request(): HasOne
    {
        return $this->hasOne(OrderVoidRequest::class)
            ->where('status', OrderVoidRequest::STATUS_PENDING);
    }

    public function void_requests(): HasMany
    {
        return $this->hasMany(OrderVoidRequest::class)
            ->orderByDesc('requested_at')->orderByDesc('id');
    }

    // Connect the receipt to the cashier profile.
    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id', 'id');
    }

    // The authenticated user who first uploaded the sale.
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by', 'id');
    }

    // Get all purchased items under this receipt.
    public function order_items()
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'id');
    }
}
