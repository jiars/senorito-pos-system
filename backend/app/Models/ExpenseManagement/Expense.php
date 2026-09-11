<?php

namespace App\Models\ExpenseManagement;

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
    ];

    public function expense_category()
    {
        return $this->belongsTo(ExpenseCategory::class, 'category_id', 'id');
    }
}
