#!/bin/bash

# Script para instalar SSL con Let's Encrypt
# Ejecutar después del despliegue principal

set -e

echo "🔒 Instalando certificado SSL con Let's Encrypt..."

# Verificar que NGINX esté funcionando
if ! systemctl is-active --quiet nginx; then
    echo "❌ NGINX no está funcionando. Ejecuta el despliegue principal primero."
    exit 1
fi

# Instalar Certbot
echo "📦 Instalando Certbot..."
apt install -y certbot python3-certbot-nginx

# Solicitar dominio
read -p "🌐 Ingresa tu dominio (ej: midashboard.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "❌ Dominio requerido"
    exit 1
fi

# Actualizar configuración de NGINX con el dominio
echo "📝 Actualizando configuración de NGINX..."
sed -i "s/server_name _;/server_name $DOMAIN;/" /etc/nginx/sites-available/nginx-dashboard

# Reiniciar NGINX
systemctl restart nginx

# Obtener certificado SSL
echo "🔐 Obteniendo certificado SSL para $DOMAIN..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Verificar renovación automática
echo "🔄 Configurando renovación automática..."
crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | crontab -

echo ""
echo "✅ SSL instalado exitosamente!"
echo "🌐 Tu dashboard ahora está disponible en: https://$DOMAIN"
echo "🔄 El certificado se renovará automáticamente"
echo ""
echo "💡 Para verificar el estado: certbot certificates"
echo "💡 Para renovar manualmente: certbot renew"
