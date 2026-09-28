const RecipeStatusBadge = ({ ingredients = [], inventoryItems = [] }) => {
  const selectedIngredients = ingredients.filter(
    (ingredient) => ingredient.ingredientId,
  );

  let status = "Complete";

  if (selectedIngredients.length === 0) {
    status = "Incomplete";
  } else {
    const hasArchivedIngredient = selectedIngredients.some((ingredient) => {
      const inventoryItem = inventoryItems.find(
        (item) => item.id === ingredient.ingredientId,
      );

      return inventoryItem && inventoryItem.archived;
    });

    if (hasArchivedIngredient) status = "On Hold";
  }

  const statusClass = status.toLowerCase().replace(" ", "-");

  return (
    <span className={`menu-recipe-status menu-recipe-status--${statusClass}`}>
      Recipe: {status}
    </span>
  );
};

export default RecipeStatusBadge;
