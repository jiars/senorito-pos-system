import React from "react";

const PosBlockingLoader = ({ isVisible, title, message }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="pos-blocking-loader" role="status" aria-live="polite">
      <div className="pos-blocking-loader-content">
        <i className="bi bi-arrow-clockwise"></i>
        <p>{title}</p>
        {message && <span>{message}</span>}
      </div>
    </div>
  );
};

export default PosBlockingLoader;
