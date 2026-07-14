import axios from 'axios';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      // Session expired
      store.dispatch(logout());
      toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
    } else if (status === 403) {
      toast.error('Anda tidak memiliki akses untuk tindakan ini.');
    } else if (status === 500) {
      toast.error('Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.');
    } else if (!status) {
      toast.error('Gagal terhubung ke server. Periksa koneksi internet Anda.');
    }

    return Promise.reject(error);
  }
);
