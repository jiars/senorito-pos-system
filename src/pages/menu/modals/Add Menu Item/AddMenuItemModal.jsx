import { useRef, useState } from "react";
import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import { toast } from "@/components/ui/toast";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import {
  getAddMenuItemErrorCode, getAddMenuItemInlineFeedback,
  getAddMenuItemStatusFeedback, getAddMenuItemToastFeedback,
} from "@/utils/menu/feedback/addMenuItemFeedback";

import Modal from "@/components/modals/Modal";
import ModalHeader from "@/components/modals/ModalHeader";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalStepper from "@/components/modals/ModalStepper";
import ModalFooter from "@/components/modals/ModalFooter";
import { Button } from "@/components/ui/button";
import { addMenuItem } from "@/services/menu/menuItemsService";
import { uploadMenuImage } from "@/utils/menu/imageUploadHelper";
import {
  calculateEstCost,
  calculateProfit,
  calculateMargin,
} from "@/utils/menu/pricingCalculations";
import { buildRecipePayload } from "@/utils/menu/buildRecipePayload";
import { validateAddMenuItem, getAddMenuItemServerFieldErrors } from "@/utils/menu/validation/addMenuItemValidation";

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
  existingItems = [],
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
  const [serverFieldErrors, setServerFieldErrors] = useState({});
  const [savedResult, setSavedResult] = useState(null);
  const [saveBlocked, setSaveBlocked] = useState(false);
  const [operationStage, setOperationStage] = useState("ITEM_SAVING");
  const { feedback, showFeedback, clearFeedback } = useFeedback(getAddMenuItemInlineFeedback);
  const uploadedImageRef = useRef(null);
  const submittingRef = useRef(false);
  const stepHeadingRef = useRef(null);

  const validation = validateAddMenuItem(baseInfo, variants, categories, inventoryItems, existingItems);
  const errors = { ...serverFieldErrors, ...validation.errors };
  const generalValid = validation.stepValidity[0] && !errors.name && !errors.category && !errors.image;
  const showErrors = attemptedStep === currentStep;
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
    setAttemptedStep(null);
    clearFeedback();
    setCurrentStep(step);
    window.requestAnimationFrame(() => stepHeadingRef.current?.focus());
  };

  const updateRecipe = (variantId, updater) => {
    if (submittingRef.current || formLocked) return;
    clearFormFeedback();
    setVariants((current) =>
      current.map((variant) =>
        variant.id === variantId ? updater(variant) : variant,
      ),
    );
  };

  // A successful write retries menu reads only, never another item creation.
  const refreshSavedItem = async (resultDetails) => {
    try {
      if (!refetchMenu) return;
      const result = await refetchMenu();
      if (result && (result.isError || result.error)) return;
    } catch {
      return;
    }
    toast.add(getAddMenuItemToastFeedback(resultDetails.itemName));
    onClose();
  };

  const handleSaveItem = async () => {
    if (submittingRef.current || savedResult || saveBlocked) return;
    setAttemptedStep(currentStep);
    if (!validation.isFormValid || Object.keys(serverFieldErrors).length > 0) {
      if (!generalValid) {
        setCurrentStep(0);
        setAttemptedStep(0);
      }
      window.requestAnimationFrame(() => stepHeadingRef.current?.focus());
      return;
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    clearFeedback();
    setOperationStage("ITEM_SAVING");

    try {
      let uploadedImageUrl;
      const cachedImage = uploadedImageRef.current;
      if (cachedImage && cachedImage.file === baseInfo.image && cachedImage.name === baseInfo.name && cachedImage.category === baseInfo.category) {
        uploadedImageUrl = cachedImage.url;
      } else {
        const category = categories.find(
          (item) => item.id === baseInfo.category,
        );
        try {
          uploadedImageUrl = await uploadMenuImage(baseInfo.image, baseInfo.name, category.category_name);
          if (!uploadedImageUrl) throw new Error("Image upload returned no URL");
          uploadedImageRef.current = { file: baseInfo.image, name: baseInfo.name, category: baseInfo.category, url: uploadedImageUrl };
        } catch {
          showFeedback("UPLOAD_FAILED");
          return;
        }
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

      setOperationStage("ITEM_SAVING");
      try {
        await addMenuItem(payload);
      } catch (error) {
        const code = getAddMenuItemErrorCode(error);
        showFeedback(code);
        if (code === "SAVE_UNCONFIRMED" || code === "RECORD_CONFLICT") setSaveBlocked(true);
        if (code === "VALIDATION_FAILED" && error.response.data && error.response.data.errors) {
          const fieldErrors = getAddMenuItemServerFieldErrors(error.response.data.errors, variants);
          setServerFieldErrors(fieldErrors);
          if (fieldErrors.name || fieldErrors.category || fieldErrors.image) {
            setCurrentStep(0);
            setAttemptedStep(0);
          }
        }
        return;
      }
      const resultDetails = { itemName: baseInfo.name.trim() };
      setSavedResult(resultDetails);
      setOperationStage("MENU_REFRESHING");
      await refreshSavedItem(resultDetails);
    } catch (error) {
      console.error("Could not prepare menu item:", error);
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
      await refreshSavedItem(savedResult);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };
  const isRefreshError = Boolean(savedResult) && !isSubmitting;
  const statusFeedback = getAddMenuItemStatusFeedback(isRefreshError ? "MENU_REFRESH_FAILED" : operationStage);
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
          <InlineFeedback feedback={feedback} id="add-menu-item-feedback" />
          <fieldset disabled={formLocked} className="min-w-0 border-0 p-0">
            {currentStep === 0 ? (
              <GeneralStep
                headingRef={stepHeadingRef}
                baseInfo={baseInfo}
                imageSize={imageSize}
                categories={categories}
                errors={showErrors ? errors : {}}
                onChange={(field, value) => {
                  if (submittingRef.current || formLocked) return;
                  clearFormFeedback();
                  setBaseInfo((current) => ({ ...current, [field]: value }));
                }}
              />
            ) : (
              <RecipePricingStep
                headingRef={stepHeadingRef}
                variants={variants}
                inventoryItems={inventoryItems}
                errors={showErrors ? errors : {}}
                disabled={formLocked}
                onRecipeChange={updateRecipe}
                onAddIngredient={(variantId) =>
                  updateRecipe(variantId, (recipe) => ({
                    ...recipe,
                    ingredients: [...recipe.ingredients, createIngredient()],
                  }))
                }
                onAddVariant={() => {
                  if (submittingRef.current || formLocked) return;
                  clearFormFeedback();
                  setVariants((current) => normalizeVariantNames([...current, createVariant()]));
                }}
                onRemoveVariant={(id) => {
                  if (submittingRef.current || formLocked) return;
                  clearFormFeedback();
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

const AddMenuItemModal = ({ isOpen, ...props }) =>
  isOpen ? <AddMenuItemModalContent {...props} /> : null;

export default AddMenuItemModal;
