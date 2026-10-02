import { getRecipeAvailabilityStatus } from "./checkoutCalculations";

export const getPOSProductVariants = (product) => {
  if (product.variants && product.variants.length > 0) {
    return product.variants;
  }

  return [{
    id: product.defaultPriceId,
    name: product.defaultVariantName || "Reg",
    price: product.basePrice,
    isAvailable: product.isAvailable,
  }];
};

// Combine current availability with the user's selected add-ons.
export const getPOSAddonOptions = (product, allAddons, cartItems, selection) => {
  const options = allAddons.filter((addon) => {
    return !addon.archived && addon.addon_categories &&
      addon.addon_categories.some((category) => {
        return category.menu_category_id === product.categoryId;
      });
  }).map((addon) => {
    const selectedAddon = selection.find((item) => item.id === addon.id);
    const recipes = addon.addon_recipes || [];
    const availability = getRecipeAvailabilityStatus({
      recipes,
      cartItems,
      posStatus: addon.pos_status,
      recipeStatus: addon.recipe_status,
    });

    return {
      id: addon.id,
      name: addon.addon_name,
      price: Number(addon.selling_price) || 0,
      selected: Boolean(selectedAddon),
      qty: selectedAddon ? selectedAddon.qty : 1,
      recipes,
      ...availability,
    };
  });

  options.sort((first, second) => {
    if (first.isAvailable && !second.isAvailable) return -1;
    if (!first.isAvailable && second.isAvailable) return 1;
    return first.name.localeCompare(second.name);
  });

  return options;
};

export const getPOSSelectedAddons = (options) => {
  return options.filter((addon) => addon.selected).map((addon) => {
    return {
      id: addon.id,
      name: addon.name,
      qty: addon.qty,
      price: addon.price,
      recipes: addon.recipes,
    };
  });
};

export const getPOSUnitPrice = (basePrice, addons) => {
  const addonsTotal = addons.reduce((sum, addon) => {
    return sum + addon.price * addon.qty;
  }, 0);
  return Number(basePrice) + addonsTotal;
};

// Use the same recipe selection as checkout when previewing stock.
export const buildPOSStockPreview = (product, variantId, quantity, addons) => {
  const recipes = product.rawRecipes || [];
  return {
    cartId: "stock-preview",
    qty: quantity,
    recipeIngredients: recipes.filter((recipe) => {
      return recipe.menu_item_price_id === variantId ||
        recipe.menu_item_price_id === null;
    }),
    addOns: addons,
  };
};
