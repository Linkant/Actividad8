import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Configuración base de Axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para añadir token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response) {
      const { status, data } = response;

      // Token expirado o inválido
      if (status === 401) {
        Cookies.remove('token');
        Cookies.remove('user');
        window.location.href = '/login';
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return Promise.reject(error);
      }

      // Error del servidor
      if (status >= 500) {
        toast.error('Error del servidor. Intenta nuevamente.');
        return Promise.reject(error);
      }

      // Otros errores con mensaje específico
      if (data && data.message) {
        toast.error(data.message);
      }
    } else {
      // Error de red
      toast.error('Error de conexión. Verifica tu conexión a internet.');
    }

    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyToken: () => api.get('/auth/verify'),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// Servicios de productos
export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock'),
  getStats: () => api.get('/products/stats'),
};

// Servicios de categorías
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Servicios de movimientos
export const movementsAPI = {
  getAll: (params = {}) => api.get('/movements', { params }),
  getById: (id) => api.get(`/movements/${id}`),
  create: (movementData) => api.post('/movements', movementData),
  getByProduct: (productId, params = {}) => api.get(`/movements/product/${productId}`, { params }),
  getStats: (params = {}) => api.get('/movements/stats', { params }),
  getDashboard: () => api.get('/movements/dashboard'),
};

// Funciones auxiliares
export const handleApiError = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return 'Ha ocurrido un error inesperado';
};

export const isAxiosError = axios.isAxiosError;

export default api;