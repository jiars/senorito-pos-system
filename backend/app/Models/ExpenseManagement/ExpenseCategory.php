<?php

namespace App\Models\ExpenseManagement;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExpenseCategory extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'expense_categories';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'category_name',
    ];

    public function expenses()
    {
        return $this->hasMany(Expense::class, 'category_id', 'id');
    }
}
