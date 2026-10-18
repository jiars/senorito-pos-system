<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Fresh-login notifications no longer need per-account viewing history.
        // Keep daily cleanup runs, audit links and all inventory quantities.
        Schema::dropIfExists('inventory_cleanup_views');
    }

    public function down(): void
    {
        // Recreate the old structure only; deleted viewing timestamps cannot be restored.
        Schema::create('inventory_cleanup_views', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('cleanup_run_id')
                ->constrained('inventory_cleanup_runs')
                ->restrictOnDelete();

            $table->foreignUuid('user_id')
                ->index()
                ->constrained('users')
                ->restrictOnDelete();

            $table->timestampTz('viewed_at')->useCurrent();
            $table->unique(
                ['cleanup_run_id', 'user_id'],
                'inventory_cleanup_views_run_user_unique'
            );
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE public.inventory_cleanup_views ENABLE ROW LEVEL SECURITY');
        }
    }
};
