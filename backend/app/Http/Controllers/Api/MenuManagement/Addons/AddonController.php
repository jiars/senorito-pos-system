<?php

namespace App\Http\Controllers\Api\MenuManagement\Addons;

use App\Http\Controllers\Controller;
use App\Models\MenuManagement\Addon;

class AddonController extends Controller
{
    public function index()
    {
        // Fetch all Add-ons and instantly grab the nested categories and recipes!
        $addons = Addon::with(['addon_categories.menu_categories', 'addon_recipes'])
            ->orderBy('addon_name', 'asc')
            ->get();

        return response()->json($addons);
    }

    public function destroy(string $id)
    {
        $addon = Addon::findOrFail($id);

        // We don't delete, we archive!
        $addon->update([
            'archived' => true,
            'pos_status' => 'Unavailable'
        ]);

        return response()->json(['message' => 'Add-on archived successfully']);
    }
}
