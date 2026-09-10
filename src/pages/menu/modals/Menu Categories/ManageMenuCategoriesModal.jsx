import React, { useState, useEffect } from 'react';

import { addMenuCategory, updateMenuCategory, deleteMenuCategory } from '../../../../services/menu/menuCategoriesService'

import './manageMenuCategoriesModal.css';

const ManageMenuCategoriesModal = ({ isOpen, onClose, categories = [], menuItems = [], refetchMenu }) => {
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

  // ─── 1. Add Category ───
  const handleAddCategory = async () => {
    if (newCategory.trim() === '' || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addMenuCategory(newCategory.trim());
      if (refetchMenu) await refetchMenu();
      setNewCategory('');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── 2. Save Edit ───
  const handleSaveEdit = async (id) => {
    if (editName.trim() === '' || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateMenuCategory(id, editName.trim());
      if (refetchMenu) await refetchMenu();
      setEditingId(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── 3. Delete Category ───
  const handleDeleteCategory = async (id) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await deleteMenuCategory(id);
      if (refetchMenu) await refetchMenu();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mc-modal-overlay">
      <div className="mc-modal-content">
        <div className="mc-modal-header">
          <h3>Manage Menu Categories</h3>
          <button className="mc-modal-close" onClick={onClose} title="Close">
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="mc-modal-body">
          {/* Add Category Row */}
          <div className="mc-add-row">
            <input
              type="text"
              className="mc-input"
              placeholder="New Category Name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button
              className="mc-btn-add"
              disabled={newCategory.trim() === '' || isSubmitting}
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
              const usedByCount = menuItems.filter((i) => i.category_id === cat.id).length;

              return (
                <div className="mc-list-item" key={cat.id}>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        className="mc-edit-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                      />
                      <div className="mc-list-item-actions">
                        <button
                          className="mc-action-btn mc-action-btn--save"
                          disabled={editName.trim() === '' || isSubmitting}
                          onClick={() => handleSaveEdit(cat.id)}
                          title="Save"
                        >
                          <i className="bi bi-check-lg"></i>
                        </button>
                        <button
                          className="mc-action-btn mc-action-btn--edit"
                          onClick={() => setEditingId(null)}
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
                        {usedByCount === 0 && (
                          <button
                            className="mc-action-btn mc-action-btn--delete"
                            disabled={isSubmitting}
                            title="Delete"
                            onClick={() => handleDeleteCategory(cat.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
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

export default ManageMenuCategoriesModal;
