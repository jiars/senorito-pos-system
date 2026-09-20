import { useState } from "react";
import {
  addExpenseCategory,
  deleteExpenseCategory,
  updateExpenseCategory,
} from "../../../services/expenses/expenseCategoriesService";
import ExpenseCategoryAddRow from "./components/ExpenseCategoryAddRow";
import ExpenseCategoryHeader from "./components/ExpenseCategoryHeader";
import ExpenseCategoryList from "./components/ExpenseCategoryList";
import "./manageExpenseCategoriesModal.css";

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

    return categories.some(
      (category) =>
        category.id !== excludedId &&
        category.category_name.toLowerCase() === normalizedName,
    );
  };

  const isNewDuplicate = Boolean(newCategory.trim()) && isDuplicate(newCategory);
  const isAddDisabled = !newCategory.trim() || isNewDuplicate || isSubmitting;
  const isEditDuplicate = Boolean(editName.trim()) &&
    isDuplicate(editName, editingId);
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

    const saved = await runRequest(
      () => addExpenseCategory(newCategory.trim()),
    );
    if (saved) setNewCategory("");
  };

  const handleSaveEdit = async (categoryId) => {
    if (isSaveDisabled) return;

    const saved = await runRequest(
      () => updateExpenseCategory(categoryId, editName.trim()),
    );
    if (saved) setEditingId(null);
  };

  return (
    <div className="ec-modal-overlay">
      <div className="ec-modal-content">
        <ExpenseCategoryHeader
          onClose={onClose}
          isSubmitting={isSubmitting}
        />

        <div className="ec-modal-body">
          {error && <p className="ec-error-text">{error}</p>}

          <ExpenseCategoryAddRow
            value={newCategory}
            isDuplicate={isNewDuplicate}
            isDisabled={isAddDisabled}
            isSubmitting={isSubmitting}
            onChange={setNewCategory}
            onAdd={handleAdd}
          />

          <div className="ec-separator" />

          <ExpenseCategoryList
            categories={categories}
            editingId={editingId}
            editName={editName}
            isEditDuplicate={isEditDuplicate}
            isSaveDisabled={isSaveDisabled}
            isSubmitting={isSubmitting}
            onEditNameChange={setEditName}
            onStartEdit={(category) => {
              setEditingId(category.id);
              setEditName(category.category_name);
            }}
            onCancelEdit={() => setEditingId(null)}
            onSaveEdit={handleSaveEdit}
            onDelete={(categoryId) => runRequest(
              () => deleteExpenseCategory(categoryId),
            )}
          />
        </div>
      </div>
    </div>
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
