<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_void_requests', function (Blueprint $table) {
            // Earlier decisions have no stock-handling choice and remain unchanged.
            $table->enum('stock_handling', ['keep_deducted', 'return_stock'])->nullable();
        });

        Schema::table('inventory_audit_logs', function (Blueprint $table) {
            $table->foreignUuid('void_request_id')->nullable()->constrained('order_void_requests')->restrictOnDelete();
            $table->index('void_request_id');
            // Each original deduction can have only one full reversal.
            $table->foreignUuid('original_deduction_id')->nullable()->constrained('inventory_audit_logs')->restrictOnDelete();
            $table->unique('original_deduction_id');
        });
    }

    public function down(): void
    {
        Schema::table('inventory_audit_logs', function (Blueprint $table) {
            $table->dropUnique(['original_deduction_id']);
            $table->dropConstrainedForeignId('original_deduction_id');
            $table->dropIndex(['void_request_id']);
            $table->dropConstrainedForeignId('void_request_id');
        });
        Schema::table('order_void_requests', function (Blueprint $table) {
            $table->dropColumn('stock_handling');
        });
    }
};
