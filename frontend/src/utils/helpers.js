import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Formatear moneda
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Formatear número
export const formatNumber = (number) => {
  return new Intl.NumberFormat('es-ES').format(number);
};

// Formatear fecha
export const formatDate = (date, pattern = 'dd/MM/yyyy HH:mm') => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, pattern, { locale: es });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Formatear fecha relativa
export const formatRelativeDate = (date) => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffInHours = Math.abs(now - dateObj) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return 'Hoy';
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return formatDate(dateObj, 'dd/MM/yyyy');
    }
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return '';
  }
};

// Obtener estado del stock
export const getStockStatus = (currentStock, minStock) => {
  if (currentStock === 0) {
    return {
      status: 'out',
      label: 'Sin stock',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200'
    };
  } else if (currentStock <= minStock) {
    return {
      status: 'low',
      label: 'Stock bajo',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200'
    };
  } else {
    return {
      status: 'ok',
      label: 'Stock normal',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200'
    };
  }
};

// Capitalizar primera letra
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncar texto
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generar SKU aleatorio
export const generateSKU = (prefix = 'PROD') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 5);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
};

// Validar email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar número de teléfono
export const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[\d\s\-\(\)]{9,}$/;
  return phoneRegex.test(phone);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Obtener contraste de color para texto
export const getTextColor = (bgColor) => {
  // Convertir hex a RGB
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calcular luminancia
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Exportar datos a CSV
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Scroll suave a elemento
export const scrollToElement = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

// Copiar al portapapeles
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};