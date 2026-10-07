import { useRef, useState } from "react";

import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import Modal from "@/components/modals/Modal";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalFooter from "@/components/modals/ModalFooter";
import ModalHeader from "@/components/modals/ModalHeader";
import ModalStepper from "@/components/modals/ModalStepper";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import { useRefreshInventoryAuditLogs } from "@/hooks/useInventoryAuditLogs";
import { useRefreshInventoryValuation } from "@/hooks/useInventoryValuation";
import { addInventoryItem } from "@/services/inventory/inventoryItemsService";
import { getStandardUnitMultiplier } from "@/utils/inventory/unitConversion";
import { getInventorySaveErrorCode } from "@/utils/inventory/inventoryFeedback";
import {
  getAddInventoryInlineFeedback,
  getAddInventoryStatusFeedback,
  getAddInventoryToastFeedback,
} from "@/utils/inventory/feedback/addInventoryFeedback";
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
  onAddAnotherItem,
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
  const [hasSaved, setHasSaved] = useState(false);
  const [hasUnconfirmedSave, setHasUnconfirmedSave] = useState(false);
  const operationInFlight = useRef(false);
  const savedItem = useRef(null);
  const fieldsRef = useRef(null);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getAddInventoryInlineFeedback);

  const clearSaveError = () => {
    if (!hasUnconfirmedSave) clearFeedback();
  };

  const focusInvalidField = () => {
    requestAnimationFrame(() => {
      if (!fieldsRef.current) return;
      const field = fieldsRef.current.querySelector('[aria-invalid="true"]');
      if (field) field.focus();
    });
  };

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
    if (operationInFlight.current || hasSaved) return;
    clearSaveError();
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
    if (operationInFlight.current || hasSaved) return;
    clearSaveError();
    setFormData((currentForm) => ({
      ...currentForm,
      purchaseUnit: value,
      purchaseMultiplier:
        getStandardUnitMultiplier(currentForm.unit, value) || "",
    }));
  };

  const handleAddConversion = () => {
    if (operationInFlight.current || hasSaved) return;
    clearSaveError();
    setConversions((currentConversions) => [
      ...currentConversions,
      createEmptyConversion(),
    ]);
  };

  const handleRemoveConversion = (conversionId) => {
    if (operationInFlight.current || hasSaved) return;
    clearSaveError();
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
    if (operationInFlight.current || hasSaved) return;
    clearSaveError();
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
    if (operationInFlight.current || hasSaved) return;
    markStepAttempted(currentStep);
    if (!stepValidity[currentStep]) {
      focusInvalidField();
      return;
    }

    clearStepAttempt(currentStep);
    clearSaveError();
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    if (operationInFlight.current || hasSaved) return;
    clearStepAttempt(currentStep);
    clearSaveError();
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  // After a confirmed save, recovery repeats only the inventory read.
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
    let toastId;
    const details = { ...savedItem.current };
    if (onAddAnotherItem) {
      details.onAddAnotherItem = () => {
        toast.close(toastId);
        onAddAnotherItem();
      };
    }
    toastId = toast.add(getAddInventoryToastFeedback("ITEM_ADDED", details));
    onClose();
    Promise.allSettled([refreshAuditLogs(), refreshValuation()]);
  };

  const handleSubmit = async () => {
    if (operationInFlight.current || hasSaved || hasUnconfirmedSave) return;
    markStepAttempted(currentStep);
    if (!validation.isFormValid) {
      const invalidStep = stepValidity.findIndex((valid) => !valid);
      if (invalidStep >= 0) {
        markStepAttempted(invalidStep);
        setCurrentStep(invalidStep);
      }
      focusInvalidField();
      return;
    }

    operationInFlight.current = true;
    setIsSubmitting(true);
    clearFeedback();

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

      let response;
      try {
        response = await addInventoryItem({
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
      } catch (error) {
        const errorCode = getInventorySaveErrorCode(error);
        showFeedback(errorCode);
        if (errorCode === "SAVE_UNCONFIRMED") setHasUnconfirmedSave(true);
        return;
      }

      savedItem.current = {
        itemName: formData.itemName.trim(),
        initialStock: baseQuantity,
        unit: formData.unit,
        totalCost: validation.parsedCost,
      };
      if (response && response.item) {
        savedItem.current.itemName = response.item.item_name;
        savedItem.current.initialStock = response.item.current_stock;
        savedItem.current.unit = response.item.base_unit;
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
  const blockingFeedback = getAddInventoryStatusFeedback(blockingCode);
  let blockingAction;
  if (isRefreshError) {
    blockingAction = { label: blockingFeedback.buttonLabel, onClick: handleRetryRefresh };
  }
  let primaryLabel = "Next";
  if (currentStep === steps.length - 1) {
    primaryLabel = "Add Item";
    if (hasUnconfirmedSave && feedback) primaryLabel = feedback.buttonLabel;
  }

  return (
    <>
    <Modal
      isOpen={!isSubmitting && !hasSaved}
      onClose={handleClose}
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

          <InlineFeedback feedback={feedback} id="add-inventory-action-feedback" />

          <fieldset ref={fieldsRef} disabled={isSubmitting || hasSaved} className="contents">
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
          </fieldset>
        </ModalContent>
      </ModalBody>

      <ModalFooter>
        {currentStep === 0 ? (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={handleClose}
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
          disabled={isSubmitting || hasSaved || (hasUnconfirmedSave && currentStep === steps.length - 1)}
          onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
          className="min-h-[var(--app-touch-target-min)] min-w-28 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)]"
        >
          {primaryLabel}
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

const AddInventoryItemModal = ({ isOpen, ...modalProps }) => {
  if (!isOpen) return null;

  return <AddInventoryItemModalContent {...modalProps} />;
};

export default AddInventoryItemModal;
