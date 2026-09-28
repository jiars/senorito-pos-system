import axios from 'axios';

// Create a customized instance of Axios
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// This "Interceptor" catches every request right before it leaves the app.
// It grabs the token from localStorage and securely attaches it.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token')
    if (token)
        config.headers.Authorization = `Bearer ${token}`
    return config
}, (error) => {
    return Promise.reject(error)
})

export default api;
