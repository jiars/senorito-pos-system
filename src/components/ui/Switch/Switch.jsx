import React from 'react';
import './switch.css';

/**
 * Reusable Switch (Toggle) component
 * @param {boolean} checked - The checked state
 * @param {function} onChange - Callback when toggled
 * @param {string} label - Optional label text
 * @param {boolean} disabled - Disabled state
 */
export const Switch = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  id,
  className = '',
}) => {
  // Generate a random ID if none provided to link label and input
  const inputId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`ui-switch-wrapper ${className} ${disabled ? 'ui-switch--disabled' : ''}`}>
      <label htmlFor={inputId} className="ui-switch">
        <input
          type="checkbox"
          id={inputId}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="ui-switch__input"
        />
        <span className="ui-switch__slider"></span>
      </label>
      {label && (
        <label htmlFor={inputId} className="ui-switch__label">
          {label}
        </label>
      )}
    </div>
  );
};
