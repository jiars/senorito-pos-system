<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Store structural recipe status per Regular price or variant.
        Schema::table('menu_item_prices', function (Blueprint $table) {
            $table
                ->string('recipe_status')
                ->default('Incomplete');
        });

        // Add-ons also have their own recipes.
        Schema::table('addons', function (Blueprint $table) {
            $table
                ->string('recipe_status')
                ->default('Incomplete');
        });

        // Backfill every Regular price and variant.
        DB::statement("
            UPDATE menu_item_prices AS price
            SET recipe_status = CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM menu_recipes AS recipe
                    JOIN inventory_items AS ingredient
                        ON ingredient.id = recipe.inventory_item_id
                    WHERE recipe.menu_item_id = price.menu_item_id
                      AND (
                          recipe.menu_item_price_id = price.id
                          OR recipe.menu_item_price_id IS NULL
                      )
                      AND ingredient.archived = true
                ) THEN 'On Hold'

                WHEN EXISTS (
                    SELECT 1
                    FROM menu_recipes AS recipe
                    WHERE recipe.menu_item_id = price.menu_item_id
                      AND (
                          recipe.menu_item_price_id = price.id
                          OR recipe.menu_item_price_id IS NULL
                      )
                ) THEN 'Complete'

                ELSE 'Incomplete'
            END
        ");

        // Backfill every Add-on.
        DB::statement("
            UPDATE addons AS addon
            SET recipe_status = CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM addon_recipes AS recipe
                    JOIN inventory_items AS ingredient
                        ON ingredient.id = recipe.inventory_item_id
                    WHERE recipe.addon_id = addon.id
                      AND ingredient.archived = true
                ) THEN 'On Hold'

                WHEN EXISTS (
                    SELECT 1
                    FROM addon_recipes AS recipe
                    WHERE recipe.addon_id = addon.id
                ) THEN 'Complete'

                ELSE 'Incomplete'
            END
        ");

        // Only structural recipe statuses may be stored.
        DB::statement("
            ALTER TABLE menu_item_prices
            ADD CONSTRAINT menu_item_prices_recipe_status_check
            CHECK (
                recipe_status IN (
                    'Complete',
                    'Incomplete',
                    'On Hold'
                )
            )
        ");

        DB::statement("
            ALTER TABLE addons
            ADD CONSTRAINT addons_recipe_status_check
            CHECK (
                recipe_status IN (
                    'Complete',
                    'Incomplete',
                    'On Hold'
                )
            )
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE menu_item_prices
            DROP CONSTRAINT IF EXISTS
            menu_item_prices_recipe_status_check
        ");

        DB::statement("
            ALTER TABLE addons
            DROP CONSTRAINT IF EXISTS
            addons_recipe_status_check
        ");

        Schema::table('menu_item_prices', function (Blueprint $table) {
            $table->dropColumn('recipe_status');
        });

        Schema::table('addons', function (Blueprint $table) {
            $table->dropColumn('recipe_status');
        });
    }
};
