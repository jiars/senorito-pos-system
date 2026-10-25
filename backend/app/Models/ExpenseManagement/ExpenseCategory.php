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
        'requires_receipt',
        'auto_archive_yearly',
    ];

    protected $casts = [
        'requires_receipt' => 'boolean',
        'auto_archive_yearly' => 'boolean',
    ];

    public const INVENTORY_PURCHASE = 'Inventory Purchase';

    public static function isInventoryPurchaseName(string $name): bool
    {
        return strtolower(trim($name)) === strtolower(self::INVENTORY_PURCHASE);
    }

    // Add Expense uses this policy, including its inventory purchase flow.
    public function receiptReferenceRules(): array
    {
        $presenceRule = 'nullable';
        if ($this->requires_receipt) {
            $presenceRule = 'required';
        }

        return [$presenceRule, 'string', 'max:255'];
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class, 'category_id', 'id');
    }
}
