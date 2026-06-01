import React from 'react';
import './filterBar.css';

/**
 * Reusable FilterBar component to align search and filters
 * @param {node} children - The search bar, dropdowns, buttons, etc.
 * @param {string} alignment - 'left' | 'right' | 'between'
 */
export const FilterBar = ({
  children,
  alignment = 'between',
  className = '',
}) => {
  return (
    <div className={`ui-filter-bar ui-filter-bar--${alignment} ${className}`}>
      {children}
    </div>
  );
};
