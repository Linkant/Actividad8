import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { productsAPI, movementsAPI } from '../services/api';
import { formatCurrency, formatNumber, formatRelativeDate, getStockStatus } from '../utils/helpers';
import { auth } from '../utils/auth';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentMovements, setRecentMovements] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const user = auth.getUser();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsResponse, lowStockResponse, dashboardResponse] = await Promise.all([
        productsAPI.getStats(),
        productsAPI.getLowStock(),
        movementsAPI.getDashboard(),
      ]);

      setStats(statsResponse.data.data);
      setLowStockProducts(lowStockResponse.data.data);
      setDashboardData(dashboardResponse.data.data);
      setRecentMovements(dashboardResponse.data.data.recent);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, link }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend > 0 ? (
                      <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4" />
                    ) : (
                      <ArrowTrendingDownIcon className="self-center flex-shrink-0 h-4 w-4" />
                    )}
                    <span className="sr-only">{trend > 0 ? 'Increased' : 'Decreased'} by</span>
                    {Math.abs(trend)}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {link && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <Link to={link} className="font-medium text-primary-600 hover:text-primary-500">
              Ver todos
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <ArrowPathIcon className="h-6 w-6 animate-spin text-primary-600" />
          <span className="text-gray-600">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            ¡Bienvenido de vuelta, {user?.username}! Aquí tienes un resumen de tu inventario.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/products/new"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Agregar Producto
          </Link>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Productos"
          value={formatNumber(stats?.general?.total_products || 0)}
          icon={CubeIcon}
          color="text-blue-600"
          link="/products"
        />
        <StatCard
          title="Stock Total"
          value={formatNumber(stats?.general?.total_stock || 0)}
          icon={ChartBarIcon}
          color="text-green-600"
        />
        <StatCard
          title="Valor Total"
          value={formatCurrency(stats?.general?.total_value || 0)}
          icon={ArrowTrendingUpIcon}
          color="text-purple-600"
        />
        <StatCard
          title="Stock Bajo"
          value={formatNumber(stats?.general?.low_stock_count || 0)}
          icon={ExclamationTriangleIcon}
          color="text-red-600"
          link="/products?filter=low-stock"
        />
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Productos con stock bajo */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Productos con Stock Bajo
              </h3>
              <Link
                to="/products?filter=low-stock"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Ver todos
              </Link>
            </div>
            
            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => {
                  const stockStatus = getStockStatus(product.stock_quantity, product.min_stock);
                  return (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category_name}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}>
                          {product.stock_quantity} unidades
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos con stock bajo</h3>
                <p className="mt-1 text-sm text-gray-500">Todos los productos tienen stock suficiente.</p>
              </div>
            )}
          </div>
        </div>

        {/* Movimientos recientes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Movimientos Recientes
              </h3>
              <Link
                to="/movements"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Ver todos
              </Link>
            </div>
            
            {recentMovements && recentMovements.length > 0 ? (
              <div className="space-y-3">
                {recentMovements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{movement.product_name}</p>
                      <p className="text-xs text-gray-500">{movement.username} • {formatRelativeDate(movement.created_at)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        movement.movement_type === 'entry' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {movement.movement_type === 'entry' ? '+' : '-'}{movement.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <ArrowTrendingUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay movimientos recientes</h3>
                <p className="mt-1 text-sm text-gray-500">Los movimientos aparecerán aquí cuando se registren.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumen de actividad */}
      {dashboardData && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Actividad del Día
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {dashboardData.today?.find(t => t.movement_type === 'entry')?.count || 0}
                </div>
                <div className="text-sm text-gray-500">Entradas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {dashboardData.today?.find(t => t.movement_type === 'exit')?.count || 0}
                </div>
                <div className="text-sm text-gray-500">Salidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {dashboardData.week?.total_movements || 0}
                </div>
                <div className="text-sm text-gray-500">Movimientos esta semana</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;