<?php

namespace App\Console\Commands\InventoryManagement;

use App\Http\Controllers\Api\InventoryManagement\Orchestrators\InventoryExpiryCleanupOrchestrator;
use App\Models\InventoryManagement\InventoryItem;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

#[Signature('inventory:cleanup-expired {--item= : Only clean one inventory item UUID}')]
#[Description('Clear remaining stock from expired inventory batches')]
class CleanupExpiredInventoryBatches extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $inventoryItemId = $this->option('item');

        // Reject invalid targets instead of falling back to all ingredients.
        if ($inventoryItemId !== null) {
            if (!Str::isUuid($inventoryItemId)) {
                $this->error('Provide a valid inventory item UUID.');

                return self::FAILURE;
            }

            if (!InventoryItem::whereKey($inventoryItemId)->exists()) {
                $this->error('Inventory item not found.');

                return self::FAILURE;
            }
        }

        $expiryCleanup = app(InventoryExpiryCleanupOrchestrator::class);

        if ($inventoryItemId !== null) {
            // Targeted cleanup must not mark the whole day complete.
            $cleanedBatchCount = $expiryCleanup->cleanup($inventoryItemId);
        } else {
            // Full cleanup uses the daily completion record.
            $result = $expiryCleanup->cleanupDaily();

            if ($result['already_completed']) {
                $this->info(
                    'Daily expiry cleanup already completed for '
                        . $result['business_date'] . '.'
                );

                return self::SUCCESS;
            }

            $cleanedBatchCount = $result['cleaned_batch_count'];
        }

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
