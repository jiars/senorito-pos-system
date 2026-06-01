import React from 'react';
import './dataTable.css';

/**
 * Reusable DataTable component
 * @param {Array} columns - Array of { key, label, render(item) }
 * @param {Array} data - Array of data objects
 * @param {string} emptyMessage - Message when no data
 * @param {node} pagination - Optional pagination component to render at bottom
 */
export const DataTable = ({
  columns = [],
  data = [],
  emptyMessage = "No data available",
  pagination,
  className = '',
}) => {
  return (
    <div className={`ui-datatable-wrapper ${className}`}>
      <div className="ui-datatable-scroll">
        <table className="ui-datatable">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={col.key || index} className="ui-datatable__th">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="ui-datatable__empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="ui-datatable__tr">
                  {columns.map((col, colIndex) => (
                    <td key={col.key || colIndex} className="ui-datatable__td">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="ui-datatable__pagination-wrapper">
          {pagination}
        </div>
      )}
    </div>
  );
};
