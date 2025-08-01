import Cookies from 'js-cookie';

// Configuración de cookies
const COOKIE_OPTIONS = {
  expires: 1, // 1 día
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production'
};

// Funciones de autenticación
export const auth = {
  // Guardar token y datos del usuario
  setAuth: (token, user) => {
    Cookies.set('token', token, COOKIE_OPTIONS);
    Cookies.set('user', JSON.stringify(user), COOKIE_OPTIONS);
  },

  // Obtener token
  getToken: () => {
    return Cookies.get('token');
  },

  // Obtener datos del usuario
  getUser: () => {
    const userStr = Cookies.get('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    const token = Cookies.get('token');
    const user = Cookies.get('user');
    return !!(token && user);
  },

  // Verificar si es administrador
  isAdmin: () => {
    const user = auth.getUser();
    return user && user.role === 'admin';
  },

  // Cerrar sesión
  logout: () => {
    Cookies.remove('token');
    Cookies.remove('user');
  },

  // Actualizar datos del usuario
  updateUser: (userData) => {
    const currentUser = auth.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      Cookies.set('user', JSON.stringify(updatedUser), COOKIE_OPTIONS);
    }
  }
};

export default auth;