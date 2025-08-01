@echo off
echo ===============================================
echo    Sistema de Gestion de Inventario v1.0     
echo ===============================================
echo.

echo [INFO] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado
    echo Por favor instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo [SUCCESS] Node.js esta instalado
)

echo [INFO] Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm no esta disponible
    pause
    exit /b 1
) else (
    echo [SUCCESS] npm esta disponible
)

echo.
echo [INFO] Instalando dependencias del backend...
cd backend
if exist package.json (
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Error instalando dependencias del backend
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencias del backend instaladas
) else (
    echo [ERROR] No se encontro package.json en backend
    pause
    exit /b 1
)

echo.
echo [INFO] Instalando dependencias del frontend...
cd ..\frontend
if exist package.json (
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Error instalando dependencias del frontend
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencias del frontend instaladas
) else (
    echo [ERROR] No se encontro package.json en frontend
    pause
    exit /b 1
)

cd ..

echo.
echo [INFO] Configurando archivos de entorno...
if not exist backend\.env (
    if exist backend\.env.example (
        copy backend\.env.example backend\.env >nul
        echo [SUCCESS] Archivo backend\.env creado
        echo [WARNING] Recuerda actualizar las credenciales de DB en backend\.env
    )
)

echo.
echo [SUCCESS] Instalacion completada!
echo.
echo ============ PROXIMOS PASOS ============
echo.
echo 1. Configura la base de datos:
echo    - Crear base de datos MySQL
echo    - Importar: mysql -u root -p ^< database/schema.sql
echo.
echo 2. Configurar variables de entorno:
echo    - Editar backend\.env con tus credenciales de DB
echo.
echo 3. Iniciar los servidores:
echo.
echo    Backend (Puerto 5000):
echo    cd backend ^&^& npm run dev
echo.
echo    Frontend (Puerto 3000):
echo    cd frontend ^&^& npm start
echo.
echo 4. Acceder a la aplicacion:
echo    http://localhost:3000
echo.
echo 5. Credenciales de prueba:
echo    Usuario: admin
echo    Contrasena: admin123
echo.
echo ¡Disfruta tu sistema de gestion de inventario!
echo.
pause