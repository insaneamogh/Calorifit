import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  USE_MOCK,
  mockAuthAPI,
  mockUserAPI,
  mockFoodsAPI,
  mockLogsAPI,
  mockAiAPI,
  mockWaterAPI,
  mockProgressAPI,
} from './mockApi';

const BASE_URL = 'https://calorifit-production.up.railway.app/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 30000 });

// Attach token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          await AsyncStorage.setItem('accessToken', res.data.accessToken);
          err.config.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(err.config);
        } catch {
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        }
      }
    }
    return Promise.reject(err);
  }
);

// --- Real API calls ---
const realAuthAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
};

const realUserAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: any) => api.put('/users/me', data),
};

const realFoodsAPI = {
  search: (q: string) => api.get(`/foods/search?q=${encodeURIComponent(q)}`),
  getById: (id: string) => api.get(`/foods/${id}`),
  createCustom: (data: any) => api.post('/foods/custom', data),
};

const realLogsAPI = {
  getDay: (date: string) => api.get(`/logs/${date}`),
  addItem: (data: any) => api.post('/logs/item', data),
  addAIItems: (data: any) => api.post('/logs/item/ai', data),
  updateItem: (id: string, data: any) => api.put(`/logs/item/${id}`, data),
  deleteItem: (id: string) => api.delete(`/logs/item/${id}`),
};

const realAiAPI = {
  scanImage: (base64: string, mimeType = 'image/jpeg') =>
    api.post('/ai/scan-image', { base64, mimeType }),
  describeFood: (description: string) => api.post('/ai/describe-food', { description }),
  lookupBarcode: (barcode: string) => api.post('/ai/barcode', { barcode }),
  estimateExercise: (description: string, userWeightKg?: number) =>
    api.post('/ai/estimate-exercise', { description, userWeightKg }),
};

const realWaterAPI = {
  getDay: (date: string) => api.get(`/water/${date}`),
  log: (amountMl: number, date?: string) => api.post('/water', { amountMl, date }),
};

const realProgressAPI = {
  getWeight: (days = 30) => api.get(`/progress/weight?days=${days}`),
  logWeight: (weightKg: number) => api.post('/progress/weight', { weightKg }),
  getCalories: (days = 7) => api.get(`/progress/calories?days=${days}`),
  getStats: () => api.get('/progress/stats'),
};

const realExerciseAPI = {
  getDay: (date: string) => api.get(`/exercises?date=${date}`),
  getWeek: () => api.get('/exercises/week'),
  add: (data: any) => api.post('/exercises', data),
  delete: (id: string) => api.delete(`/exercises/${id}`),
};

const realPantryAPI = {
  getAll: () => api.get('/pantry'),
  add: (data: any) => api.post('/pantry', data),
  update: (id: string, data: any) => api.put(`/pantry/${id}`, data),
  delete: (id: string) => api.delete(`/pantry/${id}`),
};

const realBodyCompAPI = {
  getAll: (limit = 30) => api.get(`/body-composition?limit=${limit}`),
  getLatest: () => api.get('/body-composition/latest'),
  add: (data: any) => api.post('/body-composition', data),
  delete: (id: string) => api.delete(`/body-composition/${id}`),
};

// Mock fallbacks for exercise and pantry (return empty arrays)
const mockExerciseAPI = {
  getDay: (_date: string) => Promise.resolve({ data: [] }),
  getWeek: () => Promise.resolve({ data: { days: [], totalCalories: 0 } }),
  add: (_data: any) => Promise.resolve({ data: {} }),
  delete: (_id: string) => Promise.resolve({ data: { success: true } }),
};

const mockPantryAPI = {
  getAll: () => Promise.resolve({ data: [] }),
  add: (_data: any) => Promise.resolve({ data: {} }),
  update: (_id: string, _data: any) => Promise.resolve({ data: {} }),
  delete: (_id: string) => Promise.resolve({ data: { success: true } }),
};

const mockBodyCompAPI = {
  getAll: (_limit = 30) => Promise.resolve({ data: [] }),
  getLatest: () => Promise.resolve({ data: null }),
  add: (_data: any) => Promise.resolve({ data: {} }),
  delete: (_id: string) => Promise.resolve({ data: { success: true } }),
};

// --- Export mock or real based on USE_MOCK flag ---
export const authAPI   = USE_MOCK ? mockAuthAPI   : realAuthAPI;
export const userAPI   = USE_MOCK ? mockUserAPI   : realUserAPI;
export const foodsAPI  = USE_MOCK ? mockFoodsAPI  : realFoodsAPI;
export const logsAPI   = USE_MOCK ? mockLogsAPI   : realLogsAPI;
export const aiAPI     = USE_MOCK ? mockAiAPI     : realAiAPI;
export const waterAPI  = USE_MOCK ? mockWaterAPI  : realWaterAPI;
export const progressAPI = USE_MOCK ? mockProgressAPI : realProgressAPI;
export const exerciseAPI = USE_MOCK ? mockExerciseAPI : realExerciseAPI;
export const pantryAPI   = USE_MOCK ? mockPantryAPI   : realPantryAPI;
export const bodyCompAPI = USE_MOCK ? mockBodyCompAPI  : realBodyCompAPI;

export default api;
