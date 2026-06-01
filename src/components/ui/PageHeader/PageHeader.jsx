import React from 'react';
import './pageHeader.css';

/**
 * Reusable PageHeader component
 * @param {string} title - The main page title
 * @param {string} subtitle - Optional subtitle text
 * @param {node} rightActions - Optional buttons/actions on the right
 */
export const PageHeader = ({
  title,
  subtitle,
  rightActions,
  className = '',
}) => {
  return (
    <div className={`ui-page-header ${className}`}>
      <div className="ui-page-header__left">
        <h1 className="ui-page-header__title">{title}</h1>
        {subtitle && <p className="ui-page-header__subtitle">{subtitle}</p>}
      </div>
      {rightActions && (
        <div className="ui-page-header__right">
          {rightActions}
        </div>
      )}
    </div>
  );
};
