const { executeQuery, findById } = require('../config/database');

// Obtener todos los productos con paginación y filtros
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const categoryId = req.query.category_id || '';
        const sortBy = req.query.sort_by || 'created_at';
        const sortOrder = req.query.sort_order || 'DESC';

        // Construir WHERE clause dinámicamente
        let whereClause = 'WHERE 1=1';
        let params = [];

        if (search) {
            whereClause += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (categoryId) {
            whereClause += ' AND p.category_id = ?';
            params.push(categoryId);
        }

        // Query principal con JOIN para obtener información de categoría
        const query = `
            SELECT 
                p.*,
                c.name as category_name,
                CASE 
                    WHEN p.stock_quantity <= p.min_stock THEN 'low'
                    WHEN p.stock_quantity = 0 THEN 'out'
                    ELSE 'ok'
                END as stock_status
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ${whereClause}
            ORDER BY p.${sortBy} ${sortOrder}
            LIMIT ? OFFSET ?
        `;

        const products = await executeQuery(query, [...params, limit, offset]);

        // Contar total de registros para paginación
        const countQuery = `
            SELECT COUNT(*) as total
            FROM products p
            ${whereClause}
        `;
        const countResult = await executeQuery(countQuery, params);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    current_page: page,
                    total_pages: Math.ceil(total / limit),
                    total_items: total,
                    items_per_page: limit
                }
            }
        });

    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener un producto por ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                p.*,
                c.name as category_name,
                CASE 
                    WHEN p.stock_quantity <= p.min_stock THEN 'low'
                    WHEN p.stock_quantity = 0 THEN 'out'
                    ELSE 'ok'
                END as stock_status
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `;

        const products = await executeQuery(query, [id]);

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.json({
            success: true,
            data: products[0]
        });

    } catch (error) {
        console.error('Error obteniendo producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Crear nuevo producto
const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            category_id,
            price,
            stock_quantity = 0,
            min_stock = 5,
            sku
        } = req.body;

        // Verificar que la categoría existe si se proporciona
        if (category_id) {
            const category = await findById('categories', category_id);
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'La categoría especificada no existe'
                });
            }
        }

        // Verificar que el SKU sea único si se proporciona
        if (sku) {
            const existingSku = await executeQuery(
                'SELECT id FROM products WHERE sku = ?',
                [sku]
            );
            if (existingSku.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El SKU ya existe'
                });
            }
        }

        const result = await executeQuery(
            `INSERT INTO products 
             (name, description, category_id, price, stock_quantity, min_stock, sku) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, description, category_id || null, price, stock_quantity, min_stock, sku || null]
        );

        // Registrar movimiento inicial de inventario si hay stock
        if (stock_quantity > 0) {
            await executeQuery(
                `INSERT INTO inventory_movements 
                 (product_id, user_id, movement_type, quantity, reason, price_per_unit, total_value)
                 VALUES (?, ?, 'entry', ?, 'Stock inicial', ?, ?)`,
                [result.insertId, req.user.id, stock_quantity, price, price * stock_quantity]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: {
                id: result.insertId,
                name,
                description,
                category_id,
                price,
                stock_quantity,
                min_stock,
                sku
            }
        });

    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Actualizar producto
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            category_id,
            price,
            stock_quantity,
            min_stock,
            sku
        } = req.body;

        // Verificar que el producto existe
        const product = await findById('products', id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // Verificar que la categoría existe si se proporciona
        if (category_id) {
            const category = await findById('categories', category_id);
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'La categoría especificada no existe'
                });
            }
        }

        // Verificar que el SKU sea único si se proporciona y es diferente al actual
        if (sku && sku !== product.sku) {
            const existingSku = await executeQuery(
                'SELECT id FROM products WHERE sku = ? AND id != ?',
                [sku, id]
            );
            if (existingSku.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El SKU ya existe'
                });
            }
        }

        // Preparar datos para actualización
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (category_id !== undefined) updateData.category_id = category_id;
        if (price !== undefined) updateData.price = price;
        if (stock_quantity !== undefined) updateData.stock_quantity = stock_quantity;
        if (min_stock !== undefined) updateData.min_stock = min_stock;
        if (sku !== undefined) updateData.sku = sku;

        // Si no hay datos para actualizar
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron datos para actualizar'
            });
        }

        const keys = Object.keys(updateData);
        const values = Object.values(updateData);
        const setClause = keys.map(key => `${key} = ?`).join(', ');

        await executeQuery(
            `UPDATE products SET ${setClause} WHERE id = ?`,
            [...values, id]
        );

        res.json({
            success: true,
            message: 'Producto actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Eliminar producto
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el producto existe
        const product = await findById('products', id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // Verificar si hay movimientos asociados
        const movements = await executeQuery(
            'SELECT COUNT(*) as count FROM inventory_movements WHERE product_id = ?',
            [id]
        );

        if (movements[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar el producto porque tiene movimientos de inventario asociados'
            });
        }

        await executeQuery('DELETE FROM products WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Producto eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener productos con stock bajo
const getLowStockProducts = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.*,
                c.name as category_name,
                'low' as stock_status
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.stock_quantity <= p.min_stock
            ORDER BY p.stock_quantity ASC
        `;

        const products = await executeQuery(query);

        res.json({
            success: true,
            data: products
        });

    } catch (error) {
        console.error('Error obteniendo productos con stock bajo:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener estadísticas de productos
const getProductStats = async (req, res) => {
    try {
        const stats = await executeQuery(`
            SELECT 
                COUNT(*) as total_products,
                SUM(stock_quantity) as total_stock,
                SUM(stock_quantity * price) as total_value,
                COUNT(CASE WHEN stock_quantity <= min_stock THEN 1 END) as low_stock_count,
                COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as out_of_stock_count
            FROM products
        `);

        const categoryStats = await executeQuery(`
            SELECT 
                c.name as category_name,
                COUNT(p.id) as product_count,
                SUM(p.stock_quantity) as total_stock
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            GROUP BY c.id, c.name
            ORDER BY product_count DESC
        `);

        res.json({
            success: true,
            data: {
                general: stats[0],
                by_category: categoryStats
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

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    getProductStats
};