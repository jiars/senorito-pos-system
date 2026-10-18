<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_audit_logs', function (Blueprint $table) {
            // Older logs and other stock actions do not belong to a daily run.
            $table->foreignUuid('cleanup_run_id')
                ->nullable()
                ->index()
                ->constrained('inventory_cleanup_runs')
                ->restrictOnDelete();
        });

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

            // Each account can acknowledge the same daily result only once.
            $table->unique(
                ['cleanup_run_id', 'user_id'],
                'inventory_cleanup_views_run_user_unique'
            );
        });

        // PostgreSQL protects this internal table; local SQLite tests use no RLS.
        if (DB::getDriverName() === 'pgsql') {
            DB::statement(
                'ALTER TABLE public.inventory_cleanup_views ENABLE ROW LEVEL SECURITY'
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_cleanup_views');

        Schema::table('inventory_audit_logs', function (Blueprint $table) {
            $table->dropIndex(['cleanup_run_id']);
            $table->dropConstrainedForeignId('cleanup_run_id');
        });
    }
};
