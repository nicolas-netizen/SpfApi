#!/bin/bash

# Script de despliegue para CSV Dashboard en Ubuntu
# Ejecutar como root o con sudo

set -e  # Salir si hay algún error

echo "🚀 Iniciando despliegue de CSV Dashboard..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Verificar que estamos en Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    print_error "Este script está diseñado para Ubuntu"
    exit 1
fi

# Actualizar sistema
print_status "Actualizando sistema..."
apt update && apt upgrade -y

# Instalar dependencias
print_status "Instalando dependencias..."
apt install -y python3-pip nodejs npm nginx git curl

# Verificar versiones
print_status "Verificando versiones instaladas..."
python3 --version
node --version
npm --version
nginx -v

# Crear directorio del proyecto
PROJECT_DIR="/var/www/csv-dashboard"
print_status "Creando directorio del proyecto en $PROJECT_DIR..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Clonar o copiar el proyecto (ajustar según tu caso)
if [ -d ".git" ]; then
    print_status "Actualizando repositorio..."
    git pull
else
    print_warning "Por favor, copia los archivos del proyecto a $PROJECT_DIR"
    print_warning "O clona el repositorio con: git clone <tu-repo> ."
    read -p "Presiona Enter cuando hayas copiado los archivos..."
fi

# Configurar Python backend
print_status "Configurando backend Python..."
cd backend
pip3 install -r requirements.txt

# Crear directorio de datos
mkdir -p ../data
chown -R www-data:www-data ../data
chmod 755 ../data

# Configurar frontend
print_status "Configurando frontend React..."
cd ../frontend
npm install
npm run build

# Copiar archivos del frontend a NGINX
print_status "Copiando archivos del frontend..."
cp -r dist/* /var/www/html/
chown -R www-data:www-data /var/www/html

# Configurar NGINX
print_status "Configurando NGINX..."
cp ../scripts/nginx-dashboard /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/nginx-dashboard /etc/nginx/sites-enabled/

# Deshabilitar sitio por defecto
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Verificar configuración de NGINX
nginx -t

# Configurar servicio del sistema
print_status "Configurando servicio del sistema..."
cp ../scripts/csv-dashboard.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable csv-dashboard

# Reiniciar servicios
print_status "Reiniciando servicios..."
systemctl restart csv-dashboard
systemctl restart nginx

# Verificar estado de los servicios
print_status "Verificando estado de los servicios..."
systemctl status csv-dashboard --no-pager
systemctl status nginx --no-pager

# Configurar firewall (opcional)
if command -v ufw &> /dev/null; then
    print_status "Configurando firewall..."
    ufw allow 80/tcp
    ufw allow 22/tcp
    ufw --force enable
fi

# Mostrar información final
echo ""
print_status "🎉 Despliegue completado exitosamente!"
echo ""
echo "📊 Dashboard disponible en: http://$(hostname -I | awk '{print $1}')"
echo "🔧 Backend API en: http://$(hostname -I | awk '{print $1}'):8000"
echo ""
echo "📁 Directorio del proyecto: $PROJECT_DIR"
echo "📁 Directorio de datos: $PROJECT_DIR/data"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs del backend: journalctl -u csv-dashboard -f"
echo "   Ver logs de NGINX: tail -f /var/log/nginx/dashboard_error.log"
echo "   Reiniciar backend: systemctl restart csv-dashboard"
echo "   Reiniciar NGINX: systemctl restart nginx"
echo ""
echo "💡 Para subir archivos CSV, colócalos en: $PROJECT_DIR/data"
echo "💡 O usa la interfaz web para subir archivos"
echo ""

# Verificar que todo funciona
print_status "Verificando que la API responde..."
if curl -s http://localhost:8000/ > /dev/null; then
    print_status "✅ Backend funcionando correctamente"
else
    print_error "❌ Backend no responde"
fi

if curl -s http://localhost/ > /dev/null; then
    print_status "✅ Frontend funcionando correctamente"
else
    print_error "❌ Frontend no responde"
fi

echo ""
print_status "¡Despliegue completado! 🚀"
