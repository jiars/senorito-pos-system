import React, { useState } from 'react';
import {
  Button,
  Switch,
  DataTable,
  SummaryCard,
  FilterBar,
  SearchBar,
  Chip,
  Checkbox,
  PageHeader,
  Dropdown
} from '../components/ui';

const ComponentPreview = () => {
  const [switchChecked, setSwitchChecked] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');

  // Sample data for DataTable
  const tableColumns = [
    { key: 'orderNo', label: 'ORDER #' },
    { key: 'cashier', label: 'CASHIER' },
    { key: 'total', label: 'TOTAL' },
    { key: 'payment', label: 'PAYMENT' },
    { 
      key: 'status', 
      label: 'STATUS',
      render: (item) => <Chip variant="success">{item.status}</Chip>
    },
    { key: 'dateTime', label: 'DATE & TIME' },
  ];

  const tableData = [
    { orderNo: 'SC-260302-01', cashier: 'Kimberly Legaspi', total: '₱258.00', payment: 'Cash', status: 'Completed', dateTime: '2026-03-02 11:14:02' },
    { orderNo: 'SC-260301-20', cashier: 'Kimberly Legaspi', total: '₱350.00', payment: 'Platform', status: 'Completed', dateTime: '2026-03-01 18:13:50' },
    { orderNo: 'SC-260301-19', cashier: 'Kimberly Legaspi', total: '₱870.00', payment: 'Platform', status: 'Completed', dateTime: '2026-03-01 17:45:08' },
    { orderNo: 'SC-260301-18', cashier: 'Kimberly Legaspi', total: '₱159.00', payment: 'GCash', status: 'Completed', dateTime: '2026-03-01 17:12:01' },
    { orderNo: 'SC-260301-17', cashier: 'Kimberly Legaspi', total: '₱320.00', payment: 'Card', status: 'Completed', dateTime: '2026-03-01 16:30:30' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

      {/* --- Page Header Section --- */}
      <PageHeader 
        title="Dashboard" 
        rightActions={
          <Button variant="outline" leftIcon="bi-tag">Tag</Button>
        }
      />

      {/* --- Top Controls Section --- */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <Button variant="secondary" leftIcon="bi-plus-circle">Add Item</Button>
        <Button variant="outline" leftIcon="bi-printer">Print</Button>
        <Button variant="outline" leftIcon="bi-download">Export CSV</Button>
        <Button variant="outline" leftIcon="bi-archive">View archived items</Button>
        <Button variant="ghost">Cancel</Button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Button variant="outline" size="sm">Reset</Button>
        <Dropdown 
          placeholder="All Categories" 
          options={[{ label: 'Category A', value: 'a' }]} 
          value={category} 
          onChange={(e) => setCategory(e.target.value)} 
        />
        <Dropdown 
          placeholder="tbsp" 
          options={[{ label: 'tbsp', value: 'tbsp' }, { label: 'tsp', value: 'tsp' }]} 
          value="" 
          onChange={() => {}} 
        />
        <Chip variant="success">In-stock</Chip>
        <Switch 
          checked={switchChecked} 
          onChange={(e) => setSwitchChecked(e.target.checked)} 
        />
        <Checkbox label="Sample Checkbox" />
      </div>

      {/* --- Summary Cards Section --- */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <SummaryCard 
          variant="primary"
          icon="bi-coin"
          value="₱2,970.00"
          title="Today's Sales (21 orders)"
        />
        <SummaryCard 
          icon="bi-box-seam"
          value="1,245"
          title="Total Inventory"
        />
      </div>

      {/* --- Filters Bar Section --- */}
      <div className="ui-filter-bar-section">
        <FilterBar alignment="left">
          <Dropdown placeholder="Last 7 days" />
          <Button variant="outline" leftIcon="bi-calendar">From dd/mm/yy</Button>
          <Button variant="outline" leftIcon="bi-calendar">To dd/mm/yy</Button>
          <Dropdown placeholder="All Order Source" />
          <Dropdown placeholder="Non-VAT Tax Setup" />
          <Button variant="outline">Reset</Button>
        </FilterBar>
      </div>

      <div className="ui-filter-bar-section">
        <FilterBar alignment="between">
          <SearchBar 
            value={searchValue} 
            onChange={(e) => setSearchValue(e.target.value)} 
            placeholder="Search item name..."
            style={{ maxWidth: '400px' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Dropdown 
              placeholder="All Categories" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
            />
            <Dropdown 
              placeholder="Sort: Highest Value First" 
              value={sort} 
              onChange={(e) => setSort(e.target.value)} 
            />
            <Button variant="outline">Reset</Button>
          </div>
        </FilterBar>
      </div>

      {/* --- Data Table Section --- */}
      <div className="ui-datatable-wrapper">
        <div className="ui-datatable__section-header">
          <i className="bi bi-clock-history"></i>
          Recent Orders
        </div>
        <DataTable 
          columns={tableColumns} 
          data={tableData} 
          pagination={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <span>Page 1 of 3</span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <Button variant="ghost" size="sm" disabled><i className="bi bi-chevron-left"></i></Button>
                <Button variant="outline" size="sm">1</Button>
                <Button variant="ghost" size="sm"><i className="bi bi-chevron-right"></i></Button>
              </div>
            </div>
          }
        />
      </div>

    </div>
  );
};

export default ComponentPreview;
