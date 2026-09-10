import React from 'react';

const CategoryList = ({
  categories,
  inventoryItems,
  editingId,
  editName,
  isEditDuplicate,
  isSaveDisabled,
  isSubmitting,
  setEditingId,
  setEditName,
  handleSaveEdit,
  handleDeleteCategory
}) => {
  if (categories.length === 0) {
    return (
      <div className="mc-empty-state">
        No categories found.
      </div>
    );
  }

  return (
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
    </div>
  );
};

export default CategoryList;
