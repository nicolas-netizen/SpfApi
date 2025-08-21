#!/bin/bash

# Script de actualización automática para CSV Dashboard
# Ejecutar como root o con sudo

set -e

echo "🔄 Actualizando CSV Dashboard desde GitHub..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "scripts/deploy.sh" ]; then
    print_error "No estás en el directorio del proyecto CSV Dashboard"
    print_error "Ejecuta: cd /var/www/csv-dashboard"
    exit 1
fi

# Hacer backup antes de actualizar
print_status "💾 Creando backup antes de actualizar..."
sudo ./scripts/backup.sh

# Actualizar desde GitHub
print_status "📥 Actualizando código desde GitHub..."
sudo git fetch origin
sudo git pull origin master

# Verificar si hay cambios
if [ $? -eq 0 ]; then
    print_status "✅ Código actualizado exitosamente"
else
    print_error "❌ Error actualizando código"
    exit 1
fi

# Reinstalar dependencias si es necesario
print_status "📦 Verificando dependencias..."

# Backend Python
cd backend
if [ -f "requirements.txt" ]; then
    print_status "🐍 Actualizando dependencias Python..."
    sudo pip3 install -r requirements.txt
fi
cd ..

# Frontend Node.js
cd frontend
if [ -f "package.json" ]; then
    print_status "⚛️ Actualizando dependencias Node.js..."
    sudo npm install
    
    print_status "🏗️ Construyendo frontend..."
    sudo npm run build
fi
cd ..

# Copiar archivos del frontend a NGINX
print_status "📁 Copiando archivos del frontend..."
sudo cp -r frontend/dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html

# Reiniciar servicios
print_status "🔄 Reiniciando servicios..."
sudo systemctl restart csv-dashboard
sudo systemctl restart nginx

# Verificar estado de los servicios
print_status "🔍 Verificando estado de los servicios..."
if systemctl is-active --quiet csv-dashboard; then
    print_status "✅ Backend funcionando correctamente"
else
    print_error "❌ Backend no está funcionando"
fi

if systemctl is-active --quiet nginx; then
    print_status "✅ NGINX funcionando correctamente"
else
    print_error "❌ NGINX no está funcionando"
fi

# Mostrar información final
echo ""
print_status "🎉 ¡Actualización completada exitosamente!"
echo ""
echo "📊 Dashboard disponible en: http://$(hostname -I | awk '{print $1}')"
echo "🔧 Backend API en: http://$(hostname -I | awk '{print $1}'):8000"
echo ""
echo "💡 Para verificar logs:"
echo "   Backend: sudo journalctl -u csv-dashboard -f"
echo "   NGINX: sudo tail -f /var/log/nginx/dashboard_error.log"
echo ""
echo "🔄 Para futuras actualizaciones, solo ejecuta: sudo ./scripts/update.sh"
