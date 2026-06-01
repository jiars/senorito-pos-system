import React from 'react';
import './summaryCard.css';

/**
 * Reusable SummaryCard component
 * @param {string} title - The main title or subtitle text
 * @param {string|node} value - The main numerical value
 * @param {string} icon - Bootstrap icon class
 * @param {string} variant - primary | default
 */
export const SummaryCard = ({
  title,
  value,
  icon,
  variant = 'default',
  className = '',
}) => {
  const baseClass = 'ui-summary-card';
  const classes = [
    baseClass,
    `${baseClass}--${variant}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {icon && (
        <div className="ui-summary-card__icon-wrapper">
          <i className={`bi ${icon} ui-summary-card__icon`}></i>
        </div>
      )}
      <div className="ui-summary-card__content">
        <div className="ui-summary-card__value">{value}</div>
        <div className="ui-summary-card__title">{title}</div>
      </div>
    </div>
  );
};
