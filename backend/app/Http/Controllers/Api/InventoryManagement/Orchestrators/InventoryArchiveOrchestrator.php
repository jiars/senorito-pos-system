<?php

namespace App\Http\Controllers\Api\InventoryManagement\Orchestrators;

use App\Http\Controllers\Api\MenuManagement\RecipeStatuses\RecipeStatusController;
use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryArchiveOrchestrator extends Controller
{
    public function archive(Request $request, string $id)
    {
        return DB::transaction(function () use ($request, $id) {
            // Lock the ingredient during the complete archive process.
            $item = InventoryItem::where('id', $id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($item->archived)
                abort(409, 'This inventory item is already archived.');


            $item->update([
                'archived' => true,
                'archived_by' => $request->user()->id,
                'archived_at' => now(),
            ]);

            // Affected prices and Add-ons become On Hold.
            app(RecipeStatusController::class)
                ->syncAffectedByInventoryItem($item->id);

            return $item->refresh();
        });
    }

    public function unarchive(string $id)
    {
        return DB::transaction(function () use ($id) {
            // Lock the ingredient during the complete restore process.
            $item = InventoryItem::where('id', $id)
                ->lockForUpdate()
                ->firstOrFail();

            if (!$item->archived)
                abort(409, 'This inventory item is already active.');


            $item->update([
                'archived' => false,
                'archived_by' => null,
                'archived_at' => null,
            ]);

            // Recalculate affected recipes after restoring the ingredient.
            app(RecipeStatusController::class)
                ->syncAffectedByInventoryItem($item->id);

            return $item->refresh();
        });
    }
}
