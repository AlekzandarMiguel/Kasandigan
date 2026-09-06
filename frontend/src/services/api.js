import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kasandigan_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to extract a friendly error message from DRF responses
export const extractErrorMessage = (error) => {
  if (!error.response) {
    return 'Unable to connect to Kasandigan server. Please check your internet connection.';
  }
  const status = error.response.status;
  const data = error.response.data;

  if (status === 429) {
    return data?.detail || 'Rate limit reached. You are making requests too quickly, please wait a moment.';
  }

  if (status === 403) {
    return data?.detail || 'Access restricted. You do not have permission for this barangay action.';
  }

  if (status === 404) {
    return data?.detail || 'The requested record was not found.';
  }

  if (status >= 500) {
    return 'The server encountered an issue processing this request. Please try again shortly.';
  }

  if (typeof data === 'object' && data !== null) {
    if (data.detail) return String(data.detail);
    if (data.message) return String(data.message);
    const firstVal = Object.values(data)[0];
    if (Array.isArray(firstVal)) return String(firstVal[0]);
    if (typeof firstVal === 'string') return firstVal;
  }

  return error.message || 'An unexpected error occurred.';
};

// Response interceptor: handle token refresh on 401 & normalize errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Attach human-friendly message directly to the error object
    error.userMessage = extractErrorMessage(error);

    // Handle token refresh on 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('kasandigan_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem('kasandigan_access_token', newAccess);
          api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('kasandigan_access_token');
          localStorage.removeItem('kasandigan_refresh_token');
          localStorage.removeItem('kasandigan_user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } else {
        localStorage.removeItem('kasandigan_access_token');
        localStorage.removeItem('kasandigan_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
