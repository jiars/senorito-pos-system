<?php

namespace App\Models\ExpenseManagement;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Expense extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'expenses';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'category_id',
        'description',
        'amount',
        'vendor',
        'payment_method',
        'receipt_reference',
        'expense_date',
        'recorded_by',
        'archived',
        'archived_by',
        'archived_at',
    ];

    // Connect each Expense to its category.
    public function expense_categories()
    {
        return $this->belongsTo(
            ExpenseCategory::class,
            'category_id',
            'id'
        );
    }

    // Connect recorded_by to the profiles table.
    public function profiles()
    {
        return $this->belongsTo(
            User::class,
            'recorded_by',
            'id'
        );
    }

    public function archived_by_profile()
    {
        // User currently represents the profiles table.
        return $this->belongsTo(
            User::class,
            'archived_by',
            'id'
        );
    }
}
