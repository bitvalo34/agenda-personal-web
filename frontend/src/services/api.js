/* --------------------------------------------------------------------------
 * axios instance centralizado
 * ------------------------------------------------------------------------*/
import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API || 'http://localhost:3000',
});

/* --------------------------------------------------------------------------
 * Request interceptor – añade JWT si existe en localStorage o sessionStorage
 * ------------------------------------------------------------------------*/
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* --------------------------------------------------------------------------
 * Response interceptor – muestra toast global en errores 4xx / 5xx
 * ------------------------------------------------------------------------*/
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || 'Error en el servidor';
    toast.error(msg);
    return Promise.reject(err);
  }
);

export default api;
