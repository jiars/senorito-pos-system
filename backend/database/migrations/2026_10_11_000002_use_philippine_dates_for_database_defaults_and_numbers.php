<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Freeze the agreed business zone in this migration, not runtime config.
        $this->replaceNumberFunctions("CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila'");

        // These defaults apply only when an insert does not supply its own date.
        DB::statement(
            "ALTER TABLE public.expenses
             ALTER COLUMN expense_date SET DEFAULT
             ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::date)"
        );

        DB::statement(
            "ALTER TABLE public.inventory_batches
             ALTER COLUMN received_date SET DEFAULT
             ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::date)"
        );

        // Keep the full instant for this timestamp-with-time-zone column.
        DB::statement(
            'ALTER TABLE public.inventory_items
             ALTER COLUMN created_at SET DEFAULT now()'
        );
    }

    public function down(): void
    {
        // Restore the definitions verified before this migration, not saved rows.
        $this->replaceNumberFunctions('CURRENT_DATE');

        DB::statement(
            'ALTER TABLE public.expenses
             ALTER COLUMN expense_date SET DEFAULT CURRENT_DATE'
        );

        DB::statement(
            'ALTER TABLE public.inventory_batches
             ALTER COLUMN received_date SET DEFAULT CURRENT_DATE'
        );

        DB::statement(
            "ALTER TABLE public.inventory_items
             ALTER COLUMN created_at SET DEFAULT timezone('utc'::text, now())"
        );
    }

    private function replaceNumberFunctions(string $dateExpression): void
    {
        // Only the date expression differs between applying and rolling back.
        // Values come from the two fixed calls above, never request/user input.
        // Keep existing trigger attachments, sequence names, and numbering rules.
        $sql = <<<'SQL'
CREATE OR REPLACE FUNCTION public.generate_expense_number()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    today_date text;
    seq_val text;
BEGIN
    IF NEW.expense_number IS NULL OR NEW.expense_number = '' THEN
        today_date := TO_CHAR(__NUMBER_DATE__, 'YYMMDD');
        seq_val := LPAD(nextval('seq_expenses')::text, 4, '0');
        NEW.expense_number := 'EXP-' || today_date || '-' || seq_val;
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_audit_log_number()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    today_date text;
    seq_val text;
BEGIN
    IF NEW.log_number IS NULL OR NEW.log_number = '' THEN
        today_date := TO_CHAR(__NUMBER_DATE__, 'YYMMDD');
        seq_val := LPAD(nextval('seq_audit_logs')::text, 4, '0');
        NEW.log_number := 'AUD-' || today_date || '-' || seq_val;
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.override_order_number()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    today_date text;
    seq_val text;
BEGIN
    -- Offline orders keep their existing number and do not consume this sequence.
    IF NEW.order_number LIKE 'OFF-%' THEN
        RETURN NEW;
    END IF;

    today_date := TO_CHAR(__NUMBER_DATE__, 'YYMMDD');
    seq_val := LPAD(nextval('seq_orders')::text, 4, '0');
    NEW.order_number := 'ORD-' || today_date || '-' || seq_val;
    RETURN NEW;
END;
$function$;
SQL;

        DB::unprepared(str_replace('__NUMBER_DATE__', $dateExpression, $sql));
    }
};
