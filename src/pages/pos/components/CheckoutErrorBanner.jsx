import React from 'react';

const CheckoutErrorBanner = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="pos-checkout-error" role="alert">
      <i className="bi bi-exclamation-circle"></i>
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Close error">
        <i className="bi bi-x-lg"></i>
      </button>
    </div>
  );
};

export default CheckoutErrorBanner;
