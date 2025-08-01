import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../../utils/auth';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const isAuthenticated = auth.isAuthenticated();
  const isAdmin = auth.isAdmin();

  if (!isAuthenticated) {
    // Redirigir al login manteniendo la ruta intentada
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    // Redirigir al dashboard si no es admin
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;