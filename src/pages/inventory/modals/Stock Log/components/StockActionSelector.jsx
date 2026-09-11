const actions = [
  { value: 'restock', label: 'Restock', icon: 'plus-circle', text: 'Add stock from delivery or purchase' },
  { value: 'wastage', label: 'Wastage', icon: 'dash-circle', text: 'Remove stock due to spoilage, damage, or loss' },
  { value: 'correct', label: 'Correct', icon: 'check2-circle', text: 'Adjust stock based on a physical count' },
];

const StockActionSelector = ({ actionType, onChange }) => {
  const currentAction = actions.find(action => action.value === actionType);

  return (
    <div className="stocklog-section">
      <label className="stocklog-label">Action Type</label>
      <div className="stocklog-action-types">
        {actions.map(action => (
          <button
            type="button"
            key={action.value}
            className={`stocklog-action-btn stocklog-action-btn--${action.value} ${actionType === action.value ? 'active' : ''}`}
            onClick={() => onChange(action.value)}
          >
            <i className={`bi bi-${action.icon}`} /> {action.label}
          </button>
        ))}
      </div>
      <div className="stocklog-subtext">
        <i className="bi bi-info-circle" /> {currentAction?.text}
      </div>
    </div>
  );
};

export default StockActionSelector;
