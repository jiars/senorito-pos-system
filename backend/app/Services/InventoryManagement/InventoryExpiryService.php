<?php

namespace App\Services\InventoryManagement;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Builder as QueryBuilder;

class InventoryExpiryService
{
    public function today(): string
    {
        return now(config('app.business_timezone'))->toDateString();
    }

    public function applyExpiredFilter(Builder $query, string $today): Builder
    {
        // A dated batch is already expired on its expiration date.
        return $query
            ->whereNotNull('expiration_date')
            ->where('expiration_date', '<=', $today);
    }

    public function applyUsableFilter(
        Builder|QueryBuilder $query,
        string $today,
        string $column = 'expiration_date'
    ): Builder|QueryBuilder {
        // Preserve undated batches; dated batches must expire after today.
        return $query->where(function ($dateQuery) use ($today, $column) {
            $dateQuery
                ->whereNull($column)
                ->orWhere($column, '>', $today);
        });
    }

    public function addUsableStock(Builder $inventoryQuery): Builder
    {
        $today = $this->today();

        // POS and Menu Management must use the same batch expiry calculation.
        return $inventoryQuery->selectSub(
            function ($batches) use ($today) {
                $batches
                    ->from('inventory_batches')
                    ->selectRaw('COALESCE(SUM(inventory_batches.quantity), 0)')
                    ->whereColumn(
                        'inventory_batches.inventory_item_id',
                        'inventory_items.id'
                    )
                    ->where('inventory_batches.quantity', '>', 0)
                    ->where(function ($query) use ($today) {
                        $query
                            ->where('inventory_items.track_expiry', false)
                            ->orWhere(function ($query) use ($today) {
                                $this->applyUsableFilter(
                                    $query,
                                    $today,
                                    'inventory_batches.expiration_date'
                                );
                            });
                    });
            },
            'usable_stock'
        );
    }
}
