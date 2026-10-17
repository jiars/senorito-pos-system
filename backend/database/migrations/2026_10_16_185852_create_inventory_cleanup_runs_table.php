<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('inventory_cleanup_runs', function (Blueprint $table) {
            $table->uuid('id')
                ->primary()
                ->default(DB::raw('gen_random_uuid()'));

            // Keep one daily record using the Philippine business date.
            $table->date('business_date')->unique();

            $table->integer('cleaned_batch_count')->default(0);

            // Leave empty until cleanup successfully finishes.
            $table->timestampTz('completed_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();
        });

        // Keep this internal record protected from normal Supabase clients.
        DB::statement(
            'ALTER TABLE public.inventory_cleanup_runs ENABLE ROW LEVEL SECURITY'
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_cleanup_runs');
    }
};
