import React from 'react';
import './dropdown.css';

/**
 * Reusable Dropdown component
 * @param {Array} options - Array of { value, label }
 * @param {string} value - Selected value
 * @param {function} onChange - Callback for changes
 * @param {string} placeholder - Default empty option
 */
export const Dropdown = ({
  options = [],
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <div className={`ui-dropdown-wrapper ${className} ${disabled ? 'ui-dropdown--disabled' : ''}`}>
      <select
        className="ui-dropdown"
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt, index) => (
          <option key={index} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <i className="bi bi-chevron-down ui-dropdown__icon"></i>
    </div>
  );
};
