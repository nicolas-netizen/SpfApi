# 🚀 CSV Dashboard - Guía de Instalación para Windows

Esta guía te ayudará a ejecutar la aplicación CSV Dashboard en Windows sin problemas de compilación de pandas.

## 🎯 Problema Solucionado

El error original era:
```
error: Microsoft Visual C++ 14.0 or greater is required. Get it with "Microsoft C++ Build Tools"
```

Esto ocurría porque pandas intentaba compilarse desde el código fuente. Nuestra solución instala versiones precompiladas.

## 🚀 Instalación Rápida

### Opción 1: Script Automático (Recomendado)

1. **Ejecutar PowerShell como Administrador**
2. **Cambiar política de ejecución:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. **Ejecutar el script:**
   ```powershell
   .\install-windows.ps1
   ```

### Opción 2: Script Batch

Simplemente ejecuta:
```
install-windows.bat
```

### Opción 3: Comandos Manuales

```bash
# Instalar dependencias básicas
pip install flask flask-cors werkzeug

# Instalar pandas precompilado (evita errores de compilación)
pip install --only-binary=all pandas numpy

# Instalar frontend
cd frontend
npm install
```

## 🔧 Ejecutar la Aplicación

### 1. Backend (Terminal 1)
```bash
cd backend
python app.py
```
**URL:** http://localhost:8000

### 2. Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
**URL:** http://localhost:3000

## 🐛 Solución de Problemas

### Error: "Microsoft Visual C++ 14.0 required"
**Solución:** Usar `pip install --only-binary=all pandas numpy`

### Error: "pandas no se puede importar"
**Solución:** Reinstalar pandas:
```bash
pip uninstall pandas
pip install --only-binary=all pandas
```

### Error: "flask no se puede importar"
**Solución:** Verificar instalación:
```bash
pip list | findstr flask
```

## 📁 Estructura del Proyecto

```
SpfApi/
├── backend/           # Flask + Python
│   ├── app.py        # API principal
│   ├── requirements.txt
│   └── requirements-windows.txt
├── frontend/          # React + Vite
├── install-windows.bat
├── install-windows.ps1
└── Makefile
```

## 🎮 Comandos Make (si tienes Make instalado)

```bash
# Instalar dependencias para Windows
make install-windows

# Ejecutar backend en Windows
make run-backend-windows

# Ejecutar frontend
make run-frontend

# Configurar entorno completo
make dev-windows
```

## 🌐 URLs de Acceso

- **Backend API:** http://localhost:8000
- **Frontend:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin.html

## 📊 Características

- ✅ **Backend Flask** con API REST
- ✅ **Frontend React** con Vite
- ✅ **Manejo de CSV** con pandas precompilado
- ✅ **CORS habilitado** para desarrollo
- ✅ **Subida de archivos** CSV
- ✅ **CRUD completo** para KPIs

## 🔍 Verificar Instalación

```bash
# Verificar Python
python --version

# Verificar pip
pip --version

# Verificar paquetes instalados
pip list | findstr -i "flask pandas numpy"
```

## 🆘 Soporte

Si encuentras problemas:

1. **Verifica Python:** Debe estar en el PATH
2. **Verifica pip:** Debe estar actualizado
3. **Usa versiones precompiladas:** `--only-binary=all`
4. **Reinicia terminal:** Después de instalar Python

## 📝 Notas Importantes

- **Python 3.8+** recomendado
- **Node.js 16+** requerido para frontend
- **Pandas precompilado** evita errores de compilación
- **Puertos 8000 y 3000** deben estar libres

---

¡Con estas instrucciones deberías poder ejecutar la aplicación sin problemas en Windows! 🎉
