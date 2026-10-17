<?php

namespace App\Models\InventoryManagement;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class InventoryCleanupRun extends Model
{
    use HasUuids;

    protected $table = 'inventory_cleanup_runs';
    protected $keyType = 'string';

    public $incrementing = false;

    // The database supplies created_at; completion is saved explicitly.
    public $timestamps = false;

    protected $fillable = [
        'business_date',
        'cleaned_batch_count',
        'completed_at',
    ];
}
