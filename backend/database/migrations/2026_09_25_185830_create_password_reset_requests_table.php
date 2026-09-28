<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('password_reset_requests', function (Blueprint $table) {
            $table->uuid('id')
                ->primary()
                ->default(DB::raw('gen_random_uuid()'));

            // Employee requesting the password reset.
            $table->uuid('user_id');

            $table->string('status', 20)->default('pending');

            // Pending requests expire after 24 hours.
            $table->timestampTz('requested_at')->useCurrent();
            $table->timestampTz('request_expires_at');

            // Owner review information.
            $table->uuid('reviewed_by')->nullable();
            $table->timestampTz('reviewed_at')->nullable();

            // Approved requests remain usable for a limited period.
            $table->timestampTz('approval_expires_at')->nullable();
            $table->timestampTz('completed_at')->nullable();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->restrictOnDelete();

            $table->foreign('reviewed_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->index('user_id');
            $table->index('reviewed_by');
            $table->index(['status', 'requested_at']);
        });

        // Only known request statuses are allowed.
        DB::statement(
            "ALTER TABLE public.password_reset_requests
             ADD CONSTRAINT password_reset_requests_status_check
             CHECK (
                 status IN (
                     'pending',
                     'approved',
                     'cancelled',
                     'expired',
                     'completed'
                 )
             )"
        );

        // A User can only have one open request.
        DB::statement(
            "CREATE UNIQUE INDEX password_reset_requests_user_open_unique
             ON public.password_reset_requests (user_id)
             WHERE status IN ('pending', 'approved')"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_requests');
    }
};
