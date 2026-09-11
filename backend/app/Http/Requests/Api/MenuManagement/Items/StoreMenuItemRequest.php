<?php

namespace App\Http\Requests\Api\MenuManagement\Items;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMenuItemRequest extends FormRequest
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
        return [
            // Basic Menu Item information
            'base_info' => ['required', 'array'],
            'base_info.item_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('menu_items', 'item_name')
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

            // A Menu Item needs at least one price.
            'prices' => ['required', 'array', 'min:1', 'max:20'],
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

            // Every price or variant needs at least one ingredient.
            'prices.*.recipes' => [
                'required',
                'array',
                'min:1',
                'max:50'
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

            // Fixed pricing must contain one Regular price only.
            if ($pricingType === 'Fixed') {
                if (count($prices) !== 1) {
                    $validator->errors()->add(
                        'prices',
                        'Fixed pricing must have exactly one price.'
                    );

                    return;
                }

                $variantName = $prices[0]['variant_name'] ?? null;

                if ($variantName !== 'Regular') {
                    $validator->errors()->add(
                        'prices.0.variant_name',
                        'A fixed-price Menu Item must use Regular as its variant name.'
                    );
                }
            }

            // Prevent duplicate ingredients inside the same recipe.
            foreach ($prices as $priceIndex => $price) {
                $recipes = $price['recipes'] ?? [];

                if (!is_array($recipes)) {
                    continue;
                }

                $ingredientIds = [];

                foreach ($recipes as $recipe) {
                    if (!empty($recipe['inventory_item_id'])) {
                        $ingredientIds[] = $recipe['inventory_item_id'];
                    }
                }

                if (count($ingredientIds) !== count(array_unique($ingredientIds))) {
                    $validator->errors()->add(
                        "prices.$priceIndex.recipes",
                        'The same ingredient cannot be added more than once.'
                    );
                }
            }
        });
    }
}
