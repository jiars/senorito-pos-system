import React from 'react';
import './button.css';

/**
 * Reusable Button component
 * @param {string} variant - primary | secondary | outline | ghost
 * @param {string} size - sm | md | lg
 * @param {string} leftIcon - Bootstrap icon class (e.g., 'bi-plus-circle')
 * @param {string} rightIcon - Bootstrap icon class
 * @param {boolean} disabled - Disabled state
 * @param {boolean} fullWidth - 100% width
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  fullWidth = false,
  ...props
}) => {
  const baseClass = 'ui-button';
  const classes = [
    baseClass,
    `${baseClass}--${variant}`,
    `${baseClass}--${size}`,
    fullWidth ? `${baseClass}--full-width` : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {leftIcon && <i className={`bi ${leftIcon} ${baseClass}__icon-left`} />}
      <span className={`${baseClass}__text`}>{children}</span>
      {rightIcon && <i className={`bi ${rightIcon} ${baseClass}__icon-right`} />}
    </button>
  );
};
