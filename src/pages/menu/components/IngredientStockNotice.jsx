const getLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

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
    const today = getLocalDate();

    batches.forEach((batch) => {
      const batchQuantity = Number(batch.quantity) || 0;

      if (batch.expiration_date && batch.expiration_date < today) {
        expiredStock += batchQuantity;
      } else {
        usableStock += batchQuantity;
      }
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
  const notices = [];

  if (stock.expiredStock > 0) {
    notices.push({
      key: "expired",
      type: "danger",
      message: "Some batch stock is already expired.",
    });
  }

  if (stock.usableStock <= 0) {
    notices.push({
      key: "out-of-stock",
      type: "danger",
      message: "Out of stock. This recipe cannot currently be sold.",
    });
  } else if (requiredStock > stock.usableStock) {
    notices.push({
      key: "insufficient",
      type: "danger",
      message: "Insufficient stock for one order.",
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
