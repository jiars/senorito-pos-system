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
    if (!response.ok) throw new Error('Failed to fetch dashboard summary');
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard summary:', error.message);
    return [];
  }
};