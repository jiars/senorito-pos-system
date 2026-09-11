const StockLogHeader = ({ onClose, isSubmitting }) => (
  <div className="stocklog-modal-header">
    <h3>Stock Log</h3>
    <button
      type="button"
      className="stocklog-modal-close"
      onClick={onClose}
      aria-label="Close"
      disabled={isSubmitting}
    >
      <i className="bi bi-x" />
    </button>
  </div>
);

export default StockLogHeader;
