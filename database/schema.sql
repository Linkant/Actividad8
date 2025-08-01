-- Sistema de Gestión de Inventario
-- Esquema de Base de Datos MySQL

CREATE DATABASE IF NOT EXISTS inventario_db;
USE inventario_db;

-- Tabla de Usuarios
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Categorías
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Productos
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    min_stock INT DEFAULT 5,
    sku VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Tabla de Movimientos de Inventario
CREATE TABLE inventory_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    movement_type ENUM('entry', 'exit') NOT NULL,
    quantity INT NOT NULL,
    reason VARCHAR(200),
    price_per_unit DECIMAL(10, 2),
    total_value DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para optimizar consultas
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_stock ON products(stock_quantity);
CREATE INDEX idx_movements_product ON inventory_movements(product_id);
CREATE INDEX idx_movements_user ON inventory_movements(user_id);
CREATE INDEX idx_movements_date ON inventory_movements(created_at);

-- Insertar categorías por defecto
INSERT INTO categories (name, description) VALUES
('Electrónicos', 'Dispositivos y componentes electrónicos'),
('Oficina', 'Suministros y materiales de oficina'),
('Ropa', 'Vestimenta y accesorios'),
('Hogar', 'Artículos para el hogar'),
('Herramientas', 'Herramientas y equipos de trabajo');

-- Insertar usuario administrador por defecto (password: admin123)
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@inventario.com', '$2b$10$8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8u', 'admin');

-- Productos de ejemplo
INSERT INTO products (name, description, category_id, price, stock_quantity, min_stock, sku) VALUES
('Laptop Dell Inspiron', 'Laptop para uso profesional', 1, 1299.99, 15, 5, 'DELL-INS-001'),
('Mouse Inalámbrico', 'Mouse ergonómico inalámbrico', 1, 29.99, 50, 10, 'MOUSE-WL-001'),
('Resma de Papel A4', 'Papel blanco para impresora', 2, 8.99, 100, 20, 'PAPER-A4-001'),
('Camiseta Polo', 'Camiseta polo de algodón', 3, 24.99, 25, 5, 'POLO-COT-001'),
('Martillo', 'Martillo de acero 500g', 5, 15.99, 30, 5, 'HAMR-ST-001');

-- Trigger para actualizar stock después de movimientos
DELIMITER //
CREATE TRIGGER update_stock_after_movement
    AFTER INSERT ON inventory_movements
    FOR EACH ROW
BEGIN
    IF NEW.movement_type = 'entry' THEN
        UPDATE products 
        SET stock_quantity = stock_quantity + NEW.quantity
        WHERE id = NEW.product_id;
    ELSE
        UPDATE products 
        SET stock_quantity = stock_quantity - NEW.quantity
        WHERE id = NEW.product_id;
    END IF;
END //
DELIMITER ;