<?php

namespace App\Console\Commands\InventoryManagement;

use App\Http\Controllers\Api\InventoryManagement\Orchestrators\InventoryExpiryCleanupOrchestrator;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('inventory:cleanup-expired')]
#[Description('Clear remaining stock from expired inventory batches')]
class CleanupExpiredInventoryBatches extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $cleanedBatchCount = app(
            InventoryExpiryCleanupOrchestrator::class
        )->cleanup();

        if ($cleanedBatchCount === 0) {
            $this->info('No expired inventory batches found.');

            return self::SUCCESS;
        }

        $this->info(
            $cleanedBatchCount
                . ' expired inventory batch(es) cleaned successfully.'
        );

        return self::SUCCESS;
    }
}
