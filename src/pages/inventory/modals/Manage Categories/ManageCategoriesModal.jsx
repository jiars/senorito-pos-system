import React, { useState } from 'react';
import './manageCategoriesModal.css';

const ManageCategoriesModal = ({ isOpen, onClose }) => {
  // Placeholder data
  const [categories, setCategories] = useState([
    { id: 1, name: 'Ingredient', usedByCount: 18 },
    { id: 2, name: 'Packaging', usedByCount: 7 },
    { id: 3, name: 'Supply', usedByCount: 0 }
  ]);

  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  // Reset internal states when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setNewCategory('');
      setEditingId(null);
      setEditName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Validation helpers
  const checkDuplicate = (name, excludeId = null) => {
    const trimmed = name.trim().toLowerCase();
    return categories.some(
      (cat) => cat.id !== excludeId && cat.name.toLowerCase() === trimmed
    );
  };

  // Add validation
  const isNewEmpty = newCategory.trim() === '';
  const isNewDuplicate = !isNewEmpty && checkDuplicate(newCategory);
  const isAddDisabled = isNewEmpty || isNewDuplicate;

  const handleAddCategory = () => {
    if (isAddDisabled) return;
    const newCat = {
      id: Date.now(),
      name: newCategory.trim(),
      usedByCount: 0
    };
    setCategories([...categories, newCat]);
    setNewCategory(''); // Reset input after adding
  };

  // Edit validation
  const isEditEmpty = editName.trim() === '';
  const isEditDuplicate = !isEditEmpty && checkDuplicate(editName, editingId);
  const isSaveDisabled = isEditEmpty || isEditDuplicate;

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = (id) => {
    if (isSaveDisabled) return;
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, name: editName.trim() } : cat
      )
    );
    setEditingId(null);
  };

  const deleteCategory = (id) => {
    setCategories(categories.filter((cat) => cat.id !== id));
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
              {isNewDuplicate && (
                <span className="mc-error-text">Category already exists.</span>
              )}
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

          {/* Category List */}
          <div className="mc-list">
            {categories.map((cat) => {
              const isEditing = editingId === cat.id;

              return (
                <div className="mc-list-item" key={cat.id}>
                  {isEditing ? (
                    <>
                      <div className="mc-edit-container">
                        <input
                          type="text"
                          className={`mc-edit-input ${isEditDuplicate ? 'mc-edit-input--error' : ''}`}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                        />
                        {isEditDuplicate && (
                          <span className="mc-error-text" style={{ fontSize: '0.65rem' }}>
                            Category already exists.
                          </span>
                        )}
                      </div>
                      <div className="mc-list-item-actions">
                        <button
                          className="mc-action-btn mc-action-btn--save"
                          disabled={isSaveDisabled}
                          onClick={() => saveEdit(cat.id)}
                          title="Save"
                        >
                          <i className="bi bi-check-lg"></i>
                        </button>
                        <button
                          className="mc-action-btn mc-action-btn--edit"
                          onClick={cancelEdit}
                          title="Cancel"
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="mc-list-item-name">{cat.name}</span>
                      <div className="mc-list-item-actions">
                        <button
                          className="mc-action-btn mc-action-btn--edit"
                          onClick={() => startEdit(cat)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="mc-action-btn mc-action-btn--delete"
                          disabled={cat.usedByCount > 0}
                          title={cat.usedByCount > 0 ? "Cannot delete category while items are using it." : "Delete"}
                          onClick={() => deleteCategory(cat.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCategoriesModal;
