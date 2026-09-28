import { useState } from "react";
import Modal from "@/components/modals/Modal";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalHeader from "@/components/modals/ModalHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addInventoryCategory,
  updateInventoryCategory,
  deleteInventoryCategory,
} from "../../../../services/inventory/inventoryCategoriesService";

const ManageCategoriesModalContent = ({
  onClose,
  categories,
  refetchInventory,
}) => {
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation helpers
  const checkDuplicate = (name, excludeId = null) => {
    const trimmed = name.trim().toLowerCase();
    return categories.some(
      (cat) =>
        cat.id !== excludeId && cat.category_name.toLowerCase() === trimmed,
    );
  };

  const isNewEmpty = newCategory.trim() === "";
  const isNewDuplicate = !isNewEmpty && checkDuplicate(newCategory);
  const isAddDisabled = isNewEmpty || isNewDuplicate || isSubmitting;

  const isEditEmpty = editName.trim() === "";
  const isEditDuplicate = !isEditEmpty && checkDuplicate(editName, editingId);
  const isSaveDisabled = isEditEmpty || isEditDuplicate || isSubmitting;

  // ─── 1. Add Category ───
  const handleAddCategory = async () => {
    if (isAddDisabled) return;
    setIsSubmitting(true);
    try {
      await addInventoryCategory(newCategory.trim());
      if (refetchInventory) await refetchInventory();
      setNewCategory("");
    } catch (error) {
      console.error("Failed to add category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── 2. Save Edit ───
  const handleSaveEdit = async (id) => {
    if (isSaveDisabled) return;
    setIsSubmitting(true);
    try {
      await updateInventoryCategory(id, editName.trim());
      if (refetchInventory) await refetchInventory();
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── 3. Delete Category ───
  const handleDeleteCategory = async (id) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await deleteInventoryCategory(id);
      if (refetchInventory) await refetchInventory();
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="28rem"
      maxHeight="min(85svh, 42rem)"
    >
      <ModalHeader
        title="Manage Inventory Categories"
        iconClassName="bi bi-tags"
        closeDisabled={isSubmitting}
      />

      <ModalBody>
        <ModalContent>
          <div className="flex items-start gap-[var(--app-space-2)] max-sm:flex-col">
            <div className="flex min-w-0 flex-1 flex-col gap-[var(--app-space-1)] max-sm:w-full">
              <Input
                type="text"
                className={`h-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] focus-visible:border-[var(--app-color-brand)] focus-visible:ring-0 ${isNewDuplicate ? "border-[var(--app-color-danger)]" : ""}`}
                placeholder="New Category Name"
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                aria-invalid={isNewDuplicate}
                aria-describedby={
                  isNewDuplicate ? "inventory-category-add-error" : undefined
                }
              />
              {isNewDuplicate && (
                <small
                  id="inventory-category-add-error"
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
                const usedByCount = Number(category.inventory_items_count ?? 0);

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
                            onChange={(event) =>
                              setEditName(event.target.value)
                            }
                            autoFocus
                            aria-invalid={isEditDuplicate}
                            aria-describedby={
                              isEditDuplicate
                                ? `inventory-category-edit-error-${category.id}`
                                : undefined
                            }
                          />
                          {isEditDuplicate && (
                            <small
                              id={`inventory-category-edit-error-${category.id}`}
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
                              ({usedByCount} items)
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
        </ModalContent>
      </ModalBody>
    </Modal>
  );
};

const ManageCategoriesModal = ({
  isOpen,
  onClose,
  categories = [],
  refetchInventory,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <ManageCategoriesModalContent
      onClose={onClose}
      categories={categories}
      refetchInventory={refetchInventory}
    />
  );
};

export default ManageCategoriesModal;
