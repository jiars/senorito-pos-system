import React from 'react';

const AddCategoryRow = ({ newCategory, setNewCategory, isNewDuplicate, isAddDisabled, handleAddCategory }) => {
  return (
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
  );
};

export default AddCategoryRow;
