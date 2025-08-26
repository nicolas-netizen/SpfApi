@echo off
echo 🚀 Instalando dependencias para Windows...
echo.

echo 📦 Instalando Flask y dependencias basicas...
pip install flask flask-cors werkzeug

echo 📦 Instalando pandas precompilado (evita errores de compilacion)...
pip install --only-binary=all pandas numpy

echo.
echo ✅ Instalacion completada!
echo.
echo 🔧 Para ejecutar el backend:
echo    cd backend
echo    python app.py
echo.
echo 🌐 Para ejecutar el frontend:
echo    cd frontend
echo    npm install
echo    npm run dev
echo.
pause
