<?php

namespace App\Models\MenuManagement;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AddonCategory extends Model
{
    use HasFactory;

    protected $table = 'addon_categories';
    protected $primaryKey = null;
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'addon_id',
        'menu_category_id'
    ];

    public function addon()
    {
        return $this->belongsTo(Addon::class, 'addon_id', 'id');
    }

    public function menu_categories()
    {
        return $this->belongsTo(MenuCategory::class, 'menu_category_id', 'id');
    }
}
