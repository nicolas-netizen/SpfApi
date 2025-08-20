# 🚀 Guía de Despliegue Detallada

## 📋 Requisitos Previos

### Sistema Operativo
- Ubuntu 20.04 LTS o superior
- Acceso root o sudo
- Conexión a internet

### Recursos Mínimos
- **CPU**: 1 vCPU
- **RAM**: 2GB
- **Disco**: 20GB
- **Red**: Puerto 80 y 22 abiertos

## 🔧 Instalación Paso a Paso

### 1. Preparar el Servidor

```bash
# Conectar al servidor
ssh usuario@tu-servidor

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias básicas
sudo apt install -y curl wget git
```

### 2. Clonar el Proyecto

```bash
# Crear directorio del proyecto
sudo mkdir -p /var/www/csv-dashboard
cd /var/www/csv-dashboard

# Clonar repositorio (reemplaza con tu URL)
sudo git clone https://github.com/tu-usuario/csv-dashboard.git .

# O copiar archivos manualmente
# sudo cp -r /ruta/a/tu/proyecto/* .
```

### 3. Ejecutar Script de Despliegue

```bash
# Dar permisos de ejecución
sudo chmod +x scripts/deploy.sh

# Ejecutar despliegue
sudo ./scripts/deploy.sh
```

### 4. Verificar Instalación

```bash
# Verificar servicios
sudo systemctl status csv-dashboard
sudo systemctl status nginx

# Verificar puertos
sudo netstat -tlnp | grep -E ':(80|8000)'

# Verificar logs
sudo journalctl -u csv-dashboard -f
sudo tail -f /var/log/nginx/dashboard_error.log
```

## 🌐 Configuración de Dominio

### 1. Configurar DNS
```bash
# Agregar registro A en tu proveedor DNS
# A tu-dominio.com -> IP-DE-TU-SERVIDOR
```

### 2. Instalar SSL
```bash
# Ejecutar script de SSL
sudo chmod +x scripts/install-ssl.sh
sudo ./scripts/install-ssl.sh
```

## 📊 Uso del Dashboard

### 1. Acceso
- **URL**: `http://tu-servidor` o `https://tu-dominio.com`
- **API**: `http://tu-servidor:8000` o `https://tu-dominio.com/api`

### 2. Subir Archivos CSV
- Usar la interfaz web
- O copiar directamente a `/var/www/csv-dashboard/data/`

### 3. Visualizar Datos
- Seleccionar archivo de la lista
- Elegir tipo de gráfico (línea, barras, circular)
- Los datos se actualizan automáticamente

## 🔧 Mantenimiento

### 1. Actualizaciones
```bash
cd /var/www/csv-dashboard
sudo git pull
sudo systemctl restart csv-dashboard
sudo systemctl restart nginx
```

### 2. Backups
```bash
# Backup manual
sudo chmod +x scripts/backup.sh
sudo ./scripts/backup.sh

# Backup automático (crontab)
sudo crontab -e
# Agregar: 0 2 * * * /var/www/csv-dashboard/scripts/backup.sh
```

### 3. Logs
```bash
# Backend logs
sudo journalctl -u csv-dashboard -f

# NGINX logs
sudo tail -f /var/log/nginx/dashboard_error.log
sudo tail -f /var/log/nginx/dashboard_access.log
```

## 🆘 Troubleshooting

### Problemas Comunes

#### 1. Backend no responde
```bash
# Verificar servicio
sudo systemctl status csv-dashboard

# Verificar puerto
sudo netstat -tlnp | grep 8000

# Reiniciar servicio
sudo systemctl restart csv-dashboard
```

#### 2. NGINX no funciona
```bash
# Verificar configuración
sudo nginx -t

# Verificar puerto 80
sudo netstat -tlnp | grep :80

# Reiniciar NGINX
sudo systemctl restart nginx
```

#### 3. Error de permisos
```bash
# Corregir permisos
sudo chown -R www-data:www-data /var/www/csv-dashboard
sudo chmod -R 755 /var/www/csv-dashboard
```

#### 4. Puerto ocupado
```bash
# Ver qué usa el puerto
sudo lsof -i :8000
sudo lsof -i :80

# Matar proceso si es necesario
sudo kill -9 PID
```

### Logs de Error

#### Backend Errors
```bash
sudo journalctl -u csv-dashboard -n 50 --no-pager
```

#### NGINX Errors
```bash
sudo tail -n 50 /var/log/nginx/dashboard_error.log
```

## 🔒 Seguridad

### 1. Firewall
```bash
# Configurar UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Usuarios
```bash
# Crear usuario específico (opcional)
sudo adduser csv-dashboard
sudo usermod -aG www-data csv-dashboard
```

### 3. Certificados SSL
```bash
# Verificar certificado
sudo certbot certificates

# Renovar manualmente
sudo certbot renew
```

## 📈 Monitoreo

### 1. Estado de Servicios
```bash
# Verificar todos los servicios
sudo systemctl status csv-dashboard nginx

# Verificar puertos
sudo ss -tlnp | grep -E ':(80|443|8000)'
```

### 2. Recursos del Sistema
```bash
# CPU y memoria
htop

# Disco
df -h

# Logs en tiempo real
sudo tail -f /var/log/nginx/dashboard_access.log
```

## 🚀 Optimización

### 1. NGINX
```bash
# Editar configuración
sudo nano /etc/nginx/nginx.conf

# Ajustar worker_processes según CPU
worker_processes auto;

# Ajustar worker_connections
events {
    worker_connections 1024;
}
```

### 2. Python Backend
```bash
# Ajustar workers de Uvicorn
# En scripts/csv-dashboard.service
ExecStart=/usr/local/bin/uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📞 Soporte

### Recursos Útiles
- **Documentación FastAPI**: https://fastapi.tiangolo.com/
- **Documentación NGINX**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/docs/

### Comandos de Emergencia
```bash
# Reiniciar todo
sudo systemctl restart csv-dashboard nginx

# Ver estado completo
sudo systemctl status csv-dashboard nginx --no-pager

# Ver logs completos
sudo journalctl -u csv-dashboard --no-pager | tail -100
```
