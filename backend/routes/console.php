<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('inventory:cleanup-expired')
    ->dailyAt('00:05')
    ->timezone('Asia/Manila')
    ->withoutOverlapping();

// Preserve setup tokens by using the longer expiry for shared-table cleanup.
Schedule::command('auth:clear-resets employee_setup')
    ->everyFifteenMinutes()
    ->withoutOverlapping();
