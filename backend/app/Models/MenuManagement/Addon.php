<?php

namespace App\Models\MenuManagement;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Addon extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'addons';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'addon_name',
        'selling_price',
        'estimated_cost',
        'profit',
        'margin',
        'pos_status',
        'archived'
    ];

    public function addon_categories()
    {
        return $this->hasMany(AddonCategory::class, 'addon_id', 'id');
    }

    public function addon_recipes()
    {
        return $this->hasMany(AddonRecipe::class, 'addon_id', 'id');
    }
}
