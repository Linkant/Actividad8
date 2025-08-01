const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la conexión a MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'inventario_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión exitosa a MySQL');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
        return false;
    }
};

// Función para ejecutar queries
const executeQuery = async (query, params = []) => {
    try {
        const [results] = await pool.execute(query, params);
        return results;
    } catch (error) {
        console.error('Error ejecutando query:', error);
        throw error;
    }
};

// Función para obtener un registro por ID
const findById = async (table, id) => {
    const query = `SELECT * FROM ${table} WHERE id = ?`;
    const results = await executeQuery(query, [id]);
    return results.length > 0 ? results[0] : null;
};

// Función para obtener todos los registros de una tabla
const findAll = async (table, conditions = '', params = []) => {
    const query = `SELECT * FROM ${table} ${conditions}`;
    return await executeQuery(query, params);
};

// Función para insertar registros
const create = async (table, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    const result = await executeQuery(query, values);
    return result;
};

// Función para actualizar registros
const update = async (table, id, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    const result = await executeQuery(query, [...values, id]);
    return result;
};

// Función para eliminar registros
const deleteRecord = async (table, id) => {
    const query = `DELETE FROM ${table} WHERE id = ?`;
    const result = await executeQuery(query, [id]);
    return result;
};

module.exports = {
    pool,
    testConnection,
    executeQuery,
    findById,
    findAll,
    create,
    update,
    deleteRecord
};