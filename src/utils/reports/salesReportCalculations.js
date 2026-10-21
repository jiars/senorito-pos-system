import { getBusinessHour } from "@/utils/shared/formatters/businessDates";
import { normalizeOrderSource, orderSourceOptions } from "@/utils/orders/orderOptions";
import { calculateEstCost } from "@/utils/menu/pricingCalculations";
import { getSalesCategory, matchesSalesCategory, getSalesCents } from "./salesRevenue";

// Calculate the values shown in the summary cards.
export const calculateSalesSummary = (orders, wastageRecords) => {
  const totalOrders = orders.length;

  const grossSales = orders.reduce((total, order) => {
    return total + getSalesCents(order.subtotal);
  }, 0) / 100;

  const netSales = orders.reduce((total, order) => {
    return total + getSalesCents(order.total);
  }, 0) / 100;

  const avgOrderValue = totalOrders > 0 ? netSales / totalOrders : 0;

  const totalWastageCost = wastageRecords.reduce((total, record) => {
    const quantityRemoved = Math.abs(Number(record.quantity_change) || 0);
    const batch = record.inventory_batch;
    const unitCost = batch ? Number(batch.unit_cost) || 0 : 0;

    return total + quantityRemoved * unitCost;
  }, 0);

  return {
    totalOrders,
    grossSales,
    netSales,
    avgOrderValue,
    totalWastageCost,
  };
};

const isArchivedOrderItem = (orderItem) => {
  if (orderItem.menu_item.archived) return true;
  if (orderItem.variant && orderItem.variant.archived) return true;
  return false;
};

// Item rankings exclude archived records; category sales retain historical revenue.
export const calculateSalesAnalytics = (orders, selectedCategory) => {
  const itemTotals = {};
  const categoryTotals = {};

  orders.forEach((order) => {
    const orderItems = order.order_items || [];

    orderItems.forEach((orderItem) => {
      const menuItem = orderItem.menu_item;

      const categoryName = getSalesCategory(orderItem);

      if (!matchesSalesCategory(categoryName, selectedCategory)) {
        return;
      }

      const quantity = Number(orderItem.quantity) || 0;
      const revenueCents = getSalesCents(orderItem.report_net_subtotal ?? orderItem.subtotal);

      if (menuItem && !isArchivedOrderItem(orderItem)) {
        if (!itemTotals[menuItem.id]) {
          itemTotals[menuItem.id] = {
            id: menuItem.id,
            name: menuItem.item_name,
            image_url: menuItem.image_url,
            category: categoryName,
            sold: 0,
            revenue: 0,
          };
        }

        itemTotals[menuItem.id].sold += quantity;
        itemTotals[menuItem.id].revenue =
          (getSalesCents(itemTotals[menuItem.id].revenue) + revenueCents) / 100;
      }

      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = {
          cat: categoryName,
          units: 0,
          rev: 0,
        };
      }

      categoryTotals[categoryName].units += quantity;
      categoryTotals[categoryName].rev =
        (getSalesCents(categoryTotals[categoryName].rev) + revenueCents) / 100;
    });
  });

  const topSelling = Object.values(itemTotals)
    .sort((first, second) => {
      const quantityDifference = second.sold - first.sold;
      if (quantityDifference !== 0) return quantityDifference;
      // Dashboard uses the same stable tie-breaker for equal quantities sold.
      return String(first.id).localeCompare(String(second.id));
    })
    .map((item, index) => {
      return {
        ...item,
        rank: index + 1,
      };
    });

  const totalRevenue = Object.values(categoryTotals).reduce(
    (total, category) => total + category.rev,
    0,
  );

  const categorySales = Object.values(categoryTotals)
    .map((category) => {
      return {
        ...category,
        pct: totalRevenue > 0 ? (category.rev / totalRevenue) * 100 : 0,
      };
    })
    .sort((first, second) => second.rev - first.rev);

  return {
    topSelling,
    categorySales,
  };
};

const hourlySalesBuckets = [
  { time: "8–10 AM", startHour: 8, endHour: 10 },
  { time: "10–12 NN", startHour: 10, endHour: 12 },
  { time: "12–2 PM", startHour: 12, endHour: 14 },
  { time: "2–4 PM", startHour: 14, endHour: 16 },
  { time: "4–6 PM", startHour: 16, endHour: 18 },
  { time: "6–8 PM", startHour: 18, endHour: 20 },
  { time: "8–10 PM", startHour: 20, endHour: 22 },
  { time: "10 PM–12 AM", startHour: 22, endHour: 24 },
];

// Calculate sales by source and order totals for each fixed two-hour period.
export const calculateOrderTrends = (orders) => {
  const sourceColors = {
    "In-Store": "#7189A6",
    Foodpanda: "#D47A82",
    Grab: "#6F9C8F",
  };
  const sourceTotals = {};
  orderSourceOptions.forEach((source) => {
    sourceTotals[source.value] = {
      label: source.label,
      value: 0,
      color: sourceColors[source.value],
    };
  });

  const hourlyTotals = hourlySalesBuckets.map((bucket) => ({
    ...bucket,
    orders: 0,
  }));
  let totalHourlyOrders = 0;

  orders.forEach((order) => {
    let source = normalizeOrderSource(order.order_source);
    // Preserve the report's existing In-Store fallback for missing/unknown sources.
    if (!Object.hasOwn(sourceTotals, source)) source = "In-Store";
    const orderTotal = Number(order.total) || 0;

    sourceTotals[source].value =
      (getSalesCents(sourceTotals[source].value) + getSalesCents(orderTotal)) / 100;

    if (order.order_datetime) {
      const hour = getBusinessHour(order.order_datetime);

      const bucketIndex = hourlyTotals.findIndex(
        (bucket) => hour >= bucket.startHour && hour < bucket.endHour,
      );

      if (bucketIndex >= 0) {
        hourlyTotals[bucketIndex].orders += 1;
        totalHourlyOrders += 1;
      }
    }
  });

  const totalSourceRevenue = Object.values(sourceTotals).reduce(
    (total, source) => total + source.value,
    0,
  );

  const sourceData = Object.values(sourceTotals).map((source) => {
    return {
      ...source,
      pct:
        totalSourceRevenue > 0 ? (source.value / totalSourceRevenue) * 100 : 0,
    };
  });

  const hourlyData = hourlyTotals.map(({ time, orders }) => ({
    time,
    orders,
  }));

  return {
    sourceData,
    hourlyData,
    totalHourlyOrders,
  };
};

const getCurrentRecipeCost = (menuItem, variantId) => {
  // Do not present a missing recipe response as zero cost / 100% margin.
  if (!Array.isArray(menuItem.menu_recipes) || !Array.isArray(menuItem.menu_prices)) {
    return null;
  }

  const recipes = menuItem.menu_recipes.filter((recipe) => {
    return recipe.menu_item_price_id === variantId ||
      (menuItem.menu_prices.length === 1 && recipe.menu_item_price_id == null);
  });
  if (recipes.length === 0 || recipes.some((recipe) => !recipe.inventory_items)) {
    return null;
  }

  const ingredients = recipes.map((recipe) => {
    return {
      ingredientId: recipe.inventory_item_id,
      qty: recipe.quantity,
      unit: recipe.unit,
    };
  });
  const inventoryItems = recipes.map((recipe) => {
    return recipe.inventory_items;
  });

  return calculateEstCost(ingredients, inventoryItems);
};

// Current recipe estimates combined with sales quantities from the selected period.
export const calculateDetailedProfitability = (orders, selectedCategory) => {
  const profitabilityTotals = {};

  orders.forEach((order) => {
    const orderItems = order.order_items || [];

    orderItems.forEach((orderItem) => {
      const menuItem = orderItem.menu_item;

      if (!menuItem || isArchivedOrderItem(orderItem)) return;

      const categoryName = getSalesCategory(orderItem);

      if (!matchesSalesCategory(categoryName, selectedCategory)) {
        return;
      }

      const quantity = Number(orderItem.quantity) || 0;
      const revenue = Number(orderItem.report_net_subtotal ?? orderItem.subtotal) || 0;
      const variant = orderItem.variant;
      const isVariant = menuItem.pricing_type === "Variants";

      let variantName = "";
      let sellingPrice = quantity > 0 ? revenue / quantity : 0;
      let variantId = "single";

      if (variant) {
        variantId = variant.id;
        sellingPrice = Number(variant.selling_price) || sellingPrice;

        if (isVariant && variant.variant_name) {
          variantName = ` (${variant.variant_name})`;
        }
      }

      const uniqueKey = `${menuItem.id}-${variantId}`;

      if (!profitabilityTotals[uniqueKey]) {
        const estimatedCost = getCurrentRecipeCost(menuItem, variantId);
        if (estimatedCost === null || !Number.isFinite(estimatedCost)) return;
        profitabilityTotals[uniqueKey] = {
          item: `${menuItem.item_name}${variantName}`,
          category: categoryName,
          price: sellingPrice,
          cost: estimatedCost,
          qty: 0,
          revenue: 0,
        };
      }

      profitabilityTotals[uniqueKey].qty += quantity;
      profitabilityTotals[uniqueKey].revenue =
        (getSalesCents(profitabilityTotals[uniqueKey].revenue) + getSalesCents(revenue)) / 100;
    });
  });

  return Object.values(profitabilityTotals)
    .map((item) => {
      const profitPerItem = item.price - item.cost;
      const totalProfit = profitPerItem * item.qty;
      const margin = item.price > 0 ? (profitPerItem / item.price) * 100 : 0;

      let quad = "Review or Remove";
      let cls = "row-dog";
      let badge = "remove";

      if (margin > 40 && item.qty >= 5) {
        quad = "Top Performer";
        cls = "row-star";
        badge = "star";
      } else if (margin > 40 && item.qty < 5) {
        quad = "Promote More";
        cls = "row-potential";
        badge = "promote";
      } else if (margin <= 40 && item.qty >= 5) {
        quad = "Improve Pricing";
        cls = "row-cashcow";
        badge = "pricing";
      }

      return {
        ...item,
        profitPerItem,
        totalProfit,
        margin,
        quad,
        cls,
        badge,
      };
    })
    .sort((first, second) => second.totalProfit - first.totalProfit);
};

export const calculateQuadrantCounts = (profitability) => {
  const counts = {
    "Top Performer": 0,
    "Promote More": 0,
    "Improve Pricing": 0,
    "Review or Remove": 0,
  };

  profitability.forEach((item) => {
    if (counts[item.quad] !== undefined) {
      counts[item.quad] += 1;
    }
  });

  return counts;
};

export const calculateHourlyOverview = (hourlyData, totalHourlyOrders) => {
  const safeHourlyData =
    hourlyData.length > 0 ? hourlyData : [{ time: "N/A", orders: 0 }];

  const maxOrders = Math.max(...safeHourlyData.map((item) => item.orders));

  const peakHour = safeHourlyData.reduce((highest, current) => {
    return current.orders > highest.orders ? current : highest;
  });

  const totalOrders =
    totalHourlyOrders ??
    safeHourlyData.reduce((total, item) => total + item.orders, 0);

  const stepSize = maxOrders > 0 ? Math.ceil(maxOrders / 4) : 1;

  const maximumLabel = maxOrders > 0 ? stepSize * 4 : 4;

  const yAxisLabels = [];

  for (let value = maximumLabel; value >= 0; value -= stepSize) {
    yAxisLabels.push(value);
  }

  return {
    safeHourlyData,
    maxOrders,
    peakHour,
    totalOrders,
    yAxisLabels,
  };
};

export const calculateHeatmapLimits = (profitability) => {
  const quantities = profitability.map((item) => item.qty);
  const revenues = profitability.map((item) => item.revenue);
  const margins = profitability.map((item) => item.margin);

  return {
    maxQty: Math.max(...quantities, 6),
    maxRev: Math.max(...revenues, 1),
    minMargin: Math.floor(Math.min(...margins, 0) / 20) * 20,
    maxMargin: Math.ceil(Math.max(...margins, 100) / 20) * 20,
  };
};

// Leave room around the plot edges without changing the actual margin values.
export const getHeatmapMarginPosition = (margin, minMargin, maxMargin) => {
  return 10 + ((margin - minMargin) / (maxMargin - minMargin)) * 80;
};

export const getQuadrantColorClass = (quadrant) => {
  if (quadrant === "Promote More") return "b-blue";
  if (quadrant === "Improve Pricing") return "b-yellow";
  if (quadrant === "Review or Remove") return "b-red";

  return "b-green";
};
