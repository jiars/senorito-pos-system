<?php

namespace App\Console\Commands\ExpenseManagement;

use App\Services\ExpenseManagement\ExpenseYearlyArchiveService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use LogicException;

#[Signature('expenses:archive-yearly {--apply : Archive eligible expenses; January 1 only}')]
#[Description('Preview yearly expense archiving, or apply it with --apply')]
class ArchiveYearlyExpenses extends Command
{
    public function handle(ExpenseYearlyArchiveService $service): int
    {
        // Reading the preview never creates a run or changes an expense.
        if (!$this->option('apply')) {
            $preview = $service->preview();
            $this->info('Preview only. No records changed.');
            $this->line('Business year: ' . $preview['business_year']);
            $this->line('Expense dates before: ' . $preview['cutoff_date']);
            $this->line('Eligible active expenses: ' . $preview['eligible_count']);
            if ($preview['already_completed']) {
                $this->info('This year is already complete; applying again will not archive more records.');
            }

            return self::SUCCESS;
        }

        try {
            $result = $service->archive();
        } catch (LogicException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        if ($result['already_completed']) {
            $this->info('Yearly archiving already completed for ' . $result['business_year'] . '.');
        } else {
            $this->info($result['archived_count'] . ' expense(s) archived for ' . $result['business_year'] . '.');
        }

        return self::SUCCESS;
    }
}
