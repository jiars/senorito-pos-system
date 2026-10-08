export const categoryValidationMessages = {
  nameRequired: "Category name is required.",
  nameTooLong: "Use 255 characters or fewer.",
  nameDuplicate: "Category already exists.",
};

export const validateExpenseCategory = (
  name,
  categories,
  excludeId = null,
) => {
  const trimmedName = name.trim();
  const errors = {};
  const messages = categoryValidationMessages;

  const isDuplicate = categories.some((category) => {
    return (
      category.id !== excludeId &&
      category.category_name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
  });

  // The validator owns both the rule and its field message.
  if (!trimmedName) {
    errors.name = messages.nameRequired;
  } else if (Array.from(trimmedName).length > 255) {
    errors.name = messages.nameTooLong;
  } else if (isDuplicate) {
    errors.name = messages.nameDuplicate;
  }

  return { errors, isFormValid: Object.keys(errors).length === 0 };
};
