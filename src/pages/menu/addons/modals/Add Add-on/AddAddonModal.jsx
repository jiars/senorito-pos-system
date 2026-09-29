import { useRef, useState } from "react";
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
import { validateAddonForm } from "@/utils/validation/menuValidation";
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
  const [errorMessage, setErrorMessage] = useState("");
  const submittingRef = useRef(false);
  const headingRef = useRef(null);
  const errors = validateAddonForm(
    addonName,
    recipe.sellingPrice,
    selectedCategories,
    recipe.ingredients,
  );
  const visibleErrors = attemptedStep === currentStep ? errors : {};

  const changeStep = (step) => {
    setCurrentStep(step);
    setAttemptedStep(null);
    setErrorMessage("");
    window.requestAnimationFrame(() => headingRef.current?.focus());
  };

  const updateRecipe = (updater) => {
    setErrorMessage("");
    setRecipe(updater);
  };

  const handleSave = async () => {
    setAttemptedStep(currentStep);
    if (Object.keys(errors).length > 0 || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const estimatedCost = calculateEstCost(
        recipe.ingredients,
        inventoryItems,
      );
      const profit = calculateProfit(recipe.sellingPrice, estimatedCost);
      await addAddon({
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
      });
      if (refetchAddons) await refetchAddons();
      onClose();
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to add add-on. Please try again.",
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={() => {
        if (!submittingRef.current) onClose();
      }}
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
          {errorMessage && (
            <p
              role="alert"
              className="rounded-[var(--app-radius-nested)] bg-[var(--app-color-danger-surface)] p-[var(--app-space-4)] text-[length:var(--app-font-size-caption)] text-[var(--app-color-danger)]"
            >
              {errorMessage}
            </p>
          )}
          <fieldset disabled={isSubmitting} className="min-w-0 border-0 p-0">
            {currentStep === 0 ? (
              <GeneralStep
                headingRef={headingRef}
                addonName={addonName}
                isAvailable={isAvailable}
                categories={categories}
                selectedCategories={selectedCategories}
                errors={visibleErrors}
                onNameChange={(value) => {
                  setErrorMessage("");
                  setAddonName(value);
                }}
                onAvailabilityChange={() => {
                  setErrorMessage("");
                  setIsAvailable((current) => !current);
                }}
                onCategoryToggle={(categoryId) => {
                  setErrorMessage("");
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
                disabled={isSubmitting}
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
          onClick={currentStep === 0 ? onClose : () => changeStep(0)}
        >
          {currentStep === 0 ? "Cancel" : "Previous"}
        </Button>
        <Button
          type="button"
          disabled={isSubmitting}
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
  );
};

const AddAddonModal = ({ isOpen, ...props }) => {
  if (!isOpen) return null;
  return <AddAddonModalContent {...props} />;
};

export default AddAddonModal;
