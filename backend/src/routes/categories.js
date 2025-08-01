const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateCategory, validateId } = require('../middleware/validation');
const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

// GET /api/categories - Obtener todas las categorías
router.get('/', authenticateToken, getCategories);

// GET /api/categories/:id - Obtener categoría por ID
router.get('/:id', authenticateToken, validateId, getCategoryById);

// POST /api/categories - Crear nueva categoría
router.post('/', authenticateToken, validateCategory, createCategory);

// PUT /api/categories/:id - Actualizar categoría
router.put('/:id', authenticateToken, validateId, updateCategory);

// DELETE /api/categories/:id - Eliminar categoría (solo admin)
router.delete('/:id', authenticateToken, requireAdmin, validateId, deleteCategory);

module.exports = router;