import { supabase } from "../supabaseClient";

// Helper to construct date filters
const applyDateFilters = (query, dateField, startDate, endDate) => {
  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    query = query.gte(dateField, start.toISOString());
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    query = query.lte(dateField, end.toISOString());
  }
  return query;
};

// 1. Fetch Sales Summary Cards
export const fetchSalesSummary = async (startDate, endDate, source = 'All Order Sources', category = 'All Categories') => {
  try {
    let ordersQuery = supabase
      .from('orders')
      .select('id, subtotal, total, status, order_source, order_datetime, order_items(menu_items(menu_categories(category_name)))')
      .neq('status', 'Cancelled');

    ordersQuery = applyDateFilters(ordersQuery, 'order_datetime', startDate, endDate);
    if (source !== 'All Order Sources') {
      ordersQuery = ordersQuery.ilike('order_source', source);
    }

    const { data: ordersData, error: ordersError } = await ordersQuery;
    if (ordersError) throw ordersError;

    // Filter unique orders that contain the selected category
    const validOrders = ordersData.filter(order => {
      if (category === 'All Categories') return true;
      if (!order.order_items || order.order_items.length === 0) return false;
      return order.order_items.some(oi => {
        const catName = oi.menu_items?.menu_categories?.category_name || 'Uncategorized';
        return catName.toLowerCase() === category.toLowerCase();
      });
    });

    // Wastage query (Matching Expense Tracking Logic)
    let wastageQuery = supabase
      .from('expenses')
      .select('amount, expense_categories!inner(category_name)')
      .eq('expense_categories.category_name', 'Inventory Wastage');

    wastageQuery = applyDateFilters(wastageQuery, 'expense_date', startDate, endDate);
    const { data: wastageData, error: wastageError } = await wastageQuery;
    if (wastageError) throw wastageError;

    // Calculations
    const totalOrders = validOrders.length;
    const grossSales = validOrders.reduce((sum, order) => sum + (Number(order.subtotal) || 0), 0);
    const netSales = validOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    const avgOrderValue = totalOrders > 0 ? (netSales / totalOrders) : 0;
    const totalWastageCost = wastageData.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

    return {
      totalOrders,
      grossSales,
      netSales,
      avgOrderValue,
      totalWastageCost
    };
  } catch (error) {
    console.error("Error fetching sales summary:", error);
    throw error;
  }
};

// 2. Fetch Top Selling Items & Category Breakdowns
export const fetchSalesAnalytics = async (startDate, endDate, source = 'All Order Sources', category = 'All Categories') => {
  try {
    let query = supabase
      .from('order_items')
      .select(`
        quantity,
        subtotal,
        orders!inner(order_datetime, status, order_source),
        menu_items(id, item_name, category_id, menu_categories(category_name))
      `)
      .neq('orders.status', 'Cancelled');

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query = query.gte('orders.order_datetime', start.toISOString());
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query = query.lte('orders.order_datetime', end.toISOString());
    }
    if (source !== 'All Order Sources') {
      query = query.ilike('orders.order_source', source);
    }

    const { data, error } = await query;
    if (error) throw error;

    const itemMap = {};
    const catMap = {};

    data.forEach(item => {
      const qty = Number(item.quantity) || 0;
      const sub = Number(item.subtotal) || 0;
      const menuItem = item.menu_items;
      if (!menuItem) return;

      const itemId = menuItem.id;
      const itemName = menuItem.item_name;
      const catName = menuItem.menu_categories ? menuItem.menu_categories.category_name : 'Uncategorized';

      if (category !== 'All Categories' && catName.toLowerCase() !== category.toLowerCase()) {
        return; // Skip if it doesn't match the category filter
      }

      // Top Selling Aggregation
      if (!itemMap[itemId]) {
        itemMap[itemId] = { name: itemName, category: catName, sold: 0, revenue: 0 };
      }
      itemMap[itemId].sold += qty;
      itemMap[itemId].revenue += sub;

      // Category Aggregation
      if (!catMap[catName]) {
        catMap[catName] = { cat: catName, units: 0, rev: 0 };
      }
      catMap[catName].units += qty;
      catMap[catName].rev += sub;
    });

    const topSelling = Object.values(itemMap)
      .sort((a, b) => b.sold - a.sold)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));

    const totalRevenue = Object.values(catMap).reduce((sum, cat) => sum + cat.rev, 0);
    const categorySales = Object.values(catMap).map(cat => ({
      ...cat,
      pct: totalRevenue > 0 ? (cat.rev / totalRevenue) * 100 : 0
    })).sort((a, b) => b.rev - a.rev);

    return { topSelling, categorySales };
  } catch (error) {
    console.error("Error fetching sales analytics:", error);
    throw error;
  }
};

// 3. Fetch Sales by Source & Hourly Trend
export const fetchOrderTrends = async (startDate, endDate, sourceFilter = 'All Order Sources', category = 'All Categories') => {
  try {
    let query = supabase
      .from('orders')
      .select('id, order_datetime, total, order_source, status, order_items(menu_items(menu_categories(category_name)))')
      .neq('status', 'Cancelled');

    query = applyDateFilters(query, 'order_datetime', startDate, endDate);
    if (sourceFilter !== 'All Order Sources') {
      query = query.ilike('order_source', sourceFilter);
    }
    const { data: ordersData, error } = await query;
    if (error) throw error;

    // Hourly Pattern ignores category filter
    const allOrders = ordersData;

    // Order Source respects category filter
    const categoryOrders = ordersData.filter(order => {
      if (category === 'All Categories') return true;
      if (!order.order_items || order.order_items.length === 0) return false;
      return order.order_items.some(oi => {
        const catName = oi.menu_items?.menu_categories?.category_name || 'Uncategorized';
        return catName.toLowerCase() === category.toLowerCase();
      });
    });

    const sourceMap = {
      'In-Store': { label: 'In-Store', value: 0, color: '#42A5F5' },
      'Grab': { label: 'Grab', value: 0, color: '#4CAF50' },
      'FoodPanda': { label: 'FoodPanda', value: 0, color: '#E91E63' },
    };

    const hourlyMap = {};

    // Source Chart respects category filter
    categoryOrders.forEach(order => {
      const total = Number(order.total) || 0;
      let source = order.order_source || 'In-Store';

      if (source.toLowerCase() === 'foodpanda') source = 'FoodPanda';
      if (source.toLowerCase() === 'grab') source = 'Grab';
      if (source.toLowerCase() === 'in-store') source = 'In-Store';

      if (sourceMap[source]) {
        sourceMap[source].value += total;
      } else {
        sourceMap[source] = { label: source, value: total, color: '#9E9E9E' };
      }
    });

    // Hourly Pattern ignores category filter
    allOrders.forEach(order => {
      if (order.order_datetime) {
        const dateObj = new Date(order.order_datetime);
        const hour = dateObj.getHours(); // 0-23
        const displayHour = hour === 0 ? '12AM' : hour < 12 ? `${hour}AM` : hour === 12 ? '12PM' : `${hour - 12}PM`;

        if (!hourlyMap[displayHour]) {
          hourlyMap[displayHour] = { time: displayHour, orders: 0, orderHour: hour };
        }
        hourlyMap[displayHour].orders += 1;
      }
    });

    const totalSourceRev = Object.values(sourceMap).reduce((sum, s) => sum + s.value, 0);
    const sourceData = Object.values(sourceMap).map(s => ({
      ...s,
      pct: totalSourceRev > 0 ? (s.value / totalSourceRev) * 100 : 0
    }));

    const hourlyData = Object.values(hourlyMap)
      .sort((a, b) => a.orderHour - b.orderHour)
      .map(h => ({ time: h.time, orders: h.orders }));

    return { sourceData, hourlyData };
  } catch (error) {
    console.error("Error fetching order trends:", error);
    throw error;
  }
};

// 4. Fetch Detailed Profitability
export const fetchDetailedProfitability = async (startDate, endDate, source = 'All Order Sources', category = 'All Categories') => {
  try {
    let query = supabase
      .from('order_items')
      .select(`
        quantity,
        subtotal,
        orders!inner(order_datetime, status, order_source),
        menu_items(
          id, 
          item_name, 
          pricing_type,
          menu_categories(category_name)
        ),
        menu_item_prices(id, variant_name, selling_price, estimated_cost)
      `)
      .neq('orders.status', 'Cancelled');

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query = query.gte('orders.order_datetime', start.toISOString());
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query = query.lte('orders.order_datetime', end.toISOString());
    }
    if (source !== 'All Order Sources') {
      query = query.ilike('orders.order_source', source);
    }

    const { data: orderItemsData, error: orderError } = await query;
    if (orderError) throw orderError;

    const profMap = {};

    orderItemsData.forEach(item => {
      if (!item.menu_items) return;

      const isVariant = item.menu_items.pricing_type === 'Variants';
      const variantName = isVariant && item.menu_item_prices ? ` (${item.menu_item_prices.variant_name})` : '';
      const displayItemName = `${item.menu_items.item_name}${variantName}`;
      const uniqueKey = `${item.menu_items.id}${variantName}`;
      const catName = item.menu_items.menu_categories ? item.menu_items.menu_categories.category_name : 'Uncategorized';

      if (category !== 'All Categories' && catName.toLowerCase() !== category.toLowerCase()) {
        return; // Skip if it doesn't match category
      }

      const qty = Number(item.quantity) || 0;
      const rev = Number(item.subtotal) || 0;
      const sellingPrice = Number(item.menu_item_prices?.selling_price) || (qty > 0 ? rev / qty : 0);
      const itemCost = Number(item.menu_item_prices?.estimated_cost) || 0;

      if (!profMap[uniqueKey]) {
        profMap[uniqueKey] = {
          item: displayItemName,
          category: catName,
          price: sellingPrice,
          cost: itemCost,
          qty: 0,
          revenue: 0,
        };
      } else {
        // If the cached price/cost was 0 (e.g. from a buggy old order), update it with the valid one
        if (profMap[uniqueKey].price === 0 && sellingPrice > 0) {
          profMap[uniqueKey].price = sellingPrice;
        }
        if (profMap[uniqueKey].cost === 0 && itemCost > 0) {
          profMap[uniqueKey].cost = itemCost;
        }
      }
      profMap[uniqueKey].qty += qty;
      profMap[uniqueKey].revenue += rev;
    });

    const detailedList = Object.values(profMap).map(p => {
      const profitPerItem = p.price - p.cost;
      const totalProfit = profitPerItem * p.qty;
      const margin = p.price > 0 ? (profitPerItem / p.price) * 100 : 0;

      let quad = 'Review or Remove';
      let cls = 'row-dog';
      let badge = 'remove';

      if (margin > 40 && p.qty >= 5) {
        quad = 'Top Performer'; cls = 'row-star'; badge = 'star';
      } else if (margin > 40 && p.qty < 5) {
        quad = 'Promote More'; cls = 'row-potential'; badge = 'promote';
      } else if (margin <= 40 && p.qty >= 5) {
        quad = 'Improve Pricing'; cls = 'row-cashcow'; badge = 'pricing';
      }

      return {
        ...p,
        profitPerItem,
        totalProfit,
        margin,
        quad,
        cls,
        badge
      };
    }).sort((a, b) => b.totalProfit - a.totalProfit);

    return detailedList;
  } catch (error) {
    console.error("Error fetching profitability:", error);
    throw error;
  }
};
