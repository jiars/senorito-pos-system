const InventoryAuditPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages === 0) return null;

  return (
    <div className="audit-pagination">
      <span>Page {currentPage} of {totalPages}</span>

      <div className="audit-pagination-btns">
        <button
          className="audit-page-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        <button className="audit-page-btn active">{currentPage}</button>

        <button
          className="audit-page-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default InventoryAuditPagination;
