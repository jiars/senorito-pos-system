import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import './inventoryValuation.css';
import { fetchInventoryItems } from '../../../services/inventory/inventoryItemsService';

const InventoryValuationReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [sort, setSort] = useState('Sort: Highest Value First');
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const [rawItems, setRawItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchInventoryItems();
        setRawItems(data || []);
      } catch (error) {
        console.error("Failed to load inventory valuation data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const { processedItems, totalValuation, categorySummary, availableCategories } = useMemo(() => {
    let total = 0;
    const cats = {};

    const baseItems = rawItems.map(dbItem => {
      const stock = Number(dbItem.current_stock) || 0;

      let val = 0;
      if (dbItem.inventory_batches && dbItem.inventory_batches.length > 0) {
        dbItem.inventory_batches.forEach(batch => {
          val += (Number(batch.quantity) || 0) * (Number(batch.unit_cost) || Number(dbItem.cost_per_unit) || 0);
        });
      } else {
        const fallbackCost = Number(dbItem.cost_per_unit) || 0;
        val = stock * fallbackCost;
      }

      const cost = stock > 0 ? (val / stock) : (Number(dbItem.cost_per_unit) || 0);
      total += val;

      const catName = dbItem.inventory_categories?.category_name || 'Uncategorized';
      if (!cats[catName]) cats[catName] = 0;
      cats[catName] += val;

      return {
        id: dbItem.id,
        item: dbItem.item_name,
        category: catName,
        stock,
        unit: dbItem.base_unit || '',
        minimum: dbItem.minimum_level || 0,
        cost,
        value: val
      };
    });

    const withPct = baseItems.map(item => ({
      ...item,
      pct: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'
    }));

    const catSum = Object.keys(cats).map(catName => ({
      category: catName,
      value: cats[catName],
      pct: total > 0 ? ((cats[catName] / total) * 100).toFixed(1) : '0.0'
    })).sort((a, b) => b.value - a.value);

    return {
      processedItems: withPct,
      totalValuation: total,
      categorySummary: catSum,
      availableCategories: Object.keys(cats).sort()
    };
  }, [rawItems]);

  // Filter ONLY by category (Used for the Summary Table and Chart)
  const categoryFilteredItems = useMemo(() => {
    return processedItems.filter(item => {
      if (category !== 'All Categories' && item.category !== category) return false;
      return true;
    });
  }, [processedItems, category]);

  // Filter by category AND search term AND sorting (Used for the Main Table and Export)
  const filteredItems = useMemo(() => {
    let result = categoryFilteredItems.filter(item => {
      if (searchTerm && !item.item.toLowerCase().startsWith(searchTerm.toLowerCase())) return false;
      return true;
    });

    if (sort === 'Sort: Highest Value First') result.sort((a, b) => b.value - a.value);
    else if (sort === 'Sort: Lowest Value First') result.sort((a, b) => a.value - b.value);
    else if (sort === 'Sort: A-Z') result.sort((a, b) => a.item.localeCompare(b.item));

    return result;
  }, [categoryFilteredItems, searchTerm, sort]);

  const filteredTotal = filteredItems.reduce((sum, item) => sum + item.value, 0);

  const filteredCategorySummary = useMemo(() => {
    const cats = {};
    categoryFilteredItems.forEach(item => {
      if (!cats[item.category]) cats[item.category] = 0;
      cats[item.category] += item.value;
    });

    return Object.keys(cats).map(catName => ({
      category: catName,
      value: cats[catName],
      // MUST base percentage on the absolute totalValuation, not the filtered sum
      pct: totalValuation > 0 ? ((cats[catName] / totalValuation) * 100).toFixed(1) : '0.0'
    })).sort((a, b) => b.value - a.value);
  }, [categoryFilteredItems, totalValuation]);

  const handleExportExcel = () => {
    const workbook = XLSX.utils.book_new();

    // ==========================================
    // 1. Create "All Items" Sheet
    // ==========================================
    const allData = filteredItems.map(item => ({
      "Item": item.item,
      "Category": item.category,
      "Stock": item.stock,
      "Unit": item.unit,
      "Cost/Unit (₱)": item.cost,
      "Total Value (₱)": item.value,
      "% Of Total": `${item.pct}%`
    }));

    // Add Grand Total row with accurate percentage
    const exportTotalPct = totalValuation > 0 ? ((filteredTotal / totalValuation) * 100).toFixed(1) : '0.0';
    allData.push({
      "Item": "FILTERED TOTAL",
      "Category": "",
      "Stock": "",
      "Unit": "",
      "Cost/Unit (₱)": "",
      "Total Value (₱)": filteredTotal,
      "% Of Total": `${exportTotalPct}%`
    });

    const allSheet = XLSX.utils.json_to_sheet(allData);

    // Auto-size columns for All Items sheet
    allSheet['!cols'] = [
      { wch: 30 }, // Item
      { wch: 20 }, // Category
      { wch: 10 }, // Stock
      { wch: 10 }, // Unit
      { wch: 15 }, // Cost/Unit
      { wch: 20 }, // Total Value
      { wch: 15 }  // % Of Total
    ];

    XLSX.utils.book_append_sheet(workbook, allSheet, "All Items");

    // ==========================================
    // 2. Create Category Sheets
    // ==========================================
    // Only generate tabs for categories that actually exist in the current filtered data
    const uniqueCategories = [...new Set(filteredItems.map(item => item.category))];
    
    uniqueCategories.forEach(categoryName => {
      const catItems = filteredItems.filter(item => item.category === categoryName);

      let catTotal = 0;
      const catData = catItems.map(item => {
        catTotal += item.value;
        return {
          "Item": item.item,
          "Stock": item.stock,
          "Unit": item.unit,
          "Cost/Unit (₱)": item.cost,
          "Total Value (₱)": item.value,
          "% Of Total (of Whole Inv)": `${item.pct}%`
        };
      });

      // Add subtotal row at the bottom of the category
      catData.push({
        "Item": `TOTAL ${categoryName.toUpperCase()}`,
        "Stock": "",
        "Unit": "",
        "Cost/Unit (₱)": "",
        "Total Value (₱)": catTotal,
        "% Of Total (of Whole Inv)": ""
      });

      const catSheet = XLSX.utils.json_to_sheet(catData);

      // Auto-size columns for category sheet
      catSheet['!cols'] = [
        { wch: 30 }, // Item
        { wch: 10 }, // Stock
        { wch: 10 }, // Unit
        { wch: 15 }, // Cost/Unit
        { wch: 20 }, // Total Value
        { wch: 25 }  // % Of Total
      ];

      // Excel sheet names must not exceed 31 chars and cannot contain */:?[\]
      const safeSheetName = categoryName
        .replace(/[*/:?[\]\\]/g, '') // Remove illegal chars
        .substring(0, 31);          // Truncate to 31 chars max

      // Append to workbook
      XLSX.utils.book_append_sheet(workbook, catSheet, safeSheetName || "Uncategorized");
    });

    // ==========================================
    // 3. Trigger Download
    // ==========================================
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Inventory_Valuation_${dateStr}.xlsx`);
  };

  // SVG Chart Calculation
  const radius = 80;
  const strokeWidth = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const colors = {
    'Ingredient': '#5A2D15',
    'Packaging': '#A07156'
  };

  const chartSegments = filteredCategorySummary.map((d, i) => {
    // Use exact proportion against totalValuation
    const proportion = totalValuation > 0 ? (d.value / totalValuation) : 0;
    const dashArray = proportion * circumference;
    const gap = circumference - dashArray;

    // Use positive dashOffset to avoid negative offset rendering bugs in some browsers
    const dashOffset = circumference - offset;
    offset += dashArray;

    return {
      ...d,
      dashArray,
      gap,
      dashOffset,
      color: colors[d.category] || ['#D4A373', '#FAEDCD', '#E9EDC9'][i % 3]
    };
  });

  return (
    <div className="val-page">
      {/* ─── Header ─── */}
      <div className="val-header">
        <div className="layout-page-heading" style={{ marginBottom: 0 }}>
          <h2>Inventory Valuation Report</h2>
          <p>Current as of {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
        </div>
        <div className="val-actions">
          <button className="val-btn val-btn-outline" onClick={handleExportExcel}>
            <i className="bi bi-database-down"></i> Export Data
          </button>
          <button className="val-btn val-btn-primary" onClick={() => window.print()}>
            <i className="bi bi-printer"></i> Print
          </button>
        </div>
      </div>

      {/* ─── Alert ─── */}
      <div className="val-alert">
        <i className="bi bi-info-circle"></i>
        <span><strong>Valuation Basis:</strong> Current stock x recorded unit cost (per item's stock unit)</span>
      </div>

      {/* ─── Summary Cards ─── */}
      <div className="val-summary-cards">
        <div className="val-summary-card val-card--brown">
          <div className="val-summary-card-icon">
            <i className="bi bi-currency-dollar"></i>
          </div>
          <p className="val-card-value">₱{totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="val-card-label">Total Inventory Value</p>
        </div>
        <div className="val-summary-card val-card--blue">
          <div className="val-summary-card-icon">
            <i className="bi bi-box-seam"></i>
          </div>
          <p className="val-card-value">{rawItems.length}</p>
          <p className="val-card-label">Items</p>
        </div>
        <div className="val-summary-card val-card--green">
          <div className="val-summary-card-icon">
            <i className="bi bi-tags"></i>
          </div>
          <p className="val-card-value">{availableCategories.length}</p>
          <p className="val-card-label">Categories</p>
        </div>
      </div>

      {/* ─── Top Grid (Chart + Summary Table) ─── */}
      <div className="val-top-grid">

        {/* Chart Panel */}
        <div className="val-panel">
          <div className="val-panel-header">
            <i className="bi bi-pie-chart"></i> Value By Category
          </div>
          <div className="val-panel-body val-chart-container">
            <div style={{ position: 'relative', width: '240px', height: '240px' }}>
              <svg className="val-donut-svg" viewBox="0 0 200 200">
                {chartSegments.map((seg, idx) => (
                  <circle
                    key={idx}
                    className="val-donut-segment"
                    cx="100" cy="100" r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${seg.dashArray} ${seg.gap}`}
                    strokeDashoffset={seg.dashOffset}
                    onMouseEnter={() => setHoveredSegment(idx)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    style={{ opacity: hoveredSegment !== null && hoveredSegment !== idx ? 0.4 : 1 }}
                  />
                ))}
              </svg>
              {hoveredSegment !== null && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                  pointerEvents: 'none', textAlign: 'center'
                }}>
                  <span style={{ fontSize: '0.85rem', color: '#6c757d', fontWeight: 600, maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {filteredCategorySummary[hoveredSegment].category}
                  </span>
                  <span style={{ fontSize: '1.5rem', color: '#2C1810', fontWeight: 700 }}>
                    {filteredCategorySummary[hoveredSegment].pct}%
                  </span>
                </div>
              )}
            </div>
            <div className="val-legend">
              {filteredCategorySummary.map((cat, i) => (
                <div
                  className="val-legend-item"
                  key={cat.category}
                  onMouseEnter={() => setHoveredSegment(i)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="val-legend-color" style={{ backgroundColor: colors[cat.category] || ['#D4A373', '#FAEDCD', '#E9EDC9'][i % 3] }}></div>
                  <span>{cat.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Table Panel */}
        <div className="val-panel">
          <div className="val-panel-header">
            <i className="bi bi-list-task"></i> Category Summary
          </div>
          <div className="val-panel-body" style={{ padding: '0' }}>
            <table className="val-cat-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Value</th>
                  <th>% Of Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategorySummary.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No data</td></tr>
                ) : (
                  filteredCategorySummary.map((cat, i) => (
                    <tr key={i}>
                      <td>{cat.category}</td>
                      <td>₱{cat.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>{cat.pct}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── Filter Bar ─── */}
      <div className="val-filter-bar">
        <div className="val-search">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search item name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="val-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>All Categories</option>
          {availableCategories.map(cat => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <select
          className="val-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option>Sort: Highest Value First</option>
          <option>Sort: Lowest Value First</option>
          <option>Sort: A-Z</option>
        </select>

        <button className="val-reset-btn" onClick={() => {
          setSearchTerm('');
          setCategory('All Categories');
          setSort('Sort: Highest Value First');
        }}>Reset</button>
      </div>

      {/* ─── Main Table Panel ─── */}
      <div className="val-panel">
        <div className="val-table-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="bi bi-table"></i> All Items
          </div>
          <div className="val-table-summary-info">
            Showing {filteredItems.length} items | Filtered total: <strong>₱{filteredTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="val-main-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Unit</th>
                <th>Reorder</th>
                <th>Cost/Unit</th>
                <th>Total Value</th>
                <th>% Of Total</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>Loading valuation data...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No items found.</td></tr>
              ) : (
                <>
                  {filteredItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.item}</td>
                      <td>{item.category}</td>
                      <td>{item.stock}</td>
                      <td>{item.unit}</td>
                      <td>{item.minimum}</td>
                      <td>₱{item.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ fontWeight: 600 }}>₱{item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>{item.pct}%</td>
                    </tr>
                  ))}
                  <tr className="val-main-table-grand">
                    <td colSpan="6">FILTERED TOTAL</td>
                    <td>₱{filteredTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{filteredTotal > 0 ? ((filteredTotal / totalValuation) * 100).toFixed(1) : 0}%</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================
          HIDDEN PRINT-ONLY LAYOUT (Rule #8)
          ========================================= */}
      <div className="val-print-layout">
        <div className="print-val-header">
          <h2>Inventory Valuation Report</h2>
          <p>As of {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
          <p>Total Value: <strong>₱{filteredTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> ({filteredItems.length} items)</p>
        </div>

        {/* --- Category Summary --- */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '12pt', marginBottom: '8px', color: '#000' }}>Category Summary</h3>
          <table className="val-print-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Value</th>
                <th style={{ textAlign: 'right' }}>% Of Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategorySummary.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No data</td></tr>
              ) : (
                filteredCategorySummary.map((cat, i) => (
                  <tr key={i}>
                    <td>{cat.category}</td>
                    <td style={{ textAlign: 'right' }}>₱{cat.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ textAlign: 'right' }}>{cat.pct}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Main Table --- */}
        <h3 style={{ fontSize: '12pt', marginBottom: '8px', color: '#000' }}>Detailed Items List</h3>
        <table className="val-print-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Unit</th>
              <th>Cost/Unit</th>
              <th style={{ textAlign: 'right' }}>Total Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No items found.</td></tr>
            ) : (
              <>
                {filteredItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.item}</td>
                    <td>{item.category}</td>
                    <td>{item.stock}</td>
                    <td>{item.unit}</td>
                    <td>₱{item.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ fontWeight: 600, textAlign: 'right' }}>₱{item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                <tr className="val-print-table-grand">
                  <td colSpan="5" style={{ textAlign: 'right', fontWeight: 'bold' }}>TOTAL VALUE</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₱{filteredTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default InventoryValuationReport;
