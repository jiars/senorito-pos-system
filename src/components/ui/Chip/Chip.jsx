import React from 'react';
import './chip.css';

/**
 * Reusable Chip component for status markers
 * @param {string} variant - default | success | warning | danger | info | neutral
 */
export const Chip = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const baseClass = 'ui-chip';
  const classes = [
    baseClass,
    `${baseClass}--${variant}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {children}
    </span>
  );
};
