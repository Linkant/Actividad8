const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }
    next();
};

// Validaciones para usuarios
const validateUserRegistration = [
    body('username')
        .isLength({ min: 3, max: 50 })
        .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
    
    body('email')
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
    
    body('role')
        .optional()
        .isIn(['admin', 'user'])
        .withMessage('El rol debe ser admin o user'),
    
    handleValidationErrors
];

const validateUserLogin = [
    body('username')
        .notEmpty()
        .withMessage('El nombre de usuario es requerido'),
    
    body('password')
        .notEmpty()
        .withMessage('La contraseña es requerida'),
    
    handleValidationErrors
];

// Validaciones para productos
const validateProduct = [
    body('name')
        .notEmpty()
        .withMessage('El nombre del producto es requerido')
        .isLength({ max: 200 })
        .withMessage('El nombre no puede exceder 200 caracteres'),
    
    body('price')
        .isNumeric()
        .withMessage('El precio debe ser numérico')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser mayor o igual a 0'),
    
    body('stock_quantity')
        .optional()
        .isInt({ min: 0 })
        .withMessage('La cantidad en stock debe ser un número entero mayor o igual a 0'),
    
    body('min_stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock mínimo debe ser un número entero mayor o igual a 0'),
    
    body('category_id')
        .optional()
        .isInt()
        .withMessage('El ID de categoría debe ser un número entero'),
    
    body('sku')
        .optional()
        .isLength({ max: 100 })
        .withMessage('El SKU no puede exceder 100 caracteres'),
    
    handleValidationErrors
];

// Validaciones para categorías
const validateCategory = [
    body('name')
        .notEmpty()
        .withMessage('El nombre de la categoría es requerido')
        .isLength({ max: 100 })
        .withMessage('El nombre no puede exceder 100 caracteres'),
    
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),
    
    handleValidationErrors
];

// Validaciones para movimientos de inventario
const validateMovement = [
    body('product_id')
        .isInt()
        .withMessage('El ID del producto debe ser un número entero'),
    
    body('movement_type')
        .isIn(['entry', 'exit'])
        .withMessage('El tipo de movimiento debe ser entry o exit'),
    
    body('quantity')
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser un número entero mayor a 0'),
    
    body('reason')
        .optional()
        .isLength({ max: 200 })
        .withMessage('La razón no puede exceder 200 caracteres'),
    
    body('price_per_unit')
        .optional()
        .isNumeric()
        .withMessage('El precio por unidad debe ser numérico'),
    
    handleValidationErrors
];

// Validaciones para parámetros de ID
const validateId = [
    param('id')
        .isInt()
        .withMessage('El ID debe ser un número entero'),
    
    handleValidationErrors
];

// Validaciones para query parameters de paginación
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número entero mayor a 0'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entero entre 1 y 100'),
    
    handleValidationErrors
];

module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validateProduct,
    validateCategory,
    validateMovement,
    validateId,
    validatePagination,
    handleValidationErrors
};