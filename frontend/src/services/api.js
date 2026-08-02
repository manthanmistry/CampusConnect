import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5000/uploads';

const api = axios.create({
  baseURL: API_URL,
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('campusconnect_user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Global 401 handling - log the user out if the token is invalid/expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('campusconnect_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getImageUrl = (filename) => {
  if (!filename) return null;
  return `${UPLOADS_URL}/${filename}`;
};

export default api;
