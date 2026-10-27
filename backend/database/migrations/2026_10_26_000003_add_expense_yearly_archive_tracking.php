<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_archive_runs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedSmallInteger('business_year')->unique();
            $table->unsignedInteger('archived_count')->default(0);
            $table->timestampTz('completed_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();
        });

        Schema::table('expenses', function (Blueprint $table) {
            // Manual archives and old records have no yearly run.
            $table->foreignUuid('yearly_archive_run_id')
                ->nullable()
                ->index()
                ->constrained('expense_archive_runs')
                ->restrictOnDelete();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE public.expense_archive_runs ENABLE ROW LEVEL SECURITY');
        }
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropIndex(['yearly_archive_run_id']);
            $table->dropConstrainedForeignId('yearly_archive_run_id');
        });

        Schema::dropIfExists('expense_archive_runs');
    }
};
