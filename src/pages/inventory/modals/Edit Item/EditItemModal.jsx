import { useRef, useState } from "react";

import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import Modal from "@/components/modals/Modal";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalFieldLabel from "@/components/modals/ModalFieldLabel";
import ModalFooter from "@/components/modals/ModalFooter";
import ModalHeader from "@/components/modals/ModalHeader";
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
import { toast } from "@/components/ui/toast";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { updateInventoryItem } from "@/services/inventory/inventoryItemsService";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import { getInventorySaveErrorCode } from "@/utils/inventory/feedback/inventoryFeedback";
import {
  getEditInventoryInlineFeedback,
  getEditInventoryStatusFeedback,
  getEditInventoryToastFeedback,
} from "@/utils/inventory/feedback/editInventoryFeedback";
import { formatCurrency } from "@/utils/shared/formatters/currencyFormatters";
import { validateEditInventoryItem } from "@/utils/inventory/validation/editInventoryValidation";
import { getMinimumLevelRules } from "@/utils/inventory/minimumLevel";

const labelClassName =
  "text-[length:var(--app-font-size-caption)] font-semibold leading-[var(--app-line-height-caption)] text-[var(--app-color-text)]";
const controlClassName =
  "h-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] shadow-none focus-visible:border-[var(--app-color-brand)] focus-visible:ring-0";
const errorClassName =
  "text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)]";
const disabledControlClassName =
  "disabled:cursor-not-allowed disabled:bg-[var(--app-color-canvas)] disabled:text-[var(--app-color-text-muted)] disabled:opacity-100";

const recipeConversionTooltip =
  "Map a custom serving size to the Base Unit so the system deducts stock correctly. For example, if the Base Unit is 'ml', 1 'Pump' can equal 15 ml.";

const createEmptyConversion = () => ({
  id: null,
  clientId: `new-${Date.now()}-${Math.random()}`,
  unit: "",
  equivalent: "",
});

const createInitialConversions = (item) => {
  const savedConversions = (item.inventory_conversion_units || []).map(
    (conversion) => ({
      id: conversion.id,
      clientId: `saved-${conversion.id}`,
      unit: conversion.converted_unit,
      equivalent: conversion.equivalent_base_amount.toString(),
    }),
  );

  return savedConversions.length > 0
    ? savedConversions
    : [createEmptyConversion()];
};

const EditItemModalContent = ({
  onClose,
  item,
  existingItems = [],
  categories = [],
  refetchInventory,
}) => {
  const name = item.item_name || "";
  const unit = item.base_unit || "";
  const minimumLevelRules = getMinimumLevelRules(unit);
  const [reorderLevel, setReorderLevel] = useState(item.minimum_level?.toString() || "0");
  const hasBatches = (item.inventory_batches || []).length > 0;

  const [category, setCategory] = useState(item.category_id || "");
  const [cost, setCost] = useState(item.cost_per_unit?.toString() || "");
  const [supplier, setSupplier] = useState(item.supplier || "");
  const [conversions, setConversions] = useState(() =>
    createInitialConversions(item),
  );
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [hasUnconfirmedSave, setHasUnconfirmedSave] = useState(false);
  const fieldsRef = useRef(null);
  const operationInFlight = useRef(false);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getEditInventoryInlineFeedback);
  const fieldsDisabled = isSubmitting || hasSaved;

  const { errors, isFormValid } =
    validateEditInventoryItem({
      name,
      originalName: item.item_name || "",
      existingItems,
      unit,
      category,
      cost,
      reorderLevel,
      conversions,
    });

  const selectedCategory =
    categories.find(
      (currentCategory) => String(currentCategory.id) === String(category),
    ) || null;

  const clearSaveError = () => {
    // Editing fields does not resolve a save whose outcome is still unknown.
    if (!hasUnconfirmedSave) clearFeedback();
  };

  const handleCategoryChange = (value) => {
    clearSaveError();
    setCategory(value ? String(value.id) : "");
  };

  const handleCostChange = (value) => {
    clearSaveError();
    setCost(value);
  };

  const handleSupplierChange = (value) => {
    clearSaveError();
    setSupplier(value);
  };

  const handleAddConversion = () => {
    clearSaveError();
    setConversions((current) => [...current, createEmptyConversion()]);
  };

  const handleRemoveConversion = (clientId) => {
    clearSaveError();
    setConversions((current) => {
      if (current.length === 1) return [createEmptyConversion()];
      return current.filter((conversion) => conversion.clientId !== clientId);
    });
  };

  const handleConversionChange = (clientId, field, value) => {
    clearSaveError();
    setConversions((current) =>
      current.map((conversion) =>
        conversion.clientId === clientId
          ? { ...conversion, [field]: value }
          : conversion,
      ),
    );
  };

  // A confirmed edit may only retry the refresh, never the update request.
  const refreshSavedInventory = async () => {
    try {
      if (refetchInventory) {
        const result = await refetchInventory();
        if (result && (result.isError || result.error)) {
          showFeedback("REFRESH_FAILED");
          return;
        }
      }
    } catch {
      showFeedback("REFRESH_FAILED");
      return;
    }

    clearFeedback();
    toast.add(getEditInventoryToastFeedback("ITEM_UPDATED", { itemName: name }));
    onClose();
  };

  const handleSave = async () => {
    if (operationInFlight.current || hasSaved || hasUnconfirmedSave) return;
    setHasAttemptedSubmit(true);
    if (!isFormValid) {
      requestAnimationFrame(() => {
        if (!fieldsRef.current) return;
        const firstInvalidField = fieldsRef.current.querySelector('[aria-invalid="true"]');
        if (firstInvalidField) firstInvalidField.focus();
      });
      return;
    }

    operationInFlight.current = true;
    setIsSubmitting(true);
    clearFeedback();

    try {
      try {
        await updateInventoryItem(item.id, {
          itemData: {
            item_name: name.trim(),
            base_unit: unit,
            category_id: category,
            cost_per_unit: Number(cost),
            minimum_level: Number(reorderLevel),
            supplier: supplier.trim() || null,
          },
          conversionsData: conversions
            .filter((conversion) => {
              return conversion.unit.trim() || conversion.equivalent;
            })
            .map((conversion) => ({
              ...(conversion.id ? { id: conversion.id } : {}),
              converted_unit: conversion.unit.trim(),
              equivalent_base_amount: Number(conversion.equivalent),
            })),
        });
      } catch (error) {
        const errorCode = getInventorySaveErrorCode(error);
        showFeedback(errorCode);
        if (errorCode === "SAVE_UNCONFIRMED") setHasUnconfirmedSave(true);
        return;
      }

      setHasSaved(true);
      await refreshSavedInventory();
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!operationInFlight.current && !hasSaved) onClose();
  };

  const handleRetryRefresh = async () => {
    if (operationInFlight.current || !hasSaved) return;
    operationInFlight.current = true;
    setIsSubmitting(true);
    try {
      await refreshSavedInventory();
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const isRefreshError = hasSaved && !isSubmitting;
  let blockingCode = "ITEM_SAVING";
  if (hasSaved) blockingCode = "INVENTORY_REFRESHING";
  if (isRefreshError) blockingCode = "INVENTORY_REFRESH_FAILED";
  const blockingFeedback = getEditInventoryStatusFeedback(blockingCode);
  let blockingAction;
  if (isRefreshError) {
    blockingAction = { label: blockingFeedback.buttonLabel, onClick: handleRetryRefresh };
  }

  return (
    <>
    <Modal
      isOpen={!isSubmitting && !hasSaved}
      onClose={handleClose}
      maxWidth="38rem"
      maxHeight="min(90svh, 46rem)"
    >
      <ModalHeader
        title="Edit Inventory Item"
        description="Update the item details and recipe conversion units."
        iconClassName="bi bi-pencil-square"
        closeDisabled={fieldsDisabled}
      />

      <ModalBody viewportClassName="!max-h-[calc(var(--app-modal-max-height)-9.75rem)]">
        <ModalContent>
          <InlineFeedback feedback={feedback} id="edit-inventory-action-feedback" />

          <fieldset ref={fieldsRef} disabled={fieldsDisabled} aria-busy={isSubmitting} className="flex min-w-0 flex-col gap-[var(--app-gap-related)] border-0 p-0">
          <section
            aria-labelledby="edit-inventory-details"
            className="flex flex-col gap-[var(--app-gap-related)]"
          >
            <h2 id="edit-inventory-details" className="sr-only">
              Inventory item details
            </h2>

            <div className="grid grid-cols-1 items-start gap-[var(--app-gap-related)] sm:grid-cols-2">
              <Field data-invalid={hasAttemptedSubmit && Boolean(errors.name)}>
                <FieldLabel
                  htmlFor="edit-inventory-name"
                  className={labelClassName}
                >
                  Item Name
                  <span className="text-[var(--app-color-danger)]">*</span>
                </FieldLabel>
                <Input
                  id="edit-inventory-name"
                  value={name}
                  disabled
                  title="Item name cannot be changed after creation."
                  className={`${controlClassName} ${disabledControlClassName}`}
                />
                {hasAttemptedSubmit && errors.name && (
                  <FieldError className={errorClassName}>
                    {errors.name}
                  </FieldError>
                )}
              </Field>

              <Field
                data-invalid={
                  hasAttemptedSubmit && Boolean(errors.category)
                }
              >
                <FieldLabel
                  htmlFor="edit-inventory-category"
                  className={labelClassName}
                >
                  Category
                  <span className="text-[var(--app-color-danger)]">*</span>
                </FieldLabel>
                <Combobox
                  items={categories}
                  value={selectedCategory}
                  onValueChange={handleCategoryChange}
                  disabled={fieldsDisabled}
                  itemToStringLabel={(value) => value?.category_name || ""}
                  itemToStringValue={(value) => String(value?.id || "")}
                  isItemEqualToValue={(option, value) =>
                    String(option?.id) === String(value?.id)
                  }
                >
                  <ComboboxInput
                    id="edit-inventory-category"
                    disabled={fieldsDisabled}
                    placeholder="Select category"
                    aria-invalid={
                      hasAttemptedSubmit && Boolean(errors.category)
                    }
                    className="h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] shadow-none has-aria-invalid:border-[var(--app-color-danger)]"
                  />
                  <ComboboxContent
                    positionerClassName="!z-[1100]"
                    className="z-[1100] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)]  ring-0"
                  >
                    <ComboboxEmpty>No category found.</ComboboxEmpty>
                    <ComboboxList>
                      {(currentCategory) => (
                        <ComboboxItem
                          key={currentCategory.id}
                          value={currentCategory}
                          className="min-h-[var(--app-touch-target-min)] px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)]"
                        >
                          {currentCategory.category_name}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                {hasAttemptedSubmit && errors.category && (
                  <FieldError className={errorClassName}>
                    {errors.category}
                  </FieldError>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 items-start gap-[var(--app-gap-related)] sm:grid-cols-2">
              <Field
                data-invalid={hasAttemptedSubmit && Boolean(errors.cost)}
              >
                <FieldLabel
                  htmlFor="edit-inventory-cost"
                  className={labelClassName}
                >
                  Cost Per {unit || "Unit"}
                  <span className="text-[var(--app-color-danger)]">*</span>
                </FieldLabel>
                <InputGroup className="h-[var(--app-touch-target-min)] overflow-hidden rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] shadow-none focus-within:border-[var(--app-color-brand)] focus-within:ring-0">
                  <InputGroupAddon className="h-full border-r border-[var(--app-color-border-subtle)] bg-[var(--app-color-canvas)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-semibold text-[var(--app-color-brand-number)]">
                    ₱
                  </InputGroupAddon>
                  <InputGroupInput
                    id="edit-inventory-cost"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={cost}
                    disabled={hasBatches || fieldsDisabled}
                    onChange={(event) => handleCostChange(event.target.value)}
                    placeholder="0.00"
                    aria-invalid={hasAttemptedSubmit && Boolean(errors.cost)}
                    className={`h-full px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] ${disabledControlClassName}`}
                  />
                </InputGroup>
                {hasBatches && (
                  <p className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
                    Cost is calculated automatically from the item&apos;s
                    batches.
                  </p>
                )}
                {hasAttemptedSubmit && errors.cost && (
                  <FieldError className={errorClassName}>
                    {errors.cost}
                  </FieldError>
                )}
              </Field>

              <Field
                data-invalid={hasAttemptedSubmit && Boolean(errors.unit)}
              >
                <FieldLabel
                  htmlFor="edit-inventory-base-unit"
                  className={labelClassName}
                >
                  Base Unit
                  <span className="text-[var(--app-color-danger)]">*</span>
                </FieldLabel>
                <Input
                  id="edit-inventory-base-unit"
                  value={unit}
                  disabled
                  title="Base unit cannot be changed after creation."
                  className={`${controlClassName} ${disabledControlClassName}`}
                />
                {hasAttemptedSubmit && errors.unit && (
                  <FieldError className={errorClassName}>
                    {errors.unit}
                  </FieldError>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 items-start gap-[var(--app-gap-related)] sm:grid-cols-2">
              <Field data-invalid={hasAttemptedSubmit && Boolean(errors.reorderLevel)}>
                <ModalFieldLabel
                  htmlFor="edit-inventory-minimum-level"
                  label={`Minimum Level (${unit || "unit"})`}
                  tooltip="Your low-stock threshold. The system will alert you to restock when your inventory drops below this number."
                  required
                  className={labelClassName}
                />
                <Input
                  id="edit-inventory-minimum-level"
                  type="text"
                  inputMode={minimumLevelRules.inputMode}
                  pattern={minimumLevelRules.pattern}
                  value={reorderLevel}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (minimumLevelRules.inputPattern.test(value)) {
                      clearSaveError();
                      setReorderLevel(value);
                    }
                  }}
                  placeholder="Enter minimum stock level"
                  aria-invalid={hasAttemptedSubmit && Boolean(errors.reorderLevel)}
                  className={controlClassName}
                />
                {hasAttemptedSubmit && errors.reorderLevel && (
                  <FieldError className={errorClassName}>
                    {errors.reorderLevel}
                  </FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="edit-inventory-supplier"
                  className={labelClassName}
                >
                  Supplier Name
                </FieldLabel>
                <Input
                  id="edit-inventory-supplier"
                  value={supplier}
                  onChange={(event) =>
                    handleSupplierChange(event.target.value)
                  }
                  placeholder="Optional supplier name"
                  className={controlClassName}
                />
              </Field>
            </div>
          </section>

          <section
            aria-labelledby="edit-inventory-recipe-conversion"
            className="flex flex-col gap-[var(--app-gap-related)]"
          >
            <div>
              <h2
                id="edit-inventory-recipe-conversion"
                className="text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)]"
              >
                Recipe Conversion
              </h2>
              <p className="mt-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
                Add only the alternate units used when preparing menu recipes.
              </p>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_var(--app-touch-target-min)] gap-[var(--app-space-2)]">
              <ModalFieldLabel
                htmlFor={`edit-inventory-converted-unit-${conversions[0]?.clientId || "first"}`}
                label="Converted Unit"
                tooltip={recipeConversionTooltip}
                className={labelClassName}
              />
              <span className={labelClassName}>
                Equivalent Amount in {unit || "Base Unit"}
              </span>
              <span aria-hidden="true" />
            </div>

            {conversions.map((conversion, index) => {
              const equivalent = Number(conversion.equivalent);
              const hasUnit = Boolean(conversion.unit.trim());
              const hasEquivalent = conversion.equivalent !== "";
              const isBlankAddedRow =
                index > 0 && !hasUnit && !hasEquivalent;
              const isUnitInvalid =
                isBlankAddedRow || (hasEquivalent && !hasUnit);
              const isEquivalentInvalid =
                isBlankAddedRow ||
                (hasUnit &&
                  (!hasEquivalent ||
                    !Number.isFinite(equivalent) ||
                    equivalent <= 0));
              const numericCost = Number(cost);
              const conversionCost =
                Number.isFinite(numericCost) &&
                numericCost > 0 &&
                hasUnit &&
                !isEquivalentInvalid
                  ? numericCost * equivalent
                  : null;

              return (
                <div
                  key={conversion.clientId}
                  className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)_var(--app-touch-target-min)] items-start gap-[var(--app-space-2)]"
                >
                  <Field
                    data-invalid={hasAttemptedSubmit && isUnitInvalid}
                  >
                    <Input
                      id={`edit-inventory-converted-unit-${conversion.clientId}`}
                      aria-label={`Converted unit ${index + 1}`}
                      value={conversion.unit}
                      onChange={(event) =>
                        handleConversionChange(
                          conversion.clientId,
                          "unit",
                          event.target.value,
                        )
                      }
                      placeholder="e.g. shot, tbsp"
                      aria-invalid={hasAttemptedSubmit && isUnitInvalid}
                      className={controlClassName}
                    />
                    {hasAttemptedSubmit && isUnitInvalid && (
                      <FieldError className={errorClassName}>
                        Converted unit is required.
                      </FieldError>
                    )}
                  </Field>

                  <Field
                    data-invalid={hasAttemptedSubmit && isEquivalentInvalid}
                  >
                    <Input
                      id={`edit-inventory-equivalent-${conversion.clientId}`}
                      aria-label={`Equivalent amount in ${unit || "base unit"} for converted unit ${index + 1}`}
                      type="number"
                      min="0.01"
                      step="any"
                      value={conversion.equivalent}
                      onChange={(event) =>
                        handleConversionChange(
                          conversion.clientId,
                          "equivalent",
                          event.target.value,
                        )
                      }
                      placeholder="Enter amount"
                      aria-invalid={
                        hasAttemptedSubmit && isEquivalentInvalid
                      }
                      className={controlClassName}
                    />
                    {conversionCost !== null && (
                      <p className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-subtle)]">
                        Estimated cost: {formatCurrency(conversionCost)} per{" "}
                        {conversion.unit}
                      </p>
                    )}
                    {hasAttemptedSubmit && isEquivalentInvalid && (
                      <FieldError className={errorClassName}>
                        Equivalent amount must be greater than 0.
                      </FieldError>
                    )}
                  </Field>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleRemoveConversion(conversion.clientId)
                    }
                    className="size-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] text-[var(--app-color-danger)] hover:bg-[var(--app-color-danger-surface)]"
                    aria-label={`Remove converted unit ${index + 1}`}
                  >
                    <i className="bi bi-trash" aria-hidden="true" />
                  </Button>
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddConversion}
              className="min-h-[var(--app-touch-target-min)] w-fit rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-[var(--app-color-brand)] hover:bg-[var(--app-color-control-hover)]"
            >
              <i className="bi bi-plus-lg" aria-hidden="true" />
              Add Converted Unit
            </Button>
          </section>

          </fieldset>
        </ModalContent>
      </ModalBody>

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={fieldsDisabled}
          className="min-h-[var(--app-touch-target-min)] min-w-24 rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-filter-bg)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-[var(--app-color-text-muted)] hover:bg-[var(--app-color-border-subtle)]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={fieldsDisabled || hasUnconfirmedSave}
          aria-describedby={feedback ? "edit-inventory-action-feedback" : undefined}
          className="min-h-[var(--app-touch-target-min)] min-w-28 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)]"
        >
          {hasUnconfirmedSave && feedback ? feedback.buttonLabel : "Save Changes"}
        </Button>
      </ModalFooter>
    </Modal>
    <BlockingFeedback
      open={isSubmitting || hasSaved}
      status={isRefreshError ? "error" : "loading"}
      title={blockingFeedback.title}
      message={blockingFeedback.message}
      action={blockingAction}
    />
    </>
  );
};

const EditItemModal = ({ isOpen, item, ...modalProps }) => {
  if (!isOpen || !item) return null;

  return <EditItemModalContent item={item} {...modalProps} />;
};

export default EditItemModal;
