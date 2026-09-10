import React, { useState, useEffect } from 'react';
import { addInventoryCategory, updateInventoryCategory, deleteInventoryCategory } from '../../../../services/inventory/inventoryCategoriesService';
import AddCategoryRow from './components/AddCategoryRow';
import CategoryList from './components/CategoryList';
import './manageCategoriesModal.css';

const ManageCategoriesModal = ({ isOpen, onClose, categories = [], inventoryItems = [], refetchInventory }) => {
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset inputs when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setNewCategory('');
      setEditingId(null);
      setEditName('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Validation helpers
  const checkDuplicate = (name, excludeId = null) => {
    const trimmed = name.trim().toLowerCase();
    return categories.some(
      (cat) => cat.id !== excludeId && cat.category_name.toLowerCase() === trimmed
    );
  };

  const isNewEmpty = newCategory.trim() === '';
  const isNewDuplicate = !isNewEmpty && checkDuplicate(newCategory);
  const isAddDisabled = isNewEmpty || isNewDuplicate || isSubmitting;

  const isEditEmpty = editName.trim() === '';
  const isEditDuplicate = !isEditEmpty && checkDuplicate(editName, editingId);
  const isSaveDisabled = isEditEmpty || isEditDuplicate || isSubmitting;

  // ─── 1. Add Category ───
  const handleAddCategory = async () => {
    if (isAddDisabled) return;
    setIsSubmitting(true);
    try {
      await addInventoryCategory(newCategory.trim());
      if (refetchInventory) await refetchInventory();
      setNewCategory('');
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
    <div className="mc-modal-overlay">
      <div className="mc-modal-content">
        <div className="mc-modal-header">
          <h3>Manage Inventory Categories</h3>
          <button className="mc-modal-close" onClick={onClose} title="Close">
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="mc-modal-body">
          <AddCategoryRow 
            newCategory={newCategory}
            setNewCategory={setNewCategory}
            isNewDuplicate={isNewDuplicate}
            isAddDisabled={isAddDisabled}
            handleAddCategory={handleAddCategory}
          />

          <div className="mc-separator"></div>

          <CategoryList 
            categories={categories}
            inventoryItems={inventoryItems}
            editingId={editingId}
            editName={editName}
            isEditDuplicate={isEditDuplicate}
            isSaveDisabled={isSaveDisabled}
            isSubmitting={isSubmitting}
            setEditingId={setEditingId}
            setEditName={setEditName}
            handleSaveEdit={handleSaveEdit}
            handleDeleteCategory={handleDeleteCategory}
          />
        </div>
      </div>
    </div>
  );
};

export default ManageCategoriesModal;
