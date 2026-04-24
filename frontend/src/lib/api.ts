import axios from 'axios';
import { auth } from './firebase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 
                process.env.NEXT_PUBLIC_BACKEND_URL + '/api' || 
                'http://localhost:5000/api';

export const api = axios.create({ 
  baseURL: API_URL,
  timeout: 30000 // 30s timeout for Render free tier cold starts
});

export const api = axios.create({ baseURL: API_URL });

// Inject Firebase token automatically
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: any) => {
    const message =
      error?.response?.data?.error ||
      error?.message ||
      'Something went wrong';
    return Promise.reject(new Error(String(message)));
  }
);

// Auth
export const authApi = {
  register: (data: { firebaseUid: string; email: string; displayName: string; photoURL?: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me')
};

// Shop
export const shopApi = {
  onboard: (data: any) => api.post('/shop/onboard', data),
  get: () => api.get('/shop'),
  update: (data: any) => api.put('/shop', data),
  uploadLogo: (file: File) => {
    const fd = new FormData(); fd.append('logo', file);
    return api.post('/shop/upload-logo', fd);
  },
  uploadBanner: (file: File) => {
    const fd = new FormData(); fd.append('banner', file);
    return api.post('/shop/upload-banner', fd);
  },
  getPublic: (slug: string) => api.get(`/shop/public/${slug}`),
  regenerateQR: () => api.post('/shop/regenerate-qr')
};

// Products
export const productApi = {
  list: (params?: any) => api.get('/products', { params }),
  listPublic: (shopSlug: string, params?: any) => api.get(`/products/public/${shopSlug}`, { params }),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  uploadImage: (id: string, file: File) => {
    const fd = new FormData(); fd.append('image', file);
    return api.post(`/products/upload-image/${id}`, fd);
  },
  excelPreview: (file: File) => {
    const fd = new FormData(); fd.append('file', file);
    return api.post('/products/excel-preview', fd);
  },
  excelImport: (file: File) => {
    const fd = new FormData(); fd.append('file', file);
    return api.post('/products/excel-import', fd);
  },
  exportExcel: () => api.get('/products/export-excel', { responseType: 'blob' }),
  downloadTemplate: () => api.get('/products/template', { responseType: 'blob' })
};

// Orders
export const orderApi = {
  list: (params?: any) => api.get('/orders', { params }),
  get: (id: string) => api.get(`/orders/${id}`),
  place: (shopSlug: string, data: any) => api.post(`/orders/place/${shopSlug}`, data),
  track: (orderNumber: string) => api.get(`/orders/track/${orderNumber}`),
  updateStatus: (id: string, status: string, note?: string) =>
    api.patch(`/orders/${id}/status`, { status, note }),
  updatePayment: (id: string, paymentStatus: string) =>
    api.patch(`/orders/${id}/payment`, { paymentStatus }),
  stats: () => api.get('/orders/stats/summary')
};

// Payments
export const paymentApi = {
  createOrder: (data: { orderId: string; amount: number }) => api.post('/payments/create-order', data),
  verify: (data: any) => api.post('/payments/verify', data)
};

// Analytics
export const analyticsApi = {
  dashboard: (days?: number) => api.get('/analytics/dashboard', { params: { days } }),
  sales: (params?: any) => api.get('/analytics/sales', { params })
};

// Feedback
export const feedbackApi = {
  submit: (shopSlug: string, data: any) => api.post(`/feedback/${shopSlug}`, data),
  list: (params?: any) => api.get('/feedback', { params }),
  review: (id: string) => api.patch(`/feedback/${id}/review`),
  delete: (id: string) => api.delete(`/feedback/${id}`)
};

// QR
export const qrApi = {
  get: () => api.get('/qr')
};
