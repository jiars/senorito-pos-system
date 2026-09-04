<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuCategory extends Model
{
    use HasFactory;

    // 1. Tell the Model exactly which table to manage

    protected $table = 'menu_categories';

    protected $keyType = 'string';

    public $incrementing = false;

    // Disable Laravel's default created_at / updated_at if you don't use them in Supabase
    public $timestamps = false;

    // 2. Tell the Model which columns are allowed to be inserted/updated
    protected $fillable = [
        'category_name'
    ];

    // 3. Define the Relationship: A Category has MANY Items!
    public function items()
    {
        return $this->hasMany(MenuItem::class, 'category_id', 'id');
    }
}
