import React from 'react';
import { useNavigate } from 'react-router-dom';

const POSHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="pos-header">
      <div className="pos-header-left">
        <button 
          className="pos-hamburger"
          onClick={() => navigate('/dashboard')}
          title="Back to Dashboard"
        >
          <div className="pos-hamburger-line"></div>
          <div className="pos-hamburger-line"></div>
          <div className="pos-hamburger-line"></div>
        </button>
      </div>
      <div className="pos-header-right">
        <div className="pos-synced-badge">
          <i className="bi bi-wifi"></i>
          Synced
        </div>
      </div>
    </div>
  );
};

export default POSHeader;
