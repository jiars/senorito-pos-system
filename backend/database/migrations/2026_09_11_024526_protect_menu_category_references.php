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
        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropForeign('menu_items_category_id_fkey');

            $table->foreign('category_id', 'menu_items_category_id_fkey')
                ->references('id')
                ->on('menu_categories')
                ->restrictOnDelete();
        });

        Schema::table('addon_categories', function (Blueprint $table) {
            $table->dropForeign('addon_categories_menu_category_id_fkey');

            $table->foreign('menu_category_id', 'addon_categories_menu_category_id_fkey')
                ->references('id')
                ->on('menu_categories')
                ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropForeign('menu_items_category_id_fkey');

            $table->foreign('category_id', 'menu_items_category_id_fkey')
                ->references('id')
                ->on('menu_categories')
                ->nullOnDelete();
        });

        Schema::table('addon_categories', function (Blueprint $table) {
            $table->dropForeign('addon_categories_menu_category_id_fkey');

            $table->foreign('menu_category_id', 'addon_categories_menu_category_id_fkey')
                ->references('id')
                ->on('menu_categories')
                ->cascadeOnDelete();
        });
    }
};
