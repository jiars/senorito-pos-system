import { useState } from "react";

import Modal from "@/components/modals/Modal";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalFooter from "@/components/modals/ModalFooter";
import ModalHeader from "@/components/modals/ModalHeader";
import ModalStepper from "@/components/modals/ModalStepper";
import { Button } from "@/components/ui/button";
import { useRefreshInventoryAuditLogs } from "@/hooks/useInventoryAuditLogs";
import { useRefreshInventoryValuation } from "@/hooks/useInventoryValuation";
import { addInventoryItem } from "@/services/inventory/inventoryItemsService";
import { getStandardUnitMultiplier } from "@/utils/inventory/unitConversion";
import { validateAddInventoryItem } from "@/utils/validation/inventory/addInventoryValidation";

import GeneralStep from "./steps/GeneralStep";
import InitialPurchaseStep from "./steps/InitialPurchaseStep";
import RecipeConversionStep from "./steps/RecipeConversionStep";

const steps = [
  { id: "general", label: "General" },
  { id: "purchase", label: "Initial Purchase" },
  { id: "conversion", label: "Recipe Conversion" },
];

const emptyForm = {
  itemName: "",
  unit: "",
  category: "",
  trackExpiry: false,
  expiryDate: "",
  supplier: "",
  qtyPurchased: "",
  purchaseUnit: "",
  purchaseMultiplier: "",
  totalCost: "",
  minLevel: "",
  note: "",
};

const createEmptyConversion = () => ({
  id: `${Date.now()}-${Math.random()}`,
  unit: "",
  equivalent: "",
});

const AddInventoryItemModalContent = ({
  onClose,
  existingItems = [],
  categories = [],
  units = [],
  refetchInventory,
}) => {
  const refreshAuditLogs = useRefreshInventoryAuditLogs();
  const refreshValuation = useRefreshInventoryValuation();
  const [formData, setFormData] = useState(emptyForm);
  const [conversions, setConversions] = useState(() => [
    createEmptyConversion(),
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [attemptedSteps, setAttemptedSteps] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const validation = validateAddInventoryItem({
    itemName: formData.itemName,
    existingItems,
    unit: formData.unit,
    category: formData.category,
    qtyPurchased: formData.qtyPurchased,
    purchaseUnit: formData.purchaseUnit,
    purchaseMultiplier: formData.purchaseMultiplier,
    totalCost: formData.totalCost,
    minLevel: formData.minLevel,
    conversions,
    trackExpiry: formData.trackExpiry,
    expiryDate: formData.expiryDate,
  });

  const stepValidity = [
    !validation.isNameEmpty &&
      !validation.isDuplicateName &&
      Boolean(formData.unit) &&
      Boolean(formData.category) &&
      validation.isExpiryValid,
    validation.isQtyValid &&
      Boolean(formData.purchaseUnit.trim()) &&
      validation.isMultiplierValid &&
      validation.isCostValid &&
      validation.isMinValid,
    validation.conversionsValid,
  ];

  const standardMultiplier = getStandardUnitMultiplier(
    formData.unit,
    formData.purchaseUnit,
  );
  const showCurrentStepErrors = Boolean(attemptedSteps[currentStep]);

  const updateField = (fieldName, value) => {
    setApiError("");
    setFormData((currentForm) => {
      const nextForm = { ...currentForm, [fieldName]: value };

      if (fieldName === "unit" && currentForm.purchaseUnit) {
        nextForm.purchaseMultiplier =
          getStandardUnitMultiplier(value, currentForm.purchaseUnit) || "";
      }

      return nextForm;
    });
  };

  const handlePurchaseUnitChange = (value) => {
    setApiError("");
    setFormData((currentForm) => ({
      ...currentForm,
      purchaseUnit: value,
      purchaseMultiplier:
        getStandardUnitMultiplier(currentForm.unit, value) || "",
    }));
  };

  const handleAddConversion = () => {
    setApiError("");
    setConversions((currentConversions) => [
      ...currentConversions,
      createEmptyConversion(),
    ]);
  };

  const handleRemoveConversion = (conversionId) => {
    setApiError("");
    setConversions((currentConversions) => {
      if (currentConversions.length === 1) {
        return [createEmptyConversion()];
      }

      return currentConversions.filter(
        (conversion) => conversion.id !== conversionId,
      );
    });
  };

  const handleConversionChange = (conversionId, fieldName, value) => {
    setApiError("");
    setConversions((currentConversions) => {
      return currentConversions.map((conversion) => {
        if (conversion.id !== conversionId) return conversion;
        return { ...conversion, [fieldName]: value };
      });
    });
  };

  const getBaseQuantity = () => {
    if (!validation.isQtyValid || !validation.isMultiplierValid) return null;
    return validation.parsedQty * validation.parsedMultiplier;
  };

  const getBaseUnitCost = () => {
    const baseQuantity = getBaseQuantity();
    if (!baseQuantity || !validation.isCostValid) return null;
    return validation.parsedCost / baseQuantity;
  };

  const markStepAttempted = (stepIndex) => {
    setAttemptedSteps((currentSteps) => ({
      ...currentSteps,
      [stepIndex]: true,
    }));
  };

  const clearStepAttempt = (stepIndex) => {
    setAttemptedSteps((currentSteps) => {
      const nextSteps = { ...currentSteps };
      delete nextSteps[stepIndex];
      return nextSteps;
    });
  };

  const handleNext = () => {
    markStepAttempted(currentStep);
    if (!stepValidity[currentStep]) return;

    clearStepAttempt(currentStep);
    setApiError("");
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    clearStepAttempt(currentStep);
    setApiError("");
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const handleSubmit = async () => {
    markStepAttempted(currentStep);
    if (!validation.isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setApiError("");

    try {
      const baseQuantity = getBaseQuantity();
      const computedCostPerUnit = Number(
        (validation.parsedCost / baseQuantity).toFixed(2),
      );
      const conversionsData = conversions
        .filter((conversion) => {
          return conversion.unit.trim() || conversion.equivalent;
        })
        .map((conversion) => ({
          converted_unit: conversion.unit.trim(),
          equivalent_base_amount: Number(conversion.equivalent),
        }));

      await addInventoryItem({
        itemData: {
          item_name: formData.itemName.trim(),
          category_id: formData.category,
          base_unit: formData.unit,
          minimum_level: Number(formData.minLevel),
          supplier: formData.supplier.trim() || null,
          cost_per_unit: computedCostPerUnit,
          current_stock: baseQuantity,
          track_expiry: formData.trackExpiry,
        },
        purchaseData: {
          quantity_purchased: validation.parsedQty,
          purchase_unit: formData.purchaseUnit.trim(),
          purchase_multiplier: validation.parsedMultiplier,
          total_cost: validation.parsedCost,
          cost_per_unit: computedCostPerUnit,
          supplier: formData.supplier.trim() || null,
          expiration_date: formData.trackExpiry ? formData.expiryDate : null,
          note: formData.note.trim() || null,
        },
        conversionsData,
      });

      if (refetchInventory) {
        await refetchInventory();
      }

      onClose();
      Promise.allSettled([refreshAuditLogs(), refreshValuation()]);
    } catch (error) {
      setApiError(error.message || "Failed to add inventory item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="42rem"
      maxHeight="min(90svh, 48rem)"
    >
      <ModalHeader
        title="Add Inventory Item"
        description="Register a new ingredient or packaging item in your inventory."
        iconClassName="bi bi-box-seam"
        closeDisabled={isSubmitting}
      />

      <ModalBody
        className="bg-[var(--app-color-canvas)]"
        viewportClassName="!max-h-[calc(var(--app-modal-max-height)-9.75rem)]"
      >
        <ModalContent className="gap-[var(--app-gap-section)]">
          <ModalStepper steps={steps} currentStep={currentStep} />

          {apiError && (
            <p
              className="rounded-[var(--app-radius-nested)] bg-[var(--app-color-danger-surface)] px-[var(--app-space-4)] py-[var(--app-space-2)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-danger)]"
              role="alert"
            >
              {apiError}
            </p>
          )}

          {currentStep === 0 && (
            <GeneralStep
              formData={formData}
              categories={categories}
              units={units}
              showErrors={showCurrentStepErrors}
              validation={validation}
              onFieldChange={updateField}
            />
          )}

          {currentStep === 1 && (
            <InitialPurchaseStep
              formData={formData}
              showErrors={showCurrentStepErrors}
              validation={validation}
              standardMultiplier={standardMultiplier}
              onFieldChange={updateField}
              onPurchaseUnitChange={handlePurchaseUnitChange}
              getBaseUnitCost={getBaseUnitCost}
            />
          )}

          {currentStep === 2 && (
            <RecipeConversionStep
              conversions={conversions}
              baseUnit={formData.unit}
              showErrors={showCurrentStepErrors}
              getBaseUnitCost={getBaseUnitCost}
              onAddConversion={handleAddConversion}
              onRemoveConversion={handleRemoveConversion}
              onConversionChange={handleConversionChange}
            />
          )}
        </ModalContent>
      </ModalBody>

      <ModalFooter>
        {currentStep === 0 ? (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
            className="min-h-[var(--app-touch-target-min)] min-w-24 rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-filter-bg)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-[var(--app-color-text-muted)] hover:bg-[var(--app-color-border-subtle)]"
          >
            Cancel
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={handlePrevious}
            className="min-h-[var(--app-touch-target-min)] min-w-24 rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-filter-bg)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-[var(--app-color-text-muted)] hover:bg-[var(--app-color-border-subtle)]"
          >
            Previous
          </Button>
        )}

        <Button
          type="button"
          disabled={isSubmitting}
          onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
          className="min-h-[var(--app-touch-target-min)] min-w-28 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)]"
        >
          {isSubmitting
            ? "Saving..."
            : currentStep === steps.length - 1
              ? "Add Item"
              : "Next"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const AddInventoryItemModal = ({ isOpen, ...modalProps }) => {
  if (!isOpen) return null;

  return <AddInventoryItemModalContent {...modalProps} />;
};

export default AddInventoryItemModal;
