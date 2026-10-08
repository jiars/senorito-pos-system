import imgDefault from "../../assets/images/default_menu_picture.jpg";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import { getRecipeAvailabilityStatus } from "./checkoutCalculations";

// Place the trusted usable stock inside every Menu and Add-on recipe.
const applyInventoryStock = (records, recipeKey, stockById) => {
  return records.map((record) => {
    const recipes = record[recipeKey] || [];

    return {
      ...record,
      [recipeKey]: recipes.map((recipe) => {
        const stock = stockById.get(recipe.inventory_item_id);
        let inventoryItem = recipe.inventory_items;

        if (inventoryItem) {
          inventoryItem = {
            ...inventoryItem,
            current_stock:
              Number(stock?.usable_stock ?? stock?.current_stock) || 0,
            usable_stock:
              Number(stock?.usable_stock ?? stock?.current_stock) || 0,
            minimum_level: Number(stock?.minimum_level) || 0,
            archived: Boolean(stock?.archived ?? inventoryItem.archived),
          };
        }

        return {
          ...recipe,
          inventory_items: inventoryItem,
        };
      }),
    };
  });
};

// Prepare the same catalog shape from either the online response or offline cache.
export const preparePOSCatalog = (
  data,
  addonsData,
  categoriesData,
  inventoryStockData,
) => {
  const stockById = new Map();
  inventoryStockData.forEach((item) => {
    stockById.set(item.id, item);
  });

  const menuItemsWithStock = applyInventoryStock(
    data,
    "menu_recipes",
    stockById,
  );
  const addonsWithStock = applyInventoryStock(
    addonsData,
    "addon_recipes",
    stockById,
  );

  // Transform Laravel or cached data into the shape POSPage expects.
  const formattedProducts = menuItemsWithStock.map((item) => {
    let basePrice = 0;
    let displayPrice = formatCurrency(0);
    let variants = [];
    let defaultPriceId = null;
    let defaultVariantName = "Reg";
    let defaultPricePosStatus = "Available";
    let defaultRecipeStatus = "Incomplete";
    const itemPrices = (item.menu_prices || []).filter(
      (price) => !price.archived,
    );
    const itemRecipes = item.menu_recipes || [];

    if (itemPrices.length === 1) {
      const regularPriceObj = itemPrices[0];
      basePrice = Number(regularPriceObj?.selling_price) || 0;
      displayPrice = formatCurrency(basePrice);
      defaultPriceId = regularPriceObj?.id || null;
      defaultVariantName = regularPriceObj?.variant_name || "Reg";
      defaultPricePosStatus = regularPriceObj?.pos_status || "Available";
      defaultRecipeStatus =
        regularPriceObj?.recipe_status || "Incomplete";
    } else {
      // Sort variants by price (lowest to highest) for display
      const sortedPrices = [...itemPrices].sort(
        (a, b) => a.selling_price - b.selling_price,
      );
      if (sortedPrices.length > 0) {
        basePrice = sortedPrices[0].selling_price;
        const minPrice = Number(sortedPrices[0].selling_price) || 0;
        const maxPrice =
          Number(sortedPrices[sortedPrices.length - 1].selling_price) ||
          0;

        if (minPrice === maxPrice) {
          displayPrice = formatCurrency(minPrice);
        } else {
          displayPrice = `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
        }

        variants = sortedPrices.map((p) => ({
          id: p.id,
          name: p.variant_name,
          price: Number(p.selling_price) || 0,
          posStatus: p.pos_status || "Unavailable",
          recipeStatus: p.recipe_status || "Incomplete",
        }));
      }
    }

    return {
      id: `p-${item.id}`,
      name: item.item_name,
      category: item.menu_categories?.category_name || "Uncategorized",
      categoryId: item.category_id,
      price: displayPrice,
      basePrice,
      defaultPriceId,
      defaultVariantName,
      defaultPricePosStatus,
      defaultRecipeStatus,
      posStatus: item.pos_status,
      imageURL: item.image_url || imgDefault,
      variants,
      rawRecipes: itemRecipes,
      isAvailable:
        item.pos_status === "Available" &&
        !item.archived &&
        itemPrices.length > 0,
    };
  });

  // Sort: Alphabetical, but Unavailable items always at the very end
  formattedProducts.sort((a, b) => {
    if (a.isAvailable && !b.isAvailable) return -1;
    if (!a.isAvailable && b.isAvailable) return 1;
    return a.name.localeCompare(b.name);
  });

  const categoryNames = [
    "All",
    ...new Set(
      [
        ...categoriesData.map((category) => category.category_name),
        ...formattedProducts.map((product) => product.category),
      ].filter(Boolean),
    ),
    "Not Available",
  ];

  return {
    products: formattedProducts,
    addons: addonsWithStock,
    categories: categoryNames,
  };
};

// Recalculate availability against the current cart using the shared stock rules.
export const getPOSDisplayProducts = (posProducts, cartItems) => {
  if (!posProducts || posProducts.length === 0) return [];

  return posProducts.map((product) => {
    const variants = product.variants.map((variant) => {
      const recipes = product.rawRecipes.filter(
        (recipe) =>
          recipe.menu_item_price_id === variant.id ||
          recipe.menu_item_price_id === null,
      );

      const availability = getRecipeAvailabilityStatus({
        recipes,
        cartItems,
        posStatus:
          product.posStatus === "Available"
            ? variant.posStatus
            : "Unavailable",
        recipeStatus: variant.recipeStatus,
      });

      return {
        ...variant,
        ...availability,
      };
    });

    let availability;

    if (variants.length > 0) {
      availability =
        variants.find((variant) => variant.status === "Available") ||
        variants.find((variant) => variant.isAvailable) ||
        variants[0];
    } else {
      const recipes = product.rawRecipes.filter(
        (recipe) =>
          recipe.menu_item_price_id === product.defaultPriceId ||
          recipe.menu_item_price_id === null,
      );

      availability = getRecipeAvailabilityStatus({
        recipes,
        cartItems,
        posStatus:
          product.posStatus === "Available"
            ? product.defaultPricePosStatus
            : "Unavailable",
        recipeStatus: product.defaultRecipeStatus,
      });
    }

    return {
      ...product,
      variants,
      status: availability.status,
      isAvailable: availability.isAvailable,
      blockingIngredients: availability.blockingIngredients,
      lowStockIngredients: availability.lowStockIngredients,
    };
  });
};

// Search and group available items separately from the Not Available category.
export const getPOSCatalogGroups = (
  displayProducts,
  categories,
  activeCategory,
  searchTerm,
) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchedProducts = displayProducts.filter((product) =>
    product.name.toLowerCase().includes(normalizedSearch),
  );
  const availableProducts = searchedProducts.filter(
    (product) => product.isAvailable,
  );
  const unavailableProducts = searchedProducts.filter(
    (product) => !product.isAvailable,
  );

  if (activeCategory === "Not Available") {
    return unavailableProducts.length > 0
      ? [{ label: "Not Available", products: unavailableProducts }]
      : [];
  }

  if (activeCategory !== "All") {
    const products = availableProducts.filter(
      (product) => product.category === activeCategory,
    );
    return products.length > 0 ? [{ label: activeCategory, products }] : [];
  }

  return categories
    .filter((category) => category !== "All" && category !== "Not Available")
    .map((category) => ({
      label: category,
      products: availableProducts.filter(
        (product) => product.category === category,
      ),
    }))
    .filter((group) => group.products.length > 0);
};
