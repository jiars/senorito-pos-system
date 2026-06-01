import React from 'react';
import './searchBar.css';

/**
 * Reusable SearchBar component
 * @param {string} value - The input value
 * @param {function} onChange - Callback for input changes
 * @param {string} placeholder - Placeholder text
 */
export const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  className = '',
  ...props
}) => {
  return (
    <div className={`ui-search-bar ${className}`}>
      <i className="bi bi-search ui-search-bar__icon"></i>
      <input
        type="text"
        className="ui-search-bar__input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
};
