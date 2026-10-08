import { useRef, useState } from "react";
import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import {
  getCategoryInlineFeedback,
  getCategoryStatusFeedback,
  getCategoryToastFeedback,
  getExpenseCategoryErrorCode,
} from "@/utils/expenses/feedback/categoryFeedback";
import ActionAlertDialog from "@/components/modals/ActionAlertDialog";
import { toast } from "@/components/ui/toast";
import Modal from "@/components/modals/Modal";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalHeader from "@/components/modals/ModalHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateExpenseCategory } from "@/utils/expenses/validation/categoryValidation";
import {
  addExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
} from "@/services/expenses/expenseCategoriesService";

const ManageExpenseCategoriesModalContent = ({
  onClose,
  categories,
  refetch,
}) => {
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTouched, setNewTouched] = useState(false);
  const [editTouched, setEditTouched] = useState(false);
  const operationInFlight = useRef(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [hasUnconfirmedSave, setHasUnconfirmedSave] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const savedOperation = useRef(null);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getCategoryInlineFeedback);
  const fieldsDisabled = isSubmitting || hasSaved || hasUnconfirmedSave || Boolean(deleteTarget);

  const newValidation = validateExpenseCategory(newCategory, categories);
  const editValidation = validateExpenseCategory(editName, categories, editingId);
  const isAddDisabled = !newValidation.isFormValid || fieldsDisabled;
  const isSaveDisabled = !editValidation.isFormValid || fieldsDisabled;

  // JSX controls visibility, not the validation rules or message wording.
  let newError = "";
  if (newTouched || newCategory !== "") newError = newValidation.errors.name || "";
  let editError = "";
  if (editTouched || editName !== "") editError = editValidation.errors.name || "";

  const handleClose = () => {
    if (!operationInFlight.current && !hasSaved && !deleteTarget) onClose();
  };

  // A confirmed change only retries its read, never its mutation.
  const refreshSavedCategories = async () => {
    try {
      if (refetch) {
        const result = await refetch();
        if (result && (result.isError || result.error)) {
          showFeedback("REFRESH_FAILED");
          return;
        }
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
    clearFeedback();
  };

  const saveCategoryChange = async (type, id, name) => {
    if (operationInFlight.current || isSubmitting || hasSaved || hasUnconfirmedSave) return;
    if (deleteTarget && type !== "delete") return;
    operationInFlight.current = true;
    setIsSubmitting(true);
    clearFeedback();
    try {
      try {
        if (type === "add") await addExpenseCategory(name);
        if (type === "edit") await updateExpenseCategory(id, name);
        if (type === "delete") await deleteExpenseCategory(id);
      } catch (error) {
        let code = getExpenseCategoryErrorCode(error);
        if (type === "delete" && error.response && error.response.status === 409) {
          code = "CATEGORY_IN_USE";
        }
        showFeedback(code);
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
    if (!category || Number(category.expenses_count ?? 0) > 0) return;
    clearFeedback();
    setDeleteTarget(category);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget || operationInFlight.current) return;
    const category = categories.find((currentCategory) => currentCategory.id === deleteTarget.id);
    setDeleteTarget(null);
    if (!category) return;
    if (Number(category.expenses_count ?? 0) > 0) {
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
  if (hasSaved) blockingCode = "EXPENSES_REFRESHING";
  if (isRefreshError) blockingCode = "EXPENSES_REFRESH_FAILED";
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
        title="Manage Expense Categories"
        iconClassName="bi bi-tags"
        closeDisabled={isSubmitting || Boolean(deleteTarget)}
      />

      <ModalBody>
        <ModalContent>
          <InlineFeedback feedback={feedback} id="expense-category-operation-feedback" />
          <fieldset disabled={fieldsDisabled} aria-busy={isSubmitting} className="contents">
          <div className="flex items-start gap-[var(--app-space-2)] max-sm:flex-col">
            <div className="flex min-w-0 flex-1 flex-col gap-[var(--app-space-1)] max-sm:w-full">
              <Input
                id="expense-category-add-name"
                aria-label="New category name"
                disabled={fieldsDisabled}
                onBlur={() => setNewTouched(true)}
                type="text"
                className={`h-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] focus-visible:border-[var(--app-color-brand)] focus-visible:ring-0 ${newError ? "border-[var(--app-color-danger)]" : ""}`}
                placeholder="New Category Name"
                value={newCategory}
                onChange={(event) => {
                  if (operationInFlight.current || fieldsDisabled) return;
                  clearFeedback();
                  setNewCategory(event.target.value);
                }}
                aria-invalid={Boolean(newError)}
                aria-describedby={
                  newError ? "expense-category-add-error" : undefined
                }
              />
              {newError && (
                <small
                  id="expense-category-add-error"
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
                const usedByCount = Number(category.expenses_count ?? 0);

                return (
                  <div
                    className="flex min-h-[var(--app-table-row-height)] items-center justify-between gap-[var(--app-space-2)] border-b border-[var(--app-color-border-subtle)] py-[var(--app-space-2)] last:border-b-0"
                    key={category.id}
                  >
                    {isEditing ? (
                      <>
                        <div className="flex min-w-0 flex-1 flex-col gap-[var(--app-space-1)]">
                          <Input
                            id={`expense-category-edit-name-${category.id}`}
                            aria-label={`Category name for ${category.category_name}`}
                            disabled={fieldsDisabled}
                            onBlur={() => setEditTouched(true)}
                            type="text"
                            className={`h-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] focus-visible:border-[var(--app-color-brand)] focus-visible:ring-0 ${editError ? "border-[var(--app-color-danger)]" : ""}`}
                            value={editName}
                            onChange={(event) => {
                              if (operationInFlight.current || fieldsDisabled) return;
                              clearFeedback();
                              setEditName(event.target.value);
                            }}
                            autoFocus
                            aria-invalid={Boolean(editError)}
                            aria-describedby={
                              editError
                                ? `expense-category-edit-error-${category.id}`
                                : undefined
                            }
                          />
                          {editError && (
                            <small
                              id={`expense-category-edit-error-${category.id}`}
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
                              clearFeedback();
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
                              ({usedByCount} expenses)
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
                              clearFeedback();
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

const ManageExpenseCategoriesModal = ({
  isOpen,
  onClose,
  categories = [],
  refetch,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <ManageExpenseCategoriesModalContent
      onClose={onClose}
      categories={categories}
      refetch={refetch}
    />
  );
};

export default ManageExpenseCategoriesModal;
