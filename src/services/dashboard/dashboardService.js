import { supabase } from '../supabaseClient';

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
};

export const getTodayMetrics = async () => {
  const { start, end } = getTodayRange();

  // 1. Fetch today's orders
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, total')
    .gte('order_datetime', start)
    .lte('order_datetime', end)
    .neq('status', 'Cancelled');
    
  if (ordersError) throw ordersError;

  const totalSales = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const orderCount = orders.length;

  // 2. Fetch today's expenses
  // expense_date might be date only or timestamp
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('amount')
    .gte('expense_date', start.split('T')[0]); 
    
  if (expensesError) throw expensesError;

  const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

  // 3. Fetch low stock count (requires fetching all active to compare current vs min)
  const { data: inventory, error: stockError } = await supabase
    .from('inventory_items')
    .select('id, current_stock, minimum_level')
    .eq('archived', false);
    
  if (stockError) throw stockError;

  const lowStockCount = inventory.filter(item => item.current_stock <= item.minimum_level).length;

  return {
    totalSales,
    orderCount,
    totalExpenses,
    lowStockCount
  };
};

export const getInventoryAlerts = async () => {
  // Low Stock Items (Top 5)
  const { data: inventory } = await supabase
    .from('inventory_items')
    .select('item_name, current_stock, minimum_level, base_unit')
    .eq('archived', false);
    
  const lowStockItems = (inventory || [])
    .filter(item => item.current_stock <= item.minimum_level)
    .map(item => ({
      name: item.item_name,
      min: item.minimum_level,
      qty: item.current_stock,
      unit: item.base_unit,
      level: item.current_stock <= 0 ? 'critical' : 'warning'
    }))
    .sort((a, b) => b.qty - a.qty);

  // Near Expiry / Expired Batches
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const { data: batches } = await supabase
    .from('inventory_batches')
    .select(`
      batch_number,
      expiration_date,
      quantity,
      inventory_items!inner(item_name, base_unit, archived)
    `)
    .eq('inventory_items.archived', false);

  const expiryItems = (batches || [])
    .map(batch => {
      if (!batch.expiration_date) return null; // Skip if no expiration date
      const expDate = new Date(batch.expiration_date);
      const isExpired = expDate < today;
      const isExpiring = expDate >= today && expDate <= nextWeek;
      
      if (!isExpired && !isExpiring) return null;

      return {
        name: batch.inventory_items?.item_name || 'Unknown',
        batch: batch.batch_number,
        size: `${batch.quantity} ${batch.inventory_items?.base_unit}`,
        exp: expDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        status: isExpired ? 'expired' : 'expiring',
        rawDate: expDate
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.rawDate - a.rawDate);

  return { lowStockItems, expiryItems };
};

export const getWeeklySales = async () => {
  // Last 7 days
  const data = [];
  const today = new Date();
  
  // Calculate date boundaries for the current week (Sunday to Saturday)
  const dateRanges = [];
  const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    d.setHours(0, 0, 0, 0);
    const start = d.toISOString();
    
    const endD = new Date(d);
    endD.setHours(23, 59, 59, 999);
    const end = endD.toISOString();

    const displayDay = d.toLocaleDateString('en-US', { weekday: 'short' }); // "Sun", "Mon"
    dateRanges.push({ start, end, day: displayDay });
  }

  // Fetch all orders for the last 7 days in one query to save network requests
  const oldestStart = dateRanges[0].start;
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('order_datetime, total')
    .gte('order_datetime', oldestStart)
    .neq('status', 'Cancelled');

  // Group by day
  dateRanges.forEach(range => {
    const ordersInDay = (recentOrders || []).filter(o => 
      o.order_datetime >= range.start && o.order_datetime <= range.end
    );
    const total = ordersInDay.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    data.push({ day: range.day, value: total });
  });

  return data;
};

export const getTopSellingItems = async () => {
  // Get all order items from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0,0,0,0);

  const { data: orderItems } = await supabase
    .from('order_items')
    .select(`
      quantity,
      subtotal,
      orders!inner(order_datetime),
      menu_items(item_name, category_id, menu_categories(category_name))
    `)
    .gte('orders.order_datetime', sevenDaysAgo.toISOString());

  if (!orderItems) return [];

  const aggregated = {};

  orderItems.forEach(item => {
    const name = item.menu_items?.item_name || 'Unknown';
    const category = item.menu_items?.menu_categories?.category_name || 'Uncategorized';
    
    if (!aggregated[name]) {
      aggregated[name] = { name, category, price: 0, sold: 0 };
    }
    
    aggregated[name].sold += Number(item.quantity) || 0;
    aggregated[name].price += Number(item.subtotal) || 0;
  });

  const sorted = Object.values(aggregated).sort((a, b) => b.sold - a.sold).slice(0, 6); // Top 6
  
  return sorted.map((item, index) => ({
    rank: index + 1,
    category: item.category,
    name: item.name,
    price: item.price,
    sold: item.sold
  }));
};

export const getRecentOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      order_datetime,
      total,
      payment_method,
      status,
      cashier:profiles(first_name, last_name)
    `)
    .order('order_datetime', { ascending: false })
    .limit(15);

  if (error) throw error;
  
  return data.map(order => ({
    orderNo: order.order_number,
    cashier: order.cashier ? `${order.cashier.first_name} ${order.cashier.last_name}` : 'Admin / System',
    total: Number(order.total) || 0,
    payment: order.payment_method,
    status: order.status || 'Completed',
    date: new Date(order.order_datetime).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '')
  }));
};
