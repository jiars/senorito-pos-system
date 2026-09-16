import React from "react";

const ExpenseCategoryAddRow = ({
  value,
  isDuplicate,
  isDisabled,
  isSubmitting,
  onChange,
  onAdd,
}) => (
  <div className="ec-add-row">
    <div className="ec-input-wrapper">
      <input
        type="text"
        className={`ec-input ${isDuplicate ? "ec-input--error" : ""}`}
        placeholder="New Category Name"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={isSubmitting}
      />
      {isDuplicate && (
        <span className="ec-error-text">Category already exists</span>
      )}
    </div>
    <button className="ec-btn-add" disabled={isDisabled} onClick={onAdd}>
      + Add Category
    </button>
  </div>
);

export default ExpenseCategoryAddRow;
