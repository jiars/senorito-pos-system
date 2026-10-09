import { useRef, useState } from "react";
import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import { toast } from "@/components/ui/toast";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import {
  getAddAddonErrorCode, getAddAddonInlineFeedback,
  getAddAddonStatusFeedback, getAddAddonToastFeedback,
} from "@/utils/menu/feedback/addAddonFeedback";
import Modal from "@/components/modals/Modal";
import ModalHeader from "@/components/modals/ModalHeader";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalStepper from "@/components/modals/ModalStepper";
import ModalFooter from "@/components/modals/ModalFooter";
import { Button } from "@/components/ui/button";
import { addAddon } from "@/services/menu/addonsService";
import {
  calculateEstCost,
  calculateProfit,
  calculateMargin,
} from "@/utils/menu/pricingCalculations";
import { buildRecipePayload } from "@/utils/menu/buildRecipePayload";
import { validateAddAddon, getAddAddonServerFieldErrors } from "@/utils/menu/validation/addAddonValidation";
import { secondaryButtonClassName } from "@/pages/menu/modals/shared/menuModalClasses";
import GeneralStep from "./steps/GeneralStep";
import RecipePricingStep from "./steps/RecipePricingStep";

const steps = [
  { id: "general", label: "General" },
  { id: "recipe-pricing", label: "Recipe & Pricing" },
];
const createIngredient = () => ({
  id: crypto.randomUUID(),
  ingredientId: "",
  qty: "",
  unit: "",
});

const AddAddonModalContent = ({
  onClose,
  refetchAddons,
  categories = [],
  inventoryItems = [],
  existingAddons = [],
  maxWidth = "42rem",
  maxHeight = "min(90svh, 48rem)",
}) => {
  const [addonName, setAddonName] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [recipe, setRecipe] = useState(() => ({
    sellingPrice: "",
    ingredients: [createIngredient()],
  }));
  const [currentStep, setCurrentStep] = useState(0);
  const [attemptedStep, setAttemptedStep] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState({});
  const [savedResult, setSavedResult] = useState(null);
  const [saveBlocked, setSaveBlocked] = useState(false);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getAddAddonInlineFeedback);
  const submittingRef = useRef(false);
  const headingRef = useRef(null);
  const validation = validateAddAddon(addonName, recipe, selectedCategories, categories, inventoryItems, existingAddons);
  const errors = { ...serverFieldErrors, ...validation.errors };
  const visibleErrors = attemptedStep === currentStep ? errors : {};
  const formLocked = isSubmitting || Boolean(savedResult) || saveBlocked;
  const clearFormFeedback = () => {
    clearFeedback();
    setServerFieldErrors({});
  };
  const handleClose = () => {
    if (!submittingRef.current && !savedResult) onClose();
  };

  const changeStep = (step) => {
    if (submittingRef.current || formLocked) return;
    setCurrentStep(step);
    setAttemptedStep(null);
    clearFeedback();
    window.requestAnimationFrame(() => headingRef.current?.focus());
  };

  const updateRecipe = (updater) => {
    if (submittingRef.current || formLocked) return;
    clearFormFeedback();
    setRecipe(updater);
  };

  // Refresh retry must not create the saved add-on again.
  const refreshSavedAddon = async (resultDetails) => {
    try {
      if (!refetchAddons) return;
      const result = await refetchAddons();
      if (result && (result.isError || result.error)) return;
    } catch {
      return;
    }
    toast.add(getAddAddonToastFeedback(resultDetails.addonName));
    onClose();
  };
  const handleSave = async () => {
    if (submittingRef.current || savedResult || saveBlocked) return;
    setAttemptedStep(currentStep);
    if (!validation.isFormValid || Object.keys(serverFieldErrors).length > 0) {
      if (errors.addonName || errors.categories) {
        setCurrentStep(0);
        setAttemptedStep(0);
      }
      window.requestAnimationFrame(() => headingRef.current?.focus());
      return;
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    clearFeedback();

    try {
      const estimatedCost = calculateEstCost(
        recipe.ingredients,
        inventoryItems,
      );
      const profit = calculateProfit(recipe.sellingPrice, estimatedCost);
      const payload = {
        base_info: {
          addon_name: addonName.trim(),
          selling_price: parseFloat(recipe.sellingPrice) || 0,
          estimated_cost: estimatedCost,
          profit,
          margin: calculateMargin(profit, recipe.sellingPrice),
          pos_status: isAvailable ? "Available" : "Unavailable",
          archived: false,
        },
        categories: selectedCategories,
        recipes: buildRecipePayload(recipe.ingredients, inventoryItems),
      };
      try {
        await addAddon(payload);
      } catch (error) {
        const code = getAddAddonErrorCode(error);
        showFeedback(code);
        if (code === "SAVE_UNCONFIRMED" || code === "RECORD_CONFLICT") setSaveBlocked(true);
        if (code === "VALIDATION_FAILED" && error.response.data && error.response.data.errors) {
          const fieldErrors = getAddAddonServerFieldErrors(error.response.data.errors, recipe.ingredients);
          setServerFieldErrors(fieldErrors);
          if (fieldErrors.addonName || fieldErrors.categories) {
            setCurrentStep(0);
            setAttemptedStep(0);
          }
        }
        return;
      }
      const resultDetails = { addonName: addonName.trim() };
      setSavedResult(resultDetails);
      await refreshSavedAddon(resultDetails);
    } catch (error) {
      console.error("Could not prepare add-on:", error);
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
  const statusFeedback = getAddAddonStatusFeedback(statusCode);
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
        title="Add Add-on"
        description="Add an extra option for your menu items."
        iconClassName="bi bi-plus-square"
        closeDisabled={isSubmitting}
      />
      <ModalBody
        className="bg-[var(--app-color-canvas)]"
        viewportClassName="!max-h-[calc(var(--app-modal-max-height)-9.75rem)] max-sm:!max-h-[calc(var(--app-modal-max-height)-14.5rem)]"
      >
        <ModalContent className="gap-[var(--app-gap-section)] max-sm:!p-[var(--app-space-4)]">
          <ModalStepper steps={steps} currentStep={currentStep} />
          <InlineFeedback feedback={feedback} id="add-addon-feedback" />
          <fieldset disabled={formLocked} className="min-w-0 border-0 p-0">
            {currentStep === 0 ? (
              <GeneralStep
                headingRef={headingRef}
                addonName={addonName}
                isAvailable={isAvailable}
                categories={categories}
                selectedCategories={selectedCategories}
                errors={visibleErrors}
                onNameChange={(value) => {
                  if (submittingRef.current || formLocked) return;
                  clearFormFeedback();
                  setAddonName(value);
                }}
                onAvailabilityChange={() => {
                  if (submittingRef.current || formLocked) return;
                  clearFormFeedback();
                  setIsAvailable((current) => !current);
                }}
                onCategoryToggle={(categoryId) => {
                  if (submittingRef.current || formLocked) return;
                  clearFormFeedback();
                  setSelectedCategories((current) =>
                    current.includes(categoryId)
                      ? current.filter((id) => id !== categoryId)
                      : [...current, categoryId],
                  );
                }}
              />
            ) : (
              <RecipePricingStep
                headingRef={headingRef}
                recipe={recipe}
                inventoryItems={inventoryItems}
                errors={visibleErrors}
                disabled={formLocked}
                onRecipeChange={updateRecipe}
                onAddIngredient={() =>
                  updateRecipe((current) => ({
                    ...current,
                    ingredients: [...current.ingredients, createIngredient()],
                  }))
                }
              />
            )}
          </fieldset>
        </ModalContent>
      </ModalBody>
      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          className={secondaryButtonClassName}
          disabled={isSubmitting}
          onClick={currentStep === 0 || saveBlocked ? handleClose : () => changeStep(0)}
        >
          {currentStep === 0 || saveBlocked ? "Cancel" : "Previous"}
        </Button>
        <Button
          type="button"
          disabled={formLocked}
          className="min-h-[var(--app-touch-target-min)] min-w-28 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)]"
          onClick={
            currentStep === 1
              ? handleSave
              : () => {
                  setAttemptedStep(0);
                  if (!errors.addonName && !errors.categories) changeStep(1);
                }
          }
        >
          {isSubmitting
            ? "Saving..."
            : currentStep === 1
              ? "Add Add-on"
              : "Next"}
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

const AddAddonModal = ({ isOpen, ...props }) => {
  if (!isOpen) return null;
  return <AddAddonModalContent {...props} />;
};

export default AddAddonModal;
