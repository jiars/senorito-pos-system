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
        Schema::table('profiles', function (Blueprint $table) {
            // Laravel profiles no longer depend on Supabase Auth users.
            DB::statement('
                ALTER TABLE public.profiles
                DROP CONSTRAINT profiles_id_fkey
            ');

            // Generate an ID when Laravel creates a profile.
            DB::statement('
                ALTER TABLE public.profiles
                ALTER COLUMN id SET DEFAULT gen_random_uuid()
            ');

            // Keep account statuses consistent.
            DB::statement("
              ALTER TABLE public.profiles
              ALTER COLUMN status SET DEFAULT 'Active'
            ");

            DB::statement("
                ALTER TABLE public.profiles
                ADD CONSTRAINT profiles_status_check
                CHECK (status IN ('Active', 'Deactivated'))
            ");

            // Prevent duplicate emails regardless of uppercase/lowercase.
            DB::statement('
                CREATE UNIQUE INDEX profiles_email_lower_unique
                ON public.profiles (LOWER(email))
                WHERE email IS NOT NULL
            ');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            // Remove the Laravel-owned profile rules.
            DB::statement('DROP INDEX IF EXISTS public.profiles_email_lower_unique');

            DB::statement('
                ALTER TABLE public.profiles
                DROP CONSTRAINT IF EXISTS profiles_status_check
            ');

            DB::statement("
                ALTER TABLE public.profiles
                ALTER COLUMN status SET DEFAULT 'active'
            ");

            DB::statement('
                ALTER TABLE public.profiles
                ALTER COLUMN id DROP DEFAULT
            ');

            // Restore the original Supabase Auth relationship.
            DB::statement('
                ALTER TABLE public.profiles
                ADD CONSTRAINT profiles_id_fkey
                FOREIGN KEY (id)
                REFERENCES auth.users(id)
                ON DELETE CASCADE
            ');
        });
    }
};
