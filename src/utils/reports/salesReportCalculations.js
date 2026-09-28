const getCategoryName = (orderItem) => {
  const menuItem = orderItem.menu_item;

  if (!menuItem || !menuItem.menu_categories) {
    return "Uncategorized";
  }

  return menuItem.menu_categories.category_name;
};

const matchesCategory = (categoryName, selectedCategories = []) => {
  if (selectedCategories.length === 0) {
    return true;
  }

  return selectedCategories.some(
    (selectedCategory) =>
      categoryName.toLowerCase() === selectedCategory.toLowerCase(),
  );
};

const normalizeOrderSource = (source) => {
  const normalizedSource = (source || "In-Store").toLowerCase();

  if (normalizedSource === "foodpanda") return "FoodPanda";
  if (normalizedSource === "grab") return "Grab";

  return "In-Store";
};

// Calculate the values shown in the summary cards.
export const calculateSalesSummary = (orders, wastageRecords) => {
  const totalOrders = orders.length;

  const grossSales = orders.reduce((total, order) => {
    return total + (Number(order.subtotal) || 0);
  }, 0);

  const netSales = orders.reduce((total, order) => {
    return total + (Number(order.total) || 0);
  }, 0);

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

// Calculate top-selling items and category sales.
export const calculateSalesAnalytics = (orders, selectedCategory) => {
  const itemTotals = {};
  const categoryTotals = {};

  orders.forEach((order) => {
    const orderItems = order.order_items || [];

    orderItems.forEach((orderItem) => {
      const menuItem = orderItem.menu_item;

      if (!menuItem) return;

      const categoryName = getCategoryName(orderItem);

      if (!matchesCategory(categoryName, selectedCategory)) {
        return;
      }

      const quantity = Number(orderItem.quantity) || 0;
      const revenue = Number(orderItem.subtotal) || 0;

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
      itemTotals[menuItem.id].revenue += revenue;

      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = {
          cat: categoryName,
          units: 0,
          rev: 0,
        };
      }

      categoryTotals[categoryName].units += quantity;
      categoryTotals[categoryName].rev += revenue;
    });
  });

  const topSelling = Object.values(itemTotals)
    .sort((first, second) => second.sold - first.sold)
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
  const sourceTotals = {
    "In-Store": {
      label: "In-Store",
      value: 0,
      color: "#42A5F5",
    },
    Grab: {
      label: "Grab",
      value: 0,
      color: "#4CAF50",
    },
    FoodPanda: {
      label: "FoodPanda",
      value: 0,
      color: "#E91E63",
    },
  };

  const hourlyTotals = hourlySalesBuckets.map((bucket) => ({
    ...bucket,
    orders: 0,
  }));
  let totalHourlyOrders = 0;

  orders.forEach((order) => {
    const source = normalizeOrderSource(order.order_source);
    const orderTotal = Number(order.total) || 0;

    sourceTotals[source].value += orderTotal;

    if (order.order_datetime) {
      const orderDate = new Date(order.order_datetime);
      const hour = orderDate.getHours();

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

// Calculate estimated profitability for every Menu item and variant.
export const calculateDetailedProfitability = (orders, selectedCategory) => {
  const profitabilityTotals = {};

  orders.forEach((order) => {
    const orderItems = order.order_items || [];

    orderItems.forEach((orderItem) => {
      const menuItem = orderItem.menu_item;

      if (!menuItem) return;

      const categoryName = getCategoryName(orderItem);

      if (!matchesCategory(categoryName, selectedCategory)) {
        return;
      }

      const quantity = Number(orderItem.quantity) || 0;
      const revenue = Number(orderItem.subtotal) || 0;
      const variant = orderItem.variant;
      const isVariant = menuItem.pricing_type === "Variants";

      let variantName = "";
      let sellingPrice = quantity > 0 ? revenue / quantity : 0;
      let estimatedCost = 0;
      let variantId = "single";

      if (variant) {
        variantId = variant.id;
        sellingPrice = Number(variant.selling_price) || sellingPrice;
        estimatedCost = Number(variant.estimated_cost) || 0;

        if (isVariant && variant.variant_name) {
          variantName = ` (${variant.variant_name})`;
        }
      }

      const uniqueKey = `${menuItem.id}-${variantId}`;

      if (!profitabilityTotals[uniqueKey]) {
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
      profitabilityTotals[uniqueKey].revenue += revenue;
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

  return {
    maxQty: Math.max(...quantities, 1),
    maxRev: Math.max(...revenues, 1),
  };
};

export const getQuadrantColorClass = (quadrant) => {
  if (quadrant === "Promote More") return "b-blue";
  if (quadrant === "Improve Pricing") return "b-yellow";
  if (quadrant === "Review or Remove") return "b-red";

  return "b-green";
};
