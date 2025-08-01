const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateMovement, validateId, validatePagination } = require('../middleware/validation');
const {
    getMovements,
    getMovementById,
    createMovement,
    getMovementsByProduct,
    getMovementStats,
    getDashboardSummary
} = require('../controllers/movementController');

// GET /api/movements - Obtener todos los movimientos (con paginación y filtros)
router.get('/', authenticateToken, validatePagination, getMovements);

// GET /api/movements/dashboard - Obtener resumen para dashboard
router.get('/dashboard', authenticateToken, getDashboardSummary);

// GET /api/movements/stats - Obtener estadísticas de movimientos
router.get('/stats', authenticateToken, getMovementStats);

// GET /api/movements/product/:productId - Obtener movimientos por producto
router.get('/product/:productId', authenticateToken, validateId, getMovementsByProduct);

// GET /api/movements/:id - Obtener movimiento por ID
router.get('/:id', authenticateToken, validateId, getMovementById);

// POST /api/movements - Crear nuevo movimiento
router.post('/', authenticateToken, validateMovement, createMovement);

module.exports = router;