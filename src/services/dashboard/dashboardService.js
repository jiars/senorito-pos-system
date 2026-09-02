export const fetchDashboardSummary = async () => {
  const token = localStorage.getItem('auth_token');

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};
