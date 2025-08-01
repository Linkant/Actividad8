const { executeQuery, findById } = require('../config/database');

// Obtener todos los movimientos con paginación y filtros
const getMovements = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const productId = req.query.product_id || '';
        const movementType = req.query.movement_type || '';
        const startDate = req.query.start_date || '';
        const endDate = req.query.end_date || '';

        // Construir WHERE clause dinámicamente
        let whereClause = 'WHERE 1=1';
        let params = [];

        if (productId) {
            whereClause += ' AND m.product_id = ?';
            params.push(productId);
        }

        if (movementType) {
            whereClause += ' AND m.movement_type = ?';
            params.push(movementType);
        }

        if (startDate) {
            whereClause += ' AND DATE(m.created_at) >= ?';
            params.push(startDate);
        }

        if (endDate) {
            whereClause += ' AND DATE(m.created_at) <= ?';
            params.push(endDate);
        }

        const query = `
            SELECT 
                m.*,
                p.name as product_name,
                p.sku as product_sku,
                u.username,
                c.name as category_name
            FROM inventory_movements m
            JOIN products p ON m.product_id = p.id
            JOIN users u ON m.user_id = u.id
            LEFT JOIN categories c ON p.category_id = c.id
            ${whereClause}
            ORDER BY m.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const movements = await executeQuery(query, [...params, limit, offset]);

        // Contar total para paginación
        const countQuery = `
            SELECT COUNT(*) as total
            FROM inventory_movements m
            JOIN products p ON m.product_id = p.id
            ${whereClause}
        `;
        const countResult = await executeQuery(countQuery, params);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: {
                movements,
                pagination: {
                    current_page: page,
                    total_pages: Math.ceil(total / limit),
                    total_items: total,
                    items_per_page: limit
                }
            }
        });

    } catch (error) {
        console.error('Error obteniendo movimientos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener un movimiento por ID
const getMovementById = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                m.*,
                p.name as product_name,
                p.sku as product_sku,
                u.username,
                c.name as category_name
            FROM inventory_movements m
            JOIN products p ON m.product_id = p.id
            JOIN users u ON m.user_id = u.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE m.id = ?
        `;

        const movements = await executeQuery(query, [id]);

        if (movements.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Movimiento no encontrado'
            });
        }

        res.json({
            success: true,
            data: movements[0]
        });

    } catch (error) {
        console.error('Error obteniendo movimiento:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Crear nuevo movimiento de inventario
const createMovement = async (req, res) => {
    try {
        const {
            product_id,
            movement_type,
            quantity,
            reason,
            price_per_unit
        } = req.body;

        const user_id = req.user.id;

        // Verificar que el producto existe
        const product = await findById('products', product_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // Verificar stock suficiente para salidas
        if (movement_type === 'exit' && product.stock_quantity < quantity) {
            return res.status(400).json({
                success: false,
                message: `Stock insuficiente. Stock actual: ${product.stock_quantity}`
            });
        }

        // Calcular precio por unidad si no se proporciona
        const finalPricePerUnit = price_per_unit || product.price;
        const total_value = finalPricePerUnit * quantity;

        // Crear el movimiento
        const result = await executeQuery(
            `INSERT INTO inventory_movements 
             (product_id, user_id, movement_type, quantity, reason, price_per_unit, total_value)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [product_id, user_id, movement_type, quantity, reason, finalPricePerUnit, total_value]
        );

        // El trigger actualiza automáticamente el stock del producto

        res.status(201).json({
            success: true,
            message: 'Movimiento registrado exitosamente',
            data: {
                id: result.insertId,
                product_id,
                user_id,
                movement_type,
                quantity,
                reason,
                price_per_unit: finalPricePerUnit,
                total_value
            }
        });

    } catch (error) {
        console.error('Error creando movimiento:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener movimientos por producto
const getMovementsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Verificar que el producto existe
        const product = await findById('products', productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        const query = `
            SELECT 
                m.*,
                u.username,
                p.name as product_name
            FROM inventory_movements m
            JOIN users u ON m.user_id = u.id
            JOIN products p ON m.product_id = p.id
            WHERE m.product_id = ?
            ORDER BY m.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const movements = await executeQuery(query, [productId, limit, offset]);

        const countQuery = 'SELECT COUNT(*) as total FROM inventory_movements WHERE product_id = ?';
        const countResult = await executeQuery(countQuery, [productId]);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: {
                movements,
                product: product,
                pagination: {
                    current_page: page,
                    total_pages: Math.ceil(total / limit),
                    total_items: total,
                    items_per_page: limit
                }
            }
        });

    } catch (error) {
        console.error('Error obteniendo movimientos del producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener estadísticas de movimientos
const getMovementStats = async (req, res) => {
    try {
        const { period = '30' } = req.query; // días por defecto

        const stats = await executeQuery(`
            SELECT 
                movement_type,
                COUNT(*) as total_movements,
                SUM(quantity) as total_quantity,
                SUM(total_value) as total_value,
                AVG(total_value) as avg_value
            FROM inventory_movements 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY movement_type
        `, [period]);

        const dailyStats = await executeQuery(`
            SELECT 
                DATE(created_at) as date,
                movement_type,
                COUNT(*) as movements,
                SUM(quantity) as quantity,
                SUM(total_value) as value
            FROM inventory_movements 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(created_at), movement_type
            ORDER BY date DESC
        `, [period]);

        const topProducts = await executeQuery(`
            SELECT 
                p.name as product_name,
                p.sku,
                SUM(CASE WHEN m.movement_type = 'entry' THEN m.quantity ELSE 0 END) as total_entries,
                SUM(CASE WHEN m.movement_type = 'exit' THEN m.quantity ELSE 0 END) as total_exits,
                COUNT(*) as total_movements
            FROM inventory_movements m
            JOIN products p ON m.product_id = p.id
            WHERE m.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY p.id, p.name, p.sku
            ORDER BY total_movements DESC
            LIMIT 10
        `, [period]);

        res.json({
            success: true,
            data: {
                summary: stats,
                daily_stats: dailyStats,
                top_products: topProducts,
                period_days: period
            }
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener resumen del dashboard
const getDashboardSummary = async (req, res) => {
    try {
        // Movimientos del día
        const todayMovements = await executeQuery(`
            SELECT 
                movement_type,
                COUNT(*) as count,
                SUM(quantity) as quantity
            FROM inventory_movements 
            WHERE DATE(created_at) = CURDATE()
            GROUP BY movement_type
        `);

        // Movimientos de la semana
        const weekMovements = await executeQuery(`
            SELECT 
                COUNT(*) as total_movements,
                SUM(CASE WHEN movement_type = 'entry' THEN quantity ELSE 0 END) as total_entries,
                SUM(CASE WHEN movement_type = 'exit' THEN quantity ELSE 0 END) as total_exits
            FROM inventory_movements 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);

        // Últimos movimientos
        const recentMovements = await executeQuery(`
            SELECT 
                m.*,
                p.name as product_name,
                u.username
            FROM inventory_movements m
            JOIN products p ON m.product_id = p.id
            JOIN users u ON m.user_id = u.id
            ORDER BY m.created_at DESC
            LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                today: todayMovements,
                week: weekMovements[0] || { total_movements: 0, total_entries: 0, total_exits: 0 },
                recent: recentMovements
            }
        });

    } catch (error) {
        console.error('Error obteniendo resumen del dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    getMovements,
    getMovementById,
    createMovement,
    getMovementsByProduct,
    getMovementStats,
    getDashboardSummary
};