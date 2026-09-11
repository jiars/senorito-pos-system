import React from 'react';

const ArchiveAffectedRecords = ({ records, isLoading }) => {
  const affectedRecords = [
    ...records.menuItems.map((name) => ({ name, type: 'Menu' })),
    ...records.addons.map((name) => ({ name, type: 'Add-on' }))
  ];

  return (
    <div className="archive-affected-section">
      <h4>Affected Menu Items and Add-ons</h4>
      <div className="archive-affected-list">
        {isLoading ? (
          <span>Loading affected records...</span>
        ) : affectedRecords.length > 0 ? (
          affectedRecords.map((record) => (
            <div
              key={`${record.type}-${record.name}`}
              className="archive-affected-pill"
            >
              <span>{record.name}</span>
              {record.type === 'Add-on' && <small>(Add-on)</small>}
            </div>
          ))
        ) : (
          <span>No Menu Items or Add-ons use this ingredient.</span>
        )}
      </div>
    </div>
  );
};

export default ArchiveAffectedRecords;
