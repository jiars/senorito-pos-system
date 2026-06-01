import React from 'react';
import './checkbox.css';

/**
 * Reusable Checkbox component
 * @param {boolean} checked - The checked state
 * @param {function} onChange - Callback when toggled
 * @param {string} label - Optional label text
 * @param {boolean} disabled - Disabled state
 */
export const Checkbox = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  id,
  className = '',
}) => {
  const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`ui-checkbox-wrapper ${className} ${disabled ? 'ui-checkbox--disabled' : ''}`}>
      <div className="ui-checkbox__container">
        <input
          type="checkbox"
          id={inputId}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="ui-checkbox__input"
        />
        <div className="ui-checkbox__custom">
          {/* Custom checkmark icon SVG */}
          <svg className="ui-checkbox__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>
      {label && (
        <label htmlFor={inputId} className="ui-checkbox__label">
          {label}
        </label>
      )}
    </div>
  );
};
