<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement(
            "
        UPDATE menu_item_prices
        SET pos_status = 'Available'
        WHERE pos_status = '''Available'''
        "
        );

        DB::statement("
        ALTER TABLE menu_item_prices
        ALTER COLUMN pos_status SET DEFAULT 'Available';
    ");

        DB::statement("
    ALTER TABLE menu_item_prices
    ADD CONSTRAINT menu_item_prices_pos_status_check
    CHECK (pos_status IN ('Available', 'Unavailable'))
");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('
    ALTER TABLE menu_item_prices
    DROP CONSTRAINT IF EXISTS menu_item_prices_pos_status_check
');
    }
};
