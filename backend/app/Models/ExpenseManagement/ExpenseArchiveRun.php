<?php

namespace App\Models\ExpenseManagement;

use Illuminate\Database\Eloquent\Model;

class ExpenseArchiveRun extends Model
{
    protected $table = 'expense_archive_runs';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'business_year',
        'archived_count',
        'completed_at',
    ];

    protected $casts = [
        'business_year' => 'integer',
        'archived_count' => 'integer',
    ];
}
