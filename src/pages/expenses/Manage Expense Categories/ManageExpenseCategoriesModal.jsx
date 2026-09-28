import { useState } from "react";

import Modal from "@/components/modals/Modal";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalHeader from "@/components/modals/ModalHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addExpenseCategory,
  deleteExpenseCategory,
  updateExpenseCategory,
} from "../../../services/expenses/expenseCategoriesService";

const ManageExpenseCategoriesModalContent = ({
  onClose,
  categories,
  refetch,
}) => {
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isDuplicate = (name, excludedId = null) => {
    const normalizedName = name.trim().toLowerCase();

    return categories.some((category) => {
      return category.id !== excludedId
        && category.category_name.toLowerCase() === normalizedName;
    });
  };

  const isNewDuplicate = Boolean(newCategory.trim()) && isDuplicate(newCategory);
  const isAddDisabled = !newCategory.trim() || isNewDuplicate || isSubmitting;
  const isEditDuplicate = Boolean(editName.trim())
    && isDuplicate(editName, editingId);
  const isSaveDisabled = !editName.trim() || isEditDuplicate || isSubmitting;

  const runRequest = async (request) => {
    try {
      setIsSubmitting(true);
      setError("");
      await request();
      await refetch();
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdd = async () => {
    if (isAddDisabled) return;

    const saved = await runRequest(() => {
      return addExpenseCategory(newCategory.trim());
    });

    if (saved) {
      setNewCategory("");
    }
  };

  const handleSaveEdit = async (categoryId) => {
    if (isSaveDisabled) return;

    const saved = await runRequest(() => {
      return updateExpenseCategory(categoryId, editName.trim());
    });

    if (saved) {
      setEditingId(null);
      setEditName("");
    }
  };

  const handleDelete = async (categoryId) => {
    if (isSubmitting) return;

    await runRequest(() => {
      return deleteExpenseCategory(categoryId);
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="32rem"
      maxHeight="min(85svh, 42rem)"
    >
      <ModalHeader
        title="Manage Expense Categories"
        iconClassName="bi bi-tags"
        closeDisabled={isSubmitting}
      />

      <ModalBody>
        <ModalContent>
          {error && (
            <p
              className="rounded-[var(--app-radius-nested)] bg-[var(--app-color-danger-surface)] px-[var(--app-space-4)] py-[var(--app-space-2)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-danger)]"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="flex items-start gap-[var(--app-space-2)] max-sm:flex-col">
            <div className="flex min-w-0 flex-1 flex-col gap-[var(--app-space-1)] max-sm:w-full">
              <Input
                type="text"
                className={`h-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] focus-visible:border-[var(--app-color-brand)] focus-visible:ring-0 ${isNewDuplicate ? "border-[var(--app-color-danger)]" : ""}`}
                placeholder="New Category Name"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                disabled={isSubmitting}
                aria-invalid={isNewDuplicate}
                aria-describedby={isNewDuplicate ? "expense-category-add-error" : undefined}
              />
              {isNewDuplicate && (
                <small
                  id="expense-category-add-error"
                  className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-danger)]"
                >
                  Category already exists.
                </small>
              )}
            </div>

            <Button
              type="button"
              className="h-[var(--app-touch-target-min)] shrink-0 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)] max-sm:w-full"
              disabled={isAddDisabled}
              onClick={handleAdd}
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
                const usedByCount = Number(category.expenses_count || 0);

                return (
                  <div
                    className="flex min-h-[var(--app-table-row-height)] items-center justify-between gap-[var(--app-space-2)] border-b border-[var(--app-color-border-subtle)] py-[var(--app-space-2)] last:border-b-0"
                    key={category.id}
                  >
                    {isEditing ? (
                      <>
                        <div className="flex min-w-0 flex-1 flex-col gap-[var(--app-space-1)]">
                          <Input
                            type="text"
                            className={`h-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] focus-visible:border-[var(--app-color-brand)] focus-visible:ring-0 ${isEditDuplicate ? "border-[var(--app-color-danger)]" : ""}`}
                            value={editName}
                            onChange={(event) => setEditName(event.target.value)}
                            autoFocus
                            disabled={isSubmitting}
                            aria-invalid={isEditDuplicate}
                            aria-describedby={isEditDuplicate ? `expense-category-edit-error-${category.id}` : undefined}
                          />
                          {isEditDuplicate && (
                            <small
                              id={`expense-category-edit-error-${category.id}`}
                              className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-danger)]"
                            >
                              Category already exists.
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
                              setEditingId(null);
                              setEditName("");
                            }}
                            disabled={isSubmitting}
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
                              setEditingId(category.id);
                              setEditName(category.category_name);
                            }}
                            disabled={isSubmitting}
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
                              disabled={isSubmitting}
                              onClick={() => handleDelete(category.id)}
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
        </ModalContent>
      </ModalBody>
    </Modal>
  );
};

const ManageExpenseCategoriesModal = ({
  isOpen,
  onClose,
  categories,
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
