<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    // 1. Tell the Model which table to manage
    protected $table = 'menu_items';

    protected $keyType = 'string';

    public $incrementing = false;

    // Disable timestamps if not used in Supabase
    public $timestamps = false;

    // 2. Allow these columns to be edited
    protected $fillable = [
        'item_name',
        'category_id',
        'recipe_status',
        'pos_status',
        'pricing_type',
        'image_url',
        'archived'
    ];

    // 3. Define the Relationship: An Item BELONGS TO a Category!
    public function category()
    {
        return $this->belongsTo(MenuCategory::class, 'category_id', 'id');
    }
}
