<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Keep Laravel's empty default table temporarily for safe rollback.
        Schema::rename('users', 'legacy_laravel_users');

        // Allow application users to exist without a Supabase Auth record.
        DB::statement(
            'ALTER TABLE public.profiles
             DROP CONSTRAINT profiles_id_fkey'
        );

        // Generate UUIDs automatically for new Laravel users.
        DB::statement(
            'ALTER TABLE public.profiles
             ALTER COLUMN id SET DEFAULT gen_random_uuid()'
        );

        // Make profiles the official application users table.
        Schema::rename('profiles', 'users');
    }

    public function down(): void
    {
        // Restore the previous table name.
        Schema::rename('users', 'profiles');

        // Return UUID creation to its previous behavior.
        DB::statement(
            'ALTER TABLE public.profiles
             ALTER COLUMN id DROP DEFAULT'
        );

        // Reconnect profiles to Supabase Auth.
        DB::statement(
            'ALTER TABLE public.profiles
             ADD CONSTRAINT profiles_id_fkey
             FOREIGN KEY (id)
             REFERENCES auth.users(id)
             ON DELETE CASCADE'
        );

        // Restore Laravel's original empty users table.
        Schema::rename('legacy_laravel_users', 'users');
    }
};
