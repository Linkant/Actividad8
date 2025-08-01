#!/bin/bash

# Script de instalación automática del Sistema de Gestión de Inventario
# Autor: Asistente IA
# Versión: 1.0.0

set -e

echo "🚀 Iniciando instalación del Sistema de Gestión de Inventario..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes coloridos
print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si Node.js está instalado
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js está instalado: $NODE_VERSION"
        
        # Verificar versión mínima (v16)
        if [[ $(echo "$NODE_VERSION" | cut -d'v' -f2 | cut -d'.' -f1) -lt 16 ]]; then
            print_warning "Se recomienda Node.js v16 o superior. Versión actual: $NODE_VERSION"
        fi
    else
        print_error "Node.js no está instalado."
        print_message "Por favor instala Node.js desde: https://nodejs.org/"
        exit 1
    fi
}

# Verificar si npm está instalado
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm está instalado: v$NPM_VERSION"
    else
        print_error "npm no está instalado."
        exit 1
    fi
}

# Verificar si MySQL está disponible
check_mysql() {
    if command -v mysql &> /dev/null; then
        print_success "MySQL está disponible"
    else
        print_warning "MySQL no está instalado o no está en el PATH"
        print_message "Puedes usar XAMPP, WAMP o instalar MySQL Server directamente"
    fi
}

# Instalar dependencias del backend
install_backend() {
    print_message "Instalando dependencias del backend..."
    cd backend
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Dependencias del backend instaladas correctamente"
    else
        print_error "No se encontró package.json en el directorio backend"
        exit 1
    fi
    
    cd ..
}

# Instalar dependencias del frontend
install_frontend() {
    print_message "Instalando dependencias del frontend..."
    cd frontend
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Dependencias del frontend instaladas correctamente"
    else
        print_error "No se encontró package.json en el directorio frontend"
        exit 1
    fi
    
    cd ..
}

# Configurar base de datos
setup_database() {
    print_message "Configuración de base de datos..."
    
    if [ -f "database/schema.sql" ]; then
        print_message "Archivo de esquema encontrado: database/schema.sql"
        print_warning "Para configurar la base de datos, ejecuta el siguiente comando en MySQL:"
        echo ""
        echo -e "${YELLOW}mysql -u root -p < database/schema.sql${NC}"
        echo ""
        print_message "O importa el archivo database/schema.sql usando phpMyAdmin"
    else
        print_error "No se encontró el archivo de esquema de la base de datos"
    fi
}

# Crear archivos de configuración
setup_config() {
    print_message "Configurando archivos de entorno..."
    
    # Backend .env
    if [ ! -f "backend/.env" ] && [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        print_success "Archivo backend/.env creado desde .env.example"
        print_warning "Recuerda actualizar las credenciales de la base de datos en backend/.env"
    fi
    
    # Frontend .env (si es necesario)
    if [ -f "frontend/.env.example" ] && [ ! -f "frontend/.env" ]; then
        cp frontend/.env.example frontend/.env
        print_success "Archivo frontend/.env creado desde .env.example"
    fi
}

# Mostrar instrucciones finales
show_instructions() {
    print_success "¡Instalación completada!"
    echo ""
    echo -e "${BLUE}📋 Próximos pasos:${NC}"
    echo ""
    echo "1. 🗄️  Configura la base de datos:"
    echo "   - Crear base de datos MySQL"
    echo "   - Importar: mysql -u root -p < database/schema.sql"
    echo ""
    echo "2. ⚙️  Configurar variables de entorno:"
    echo "   - Editar backend/.env con tus credenciales de DB"
    echo ""
    echo "3. 🚀 Iniciar los servidores:"
    echo ""
    echo "   📡 Backend (Puerto 5000):"
    echo "   cd backend && npm run dev"
    echo ""
    echo "   🎨 Frontend (Puerto 3000):"
    echo "   cd frontend && npm start"
    echo ""
    echo "4. 🌐 Acceder a la aplicación:"
    echo "   http://localhost:3000"
    echo ""
    echo "5. 👤 Credenciales de prueba:"
    echo "   Usuario: admin"
    echo "   Contraseña: admin123"
    echo ""
    echo -e "${GREEN}¡Disfruta tu sistema de gestión de inventario!${NC}"
}

# Función principal
main() {
    echo ""
    echo "==============================================="
    echo "    Sistema de Gestión de Inventario v1.0     "
    echo "==============================================="
    echo ""
    
    # Verificaciones previas
    print_message "Verificando dependencias del sistema..."
    check_nodejs
    check_npm
    check_mysql
    
    echo ""
    print_message "Iniciando instalación de dependencias..."
    
    # Instalaciones
    install_backend
    install_frontend
    
    # Configuraciones
    setup_config
    setup_database
    
    echo ""
    show_instructions
}

# Ejecutar función principal
main