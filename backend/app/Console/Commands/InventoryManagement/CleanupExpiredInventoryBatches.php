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

        $cleanedBatchCount = $expiryCleanup->cleanup($inventoryItemId);

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
