<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn(
            'inventory_audit_logs',
            'transaction_reference'
        )) {
            Schema::table('inventory_audit_logs', function (Blueprint $table) {
                $table->uuid('transaction_reference')
                    ->nullable()
                    ->index();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn(
            'inventory_audit_logs',
            'transaction_reference'
        )) {
            Schema::table('inventory_audit_logs', function (Blueprint $table) {
                $table->dropColumn('transaction_reference');
            });
        }
    }
};
