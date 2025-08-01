const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateProduct, validateId, validatePagination } = require('../middleware/validation');
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    getProductStats
} = require('../controllers/productController');

// GET /api/products - Obtener todos los productos (con paginación y filtros)
router.get('/', authenticateToken, validatePagination, getProducts);

// GET /api/products/low-stock - Obtener productos con stock bajo
router.get('/low-stock', authenticateToken, getLowStockProducts);

// GET /api/products/stats - Obtener estadísticas de productos
router.get('/stats', authenticateToken, getProductStats);

// GET /api/products/:id - Obtener producto por ID
router.get('/:id', authenticateToken, validateId, getProductById);

// POST /api/products - Crear nuevo producto
router.post('/', authenticateToken, validateProduct, createProduct);

// PUT /api/products/:id - Actualizar producto
router.put('/:id', authenticateToken, validateId, updateProduct);

// DELETE /api/products/:id - Eliminar producto (solo admin)
router.delete('/:id', authenticateToken, requireAdmin, validateId, deleteProduct);

module.exports = router;