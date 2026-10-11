<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Replace only future online numbering. Keep stored orders and OFF references.
        DB::unprepared(<<<'SQL'
CREATE OR REPLACE FUNCTION public.override_order_number()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    today_date text;
    random_suffix text;
BEGIN
    IF NEW.order_number LIKE 'OFF-%' THEN
        RETURN NEW;
    END IF;

    today_date := TO_CHAR(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila', 'YYMMDD');
    random_suffix := UPPER(LEFT(REPLACE(gen_random_uuid()::text, '-', ''), 12));
    NEW.order_number := 'ORD-' || today_date || '-' || random_suffix;
    RETURN NEW;
END;
$function$;
SQL);
    }

    public function down(): void
    {
        // Restore the previous Philippine-date counter without resetting its sequence.
        // Already saved random references stay unchanged.
        DB::unprepared(<<<'SQL'
CREATE OR REPLACE FUNCTION public.override_order_number()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    today_date text;
    seq_val text;
BEGIN
    IF NEW.order_number LIKE 'OFF-%' THEN
        RETURN NEW;
    END IF;

    today_date := TO_CHAR(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila', 'YYMMDD');
    seq_val := LPAD(nextval('seq_orders')::text, 4, '0');
    NEW.order_number := 'ORD-' || today_date || '-' || seq_val;
    RETURN NEW;
END;
$function$;
SQL);
    }
};
