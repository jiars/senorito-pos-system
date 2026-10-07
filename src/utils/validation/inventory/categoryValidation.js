export const validateInventoryCategory = (
  name,
  categories,
  excludeId = null,
) => {
  const trimmedName = name.trim();
  const errors = {};

  const isDuplicate = categories.some((category) => {
    return (
      category.id !== excludeId &&
      category.category_name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
  });

  // The validator owns both the rule and its field message.
  if (!trimmedName) {
    errors.name = "Category name is required.";
  } else if (Array.from(trimmedName).length > 255) {
    errors.name = "Use 255 characters or fewer.";
  } else if (isDuplicate) {
    errors.name = "Category already exists.";
  }

  return { errors, isFormValid: Object.keys(errors).length === 0 };
};
