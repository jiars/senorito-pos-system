<?php

namespace App\Services\InventoryManagement;

use Illuminate\Database\Eloquent\Builder;

class InventoryStockHistoryService
{
    public function addLastStockChange(Builder $query): Builder
    {
        // Keep existing selected fields; Inventory normally selects all columns.
        if ($query->getQuery()->columns === null) {
            $query->select('inventory_items.*');
        }

        $fields = [
            'last_stock_action' => 'action',
            'last_stock_changed_at' => 'created_at',
        ];

        foreach ($fields as $alias => $column) {
            $query->selectSub(function ($stockChange) use ($column) {
                $stockChange->from('inventory_audit_logs')
                    ->select($column)
                    ->whereColumn(
                        'inventory_audit_logs.inventory_item_id',
                        'inventory_items.id'
                    )
                    ->where('quantity_change', '!=', 0)
                    ->orderByDesc('created_at')
                    ->orderByDesc('id')
                    ->limit(1);
            }, $alias);
        }

        return $query;
    }
}
