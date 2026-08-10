import React, { useState, useEffect } from 'react';
import { addInventoryCategory, updateInventoryCategory, deleteInventoryCategory } from '../../../../services/inventory/inventoryCategoriesService';
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
          {/* Add Category Row */}
          <div className="mc-add-row">
            <div className="mc-input-wrapper">
              <input
                type="text"
                className={`mc-input ${isNewDuplicate ? 'mc-input--error' : ''}`}
                placeholder="New Category Name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              {isNewDuplicate && <small className="mc-error-text">Category already exists.</small>}
            </div>
            <button
              className="mc-btn-add"
              disabled={isAddDisabled}
              onClick={handleAddCategory}
            >
              + Add Category
            </button>
          </div>

          <div className="mc-separator"></div>

          {/* Categories List */}
          <div className="mc-list">
            {categories.map((cat) => {
              const isEditing = editingId === cat.id;
              // Check how many items use this category
              const usedByCount = inventoryItems.filter((i) => i.category_id === cat.id).length;

              return (
                <div className="mc-list-item" key={cat.id}>
                  {isEditing ? (
                    <>
                      <div className="mc-input-wrapper">
                        <input
                          type="text"
                          className={`mc-edit-input ${isEditDuplicate ? 'mc-edit-input--error' : ''}`}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                        />
                        {isEditDuplicate && <small className="mc-error-text">Category already exists.</small>}
                      </div>

                      <div className="mc-list-item-actions">
                        <button
                          className="mc-action-btn mc-action-btn--save"
                          disabled={isSaveDisabled}
                          onClick={() => handleSaveEdit(cat.id)}
                          title="Save"
                        >
                          <i className="bi bi-check-lg"></i>
                        </button>
                        <button
                          className="mc-action-btn mc-action-btn--edit"
                          onClick={() => {
                            setEditingId(null);
                            setEditName('');
                          }}
                          title="Cancel"
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="mc-list-item-name">
                        {cat.category_name} {usedByCount > 0 && <small style={{ color: '#6c757d' }}>({usedByCount} items)</small>}
                      </span>
                      <div className="mc-list-item-actions">
                        <button
                          className="mc-action-btn mc-action-btn--edit"
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditName(cat.category_name);
                          }}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="mc-action-btn mc-action-btn--delete"
                          disabled={usedByCount > 0 || isSubmitting}
                          title={usedByCount > 0 ? "Cannot delete category while items are using it." : "Delete"}
                          onClick={() => handleDeleteCategory(cat.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {categories.length === 0 && (
              <div className="mc-empty-state">
                No categories found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCategoriesModal;
