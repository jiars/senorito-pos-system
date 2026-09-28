<?php

namespace App\Http\Requests\Api\MenuManagement\Items;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\MenuManagement\MenuRecipe;

class SyncMenuItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $menuItemId = $this->route('id');

        return [
            // Basic Menu Item information
            'base_info' => ['required', 'array'],
            'base_info.item_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('menu_items', 'item_name')
                    ->ignore($menuItemId)
            ],
            'base_info.category_id' => [
                'required',
                'uuid',
                Rule::exists('menu_categories', 'id')
            ],
            'base_info.pos_status' => [
                'required',
                Rule::in(['Available', 'Unavailable'])
            ],
            'base_info.pricing_type' => [
                'required',
                Rule::in(['Fixed', 'Variants'])
            ],
            'base_info.image_url' => [
                'nullable',
                'url',
                'max:2048'
            ],

            // Validate existing and newly added prices.
            'prices' => ['required', 'array', 'min:1', 'max:20'],
            'prices.*.id' => [
                'nullable',
                'uuid',
                Rule::exists('menu_item_prices', 'id')
                    ->where(function ($query) use ($menuItemId) {
                        $query->where('menu_item_id', $menuItemId);
                    })
            ],
            'prices.*.variant_name' => [
                'required',
                'string',
                'max:100',
                'distinct:ignore_case'
            ],
            'prices.*.selling_price' => [
                'required',
                'numeric',
                'gt:0'
            ],
            'prices.*.item_code' => [
                'nullable',
                'string',
                'max:100'
            ],
            'prices.*.pos_status' => [
                'required',
                Rule::in(['Available', 'Unavailable'])
            ],

            // Validate existing and newly added recipe ingredients.
            'prices.*.recipes' => [
                'required',
                'array',
                'min:1',
                'max:50'
            ],
            'prices.*.recipes.*.id' => [
                'nullable',
                'uuid',
                Rule::exists('menu_recipes', 'id')
                    ->where(function ($query) use ($menuItemId) {
                        $query->where('menu_item_id', $menuItemId);
                    })
            ],
            'prices.*.recipes.*.inventory_item_id' => [
                'required',
                'uuid',
                Rule::exists('inventory_items', 'id')
                    ->where('archived', false)
            ],
            'prices.*.recipes.*.quantity' => [
                'required',
                'numeric',
                'gt:0'
            ],
            'prices.*.recipes.*.unit' => [
                'required',
                'string',
                'max:50'
            ]
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $pricingType = $this->input('base_info.pricing_type');
            $prices = $this->input('prices', []);

            if (!is_array($prices)) {
                return;
            }

            // Fixed pricing must contain one Regular price.
            if ($pricingType === 'Fixed') {
                if (count($prices) !== 1) {
                    $validator->errors()->add(
                        'prices',
                        'Fixed pricing must have exactly one price.'
                    );
                } else {
                    $variantName = $prices[0]['variant_name'] ?? null;

                    if ($variantName !== 'Regular') {
                        $validator->errors()->add(
                            'prices.0.variant_name',
                            'A fixed-price Menu Item must use Regular as its variant name.'
                        );
                    }
                }
            }

            $existingRecipeIds = [];

            // Collect existing recipe IDs in one array.
            foreach ($prices as $price) {
                $recipes = $price['recipes'] ?? [];

                if (!is_array($recipes)) {
                    continue;
                }

                foreach ($recipes as $recipe) {
                    if (!empty($recipe['id'])) {
                        $existingRecipeIds[] = $recipe['id'];
                    }
                }
            }

            // Fetch all recipe parent IDs using one database query.
            $recipeParentIds = MenuRecipe::whereIn(
                'id',
                $existingRecipeIds
            )->pluck('menu_item_price_id', 'id');

            foreach ($prices as $priceIndex => $price) {
                $priceId = $price['id'] ?? null;
                $recipes = $price['recipes'] ?? [];

                if (!is_array($recipes)) {
                    continue;
                }

                $ingredientIds = [];

                foreach ($recipes as $recipeIndex => $recipe) {
                    $ingredientId = $recipe['inventory_item_id'] ?? null;
                    $recipeId = $recipe['id'] ?? null;

                    if (!empty($ingredientId)) {
                        $ingredientIds[] = $ingredientId;
                    }

                    if (empty($recipeId)) {
                        continue;
                    }

                    $actualPriceId = $recipeParentIds->get($recipeId);

                    // Existing recipes must stay under their real price.
                    if (empty($priceId) || $actualPriceId !== $priceId) {
                        $validator->errors()->add(
                            "prices.$priceIndex.recipes.$recipeIndex.id",
                            'This recipe does not belong to the selected price.'
                        );
                    }
                }

                // Prevent duplicate ingredients in each recipe.
                if (
                    count($ingredientIds) !==
                    count(array_unique($ingredientIds))
                ) {
                    $validator->errors()->add(
                        "prices.$priceIndex.recipes",
                        'The same ingredient cannot be added more than once.'
                    );
                }
            }
        });
    }
}
