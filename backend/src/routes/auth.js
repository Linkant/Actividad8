const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');
const { register, login, verifyToken, changePassword } = require('../controllers/authController');

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', validateUserRegistration, register);

// POST /api/auth/login - Iniciar sesión
router.post('/login', validateUserLogin, login);

// GET /api/auth/verify - Verificar token actual
router.get('/verify', authenticateToken, verifyToken);

// PUT /api/auth/change-password - Cambiar contraseña
router.put('/change-password', authenticateToken, changePassword);

module.exports = router;