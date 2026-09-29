import { useRef, useState } from "react";

import Modal from "@/components/modals/Modal";
import ModalHeader from "@/components/modals/ModalHeader";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalStepper from "@/components/modals/ModalStepper";
import ModalFooter from "@/components/modals/ModalFooter";
import { Button } from "@/components/ui/button";
import { addMenuItem } from "@/services/menu/menuItemsService";
import { uploadMenuImage } from "@/utils/imageUploadHelper";
import {
  calculateEstCost,
  calculateProfit,
  calculateMargin,
} from "@/utils/menu/pricingCalculations";
import { buildRecipePayload } from "@/utils/menu/buildRecipePayload";
import { validateMenuItemForm } from "@/utils/validation/menuValidation";

import GeneralStep from "./steps/GeneralStep";
import RecipePricingStep from "./steps/RecipePricingStep";
import { secondaryButtonClassName } from "../shared/menuModalClasses";
import "./addMenuItemLayout.css";

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
const createRecipe = () => ({
  sellingPrice: "",
  ingredients: [createIngredient()],
});
const createVariant = () => ({
  ...createRecipe(),
  id: crypto.randomUUID(),
  name: "Reg",
  isNameAutomatic: true,
  archived: false,
  isAvailable: true,
});

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

const AddMenuItemModalContent = ({
  onClose,
  refetchMenu,
  categories = [],
  inventoryItems = [],
  maxWidth = "42rem",
  maxHeight = "min(90svh, 48rem)",
  imageSize = 512,
}) => {
  const [baseInfo, setBaseInfo] = useState({
    name: "",
    category: "",
    isAvailable: true,
    image: null,
  });
  const [variants, setVariants] = useState(() => [createVariant()]);
  const [currentStep, setCurrentStep] = useState(0);
  const [attemptedStep, setAttemptedStep] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const submittingRef = useRef(false);
  const stepHeadingRef = useRef(null);

  const errors = validateMenuItemForm(
    baseInfo,
    variants,
    { requireImage: true },
  );
  const generalValid = !errors.name && !errors.category && !errors.image;
  const showErrors = attemptedStep === currentStep;

  const changeStep = (step) => {
    setAttemptedStep(null);
    setErrorMessage("");
    setCurrentStep(step);
    window.requestAnimationFrame(() => stepHeadingRef.current?.focus());
  };

  const updateRecipe = (variantId, updater) => {
    setErrorMessage("");
      setVariants((current) =>
        current.map((variant) =>
          variant.id === variantId ? updater(variant) : variant,
        ),
      );
  };

  const handleSaveItem = async () => {
    setAttemptedStep(currentStep);
    if (Object.keys(errors).length > 0 || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      let uploadedImageUrl = null;
      if (baseInfo.image) {
        const category = categories.find(
          (item) => item.id === baseInfo.category,
        );
        uploadedImageUrl = await uploadMenuImage(
          baseInfo.image,
          baseInfo.name,
          category?.category_name || "Uncategorized",
        );
      }

      // Keep the existing Fixed/Variants and recipe payload contract unchanged.
      const recipes = variants;
      const payload = {
        base_info: {
          item_name: baseInfo.name.trim(),
          category_id: baseInfo.category,
          recipe_status: "Complete",
          pos_status: baseInfo.isAvailable ? "Available" : "Unavailable",
          pricing_type: variants.length === 1 ? "Fixed" : "Variants",
          image_url: uploadedImageUrl,
        },
        prices: recipes.map((recipe) => {
          const estimatedCost = calculateEstCost(
            recipe.ingredients,
            inventoryItems,
          );
          const profit = calculateProfit(recipe.sellingPrice, estimatedCost);
          return {
            variant_name:
              recipe.name.trim() || "Reg",
            selling_price: parseFloat(recipe.sellingPrice) || 0,
            estimated_cost: estimatedCost,
            profit,
            margin: calculateMargin(profit, recipe.sellingPrice),
            item_code: null,
            archived: false,
            pos_status:
              recipe.isAvailable
                ? "Available"
                : "Unavailable",
            recipes: buildRecipePayload(recipe.ingredients, inventoryItems),
          };
        }),
      };

      await addMenuItem(payload);
      if (refetchMenu) await refetchMenu();
      onClose();
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to add menu item. Please try again.",
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
        title="Add Menu Item"
        description="Add a new menu item to your café."
        iconClassName="bi bi-box-seam"
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
                headingRef={stepHeadingRef}
                baseInfo={baseInfo}
                imageSize={imageSize}
                categories={categories}
                errors={showErrors ? errors : {}}
                onChange={(field, value) => {
                  setErrorMessage("");
                  setBaseInfo((current) => ({ ...current, [field]: value }));
                }}
              />
            ) : (
              <RecipePricingStep
                headingRef={stepHeadingRef}
                variants={variants}
                inventoryItems={inventoryItems}
                errors={showErrors ? errors : {}}
                disabled={isSubmitting}
                onRecipeChange={updateRecipe}
                onAddIngredient={(variantId) =>
                  updateRecipe(variantId, (recipe) => ({
                    ...recipe,
                    ingredients: [...recipe.ingredients, createIngredient()],
                  }))
                }
                onAddVariant={() => {
                  setErrorMessage("");
                  setVariants((current) => normalizeVariantNames([...current, createVariant()]));
                }}
                onRemoveVariant={(id) => {
                  setErrorMessage("");
                  setVariants((current) =>
                    current.length > 1
                      ? normalizeVariantNames(current.filter((variant) => variant.id !== id))
                      : current,
                  );
                }}
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
              ? handleSaveItem
              : () => {
                  setAttemptedStep(0);
                  if (generalValid) changeStep(1);
                }
          }
        >
          {isSubmitting ? "Saving..." : currentStep === 1 ? "Add Item" : "Next"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const AddMenuItemModal = ({ isOpen, ...props }) =>
  isOpen ? <AddMenuItemModalContent {...props} /> : null;

export default AddMenuItemModal;
