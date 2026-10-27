<?php

namespace App\Services\ExpenseManagement;

use App\Models\ExpenseManagement\Expense;
use App\Models\ExpenseManagement\ExpenseArchiveRun;
use App\Models\ExpenseManagement\ExpenseCategory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use LogicException;

class ExpenseYearlyArchiveService
{
    private function eligibleExpenses(string $cutoffDate): Builder
    {
        return Expense::query()
            ->where('archived', false)
            ->where('expense_date', '<', $cutoffDate)
            ->whereHas('expense_categories', function (Builder $query) {
                $query->where('auto_archive_yearly', true)
                    // Protect purchases even if their flag was changed outside the API.
                    ->whereRaw('LOWER(TRIM(category_name)) <> ?', [
                        strtolower(ExpenseCategory::INVENTORY_PURCHASE),
                    ]);
            });
    }

    public function preview(): array
    {
        $today = now(config('app.business_timezone'));
        $cutoffDate = $today->copy()->startOfYear()->toDateString();
        $run = ExpenseArchiveRun::where('business_year', $today->year)->first();

        return [
            'business_year' => $today->year,
            'cutoff_date' => $cutoffDate,
            'eligible_count' => $this->eligibleExpenses($cutoffDate)->count(),
            'already_completed' => $run !== null && $run->completed_at !== null,
        ];
    }

    public function archive(): array
    {
        $today = now(config('app.business_timezone'));
        if ($today->format('m-d') !== '01-01') {
            throw new LogicException('Yearly archiving can only be applied on January 1, Philippine time.');
        }

        $year = $today->year;
        $cutoffDate = $today->copy()->startOfYear()->toDateString();

        return DB::transaction(function () use ($year, $cutoffDate) {
            ExpenseArchiveRun::query()->insertOrIgnore([
                'id' => (string) Str::uuid(),
                'business_year' => $year,
            ]);

            // A durable yearly lock also protects restores from later retries.
            $run = ExpenseArchiveRun::where('business_year', $year)
                ->lockForUpdate()
                ->firstOrFail();

            if ($run->completed_at !== null) {
                return [
                    'business_year' => $year,
                    'already_completed' => true,
                    'archived_count' => $run->archived_count,
                ];
            }

            $archivedAt = now()->toIso8601String();
            $archivedCount = $this->eligibleExpenses($cutoffDate)->update([
                'archived' => true,
                'archived_by' => null,
                'archived_at' => $archivedAt,
                'yearly_archive_run_id' => $run->id,
            ]);

            // Archive changes and completion either both commit or both roll back.
            $run->update([
                'archived_count' => $archivedCount,
                'completed_at' => $archivedAt,
            ]);

            return [
                'business_year' => $year,
                'already_completed' => false,
                'archived_count' => $archivedCount,
            ];
        });
    }
}
