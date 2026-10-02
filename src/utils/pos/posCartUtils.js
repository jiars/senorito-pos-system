import { buildPOSStockPreview } from "./posSelectionUtils";

export const buildPOSCartWithItem = (cartItems, selection, cartId) => {
  const existingIndex = cartItems.findIndex((item) => {
    if (item.productId !== selection.id) return false;
    if (item.variant !== selection.selectedVariant) return false;
    if (item.addOns.length !== selection.selectedAddOns.length) return false;

    return selection.selectedAddOns.every((addon) => {
      return item.addOns.some((existingAddon) => {
        return existingAddon.name === addon.name && existingAddon.qty === addon.qty;
      });
    });
  });

  if (existingIndex >= 0) {
    return cartItems.map((item, index) => {
      if (index === existingIndex) {
        return { ...item, qty: item.qty + selection.drinkQty };
      }
      return item;
    });
  }

  const preview = buildPOSStockPreview(
    selection,
    selection.selectedVariantId,
    selection.drinkQty,
    selection.selectedAddOns,
  );
  const newItem = {
    cartId,
    productId: selection.id,
    priceId: selection.selectedVariantId || null,
    name: selection.name,
    imageURL: selection.imageURL,
    variant: selection.selectedVariant,
    price: selection.totalPrice,
    basePrice: selection.basePrice || selection.totalPrice,
    qty: selection.drinkQty,
    addOns: selection.selectedAddOns,
    recipeIngredients: preview.recipeIngredients,
  };
  return [...cartItems, newItem];
};
