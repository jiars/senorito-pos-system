import React from 'react';

const InventoryArchiveTable = ({
  isLoading,
  error,
  filteredItems,
  getStatusChipClass,
  renderExpiry,
  setSelectedUnarchiveItem,
  setIsUnarchiveModalOpen
}) => {
  return (
    <div className="inventory-table-wrapper">
      <table className="inventory-table" style={{ minWidth: '1300px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>NAME</th>
            <th style={{ width: '150px', textAlign: 'left' }}>CATEGORY</th>
            <th style={{ width: '110px', textAlign: 'center' }}>LAST QTY</th>
            <th style={{ width: '90px', textAlign: 'center' }}>UNIT</th>
            <th style={{ width: '120px', textAlign: 'center' }}>MIN LEVEL</th>
            <th style={{ width: '140px', textAlign: 'center' }}>LAST STATUS</th>
            <th style={{ width: '170px', textAlign: 'center' }}>LAST EXPIRY STATUS</th>
            <th style={{ width: '150px', textAlign: 'center' }}>ARCHIVED DATE</th>
            <th style={{ width: '160px', textAlign: 'center' }}>ARCHIVED BY</th>
            <th style={{ width: '100px', textAlign: 'center' }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>Loading archived items...</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</td>
            </tr>
          ) : filteredItems.length === 0 ? (
            <tr>
              <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>No archived items found.</td>
            </tr>
          ) : (
            filteredItems.map(item => {
              const stockStatus = item.current_stock > (item.minimum_level || 0) ? 'In-stock' : (item.current_stock === 0 ? 'Out of Stock' : 'Low Stock');

              return (
                <tr key={item.id}>
                  <td style={{ textAlign: 'left' }}><strong>{item.item_name}</strong></td>
                  <td style={{ textAlign: 'left' }}>{item.inventory_categories?.category_name || '-'}</td>
                  <td style={{ textAlign: 'center', fontWeight: '500' }}>{item.current_stock || 0}</td>
                  <td style={{ textAlign: 'center' }}>{item.base_unit}</td>
                  <td style={{ textAlign: 'center' }}>{item.minimum_level}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`inventory-chip ${getStatusChipClass(stockStatus)}`}>
                      {stockStatus}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{renderExpiry(item)}</td>
                  <td style={{ textAlign: 'center' }}>{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '-'}</td>
                  <td style={{ textAlign: 'center' }}>
                    {item.profiles
                      ? `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}`.trim()
                      : '-'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="inventory-action-btn inventory-archive-action-btn--restore"
                      onClick={() => {
                        setSelectedUnarchiveItem(item);
                        setIsUnarchiveModalOpen(true);
                      }}
                      title="Unarchive"
                    >
                      <i className="bi bi-box-arrow-up"></i>
                    </button>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryArchiveTable;
