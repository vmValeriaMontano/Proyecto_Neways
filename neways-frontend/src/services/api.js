import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
const apiBaseUrl = /\/api$/.test(apiUrl) ? apiUrl : `${apiUrl}/api`;

const API = axios.create({
  baseURL: apiBaseUrl,
});

// Interceptor para agregar token a peticiones protegidas
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;