import { isBatchExpired } from "@/utils/inventory/inventoryBatchUtils";

const getRequiredStock = (ingredient, quantity, unit) => {
  let equivalent = 1;
  const conversions = ingredient.inventory_conversion_units || [];

  if (unit && unit !== ingredient.base_unit) {
    const conversion = conversions.find(
      (item) => item.converted_unit === unit,
    );

    if (conversion) {
      equivalent = Number(conversion.equivalent_base_amount) || 1;
    }
  }

  return (Number(quantity) || 0) * equivalent;
};

const getBatchStock = (ingredient) => {
  let usableStock = Number(ingredient.current_stock) || 0;
  let expiredStock = 0;
  const batches = ingredient.inventory_batches || [];

  if (ingredient.track_expiry && batches.length > 0) {
    usableStock = 0;

    batches.forEach((batch) => {
      const batchQuantity = Number(batch.quantity) || 0;

      if (isBatchExpired(batch.expiration_date)) expiredStock += batchQuantity;
      else usableStock += batchQuantity;

    });
  }

  return { usableStock, expiredStock };
};

// Shows live Inventory warnings without changing or saving recipe data.
const IngredientStockNotice = ({ ingredient, quantity, unit }) => {
  if (!ingredient) return null;

  if (ingredient.archived) {
    return (
      <p className="menu-ingredient-notice menu-ingredient-notice--danger">
        Archived ingredient. Remove or replace it.
      </p>
    );
  }

  const stock = getBatchStock(ingredient);
  const requiredStock = getRequiredStock(ingredient, quantity, unit);
  const minimumLevel = Number(ingredient.minimum_level) || 0;

  // Cleanup leaves zero quantities; the latest stock action explains why.
  const wasClearedByExpiry =
    Number(ingredient.current_stock) <= 0 &&
    ingredient.last_stock_action === "Expired";
  const isExpiredDepletion =
    ingredient.track_expiry &&
    (stock.expiredStock > 0 || wasClearedByExpiry);
  const notices = [];

  // Pick one warning, starting with the conditions that prevent a sale.
  if (stock.usableStock <= 0) {
    notices.push({
      key: isExpiredDepletion ? "expired" : "out-of-stock",
      type: "danger",
      message: isExpiredDepletion
        ? "Stock expired. Restock this ingredient."
        : "Out of stock. This recipe cannot currently be sold.",
    });
  } else if (requiredStock > stock.usableStock) {
    notices.push({
      key: "insufficient",
      type: "danger",
      message: "Insufficient usable stock for one order.",
    });
  } else if (stock.expiredStock > 0) {
    notices.push({
      key: "partial-expiry",
      type: "warning",
      message: "Some batches expired; usable stock remains.",
    });
  } else if (stock.usableStock <= minimumLevel) {
    notices.push({
      key: "low-stock",
      type: "warning",
      message: `Low stock: ${stock.usableStock} ${ingredient.base_unit} remaining.`,
    });
  }

  if (notices.length === 0) return null;

  return (
    <div className="menu-ingredient-notices">
      {notices.map((notice) => (
        <p
          key={notice.key}
          className={`menu-ingredient-notice menu-ingredient-notice--${notice.type}`}
        >
          {notice.message}
        </p>
      ))}
    </div>
  );
};

export default IngredientStockNotice;
