export const calculateEstCost = (ingredients, inventoryItems) => {
    return ingredients.reduce((total, ing) => {
        if (!ing.ingredientId || !ing.qty) return total;
        const ref = inventoryItems.find(i => i.id === ing.ingredientId);
        if (!ref) return total;

        let equivalent = 1;
        if (ing.unit && ing.unit !== ref.base_unit) {
            const conv = ref.inventory_conversion_units?.find(cu => cu.converted_unit === ing.unit);
            if (conv) equivalent = Number(conv.equivalent_base_amount);
        }

        const parsedQty = parseFloat(ing.qty) || 0;
        const baseQty = parsedQty * equivalent;
        return total + (baseQty * ref.cost_per_unit);
    }, 0);
};

export const calculateProfit = (sellingPrice, estCost) => {
    const sp = parseFloat(sellingPrice) || 0;
    return sp - estCost;
};

export const calculateMargin = (profit, sellingPrice) => {
    const sp = parseFloat(sellingPrice) || 0;
    if (sp === 0) return 0;
    return (profit / sp) * 100;
};
