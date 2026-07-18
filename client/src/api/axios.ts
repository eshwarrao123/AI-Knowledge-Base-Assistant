import axios from 'axios';

// ─── Toast helper (lightweight, no dep) ──────────────────────────────────────
const showToast = (msg: string, type: 'error' | 'warn' = 'error'): void => {
  const div = document.createElement('div');
  const colors = type === 'error'
    ? 'background:#dc2626;color:#fff'
    : 'background:#d97706;color:#fff';
  div.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;padding:12px 18px;border-radius:12px;${colors};font-size:14px;font-family:inherit;box-shadow:0 4px 24px rgba(0,0,0,.4);max-width:320px`;
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 4000);
};

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor: global error handling ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status: number | undefined = error.response?.status;

    if (!error.response) {
      // Network error / CORS / server down
      showToast('Connection lost. Please check your network.');
      return Promise.reject(error);
    }

    switch (status) {
      case 401:
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
      case 403:
        showToast('Access denied.');
        break;
      case 429:
        showToast('Too many requests. Please slow down.', 'warn');
        break;
      case 500:
      case 503:
        showToast('Server error. Please try again later.');
        break;
      default:
        break;
    }

    return Promise.reject(error);
  },
);

export default api;
