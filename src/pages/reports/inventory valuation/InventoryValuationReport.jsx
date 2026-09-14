import { useMemo, useState } from 'react';
import { useInventoryValuation } from '../../../hooks/useInventoryValuation';
import {
  calculateInventoryValuation,
  createValuationCategorySummary,
  exportInventoryValuation,
  filterInventoryValuationItems,
} from '../../../utils/inventory/inventoryValuationUtils';
import InventoryValuationFilters from './components/InventoryValuationFilters';
import InventoryValuationHeader from './components/InventoryValuationHeader';
import InventoryValuationOverview from './components/InventoryValuationOverview';
import InventoryValuationPrintLayout from './components/InventoryValuationPrintLayout';
import InventoryValuationSummaryCards from './components/InventoryValuationSummaryCards';
import InventoryValuationTable from './components/InventoryValuationTable';
import './inventoryValuation.css';

const InventoryValuationReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [sort, setSort] = useState('Sort: Highest Value First');
  const { inventoryItems: rawItems, isLoading } = useInventoryValuation();

  const { processedItems, totalValuation, availableCategories } = useMemo(() => {
    return calculateInventoryValuation(rawItems);
  }, [rawItems]);

  const { categoryItems, filteredItems } = useMemo(() => {
    return filterInventoryValuationItems(processedItems, {
      searchTerm,
      category,
      sort,
    });
  }, [processedItems, searchTerm, category, sort]);

  const filteredTotal = filteredItems.reduce((total, item) => {
    return total + item.value;
  }, 0);

  const categorySummary = useMemo(() => {
    return createValuationCategorySummary(categoryItems, totalValuation);
  }, [categoryItems, totalValuation]);

  const handleExport = () => {
    exportInventoryValuation({
      filteredItems,
      filteredTotal,
      totalValuation,
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setCategory('All Categories');
    setSort('Sort: Highest Value First');
  };

  return (
    <div className="val-page">
      <InventoryValuationHeader
        onExport={handleExport}
        onPrint={() => window.print()}
      />

      <div className="val-alert">
        <i className="bi bi-info-circle"></i>
        <span>
          <strong>Valuation Basis:</strong> Current stock x recorded unit cost
          {' '}(per item&apos;s stock unit)
        </span>
      </div>

      <InventoryValuationSummaryCards
        totalValuation={totalValuation}
        itemCount={rawItems.length}
        categoryCount={availableCategories.length}
      />

      <InventoryValuationOverview
        categorySummary={categorySummary}
        totalValuation={totalValuation}
      />

      <InventoryValuationFilters
        searchTerm={searchTerm}
        category={category}
        sort={sort}
        categories={availableCategories}
        onSearchChange={setSearchTerm}
        onCategoryChange={setCategory}
        onSortChange={setSort}
        onReset={handleReset}
      />

      <InventoryValuationTable
        items={filteredItems}
        filteredTotal={filteredTotal}
        totalValuation={totalValuation}
        isLoading={isLoading}
      />

      <InventoryValuationPrintLayout
        items={filteredItems}
        categorySummary={categorySummary}
        searchTerm={searchTerm}
        category={category}
        sort={sort}
        filteredTotal={filteredTotal}
      />
    </div>
  );
};

export default InventoryValuationReport;
