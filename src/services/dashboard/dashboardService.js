export const fetchDashboardSummary = async () => {
  const token = localStorage.getItem('auth_token');
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const error = new Error('Failed to fetch dashboard summary');
      error.status = response.status;
      throw error;
    }

    const data = await response.json();

    // Reject missing sections rather than rendering a broken or empty Dashboard.
    if (
      !data || !data.metrics || !data.alerts ||
      !Array.isArray(data.alerts.lowStockItems) ||
      !Array.isArray(data.alerts.expiryItems) ||
      !Array.isArray(data.weeklySales) ||
      !Array.isArray(data.topItems) ||
      !Array.isArray(data.recentOrders)
    ) {
      const error = new Error('Invalid dashboard summary response');
      error.code = 'DASHBOARD_INVALID_RESPONSE';
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
};
