import { useMemo, useState } from 'react';
import { useInventoryAuditLogs } from '../../../hooks/useInventoryAuditLogs';
import {
  exportInventoryAuditLogs,
  filterInventoryAuditLogs,
} from '../../../utils/inventory/inventoryAuditLogUtils';
import InventoryAuditFilters from './components/InventoryAuditFilters';
import InventoryAuditHeader from './components/InventoryAuditHeader';
import InventoryAuditPagination from './components/InventoryAuditPagination';
import InventoryAuditTable from './components/InventoryAuditTable';
import './inventoryAuditLog.css';

const ITEMS_PER_PAGE = 12;

const EMPTY_FILTERS = {
  searchTerm: '',
  fromDate: '',
  toDate: '',
  action: 'All actions',
  source: 'All sources',
};

const InventoryAuditLogPage = () => {
  const { logs, isLoading, error } = useInventoryAuditLogs();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLogs = useMemo(() => {
    return filterInventoryAuditLogs(logs, filters);
  }, [logs, filters]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLogs = filteredLogs.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handleFilterChange = (field, value) => {
    // Show the first page whenever the user changes a filter.
    setCurrentPage(1);
    setFilters((currentFilters) => {
      return {
        ...currentFilters,
        [field]: value,
      };
    });
  };

  const handleResetFilters = () => {
    setCurrentPage(1);
    setFilters(EMPTY_FILTERS);
  };

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      alert('No logs to export based on current filters.');
      return;
    }

    exportInventoryAuditLogs(filteredLogs);
  };

  return (
    <div className="audit-page">
      <InventoryAuditHeader onExport={handleExport} />

      {error && <p className="audit-load-error">{error}</p>}

      <div className="audit-panel">
        <InventoryAuditFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        <InventoryAuditTable
          logs={paginatedLogs}
          isLoading={isLoading}
        />

        <InventoryAuditPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default InventoryAuditLogPage;
