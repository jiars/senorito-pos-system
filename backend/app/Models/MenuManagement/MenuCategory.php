<?php

namespace App\Models\MenuManagement;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuCategory extends Model
{
    use HasFactory;

    protected $table = 'menu_categories';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'category_name'
    ];

    public function menu_items()
    {
        return $this->hasMany(MenuItem::class, 'category_id', 'id');
    }
}
