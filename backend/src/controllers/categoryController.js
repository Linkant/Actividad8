const { executeQuery, findById, create, update, deleteRecord } = require('../config/database');

// Obtener todas las categorías
const getCategories = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.*,
                COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            GROUP BY c.id
            ORDER BY c.name ASC
        `;

        const categories = await executeQuery(query);

        res.json({
            success: true,
            data: categories
        });

    } catch (error) {
        console.error('Error obteniendo categorías:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener una categoría por ID
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                c.*,
                COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            WHERE c.id = ?
            GROUP BY c.id
        `;

        const categories = await executeQuery(query, [id]);

        if (categories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        res.json({
            success: true,
            data: categories[0]
        });

    } catch (error) {
        console.error('Error obteniendo categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Crear nueva categoría
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Verificar que el nombre no existe
        const existing = await executeQuery(
            'SELECT id FROM categories WHERE name = ?',
            [name]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una categoría con ese nombre'
            });
        }

        const result = await create('categories', { name, description });

        res.status(201).json({
            success: true,
            message: 'Categoría creada exitosamente',
            data: {
                id: result.insertId,
                name,
                description
            }
        });

    } catch (error) {
        console.error('Error creando categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Actualizar categoría
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        // Verificar que la categoría existe
        const category = await findById('categories', id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        // Verificar que el nombre no existe (excepto en la categoría actual)
        if (name && name !== category.name) {
            const existing = await executeQuery(
                'SELECT id FROM categories WHERE name = ? AND id != ?',
                [name, id]
            );

            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una categoría con ese nombre'
                });
            }
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron datos para actualizar'
            });
        }

        await update('categories', id, updateData);

        res.json({
            success: true,
            message: 'Categoría actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error actualizando categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Eliminar categoría
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que la categoría existe
        const category = await findById('categories', id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        // Verificar si hay productos asociados
        const products = await executeQuery(
            'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
            [id]
        );

        if (products[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar la categoría porque tiene productos asociados'
            });
        }

        await deleteRecord('categories', id);

        res.json({
            success: true,
            message: 'Categoría eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};