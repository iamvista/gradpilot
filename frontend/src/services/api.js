/**
 * API 服務層
 * Centralized API calls
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 創建 axios 實例
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器 - 添加 JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 響應攔截器 - 處理錯誤
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 不在這裡自動重定向，讓 AuthContext 統一處理認證錯誤
    // 只記錄錯誤以便除錯
    if (error.response?.status === 401) {
      console.warn('API returned 401 Unauthorized:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

// 認證 API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  refresh: () => api.post('/auth/refresh'),
};

// 待辦事項 API
export const todosAPI = {
  getAll: (params) => api.get('/todos', { params }),
  getOne: (id) => api.get(`/todos/${id}`),
  create: (data) => api.post('/todos', data),
  update: (id, data) => api.put(`/todos/${id}`, data),
  delete: (id) => api.delete(`/todos/${id}`),
};

// 筆記 API
export const notesAPI = {
  getAll: (params) => api.get('/notes', { params }),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

// 番茄鐘 API
export const pomodoroAPI = {
  getSessions: (params) => api.get('/pomodoro/sessions', { params }),
  createSession: (data) => api.post('/pomodoro/sessions', data),
  getStats: (params) => api.get('/pomodoro/stats', { params }),
};

// 儀表板 API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
