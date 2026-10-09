import { useRef, useState } from "react";
import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import { toast } from "@/components/ui/toast";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import {
  getEditAddonErrorCode, getEditAddonInlineFeedback,
  getEditAddonStatusFeedback, getEditAddonToastFeedback,
} from "@/utils/menu/feedback/editAddonFeedback";

import Modal from "@/components/modals/Modal";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalFooter from "@/components/modals/ModalFooter";
import ModalHeader from "@/components/modals/ModalHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import RecipePricingStep from "../Add Add-on/steps/RecipePricingStep";
import { updateAddon } from "@/services/menu/addonsService";
import {
  calculateEstCost,
  calculateMargin,
  calculateProfit,
} from "@/utils/menu/pricingCalculations";
import { validateEditAddon, getEditAddonServerFieldErrors } from "@/utils/menu/validation/editAddonValidation";
import {
  controlClassName,
  errorClassName,
  labelClassName,
  secondaryButtonClassName,
  toggleClassName,
} from "@/pages/menu/modals/shared/menuModalClasses";

const createIngredient = (recipe = null) => ({
  id: recipe?.id || crypto.randomUUID(),
  persistedId: recipe?.id || null,
  ingredientId: recipe?.inventory_item_id || "",
  qty:
    recipe?.quantity === undefined || recipe?.quantity === null
      ? ""
      : String(recipe.quantity),
  unit: recipe?.unit || recipe?.inventory_items?.base_unit || "",
});

const EditAddonModalContent = ({
  onClose,
  addon,
  refetchAddons,
  categories = [],
  inventoryItems = [],
  existingAddons = [],
  maxWidth = "42rem",
  maxHeight = "min(90svh, 48rem)",
}) => {
  const [addonName, setAddonName] = useState(addon.addon_name || "");
  const [isAvailable, setIsAvailable] = useState(
    addon.pos_status === "Available",
  );
  const [selectedCategories, setSelectedCategories] = useState(() =>
    (addon.addon_categories || [])
      .map((category) => category.menu_category_id)
      .filter(Boolean),
  );
  const [recipe, setRecipe] = useState(() => ({
    sellingPrice: String(addon.selling_price ?? ""),
    ingredients: addon.addon_recipes?.length
      ? addon.addon_recipes.map((entry) => createIngredient(entry))
      : [createIngredient()],
  }));
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState({});
  const [savedResult, setSavedResult] = useState(null);
  const [saveBlocked, setSaveBlocked] = useState(false);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getEditAddonInlineFeedback);
  const submittingRef = useRef(false);

  const estimatedCost = calculateEstCost(recipe.ingredients, inventoryItems);
  const profit = calculateProfit(recipe.sellingPrice, estimatedCost);
  const margin = calculateMargin(profit, recipe.sellingPrice);
  const validation = validateEditAddon(
    addonName,
    recipe,
    selectedCategories,
    categories,
    inventoryItems,
    existingAddons,
    addon.id,
  );
  const errors = hasAttemptedSubmit ? { ...serverFieldErrors, ...validation.errors } : {};
  const formLocked = isSubmitting || Boolean(savedResult) || saveBlocked;
  const clearFormFeedback = () => {
    clearFeedback();
    setServerFieldErrors({});
  };
  const handleClose = () => {
    if (!submittingRef.current && !savedResult) onClose();
  };

  const updateRecipe = (updater) => {
    if (submittingRef.current || formLocked) return;
    clearFormFeedback();
    setRecipe(updater);
  };

  const toggleCategory = (categoryId) => {
    if (submittingRef.current || formLocked) return;
    clearFormFeedback();
    setSelectedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  };

  // Once saved, retry only the refresh, never the update request.
  const refreshSavedAddon = async (resultDetails) => {
    try {
      if (!refetchAddons) return;
      const result = await refetchAddons();
      if (result && (result.isError || result.error)) return;
    } catch {
      return;
    }
    toast.add(getEditAddonToastFeedback(resultDetails.addonName));
    onClose();
  };

  const handleSave = async () => {
    if (submittingRef.current || savedResult || saveBlocked) return;
    setHasAttemptedSubmit(true);
    if (!validation.isFormValid || Object.keys(serverFieldErrors).length > 0) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    clearFeedback();

    try {
      const payload = {
        base_info: {
          addon_name: addonName.trim(),
          selling_price: Number(recipe.sellingPrice) || 0,
          estimated_cost: estimatedCost,
          profit,
          margin,
          pos_status: isAvailable ? "Available" : "Unavailable",
          archived: addon.archived === true,
        },
        categories: selectedCategories,
        recipes: recipe.ingredients
          .filter((ingredient) => ingredient.ingredientId && ingredient.qty)
          .map((ingredient) => {
            const reference = inventoryItems.find(
              (item) => item.id === ingredient.ingredientId,
            );
            const conversion = reference?.inventory_conversion_units?.find(
              (unit) => unit.converted_unit === ingredient.unit,
            );
            const equivalent = conversion
              ? Number(conversion.equivalent_base_amount)
              : 1;
            return {
              id: ingredient.persistedId || null,
              inventory_item_id: ingredient.ingredientId,
              quantity: Number(ingredient.qty),
              unit: ingredient.unit || reference?.base_unit,
              estimated_cost:
                Number(ingredient.qty) *
                equivalent *
                Number(reference?.cost_per_unit || 0),
            };
          }),
      };
      try {
        await updateAddon(addon.id, payload);
      } catch (error) {
        const code = getEditAddonErrorCode(error);
        showFeedback(code);
        if (code === "SAVE_UNCONFIRMED" || code === "RECORD_CONFLICT") setSaveBlocked(true);
        if (code === "VALIDATION_FAILED" && error.response.data && error.response.data.errors) {
          setServerFieldErrors(getEditAddonServerFieldErrors(error.response.data.errors, recipe.ingredients));
        }
        return;
      }
      const resultDetails = { addonName: addonName.trim() };
      setSavedResult(resultDetails);
      await refreshSavedAddon(resultDetails);
    } catch (error) {
      console.error("Could not prepare add-on update:", error);
      showFeedback("SAVE_FAILED");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleRetryRefresh = async () => {
    if (submittingRef.current || !savedResult) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      await refreshSavedAddon(savedResult);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };
  const isRefreshError = Boolean(savedResult) && !isSubmitting;
  let statusCode = "ADDON_SAVING";
  if (savedResult) statusCode = "MENU_REFRESHING";
  if (isRefreshError) statusCode = "MENU_REFRESH_FAILED";
  const statusFeedback = getEditAddonStatusFeedback(statusCode);
  let blockingAction;
  if (isRefreshError) blockingAction = { label: statusFeedback.buttonLabel, onClick: handleRetryRefresh };

  return (
    <>
    <Modal
      isOpen={!isSubmitting && !savedResult}
      onClose={handleClose}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
    >
      <ModalHeader
        title="Edit Add-on"
        description="Update the add-on details, pricing, and recipe ingredients."
        iconClassName="bi bi-pencil-square"
        closeDisabled={isSubmitting}
      />
      <ModalBody viewportClassName="!max-h-[calc(var(--app-modal-max-height)-9.75rem)] max-sm:!max-h-[calc(var(--app-modal-max-height)-14.5rem)]">
        <ModalContent className="max-sm:!p-[var(--app-space-4)]">
          <InlineFeedback feedback={feedback} id="edit-addon-feedback" />
          <fieldset
            disabled={formLocked}
            className="flex min-w-0 flex-col gap-[var(--app-gap-section)] border-0 p-0"
          >
            <section
              aria-labelledby="edit-addon-general"
              className="flex min-w-0 flex-col gap-[var(--app-gap-related)]"
            >
              <h2 id="edit-addon-general" className="sr-only">
                General add-on information
              </h2>
              <Field data-invalid={Boolean(errors.addonName)}>
                <FieldLabel
                  htmlFor="edit-addon-name"
                  className={labelClassName}
                >
                  Add-on Name{" "}
                  <span className="text-[var(--app-color-danger)]">*</span>
                </FieldLabel>
                <Input
                  id="edit-addon-name"
                  value={addonName}
                  onChange={(event) => {
                    if (submittingRef.current || formLocked) return;
                    clearFormFeedback();
                    setAddonName(event.target.value);
                  }}
                  className={controlClassName}
                  aria-invalid={Boolean(errors.addonName)}
                />
                {errors.addonName && (
                  <FieldError className={errorClassName}>
                    {errors.addonName}
                  </FieldError>
                )}
              </Field>
              <Field data-invalid={Boolean(errors.categories)}>
                <span
                  id="edit-addon-categories-label"
                  className={labelClassName}
                >
                  Apply to Categories{" "}
                  <span className="text-[var(--app-color-danger)]">*</span>
                </span>
                <div
                  role="group"
                  aria-labelledby="edit-addon-categories-label"
                  className="grid max-h-[min(30svh,14rem)] grid-cols-2 gap-x-[var(--app-gap-related)] gap-y-[var(--app-space-2)] overflow-y-auto px-[var(--app-space-2)] py-[var(--app-space-1)] sm:grid-cols-4 sm:px-[var(--app-space-6)]"
                >
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex min-h-[var(--app-touch-target-min)] min-w-0 cursor-pointer items-center gap-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text)]"
                    >
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                        className="size-[18px] border-[var(--app-color-border)] bg-[var(--app-color-filter-checkbox-surface)] data-checked:border-[var(--app-color-brand)] data-checked:bg-[var(--app-color-brand)] data-checked:text-white"
                      />
                      <span className="min-w-0 break-words">
                        {category.category_name}
                      </span>
                    </label>
                  ))}
                  {categories.length === 0 && (
                    <p className="col-span-full text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">
                      No categories found.
                    </p>
                  )}
                </div>
                {errors.categories && (
                  <FieldError className={errorClassName}>
                    {errors.categories}
                  </FieldError>
                )}
              </Field>
              <button
                type="button"
                role="switch"
                aria-checked={isAvailable}
                onClick={() => {
                  if (submittingRef.current || formLocked) return;
                  clearFormFeedback();
                  setIsAvailable((current) => !current);
                }}
                className={toggleClassName}
              >
                <span
                  aria-hidden="true"
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${isAvailable ? "bg-[var(--app-color-brand)]" : "bg-[var(--app-color-border-subtle)]"}`}
                >
                  <span
                    className={`absolute top-[3px] size-[18px] rounded-full bg-white shadow-sm transition-transform ${isAvailable ? "translate-x-[23px]" : "translate-x-[3px]"}`}
                  />
                </span>
                Available for sale
              </button>
            </section>
            <RecipePricingStep
              headingRef={null}
              recipe={recipe}
              inventoryItems={inventoryItems}
              errors={errors}
              disabled={formLocked}
              className="!bg-[var(--app-color-canvas)]"
              onRecipeChange={updateRecipe}
              onAddIngredient={() =>
                updateRecipe((current) => ({
                  ...current,
                  ingredients: [...current.ingredients, createIngredient()],
                }))
              }
            />
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
          onClick={handleSave}
          disabled={formLocked}
          className="min-h-[var(--app-touch-target-min)] min-w-28 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)]"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </ModalFooter>
    </Modal>
    <BlockingFeedback
      open={isSubmitting || Boolean(savedResult)}
      status={isRefreshError ? "error" : "loading"}
      title={statusFeedback.title}
      message={statusFeedback.message}
      action={blockingAction}
    />
    </>
  );
};

const EditAddonModal = ({ isOpen, addon, ...props }) => {
  if (!isOpen || !addon) return null;
  return <EditAddonModalContent key={addon.id} addon={addon} {...props} />;
};

export default EditAddonModal;
