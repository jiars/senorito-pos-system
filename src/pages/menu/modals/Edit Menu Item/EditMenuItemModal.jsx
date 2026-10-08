import { useEffect, useRef, useState } from "react";
import Modal from "@/components/modals/Modal";
import ModalHeader from "@/components/modals/ModalHeader";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalFooter from "@/components/modals/ModalFooter";
import RecipeStatusBadge from "@/pages/menu/components/RecipeStatusBadge";
import { syncMenuItem } from "@/services/menu/menuItemsService";
import { uploadMenuImage } from "@/utils/menu/imageUploadHelper";
import { validateMenuItemForm } from "@/utils/menu/validation/menuValidation";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  calculateEstCost,
  calculateProfit,
  calculateMargin,
} from "@/utils/menu/pricingCalculations";
import IngredientStockNotice from "@/pages/menu/components/IngredientStockNotice";
import {
  addButtonClassName,
  comboClassName,
  controlClassName,
  errorClassName,
  labelClassName,
  optionClassName,
  popupClassName,
  removeButtonClassName,
  secondaryButtonClassName,
  toggleClassName,
} from "../shared/menuModalClasses";

import "./editMenuItemModal.css";

// Keep saved IDs separate from temporary UI keys for newly added rows.
const createEditIngredient = () => ({
  id: crypto.randomUUID(),
  persistedId: null,
  ingredientId: "",
  qty: "",
  unit: "",
});

const createEditVariant = () => ({
  id: crypto.randomUUID(),
  persistedId: null,
  name: "Reg",
  isNameAutomatic: true,
  archived: false,
  isAvailable: true,
  sellingPrice: "",
  ingredients: [createEditIngredient()],
});

const mapIngredients = (recipes) => {
  if (recipes.length === 0) return [createEditIngredient()];

  return recipes.map((recipe) => ({
    id: recipe.id || crypto.randomUUID(),
    persistedId: recipe.id || null,
    ingredientId: recipe.inventory_item_id,
    qty: String(recipe.quantity ?? ""),
    unit: recipe.unit || "",
  }));
};

const createEditMenuDraft = (item) => {
  const prices = item.menu_prices || [];
  const recipes = item.menu_recipes || [];
  return {
    baseInfo: {
      name: item.item_name || "",
      category: item.category_id || "",
      isAvailable: item.pos_status === "Available",
      image: null,
    },
    variants:
      prices.length > 0
        ? prices.map((price) => ({
            id: price.id || crypto.randomUUID(),
            persistedId: price.id || null,
            name: price.variant_name || "",
            isNameAutomatic: false,
            archived: price.archived === true,
            itemCode: price.item_code || null,
            isAvailable: price.pos_status !== "Unavailable",
            sellingPrice: String(price.selling_price ?? ""),
            ingredients: mapIngredients(
              recipes.filter(
                (recipe) =>
                  recipe.menu_item_price_id === price.id ||
                  (prices.length === 1 && recipe.menu_item_price_id == null),
              ),
            ),
          }))
        : [createEditVariant()],
  };
};
// Only generated names are cleared when another active size is added.
const normalizeVariantNames = (variants) => {
  const activeCount = variants.filter((variant) => !variant.archived).length;
  return variants.map((variant) => {
    if (variant.archived) return variant;
    if (activeCount > 1 && variant.isNameAutomatic) {
      return { ...variant, name: "", isNameAutomatic: false };
    }
    if (activeCount === 1 && !variant.name.trim()) {
      return { ...variant, name: "Reg", isNameAutomatic: true };
    }
    return variant;
  });
};

const EditMenuItemModalContent = ({
  onClose,
  item,
  refetchMenu,
  categories = [],
  inventoryItems = [],
  maxWidth = "42rem",
  maxHeight = "min(90svh, 48rem)",
  supportsVariantArchiving = false,
}) => {
  const [initialDraft] = useState(() => {
    const draft = createEditMenuDraft(item);
    return { ...draft, variants: normalizeVariantNames(draft.variants) };
  });
  const [baseInfo, setBaseInfo] = useState(initialDraft.baseInfo);
  const [variants, setVariants] = useState(initialDraft.variants);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const submittingRef = useRef(false);
  const previewRef = useRef(null);
  const allErrors = validateMenuItemForm(baseInfo, variants);
  const errors = hasAttemptedSubmit ? allErrors : {};
  const isFormValid = Object.keys(allErrors).length === 0;
  const category =
    categories.find((entry) => entry.id === baseInfo.category) || null;
  const recipes = variants.filter((variant) => !variant.archived);
  const archivedVariants = variants.filter((variant) => variant.archived);
  const hasVariants = recipes.length > 1;
  const hasArchiveChanges = variants.some((variant) => {
    const original = initialDraft.variants.find(
      (saved) => saved.id === variant.id,
    );
    return (
      variant.persistedId && original && variant.archived !== original.archived
    );
  });
  // The old sync endpoint ignores archive flags; do not send archive drafts to it.
  const archivePersistenceBlocked =
    !supportsVariantArchiving &&
    (hasArchiveChanges || archivedVariants.length > 0);
  const disabled = isSubmitting;

  useEffect(() => {
    if (!baseInfo.image) return;
    const url = URL.createObjectURL(baseInfo.image);
    if (previewRef.current) previewRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [baseInfo.image]);

  const onChange = (field, value) => {
    setErrorMessage("");
    setBaseInfo((current) => ({ ...current, [field]: value }));
  };

  const onRecipeChange = (variantId, updater) => {
    setErrorMessage("");
    setVariants((current) =>
      current.map((variant) =>
        variant.id === variantId ? updater(variant) : variant,
      ),
    );
  };

  const onAddIngredient = (variantId) => {
    onRecipeChange(variantId, (recipe) => ({
      ...recipe,
      ingredients: [...recipe.ingredients, createEditIngredient()],
    }));
  };

  const onAddVariant = () => {
    setErrorMessage("");
    setVariants((current) =>
      normalizeVariantNames([...current, createEditVariant()]),
    );
  };

  const onRemoveVariant = (variantId) => {
    setErrorMessage("");
    setVariants((current) => {
      if (current.filter((variant) => !variant.archived).length <= 1)
        return current;
      const target = current.find((variant) => variant.id === variantId);
      if (!target) return current;
      if (!target.persistedId) {
        return normalizeVariantNames(
          current.filter((variant) => variant.id !== variantId),
        );
      }
      return normalizeVariantNames(
        current.map((variant) =>
          variant.id === variantId ? { ...variant, archived: true } : variant,
        ),
      );
    });
  };

  const onRestoreVariant = (variantId) => {
    setErrorMessage("");
    setVariants((current) =>
      normalizeVariantNames(
        current.map((variant) =>
          variant.id === variantId ? { ...variant, archived: false } : variant,
        ),
      ),
    );
  };

  const handleClose = () => {
    if (!submittingRef.current) onClose();
  };

  const updateIngredient = (variantId, ingredientId, field, value) => {
    onRecipeChange(variantId, (recipe) => ({
      ...recipe,
      ingredients: recipe.ingredients.map((ingredient) => {
        if (ingredient.id !== ingredientId) return ingredient;
        const nextIngredient = { ...ingredient, [field]: value };
        if (field === "ingredientId") {
          nextIngredient.unit =
            inventoryItems.find((item) => item.id === value)?.base_unit || "";
        }
        return nextIngredient;
      }),
    }));
  };

  const handleSaveEdit = async () => {
    setHasAttemptedSubmit(true);
    if (!isFormValid || archivePersistenceBlocked || submittingRef.current)
      return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      let finalImageUrl = item.image_url;
      if (baseInfo.image) {
        const selectedCat = categories.find((c) => c.id === baseInfo.category);
        const categoryName = selectedCat
          ? selectedCat.category_name
          : "Uncategorized";
        finalImageUrl = await uploadMenuImage(
          baseInfo.image,
          baseInfo.name,
          categoryName,
        );
      }

      // Preserve the existing sync payload and saved record IDs.
      const payload = {
        base_info: {
          item_name: baseInfo.name.trim(),
          category_id: baseInfo.category,
          recipe_status: item.recipe_status || "Complete",
          pos_status: baseInfo.isAvailable ? "Available" : "Unavailable",
          pricing_type: recipes.length === 1 ? "Fixed" : "Variants",
          image_url: finalImageUrl,
        },
        prices: [],
      };

      const processIngredients = (ingredients) => {
        const recipes = [];
        ingredients.forEach((ing) => {
          if (ing.ingredientId && ing.qty) {
            const ref = inventoryItems.find((i) => i.id === ing.ingredientId);
            let equivalent = 1;
            if (ing.unit && ing.unit !== ref?.base_unit) {
              const conv = ref?.inventory_conversion_units?.find(
                (cu) => cu.converted_unit === ing.unit,
              );
              if (conv) equivalent = Number(conv.equivalent_base_amount);
            }
            const baseQty = parseFloat(ing.qty) * equivalent;

            recipes.push({
              id: ing.persistedId,
              inventory_item_id: ing.ingredientId,
              quantity: parseFloat(ing.qty),
              unit: ing.unit || ref?.base_unit,
              estimated_cost: baseQty * (ref ? ref.cost_per_unit : 0),
            });
          }
        });
        return recipes;
      };

      // Include saved archived rows too; omission must never delete a price.
      payload.prices = variants.map((variant) => {
        const estCost = calculateEstCost(variant.ingredients, inventoryItems);
        const profit = calculateProfit(variant.sellingPrice, estCost);
        const name =
          variant.name.trim() ||
          (!variant.archived && recipes.length === 1 ? "Reg" : "");
        return {
          id: variant.persistedId,
          variant_name: name,
          selling_price: parseFloat(variant.sellingPrice) || 0,
          estimated_cost: estCost,
          profit,
          margin: calculateMargin(profit, variant.sellingPrice),
          item_code: variant.itemCode || null,
          pos_status: variant.isAvailable ? "Available" : "Unavailable",
          archived: variant.archived,
          recipes: processIngredients(variant.ingredients),
        };
      });

      // Save through the existing menu service.
      await syncMenuItem(item.id, payload);

      // Refresh the list after a successful save.
      if (refetchMenu) {
        await refetchMenu();
      }
      onClose();
    } catch (error) {
      console.error("Failed to update menu item:", error);
      setErrorMessage(error.message || "Error updating item in database.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
    >
      <ModalHeader
        title="Edit Menu Item"
        description="Update the menu details, pricing, and recipe ingredients."
        iconClassName="bi bi-pencil-square"
        closeDisabled={isSubmitting}
      />
      <ModalBody viewportClassName="!max-h-[calc(var(--app-modal-max-height)-9.75rem)] max-sm:!max-h-[calc(var(--app-modal-max-height)-14.5rem)]">
        <ModalContent className="max-sm:!p-[var(--app-space-4)]">
          {errorMessage && (
            <p
              role="alert"
              className="rounded-[var(--app-radius-nested)] bg-[var(--app-color-danger-surface)] p-[var(--app-space-4)] text-[length:var(--app-font-size-caption)] text-[var(--app-color-danger)]"
            >
              {errorMessage}
            </p>
          )}
          <fieldset
            disabled={isSubmitting}
            className="flex min-w-0 flex-col gap-[var(--app-gap-section)] border-0 p-0"
          >
            <section
              aria-labelledby="edit-menu-general"
              className="flex min-w-0 flex-col gap-[var(--app-gap-related)]"
            >
              <h2 id="edit-menu-general" className="sr-only">
                General menu information
              </h2>
              <div className="edit-menu-general-grid">
                <Field
                  data-invalid={Boolean(errors.image)}
                  className="min-w-0 self-start"
                >
                  <FieldLabel
                    htmlFor="edit-menu-image"
                    className={labelClassName}
                  >
                    Item Image
                  </FieldLabel>
                  <label
                    className={`edit-menu-image-upload relative flex min-w-0 cursor-pointer items-center justify-center overflow-hidden rounded-[var(--app-radius-nested)] border border-dashed bg-[var(--app-color-canvas)] focus-within:outline-2 focus-within:outline-[var(--app-color-brand)] ${errors.image ? "border-[var(--app-color-danger)]" : "border-[var(--app-color-brand-border)]"}`}
                  >
                    <input
                      id="edit-menu-image"
                      type="file"
                      accept="image/*"
                      aria-label="Change menu image"
                      aria-invalid={Boolean(errors.image)}
                      aria-describedby={
                        errors.image ? "edit-menu-image-error" : undefined
                      }
                      className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) onChange("image", file);
                      }}
                    />
                    {(baseInfo.image || item.image_url) && (
                      <img
                        src={item.image_url || undefined}
                        ref={previewRef}
                        alt="Menu item preview"
                        className="absolute inset-0 size-full object-contain"
                      />
                    )}
                    <span
                      className={`flex flex-col items-center gap-[var(--app-space-2)] p-[var(--app-space-2)] text-[length:var(--app-font-size-caption)] text-[var(--app-color-brand)] ${baseInfo.image || item.image_url ? "absolute inset-x-0 bottom-0 bg-white/90" : ""}`}
                    >
                      <i aria-hidden="true" className="bi bi-image text-xl" />
                      {baseInfo.image || item.image_url
                        ? "Change Image"
                        : "Upload Image"}
                    </span>
                  </label>
                  {errors.image && (
                    <FieldError
                      id="edit-menu-image-error"
                      className={errorClassName}
                    >
                      {errors.image}
                    </FieldError>
                  )}
                </Field>
                <div className="flex min-w-0 flex-col justify-between gap-[var(--app-gap-related)]">
                  <Field data-invalid={Boolean(errors.name)}>
                    <FieldLabel
                      htmlFor="edit-menu-name"
                      className={labelClassName}
                    >
                      Item Name{" "}
                      <span className="text-[var(--app-color-danger)]">*</span>
                    </FieldLabel>
                    <Input
                      id="edit-menu-name"
                      value={baseInfo.name}
                      onChange={(event) => onChange("name", event.target.value)}
                      placeholder="e.g. Blueberry Dream Frappe"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={
                        errors.name ? "edit-menu-name-error" : undefined
                      }
                      className={controlClassName}
                    />
                    {errors.name && (
                      <FieldError
                        id="edit-menu-name-error"
                        className={errorClassName}
                      >
                        {errors.name}
                      </FieldError>
                    )}
                  </Field>
                  <Field data-invalid={Boolean(errors.category)}>
                    <FieldLabel
                      htmlFor="edit-menu-category"
                      className={labelClassName}
                    >
                      Category{" "}
                      <span className="text-[var(--app-color-danger)]">*</span>
                    </FieldLabel>
                    <Combobox
                      disabled={isSubmitting}
                      items={categories}
                      value={category}
                      onValueChange={(value) =>
                        onChange("category", value?.id ?? "")
                      }
                      itemToStringLabel={(item) => item?.category_name || ""}
                      itemToStringValue={(item) => String(item?.id || "")}
                      isItemEqualToValue={(item, value) =>
                        item?.id === value?.id
                      }
                    >
                      <ComboboxInput
                        id="edit-menu-category"
                        placeholder="Search category"
                        aria-invalid={Boolean(errors.category)}
                        aria-describedby={
                          errors.category
                            ? "edit-menu-category-error"
                            : undefined
                        }
                        className={comboClassName}
                      />
                      <ComboboxContent
                        positionerClassName="!z-[1100]"
                        className={popupClassName}
                      >
                        <ComboboxEmpty>No category found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item) => (
                            <ComboboxItem
                              key={item.id}
                              value={item}
                              className={optionClassName}
                            >
                              {item.category_name}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    {errors.category && (
                      <FieldError
                        id="edit-menu-category-error"
                        className={errorClassName}
                      >
                        {errors.category}
                      </FieldError>
                    )}
                  </Field>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={baseInfo.isAvailable}
                    onClick={() =>
                      onChange("isAvailable", !baseInfo.isAvailable)
                    }
                    className={`${toggleClassName} !bg-transparent`}
                  >
                    <span
                      aria-hidden="true"
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors motion-reduce:transition-none ${baseInfo.isAvailable ? "bg-[var(--app-color-brand)]" : "bg-[var(--app-color-border-subtle)]"}`}
                    >
                      <span
                        className={`absolute top-[3px] size-[18px] rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${baseInfo.isAvailable ? "translate-x-[23px]" : "translate-x-[3px]"}`}
                      />
                    </span>
                    Available for sale
                  </button>
                </div>
              </div>
            </section>
            <section
              aria-labelledby="edit-menu-pricing"
              className="flex min-w-0 flex-col gap-[var(--app-gap-related)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-[var(--app-gap-related)]">
                <h2
                  id="edit-menu-pricing"
                  className="text-[length:var(--app-font-size-body-secondary)] font-semibold text-[var(--app-color-text)]"
                >
                  Pricing
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onAddVariant}
                  className={addButtonClassName}
                >
                  <i aria-hidden="true" className="bi bi-plus-lg" /> Add Variant
                  / Size
                </Button>
              </div>
              {errors.variants && (
                <p role="alert" className={errorClassName}>
                  {errors.variants}
                </p>
              )}
              {recipes.map((recipe, recipeIndex) => {
                const variantId = recipe.id;
                const prefix = `variant_${recipe.id}`;
                const priceError = errors[`${prefix}_price`];
                const nameError = errors[`${prefix}_name`];
                const estimatedCost = calculateEstCost(
                  recipe.ingredients,
                  inventoryItems,
                );
                const profit = calculateProfit(
                  recipe.sellingPrice,
                  estimatedCost,
                );
                const margin = calculateMargin(profit, recipe.sellingPrice);
                const metrics = [
                  {
                    key: "price",
                    label: "Selling Price",
                    value: recipe.sellingPrice,
                    editable: true,
                  },
                  {
                    key: "cost",
                    label: "Est. Cost",
                    value: estimatedCost.toFixed(2),
                  },
                  { key: "profit", label: "Profit", value: profit.toFixed(2) },
                  {
                    key: "margin",
                    label: "Margin",
                    value: `${margin.toFixed(2)}%`,
                    percentage: true,
                  },
                ];

                return (
                  <div
                    key={prefix}
                    role="group"
                    aria-label={
                      hasVariants
                        ? `Variant ${recipeIndex + 1}`
                        : "Single price recipe"
                    }
                    className="flex min-w-0 flex-col gap-[var(--app-gap-related)] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] p-[var(--app-space-4)]"
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_var(--app-touch-target-min)] items-start gap-[var(--app-space-2)] sm:grid-cols-[minmax(0,1fr)_auto_var(--app-touch-target-min)]">
                      <Field
                        data-invalid={Boolean(nameError)}
                        className="max-sm:col-span-2"
                      >
                        <FieldLabel
                          htmlFor={`${prefix}-name`}
                          className={labelClassName}
                        >
                          Size / Variant Name{" "}
                          {hasVariants && (
                            <span className="text-[var(--app-color-danger)]">
                              *
                            </span>
                          )}
                        </FieldLabel>
                        <Input
                          id={`${prefix}-name`}
                          value={recipe.name}
                          placeholder={hasVariants ? "e.g. 16oz" : "Reg"}
                          onChange={(event) =>
                            onRecipeChange(variantId, (current) => ({
                              ...current,
                              name: event.target.value,
                              isNameAutomatic: false,
                            }))
                          }
                          aria-invalid={Boolean(nameError)}
                          aria-describedby={
                            nameError ? `${prefix}-name-error` : undefined
                          }
                          className={controlClassName}
                        />
                        {nameError && (
                          <FieldError
                            id={`${prefix}-name-error`}
                            className={errorClassName}
                          >
                            {nameError}
                          </FieldError>
                        )}
                      </Field>
                      <button
                        type="button"
                        role="switch"
                        aria-label={`Variant ${recipeIndex + 1} available for sale`}
                        aria-checked={recipe.isAvailable}
                        onClick={() =>
                          onRecipeChange(variantId, (current) => ({
                            ...current,
                            isAvailable: !current.isAvailable,
                          }))
                        }
                        className={`${toggleClassName} !bg-transparent sm:mt-6`}
                      >
                        <span
                          aria-hidden="true"
                          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors motion-reduce:transition-none ${recipe.isAvailable ? "bg-[var(--app-color-brand)]" : "bg-[var(--app-color-border-subtle)]"}`}
                        >
                          <span
                            className={`absolute top-[3px] size-[18px] rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${recipe.isAvailable ? "translate-x-[23px]" : "translate-x-[3px]"}`}
                          />
                        </span>
                        <span className="text-[length:var(--app-font-size-caption)]">
                          Available for sale
                        </span>
                      </button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={`${removeButtonClassName} sm:mt-6`}
                        disabled={recipes.length === 1}
                        onClick={() => onRemoveVariant(variantId)}
                        aria-label={`${recipe.persistedId ? "Archive" : "Remove"} variant ${recipeIndex + 1}`}
                        title={
                          recipes.length === 1
                            ? "Keep at least one non-archived size."
                            : recipe.persistedId
                              ? "Archive variant"
                              : "Remove unsaved variant"
                        }
                      >
                        <i
                          aria-hidden="true"
                          className={
                            recipe.persistedId ? "bi bi-archive" : "bi bi-trash"
                          }
                        />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-[var(--app-space-2)] sm:grid-cols-4">
                      {metrics.map((metric) => (
                        <Field
                          key={metric.key}
                          data-invalid={Boolean(metric.editable && priceError)}
                        >
                          <FieldLabel
                            htmlFor={`${prefix}-${metric.key}`}
                            className={labelClassName}
                          >
                            {metric.label}
                            {metric.editable && (
                              <span className="text-[var(--app-color-danger)]">
                                *
                              </span>
                            )}
                          </FieldLabel>
                          {metric.percentage ? (
                            <Input
                              id={`${prefix}-${metric.key}`}
                              readOnly
                              value={metric.value}
                              className={`${controlClassName} bg-[var(--app-color-filter-bg)]`}
                            />
                          ) : (
                            <InputGroup
                              className={`${comboClassName} overflow-hidden ${!metric.editable ? "bg-[var(--app-color-filter-bg)]" : ""}`}
                            >
                              <InputGroupAddon
                                className="h-full border-r border-[var(--app-color-border-subtle)] bg-[var(--app-color-filter-bg)] px-[var(--app-space-2)]"
                                aria-hidden="true"
                              >
                                ₱
                              </InputGroupAddon>
                              <InputGroupInput
                                id={`${prefix}-${metric.key}`}
                                type={metric.editable ? "number" : "text"}
                                readOnly={!metric.editable}
                                min={metric.editable ? "0" : undefined}
                                step={metric.editable ? "any" : undefined}
                                placeholder="0.00"
                                value={metric.value}
                                onChange={
                                  metric.editable
                                    ? (event) =>
                                        onRecipeChange(
                                          variantId,
                                          (current) => ({
                                            ...current,
                                            sellingPrice: event.target.value,
                                          }),
                                        )
                                    : undefined
                                }
                                aria-invalid={Boolean(
                                  metric.editable && priceError,
                                )}
                                aria-describedby={
                                  metric.editable && priceError
                                    ? `${prefix}-price-error`
                                    : undefined
                                }
                                className="min-w-0 text-[length:var(--app-font-size-body-secondary)]"
                              />
                            </InputGroup>
                          )}
                          {metric.editable && priceError && (
                            <FieldError
                              id={`${prefix}-price-error`}
                              className={errorClassName}
                            >
                              {priceError}
                            </FieldError>
                          )}
                        </Field>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-start justify-between gap-[var(--app-space-2)]">
                      <div>
                        <h3 className="text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]">
                          Recipe / Ingredient Deduction
                        </h3>
                        <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
                          Select ingredients that will be deducted from
                          inventory when sold.
                        </p>
                      </div>
                      <RecipeStatusBadge
                        ingredients={recipe.ingredients}
                        inventoryItems={inventoryItems}
                      />
                    </div>

                    <div
                      aria-hidden="true"
                      className="edit-menu-ingredient-row !hidden sm:!grid"
                    >
                      {[
                        "Ingredient *",
                        "Quantity *",
                        "Unit *",
                        "Est. Cost",
                      ].map((label) => (
                        <span key={label} className={labelClassName}>
                          {label}
                        </span>
                      ))}
                      <span />
                    </div>
                    {recipe.ingredients.map((ingredient, ingredientIndex) => {
                      const ingredientPrefix = `var_${recipe.id}_ing_${ingredient.id}`;
                      const selectedItem =
                        inventoryItems.find(
                          (item) => item.id === ingredient.ingredientId,
                        ) || null;
                      const selectableIngredients = inventoryItems.filter(
                        (item) =>
                          !item.archived || item.id === ingredient.ingredientId,
                      );
                      const units = selectedItem
                        ? [
                            selectedItem.base_unit,
                            ...new Set(
                              (selectedItem.inventory_conversion_units || [])
                                .map((unit) => unit.converted_unit)
                                .filter(
                                  (unit) => unit !== selectedItem.base_unit,
                                ),
                            ),
                          ]
                        : [];
                      const rowCost = calculateEstCost(
                        [ingredient],
                        inventoryItems,
                      );
                      const idError = errors[`${ingredientPrefix}_id`];
                      const qtyError = errors[`${ingredientPrefix}_qty`];
                      const unitError = errors[`${ingredientPrefix}_unit`];

                      return (
                        <div
                          key={ingredient.id}
                          className="edit-menu-ingredient-row"
                        >
                          <Field
                            className="edit-menu-ingredient-picker min-w-0"
                            data-invalid={Boolean(idError)}
                          >
                            <FieldLabel
                              htmlFor={`${ingredientPrefix}-item`}
                              className={`${labelClassName} sm:sr-only`}
                            >
                              Ingredient {ingredientIndex + 1} *
                            </FieldLabel>
                            <Combobox
                              disabled={disabled}
                              items={selectableIngredients}
                              value={selectedItem}
                              onValueChange={(item) =>
                                updateIngredient(
                                  variantId,
                                  ingredient.id,
                                  "ingredientId",
                                  item?.id ?? "",
                                )
                              }
                              itemToStringLabel={(item) =>
                                item?.item_name || ""
                              }
                              itemToStringValue={(item) =>
                                String(item?.id || "")
                              }
                              isItemEqualToValue={(item, value) =>
                                item?.id === value?.id
                              }
                            >
                              <ComboboxInput
                                id={`${ingredientPrefix}-item`}
                                placeholder="Search ingredient"
                                className={comboClassName}
                                aria-invalid={Boolean(idError)}
                                aria-describedby={
                                  idError
                                    ? `${ingredientPrefix}-item-error`
                                    : undefined
                                }
                              />
                              <ComboboxContent
                                positionerClassName="!z-[1100]"
                                className={popupClassName}
                              >
                                <ComboboxEmpty>
                                  No ingredient found.
                                </ComboboxEmpty>
                                <ComboboxList>
                                  {(item) => (
                                    <ComboboxItem
                                      key={item.id}
                                      value={item}
                                      disabled={Boolean(item.archived)}
                                      className={optionClassName}
                                    >
                                      <span className="min-w-0 break-words">
                                        {item.item_name}
                                        {item.archived
                                          ? " (Archived)"
                                          : ""}{" "}
                                        <span className="text-[length:var(--app-font-size-caption)] italic text-[var(--app-color-text-muted)]">
                                          — ₱
                                          {Number(
                                            item.cost_per_unit || 0,
                                          ).toFixed(2)}
                                          /{item.base_unit}
                                        </span>
                                      </span>
                                    </ComboboxItem>
                                  )}
                                </ComboboxList>
                              </ComboboxContent>
                            </Combobox>
                            <IngredientStockNotice
                              ingredient={selectedItem}
                              quantity={ingredient.qty}
                              unit={ingredient.unit}
                            />
                            {idError && (
                              <FieldError
                                id={`${ingredientPrefix}-item-error`}
                                className={errorClassName}
                              >
                                {idError}
                              </FieldError>
                            )}
                          </Field>
                          <Field
                            className="min-w-0"
                            data-invalid={Boolean(qtyError)}
                          >
                            <FieldLabel
                              htmlFor={`${ingredientPrefix}-qty`}
                              className={`${labelClassName} sm:sr-only`}
                            >
                              Quantity {ingredientIndex + 1} *
                            </FieldLabel>
                            <Input
                              id={`${ingredientPrefix}-qty`}
                              type="number"
                              min="0"
                              step="any"
                              placeholder="0"
                              value={ingredient.qty}
                              onChange={(event) =>
                                updateIngredient(
                                  variantId,
                                  ingredient.id,
                                  "qty",
                                  event.target.value,
                                )
                              }
                              className={controlClassName}
                              aria-invalid={Boolean(qtyError)}
                              aria-describedby={
                                qtyError
                                  ? `${ingredientPrefix}-qty-error`
                                  : undefined
                              }
                            />
                            {qtyError && (
                              <FieldError
                                id={`${ingredientPrefix}-qty-error`}
                                className={errorClassName}
                              >
                                {qtyError}
                              </FieldError>
                            )}
                          </Field>
                          <Field
                            className="min-w-0"
                            data-invalid={Boolean(unitError)}
                          >
                            <FieldLabel
                              htmlFor={`${ingredientPrefix}-unit`}
                              className={`${labelClassName} sm:sr-only`}
                            >
                              Unit {ingredientIndex + 1} *
                            </FieldLabel>
                            <Combobox
                              disabled={disabled || !selectedItem}
                              items={units}
                              value={ingredient.unit || null}
                              onValueChange={(unit) =>
                                updateIngredient(
                                  variantId,
                                  ingredient.id,
                                  "unit",
                                  unit || "",
                                )
                              }
                            >
                              <ComboboxInput
                                id={`${ingredientPrefix}-unit`}
                                disabled={disabled || !selectedItem}
                                placeholder="Unit"
                                className={comboClassName}
                                aria-invalid={Boolean(unitError)}
                                aria-describedby={
                                  unitError
                                    ? `${ingredientPrefix}-unit-error`
                                    : undefined
                                }
                              />
                              <ComboboxContent
                                positionerClassName="!z-[1100]"
                                className={popupClassName}
                              >
                                <ComboboxEmpty>No unit found.</ComboboxEmpty>
                                <ComboboxList>
                                  {(unit) => (
                                    <ComboboxItem
                                      key={unit}
                                      value={unit}
                                      className={optionClassName}
                                    >
                                      {unit}
                                      {unit === selectedItem?.base_unit
                                        ? " (Base)"
                                        : ""}
                                    </ComboboxItem>
                                  )}
                                </ComboboxList>
                              </ComboboxContent>
                            </Combobox>
                            {unitError && (
                              <FieldError
                                id={`${ingredientPrefix}-unit-error`}
                                className={errorClassName}
                              >
                                {unitError}
                              </FieldError>
                            )}
                          </Field>
                          <Field className="min-w-0">
                            <FieldLabel
                              htmlFor={`${ingredientPrefix}-cost`}
                              className={`${labelClassName} sm:sr-only`}
                            >
                              Est. Cost {ingredientIndex + 1}
                            </FieldLabel>
                            <InputGroup
                              className={`${comboClassName} overflow-hidden bg-[var(--app-color-filter-bg)]`}
                            >
                              <InputGroupAddon
                                aria-hidden="true"
                                className="h-full border-r border-[var(--app-color-border-subtle)] px-[var(--app-space-2)]"
                              >
                                ₱
                              </InputGroupAddon>
                              <InputGroupInput
                                id={`${ingredientPrefix}-cost`}
                                readOnly
                                value={rowCost.toFixed(2)}
                                className="min-w-0 text-[length:var(--app-font-size-body-secondary)]"
                              />
                            </InputGroup>
                          </Field>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={recipe.ingredients.length === 1}
                            className={`${removeButtonClassName} edit-menu-ingredient-remove`}
                            title={
                              recipe.ingredients.length === 1
                                ? "At least one ingredient is required."
                                : "Remove ingredient"
                            }
                            aria-label={`Remove ingredient ${ingredientIndex + 1}`}
                            onClick={() =>
                              onRecipeChange(variantId, (current) => ({
                                ...current,
                                ingredients:
                                  current.ingredients.length > 1
                                    ? current.ingredients.filter(
                                        (item) => item.id !== ingredient.id,
                                      )
                                    : current.ingredients,
                              }))
                            }
                          >
                            <i aria-hidden="true" className="bi bi-trash" />
                          </Button>
                        </div>
                      );
                    })}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onAddIngredient(variantId)}
                      className={addButtonClassName}
                    >
                      <i aria-hidden="true" className="bi bi-plus-lg" /> Add
                      Ingredient
                    </Button>
                  </div>
                );
              })}
              {archivedVariants.length > 0 && (
                <details className="rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] p-[var(--app-space-4)]">
                  <summary className="cursor-pointer text-[length:var(--app-font-size-body-secondary)] font-semibold">
                    Archived Variants ({archivedVariants.length})
                  </summary>
                  <div className="mt-[var(--app-space-2)] flex flex-col gap-[var(--app-space-2)]">
                    {archivedVariants.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex min-w-0 items-center justify-between gap-[var(--app-gap-related)] px-[var(--app-space-2)]"
                      >
                        <div className="flex min-w-0 items-baseline gap-[var(--app-gap-related)]">
                          <span className="min-w-0 break-words text-[length:var(--app-font-size-body-secondary)]">
                            {variant.name || "Unnamed size"}
                          </span>
                          <span className="shrink-0 text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">
                            ₱{Number(variant.sellingPrice || 0).toFixed(2)}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className={removeButtonClassName}
                          onClick={() => onRestoreVariant(variant.id)}
                          aria-label={`Restore ${variant.name || "size"}`}
                          title={`Restore ${variant.name || "size"}`}
                        >
                          <i
                            aria-hidden="true"
                            className="bi bi-arrow-counterclockwise"
                          />
                        </Button>
                      </div>
                    ))}
                  </div>
                </details>
              )}
              {archivePersistenceBlocked && (
                <p
                  role="status"
                  className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]"
                >
                  Archive and restore are preview-only until backend support is
                  enabled. Saving is paused to protect existing variants. Cancel
                  discards this draft.
                </p>
              )}
            </section>
          </fieldset>
        </ModalContent>
      </ModalBody>
      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={isSubmitting}
          className={secondaryButtonClassName}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSaveEdit}
          disabled={isSubmitting || archivePersistenceBlocked}
          className="min-h-[var(--app-touch-target-min)] min-w-28 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)]"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const EditMenuItemModal = ({ isOpen, item, ...modalProps }) => {
  if (!isOpen || !item) return null;
  return <EditMenuItemModalContent key={item.id} item={item} {...modalProps} />;
};

export default EditMenuItemModal;
