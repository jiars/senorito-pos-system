<?php

namespace App\Models\InventoryManagement;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryCategory extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'inventory_categories';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'category_name',
        'archived'
    ];

    public function inventory_items()
    {
        return $this->hasMany(InventoryItem::class, 'category_id', 'id');
    }
}
