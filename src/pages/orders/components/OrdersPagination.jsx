import React from 'react';

const OrdersPagination = ({ totalPages, currentPage, setCurrentPage }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="orders-pagination">
      <span>Page {currentPage} of {totalPages}</span>
      <div className="orders-pagination-btns" style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className="orders-page-btn"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
        >
          <i className="bi bi-chevron-left"></i>
        </button>
        <button className="orders-page-btn active" style={{ backgroundColor: '#E9ECEF', fontWeight: 'bold' }}>
          {currentPage}
        </button>
        <button
          className="orders-page-btn"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default OrdersPagination;
