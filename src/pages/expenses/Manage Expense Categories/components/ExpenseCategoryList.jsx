import React from "react";

const ExpenseCategoryList = ({
  categories,
  editingId,
  editName,
  isEditDuplicate,
  isSaveDisabled,
  isSubmitting,
  onEditNameChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}) => (
  <div className="ec-list">
    {categories.map((category) => {
      const isEditing = editingId === category.id;
      const usedByCount = Number(category.expenses_count || 0);

      return (
        <div className="ec-list-item" key={category.id}>
          {isEditing ? (
            <>
              <div className="ec-edit-container">
                <input
                  type="text"
                  className={`ec-edit-input ${isEditDuplicate ? "ec-edit-input--error" : ""}`}
                  value={editName}
                  onChange={(event) => onEditNameChange(event.target.value)}
                  autoFocus
                  disabled={isSubmitting}
                />
                {isEditDuplicate && (
                  <span className="ec-error-text">Category already exists</span>
                )}
              </div>
              <div className="ec-list-item-actions">
                <button
                  className="ec-action-btn ec-action-btn--save"
                  disabled={isSaveDisabled}
                  onClick={() => onSaveEdit(category.id)}
                  title="Save"
                >
                  <i className="bi bi-check-lg" />
                </button>
                <button
                  className="ec-action-btn ec-action-btn--edit"
                  onClick={onCancelEdit}
                  title="Cancel"
                  disabled={isSubmitting}
                >
                  <i className="bi bi-x-lg" />
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="ec-list-item-name">
                {category.category_name}
                {usedByCount > 0 && <small> ({usedByCount} expenses)</small>}
              </span>
              <div className="ec-list-item-actions">
                <button
                  className="ec-action-btn ec-action-btn--edit"
                  onClick={() => onStartEdit(category)}
                  title="Edit"
                  disabled={isSubmitting}
                >
                  <i className="bi bi-pencil" />
                </button>
                {usedByCount === 0 && (
                  <button
                    className="ec-action-btn ec-action-btn--delete"
                    disabled={isSubmitting}
                    title="Delete"
                    onClick={() => onDelete(category.id)}
                  >
                    <i className="bi bi-trash" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      );
    })}

    {categories.length === 0 && (
      <div className="ec-empty-state">No categories found.</div>
    )}
  </div>
);

export default ExpenseCategoryList;
