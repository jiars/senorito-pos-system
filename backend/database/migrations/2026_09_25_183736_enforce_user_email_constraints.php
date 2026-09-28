<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Normalize all existing User emails.
        DB::statement(
            'UPDATE public.users
             SET email = LOWER(BTRIM(email))'
        );

        // Every User must have an email.
        DB::statement(
            'ALTER TABLE public.users
             ALTER COLUMN email SET NOT NULL'
        );

        // Reject uppercase, extra spaces, and empty email values.
        DB::statement(
            "ALTER TABLE public.users
             ADD CONSTRAINT users_email_normalized_check
             CHECK (
                 email <> ''
                 AND email = LOWER(BTRIM(email))
             )"
        );

        // Prevent duplicate emails regardless of casing or spaces.
        DB::statement(
            'CREATE UNIQUE INDEX users_email_normalized_unique
             ON public.users (LOWER(BTRIM(email)))'
        );
    }

    public function down(): void
    {
        DB::statement(
            'DROP INDEX IF EXISTS public.users_email_normalized_unique'
        );

        DB::statement(
            'ALTER TABLE public.users
             DROP CONSTRAINT IF EXISTS users_email_normalized_check'
        );

        DB::statement(
            'ALTER TABLE public.users
             ALTER COLUMN email DROP NOT NULL'
        );
    }
};
