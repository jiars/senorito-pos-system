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
        $categoryId = DB::table('expense_categories')
            ->where('category_name', 'Inventory Wastage')
            ->value('id');

        if (!$categoryId) {
            return;
        }

        // Preserve old records but remove them from active Expenses.
        DB::table('expenses')
            ->where('category_id', $categoryId)
            ->where('archived', false)
            ->update([
                'archived' => true,
                'archived_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
