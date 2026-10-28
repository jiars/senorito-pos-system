<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Old orders have no verified link to their original deductions.
            $table->boolean('stock_deductions_recorded')->default(false);
        });

        Schema::table('inventory_audit_logs', function (Blueprint $table) {
            $table->foreignUuid('order_id')->nullable()->constrained('orders')->restrictOnDelete();
            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::table('inventory_audit_logs', function (Blueprint $table) {
            $table->dropIndex(['order_id']);
            $table->dropConstrainedForeignId('order_id');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('stock_deductions_recorded');
        });
    }
};
