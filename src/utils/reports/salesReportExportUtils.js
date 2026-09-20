import * as XLSX from "xlsx";

const appendSheet = (workbook, rows, columns, sheetName) => {
  const sheet = XLSX.utils.json_to_sheet(rows);

  sheet["!cols"] = columns.map((width) => ({ wch: width }));
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
};

export const exportSalesReport = ({
  summaryData,
  topSellingItems,
  sourceData,
  categorySales,
  detailedProfitability,
  hourlyData,
}) => {
  const workbook = XLSX.utils.book_new();

  appendSheet(
    workbook,
    [
      { Metric: "Total Orders", Value: summaryData.totalOrders },
      { Metric: "Gross Revenue", Value: summaryData.grossSales },
      { Metric: "Net Revenue", Value: summaryData.netSales },
      { Metric: "Average Order Value", Value: summaryData.avgOrderValue },
      { Metric: "Wastage / Shrinkage", Value: summaryData.totalWastageCost },
    ],
    [28, 20],
    "Summary",
  );

  appendSheet(
    workbook,
    topSellingItems.map((item) => ({
      Rank: item.rank,
      Item: item.name,
      Category: item.category,
      "Units Sold": item.sold,
      Revenue: item.revenue,
    })),
    [8, 30, 20, 14, 18],
    "Top Selling Items",
  );

  appendSheet(
    workbook,
    sourceData.map((source) => ({
      "Order Source": source.label,
      Revenue: source.value,
      "% of Total": String(source.pct.toFixed(1)) + "%",
    })),
    [20, 18, 14],
    "Sales by Source",
  );

  appendSheet(
    workbook,
    categorySales.map((category) => ({
      Category: category.cat,
      "Units Sold": category.units,
      Revenue: category.rev,
      "% of Total": String(category.pct.toFixed(1)) + "%",
    })),
    [24, 14, 18, 14],
    "Sales by Category",
  );

  appendSheet(
    workbook,
    detailedProfitability.map((item) => ({
      Item: item.item,
      Category: item.category,
      Price: item.price,
      "Estimated Cost": item.cost,
      "Profit / Item": item.profitPerItem,
      "Margin %": String(item.margin.toFixed(1)) + "%",
      "Units Sold": item.qty,
      Revenue: item.revenue,
      Quadrant: item.quad,
    })),
    [30, 20, 14, 16, 16, 12, 14, 18, 20],
    "Menu Profitability",
  );

  appendSheet(
    workbook,
    hourlyData.map((item) => ({
      "Time Period": item.time,
      Orders: item.orders,
    })),
    [20, 14],
    "Hourly Sales",
  );

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, "Sales_Report_" + today + ".xlsx");
};
