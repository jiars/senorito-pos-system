// Compare saved values, not temporary row IDs or ingredient ordering.
const getRecipeSnapshot = (ingredients) => {
  const rows = ingredients.filter((ingredient) => {
    return Boolean(ingredient.ingredientId);
  }).map((ingredient) => {
    return JSON.stringify([
      ingredient.ingredientId,
      Number(ingredient.qty),
      ingredient.unit,
    ]);
  });
  return JSON.stringify(rows.sort());
};

export const getMenuItemChanges = (initialDraft, baseInfo, variants) => {
  const changes = {
    imageUpdated: Boolean(baseInfo.image),
    availabilityChanged: baseInfo.isAvailable !== initialDraft.baseInfo.isAvailable,
    isAvailable: baseInfo.isAvailable,
    variantsAdded: 0,
    variantsArchived: 0,
    variantsRestored: 0,
    namesUpdated: false,
    pricesUpdated: false,
    recipesUpdated: false,
    variantAvailabilityUpdated: false,
  };

  variants.forEach((variant) => {
    const original = initialDraft.variants.find((saved) => {
      return saved.id === variant.id;
    });

    if (!original) {
      if (!variant.archived) changes.variantsAdded++;
      return;
    }

    if (!original.archived && variant.archived) {
      changes.variantsArchived++;
      return;
    }
    if (original.archived && !variant.archived) {
      changes.variantsRestored++;
    }
    if (variant.archived) return;

    if (variant.name.trim() !== original.name.trim()) changes.namesUpdated = true;
    if (Number(variant.sellingPrice) !== Number(original.sellingPrice)) changes.pricesUpdated = true;
    if (variant.isAvailable !== original.isAvailable) changes.variantAvailabilityUpdated = true;
    if (getRecipeSnapshot(variant.ingredients) !== getRecipeSnapshot(original.ingredients)) {
      changes.recipesUpdated = true;
    }
  });

  return changes;
};
