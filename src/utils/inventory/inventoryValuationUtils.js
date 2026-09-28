import * as XLSX from 'xlsx';

const CATEGORY_COLORS = {
  Ingredient: '#5A2D15',
  Packaging: '#A07156',
};

const FALLBACK_COLORS = ['#D4A373', '#FAEDCD', '#E9EDC9'];

export const getValuationCategoryColor = (category, index) => {
  return CATEGORY_COLORS[category] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
};

export const createValuationChartSegments = (
  categorySummary,
  totalValuation,
  circumference,
) => {
  return categorySummary.map((entry, index) => {
    const proportion = totalValuation > 0 ? entry.value / totalValuation : 0;
    const dashArray = proportion * circumference;
    const usedCircumference = categorySummary
      .slice(0, index)
      .reduce((total, previousEntry) => {
        const previousProportion =
          totalValuation > 0 ? previousEntry.value / totalValuation : 0;
        return total + previousProportion * circumference;
      }, 0);

    return {
      ...entry,
      dashArray,
      gap: circumference - dashArray,
      dashOffset: circumference - usedCircumference,
      color: getValuationCategoryColor(entry.category, index),
    };
  });
};

export const calculateInventoryValuation = (rawItems = []) => {
  let totalValuation = 0;
  const categoryValues = {};

  const baseItems = rawItems.map((databaseItem) => {
    const stock = Number(databaseItem.current_stock) || 0;
    const fallbackCost = Number(databaseItem.cost_per_unit) || 0;

    // Preserve the current valuation: add every batch's remaining value.
    const value = databaseItem.inventory_batches?.length > 0
      ? databaseItem.inventory_batches.reduce((total, batch) => {
          const quantity = Number(batch.quantity) || 0;
          const unitCost = Number(batch.unit_cost) || fallbackCost;
          return total + quantity * unitCost;
        }, 0)
      : stock * fallbackCost;

    const category =
      databaseItem.inventory_categories?.category_name || 'Uncategorized';

    totalValuation += value;
    categoryValues[category] = (categoryValues[category] || 0) + value;

    return {
      id: databaseItem.id,
      item: databaseItem.item_name,
      category,
      stock,
      unit: databaseItem.base_unit || '',
      minimum: databaseItem.minimum_level || 0,
      cost: stock > 0 ? value / stock : fallbackCost,
      value,
    };
  });

  const processedItems = baseItems.map((item) => ({
    ...item,
    pct:
      totalValuation > 0
        ? ((item.value / totalValuation) * 100).toFixed(1)
        : '0.0',
  }));

  return {
    processedItems,
    totalValuation,
    availableCategories: Object.keys(categoryValues).sort(),
  };
};

export const filterInventoryValuationItems = (
  processedItems,
  { searchTerm, categories = [], sort },
) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const categoryItems = processedItems.filter((item) => {
    return categories.length === 0 || categories.includes(item.category);
  });

  const filteredItems = categoryItems.filter((item) => {
    return !normalizedSearch || item.item.toLowerCase().startsWith(normalizedSearch);
  });

  if (sort === 'Sort: Highest Value First') {
    filteredItems.sort((a, b) => b.value - a.value);
  } else if (sort === 'Sort: Lowest Value First') {
    filteredItems.sort((a, b) => a.value - b.value);
  } else if (sort === 'Sort: 0-Z') {
    filteredItems.sort((a, b) =>
      a.item.localeCompare(b.item, undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
    );
  }

  return { categoryItems, filteredItems };
};

export const createValuationCategorySummary = (
  categoryItems,
  totalValuation,
) => {
  const categoryValues = categoryItems.reduce((values, item) => {
    values[item.category] = (values[item.category] || 0) + item.value;
    return values;
  }, {});

  return Object.entries(categoryValues)
    .map(([category, value]) => ({
      category,
      value,
      // Keep percentages based on the complete inventory value.
      pct:
        totalValuation > 0
          ? ((value / totalValuation) * 100).toFixed(1)
          : '0.0',
    }))
    .sort((a, b) => b.value - a.value);
};

const createExportItem = (item) => ({
  Item: item.item,
  Category: item.category,
  Stock: item.stock,
  Unit: item.unit,
  'Cost/Unit (₱)': item.cost,
  'Total Value (₱)': item.value,
  '% Of Total': `${item.pct}%`,
});

const getSafeSheetName = (name) => {
  const invalidCharacters = ['\\', '/', '*', '?', ':', '[', ']'];
  return invalidCharacters
    .reduce((safeName, character) => safeName.replaceAll(character, ''), name)
    .substring(0, 31);
};

export const exportInventoryValuation = ({
  filteredItems,
  filteredTotal,
  totalValuation,
}) => {
  const workbook = XLSX.utils.book_new();
  const allData = filteredItems.map(createExportItem);
  const exportTotalPct =
    totalValuation > 0
      ? ((filteredTotal / totalValuation) * 100).toFixed(1)
      : '0.0';

  allData.push({
    Item: 'FILTERED TOTAL',
    Category: '',
    Stock: '',
    Unit: '',
    'Cost/Unit (₱)': '',
    'Total Value (₱)': filteredTotal,
    '% Of Total': `${exportTotalPct}%`,
  });

  const allSheet = XLSX.utils.json_to_sheet(allData);
  allSheet['!cols'] = [
    { wch: 30 }, { wch: 20 }, { wch: 10 }, { wch: 10 },
    { wch: 15 }, { wch: 20 }, { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(workbook, allSheet, 'All Items');

  const categories = [...new Set(filteredItems.map((item) => item.category))];

  categories.forEach((category) => {
    const categoryItems = filteredItems.filter((item) => {
      return item.category === category;
    });
    const categoryTotal = categoryItems.reduce((total, item) => {
      return total + item.value;
    }, 0);
    const categoryData = categoryItems.map((item) => ({
      Item: item.item,
      Stock: item.stock,
      Unit: item.unit,
      'Cost/Unit (₱)': item.cost,
      'Total Value (₱)': item.value,
      '% Of Total (of Whole Inv)': `${item.pct}%`,
    }));

    categoryData.push({
      Item: `TOTAL ${category.toUpperCase()}`,
      Stock: '',
      Unit: '',
      'Cost/Unit (₱)': '',
      'Total Value (₱)': categoryTotal,
      '% Of Total (of Whole Inv)': '',
    });

    const categorySheet = XLSX.utils.json_to_sheet(categoryData);
    categorySheet['!cols'] = [
      { wch: 30 }, { wch: 10 }, { wch: 10 },
      { wch: 15 }, { wch: 20 }, { wch: 25 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      categorySheet,
      getSafeSheetName(category) || 'Uncategorized',
    );
  });

  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Inventory_Valuation_${today}.xlsx`);
};
