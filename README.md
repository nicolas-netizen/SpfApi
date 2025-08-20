# 🚀 CSV Dashboard - Backend + Frontend

Un dashboard completo para visualizar datos CSV con backend Python (FastAPI) y frontend React.

## 📁 Estructura del Proyecto

```
csv-dashboard/
├── backend/           # FastAPI + Python
├── frontend/          # React + Vite
├── scripts/           # Scripts de despliegue Ubuntu
├── data/              # Carpeta para tus archivos CSV
└── docs/              # Documentación
```

## 🚀 Despliegue Rápido en Ubuntu

### 1. Preparar el Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install python3-pip nodejs npm nginx git -y

# Clonar el proyecto
git clone <tu-repo>
cd csv-dashboard
```

### 2. Configurar Backend

```bash
cd backend
pip3 install -r requirements.txt

# Probar el backend
python3 -m uvicorn app:app --host 0.0.0.0 --port 8000
```

### 3. Configurar Frontend

```bash
cd frontend
npm install
npm run build
```

### 4. Configurar NGINX

```bash
# Copiar configuración
sudo cp ../scripts/nginx-dashboard /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/nginx-dashboard /etc/nginx/sites-enabled/

# Reiniciar NGINX
sudo systemctl restart nginx
```

### 5. Configurar Servicios del Sistema

```bash
# Backend como servicio
sudo cp ../scripts/csv-dashboard.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable csv-dashboard
sudo systemctl start csv-dashboard
```

## 📊 Uso

1. Coloca tu archivo CSV en la carpeta `data/`
2. El backend automáticamente detecta y sirve los datos
3. Accede a `http://tu-servidor` para ver el dashboard
4. Los datos se actualizan automáticamente

## 🔧 Configuración

- **Puerto Backend**: 8000
- **Puerto Frontend**: 80 (NGINX)
- **Archivos CSV**: Carpeta `data/`

## 📈 Características

- ✅ Lectura automática de CSV
- ✅ API REST con FastAPI
- ✅ Dashboard React con gráficos
- ✅ Despliegue automático en Ubuntu
- ✅ Servicios del sistema configurados
- ✅ NGINX como proxy reverso

## 🆘 Troubleshooting

### Verificar servicios:
```bash
sudo systemctl status csv-dashboard
sudo systemctl status nginx
```

### Ver logs:
```bash
sudo journalctl -u csv-dashboard -f
sudo tail -f /var/log/nginx/error.log
```

## 📝 Licencia

MIT License - Libre para uso comercial y personal
