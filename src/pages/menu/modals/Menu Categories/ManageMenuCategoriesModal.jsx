import { useRef, useState } from "react";
import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import {
  getCategoryInlineFeedback,
  getCategoryStatusFeedback,
  getCategoryToastFeedback,
  getMenuCategoryErrorCode,
} from "@/utils/menu/feedback/categoryFeedback";
import ActionAlertDialog from "@/components/modals/ActionAlertDialog";
import { toast } from "@/components/ui/toast";
import Modal from "@/components/modals/Modal";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalHeader from "@/components/modals/ModalHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateMenuCategory, getMenuCategoryServerFieldErrors } from "@/utils/menu/validation/categoryValidation";
import {
  addMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
} from "@/services/menu/menuCategoriesService";

const ManageMenuCategoriesModalContent = ({
  onClose,
  categories,
  menuItems,
  addons,
  refetchMenu,
}) => {
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTouched, setNewTouched] = useState(false);
  const [editTouched, setEditTouched] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState({});
  const operationInFlight = useRef(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [hasUnconfirmedSave, setHasUnconfirmedSave] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const savedOperation = useRef(null);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getCategoryInlineFeedback);
  const fieldsDisabled = isSubmitting || hasSaved || hasUnconfirmedSave || Boolean(deleteTarget);

  const newValidation = validateMenuCategory(newCategory, categories);
  const editValidation = validateMenuCategory(editName, categories, editingId);
  const isAddDisabled = !newValidation.isFormValid || fieldsDisabled;
  const isSaveDisabled = !editValidation.isFormValid || fieldsDisabled;
  const clearFormFeedback = () => {
    clearFeedback();
    setServerFieldErrors({});
  };

  const getCategoryUsage = (category) => {
    const linkedItems = menuItems.filter((item) => item.category_id === category.id);
    let itemCount = linkedItems.length;
    if (Array.isArray(category.menu_items)) {
      itemCount = Math.max(itemCount, category.menu_items.length);
    }
    const addonCount = addons.filter((addon) => {
      return (addon.addon_categories || []).some((link) => link.menu_category_id === category.id);
    }).length;
    return { itemCount, addonCount, total: itemCount + addonCount };
  };

  // JSX controls visibility, not the validation rules or message wording.
  let newError = "";
  if (newTouched || newCategory !== "") newError = newValidation.errors.name || "";
  let editError = "";
  if (editTouched || editName !== "") editError = editValidation.errors.name || "";
  if (serverFieldErrors.type === "add") newError = serverFieldErrors.name || newError;
  if (serverFieldErrors.type === "edit") editError = serverFieldErrors.name || editError;

  const handleClose = () => {
    if (!operationInFlight.current && !hasSaved && !deleteTarget) onClose();
  };

  // A confirmed change only retries its read, never its mutation.
  const refreshSavedCategories = async () => {
    try {
      if (!refetchMenu) {
        showFeedback("REFRESH_FAILED");
        return;
      }
      const result = await refetchMenu();
      if (result && (result.isError || result.error)) {
        showFeedback("REFRESH_FAILED");
        return;
      }
    } catch {
      showFeedback("REFRESH_FAILED");
      return;
    }

    let toastCode = "CATEGORY_ADDED";
    if (savedOperation.current.type === "edit") toastCode = "CATEGORY_UPDATED";
    if (savedOperation.current.type === "delete") toastCode = "CATEGORY_DELETED";
    toast.add(getCategoryToastFeedback(toastCode, { categoryName: savedOperation.current.name }));

    if (savedOperation.current.type === "add") {
      setNewCategory("");
      setNewTouched(false);
    }
    if (savedOperation.current.type === "edit" || savedOperation.current.id === editingId) {
      setEditingId(null);
      setEditName("");
      setEditTouched(false);
    }
    savedOperation.current = null;
    setHasSaved(false);
    clearFormFeedback();
  };

  const saveCategoryChange = async (type, id, name) => {
    if (operationInFlight.current || isSubmitting || hasSaved || hasUnconfirmedSave) return;
    if (deleteTarget && type !== "delete") return;
    operationInFlight.current = true;
    setIsSubmitting(true);
    clearFormFeedback();
    try {
      try {
        if (type === "add") await addMenuCategory(name);
        if (type === "edit") await updateMenuCategory(id, name);
        if (type === "delete") await deleteMenuCategory(id);
      } catch (error) {
        let code = getMenuCategoryErrorCode(error);
        if (type === "delete" && error.response && error.response.status === 409) {
          code = "CATEGORY_IN_USE";
        }
        showFeedback(code);
        if (code === "VALIDATION_FAILED" && error.response.data && error.response.data.errors) {
          const errors = getMenuCategoryServerFieldErrors(error.response.data.errors);
          setServerFieldErrors({ type, ...errors });
        }
        if (code === "SAVE_UNCONFIRMED" || code === "RECORD_CONFLICT") setHasUnconfirmedSave(true);
        return;
      }
      savedOperation.current = { type, id, name };
      setHasSaved(true);
      await refreshSavedCategories();
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = () => {
    if (isAddDisabled) return;
    return saveCategoryChange("add", null, newCategory.trim());
  };

  const handleSaveEdit = (id) => {
    if (isSaveDisabled || id !== editingId) return;
    return saveCategoryChange("edit", id, editName.trim());
  };

  // Confirm only unused categories; the backend checks usage again on deletion.
  const handleDeleteCategory = (id) => {
    if (operationInFlight.current || fieldsDisabled) return;
    const category = categories.find((currentCategory) => currentCategory.id === id);
    if (!category || getCategoryUsage(category).total > 0) return;
    clearFormFeedback();
    setDeleteTarget(category);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget || operationInFlight.current) return;
    const category = categories.find((currentCategory) => currentCategory.id === deleteTarget.id);
    setDeleteTarget(null);
    if (!category) return;
    if (getCategoryUsage(category).total > 0) {
      showFeedback("CATEGORY_IN_USE");
      return;
    }
    return saveCategoryChange("delete", category.id, category.category_name);
  };

  const handleRetryRefresh = async () => {
    if (operationInFlight.current || !hasSaved) return;
    operationInFlight.current = true;
    setIsSubmitting(true);
    try {
      await refreshSavedCategories();
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const isRefreshError = hasSaved && !isSubmitting;
  let blockingCode = "CATEGORY_SAVING";
  if (hasSaved) blockingCode = "MENU_REFRESHING";
  if (isRefreshError) blockingCode = "MENU_REFRESH_FAILED";
  const blockingFeedback = getCategoryStatusFeedback(blockingCode);
  let blockingAction;
  if (isRefreshError) {
    blockingAction = { label: blockingFeedback.buttonLabel, onClick: handleRetryRefresh };
  }

  return (
    <>
    <Modal
      isOpen={!isSubmitting && !hasSaved}
      onClose={handleClose}
      maxWidth="32rem"
      maxHeight="min(85svh, 42rem)"
    >
      <ModalHeader
        title="Manage Menu Categories"
        iconClassName="bi bi-tags"
        closeDisabled={isSubmitting || Boolean(deleteTarget)}
      />

      <ModalBody>
        <ModalContent>
          <InlineFeedback feedback={feedback} id="menu-category-operation-feedback" />
          <fieldset disabled={fieldsDisabled} aria-busy={isSubmitting} className="contents">
          <div className="flex items-start gap-[var(--app-space-2)] max-sm:flex-col">
            <div className="flex min-w-0 flex-1 flex-col gap-[var(--app-space-1)] max-sm:w-full">
              <Input
                id="menu-category-add-name"
                aria-label="New category name"
                disabled={fieldsDisabled}
                onBlur={() => setNewTouched(true)}
                type="text"
                className={`h-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] focus-visible:border-[var(--app-color-brand)] focus-visible:ring-0 ${newError ? "border-[var(--app-color-danger)]" : ""}`}
                placeholder="New Category Name"
                value={newCategory}
                onChange={(event) => {
                  if (operationInFlight.current || fieldsDisabled) return;
                  clearFormFeedback();
                  setNewCategory(event.target.value);
                }}
                aria-invalid={Boolean(newError)}
                aria-describedby={
                  newError ? "menu-category-add-error" : undefined
                }
              />
              {newError && (
                <small
                  id="menu-category-add-error"
                  className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-danger)]"
                >
                  {newError}
                </small>
              )}
            </div>

            <Button
              type="button"
              className="h-[var(--app-touch-target-min)] shrink-0 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)] max-sm:w-full"
              disabled={isAddDisabled}
              onClick={handleAddCategory}
            >
              + Add Category
            </Button>
          </div>

          <div
            className="h-px w-full bg-[var(--app-color-border-subtle)]"
            aria-hidden="true"
          />

          {categories.length === 0 ? (
            <div className="py-[var(--app-space-6)] text-center text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text-subtle)]">
              No categories found.
            </div>
          ) : (
            <div className="flex flex-col">
              {categories.map((category) => {
                const isEditing = editingId === category.id;
                const usage = getCategoryUsage(category);
                const usedByCount = usage.total;

                return (
                  <div
                    className="flex min-h-[var(--app-table-row-height)] items-center justify-between gap-[var(--app-space-2)] border-b border-[var(--app-color-border-subtle)] py-[var(--app-space-2)] last:border-b-0"
                    key={category.id}
                  >
                    {isEditing ? (
                      <>
                        <div className="flex min-w-0 flex-1 flex-col gap-[var(--app-space-1)]">
                          <Input
                            id={`menu-category-edit-name-${category.id}`}
                            aria-label={`Category name for ${category.category_name}`}
                            disabled={fieldsDisabled}
                            onBlur={() => setEditTouched(true)}
                            type="text"
                            className={`h-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] focus-visible:border-[var(--app-color-brand)] focus-visible:ring-0 ${editError ? "border-[var(--app-color-danger)]" : ""}`}
                            value={editName}
                            onChange={(event) => {
                              if (operationInFlight.current || fieldsDisabled) return;
                              clearFormFeedback();
                              setEditName(event.target.value);
                            }}
                            autoFocus
                            aria-invalid={Boolean(editError)}
                            aria-describedby={
                              editError
                                ? `menu-category-edit-error-${category.id}`
                                : undefined
                            }
                          />
                          {editError && (
                            <small
                              id={`menu-category-edit-error-${category.id}`}
                              className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-danger)]"
                            >
                              {editError}
                            </small>
                          )}
                        </div>

                        <div className="flex shrink-0 gap-[var(--app-space-1)]">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-[var(--app-touch-target-min)] rounded-full text-[var(--app-color-success)] hover:bg-[var(--app-color-success-surface)] hover:text-[var(--app-color-success)]"
                            disabled={isSaveDisabled}
                            onClick={() => handleSaveEdit(category.id)}
                            aria-label={`Save ${category.category_name}`}
                          >
                            <i className="bi bi-check-lg" aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-[var(--app-touch-target-min)] rounded-full text-[var(--app-color-text-muted)] hover:bg-[var(--app-color-control-hover)] hover:text-[var(--app-color-text)]"
                            onClick={() => {
                              if (operationInFlight.current || fieldsDisabled) return;
                              clearFormFeedback();
                              setEditingId(null);
                              setEditName("");
                              setEditTouched(false);
                            }}
                            disabled={fieldsDisabled}
                            aria-label={`Cancel editing ${category.category_name}`}
                          >
                            <i className="bi bi-x-lg" aria-hidden="true" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 break-words text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] font-medium text-[var(--app-color-text)]">
                          {category.category_name}
                          {usedByCount > 0 && (
                            <small className="ml-[var(--app-space-1)] text-[length:var(--app-font-size-caption)] font-normal text-[var(--app-color-text-subtle)]">
                              {usage.itemCount} items · {usage.addonCount} add-ons
                            </small>
                          )}
                        </span>

                        <div className="flex shrink-0 gap-[var(--app-space-1)]">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-[var(--app-touch-target-min)] rounded-full text-[var(--app-color-text-muted)] hover:bg-[var(--app-color-control-hover)] hover:text-[var(--app-color-brand)]"
                            onClick={() => {
                              if (operationInFlight.current || fieldsDisabled) return;
                              clearFormFeedback();
                              setEditingId(category.id);
                              setEditName(category.category_name);
                              setEditTouched(false);
                            }}
                            disabled={fieldsDisabled}
                            aria-label={`Edit ${category.category_name}`}
                          >
                            <i className="bi bi-pencil" aria-hidden="true" />
                          </Button>
                          {usedByCount === 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-[var(--app-touch-target-min)] rounded-full text-[var(--app-color-danger)] hover:bg-[var(--app-color-danger-surface)] hover:text-[var(--app-color-danger)]"
                              disabled={fieldsDisabled}
                              onClick={() => handleDeleteCategory(category.id)}
                              aria-label={`Delete ${category.category_name}`}
                            >
                              <i className="bi bi-trash" aria-hidden="true" />
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          </fieldset>
        </ModalContent>
      </ModalBody>
      <ActionAlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !operationInFlight.current) setDeleteTarget(null);
        }}
        type="destructive"
        title="Delete category?"
        description={
          <>
            Permanently delete <strong className="font-semibold">{deleteTarget && deleteTarget.category_name}</strong>?
            {" "}This action cannot be undone.
          </>
        }
        actions={[
          { key: "cancel", label: "Cancel", close: true },
          { key: "confirm", label: "Confirm", onClick: handleConfirmDelete, disabled: isSubmitting },
        ]}
      />
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

const ManageMenuCategoriesModal = ({
  isOpen,
  onClose,
  categories = [],
  menuItems = [],
  addons = [],
  refetchMenu,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <ManageMenuCategoriesModalContent
      onClose={onClose}
      categories={categories}
      menuItems={menuItems}
      addons={addons}
      refetchMenu={refetchMenu}
    />
  );
};

export default ManageMenuCategoriesModal;
