import React, { useState, useEffect } from 'react';
import './manageExpenseCategoriesModal.css';
import { addExpenseCategory, updateExpenseCategory, deleteExpenseCategory } from '../../../services/expenses/expenseService';

const ManageExpenseCategoriesModal = ({ isOpen, onClose, categories, expenses = [], refetch }) => {
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Reset inputs when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setNewCategory('');
      setEditingId(null);
      setEditName('');
      setIsSubmitting(false);
      setError(null);
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

  const handleAddCategory = async () => {
    if (isAddDisabled) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await addExpenseCategory(newCategory.trim());
      await refetch();
      setNewCategory('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditEmpty = editName.trim() === '';
  const isEditDuplicate = !isEditEmpty && checkDuplicate(editName, editingId);
  const isSaveDisabled = isEditEmpty || isEditDuplicate || isSubmitting;

  const handleSaveEdit = async (id) => {
    if (isSaveDisabled) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await updateExpenseCategory(id, editName.trim());
      await refetch();
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await deleteExpenseCategory(id);
      await refetch();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ec-modal-overlay">
      <div className="ec-modal-content">
        <div className="ec-modal-header">
          <h3>Manage Expense Categories</h3>
          <button className="ec-modal-close" onClick={onClose} title="Close" disabled={isSubmitting}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="ec-modal-body">
          {error && <div style={{ color: '#C62828', fontSize: '0.875rem' }}>{error}</div>}

          {/* Add Category Row */}
          <div className="ec-add-row">
            <div className="ec-input-wrapper">
              <input
                type="text"
                className={`ec-input ${isNewDuplicate ? 'ec-input--error' : ''}`}
                placeholder="New Category Name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                disabled={isSubmitting}
              />
              {isNewDuplicate && <span className="ec-error-text">Category already exists</span>}
            </div>
            <button
              className="ec-btn-add"
              disabled={isAddDisabled}
              onClick={handleAddCategory}
            >
              + Add Category
            </button>
          </div>

          <div className="ec-separator"></div>

          {/* Categories List */}
          <div className="ec-list">
            {categories.map((cat) => {
              const isEditing = editingId === cat.id;
              const usedByCount = expenses.filter((e) => e.category_id === cat.id).length;

              return (
                <div className="ec-list-item" key={cat.id}>
                  {isEditing ? (
                    <>
                      <div className="ec-edit-container">
                        <input
                          type="text"
                          className={`ec-edit-input ${isEditDuplicate ? 'ec-edit-input--error' : ''}`}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                          disabled={isSubmitting}
                        />
                        {isEditDuplicate && <span className="ec-error-text">Category already exists</span>}
                      </div>
                      <div className="ec-list-item-actions">
                        <button
                          className="ec-action-btn ec-action-btn--save"
                          disabled={isSaveDisabled}
                          onClick={() => handleSaveEdit(cat.id)}
                          title="Save"
                        >
                          <i className="bi bi-check-lg"></i>
                        </button>
                        <button
                          className="ec-action-btn ec-action-btn--edit"
                          onClick={() => setEditingId(null)}
                          title="Cancel"
                          disabled={isSubmitting}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="ec-list-item-name">
                        {cat.category_name} {usedByCount > 0 && <small style={{ color: '#6c757d' }}>({usedByCount} expenses)</small>}
                      </span>
                      <div className="ec-list-item-actions">
                        <button
                          className="ec-action-btn ec-action-btn--edit"
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditName(cat.category_name);
                          }}
                          title="Edit"
                          disabled={isSubmitting}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="ec-action-btn ec-action-btn--delete"
                          disabled={usedByCount > 0 || isSubmitting}
                          title={usedByCount > 0 ? "Cannot delete category while expenses are using it." : "Delete"}
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
              <div style={{ textAlign: 'center', padding: '1rem', color: '#6C757D', fontSize: '0.875rem' }}>
                No categories found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageExpenseCategoriesModal;
