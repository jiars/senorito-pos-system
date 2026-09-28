<?php

namespace App\Http\Controllers\Api\MenuManagement\Addons;

use App\Http\Controllers\Controller;
use App\Models\MenuManagement\AddonCategory;

class AddonCategoryController extends Controller
{
    public function storeMany(array $categoryIds, string $addonId)
    {
        foreach ($categoryIds as $menuCategoryId) {
            AddonCategory::create([
                'addon_id' => $addonId,
                'menu_category_id' => $menuCategoryId
            ]);
        }
    }

    public function destroyMany(array $categoryIds, string $addonId)
    {
        if (!empty($categoryIds)) {
            AddonCategory::where('addon_id', $addonId)
                ->whereIn('menu_category_id', $categoryIds)
                ->delete();
        }
    }
}
