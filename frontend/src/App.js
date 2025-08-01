import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Common/ProtectedRoute';

// Páginas públicas
import Login from './pages/Login';
import Register from './pages/Register';

// Páginas protegidas
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Categories from './pages/Categories';
import Movements from './pages/Movements';
import Reports from './pages/Reports';

// Utilidades
import { auth } from './utils/auth';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Configuración de notificaciones */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Configuración global
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#374151',
              fontSize: '14px',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            // Estilos específicos por tipo
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
            loading: {
              iconTheme: {
                primary: '#3b82f6',
                secondary: '#ffffff',
              },
            },
          }}
        />

        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={
            auth.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />
          } />
          <Route path="/register" element={
            auth.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Register />
          } />

          {/* Rutas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Redirigir raíz al dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard */}
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Productos */}
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            
            {/* Categorías */}
            <Route path="categories" element={<Categories />} />
            
            {/* Movimientos */}
            <Route path="movements" element={<Movements />} />
            
            {/* Reportes */}
            <Route path="reports" element={<Reports />} />
            
            {/* Perfil y configuración */}
            <Route path="profile" element={<div>Perfil - En desarrollo</div>} />
            <Route path="settings" element={<div>Configuración - En desarrollo</div>} />
          </Route>

          {/* Ruta 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Página no encontrada</p>
                <a 
                  href="/dashboard" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Ir al Dashboard
                </a>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;