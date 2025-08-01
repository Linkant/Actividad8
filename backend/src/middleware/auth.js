const jwt = require('jsonwebtoken');
const { findById } = require('../config/database');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token de acceso requerido' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar que el usuario aún existe
        const user = await findById('users', decoded.userId);
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token inválido - usuario no encontrado' 
            });
        }

        // Añadir información del usuario a la request
        req.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: 'Token inválido o expirado' 
        });
    }
};

// Middleware para verificar role de administrador
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Acceso denegado - Se requieren permisos de administrador' 
        });
    }
    next();
};

// Middleware para verificar owner o admin
const requireOwnerOrAdmin = (req, res, next) => {
    const resourceUserId = req.params.userId || req.body.userId;
    
    if (req.user.role === 'admin' || req.user.id == resourceUserId) {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Acceso denegado - Solo puedes acceder a tus propios recursos' 
        });
    }
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireOwnerOrAdmin
};