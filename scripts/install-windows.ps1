# Script de instalación para Windows PowerShell
# Ejecutar como: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Luego: .\install-windows.ps1

Write-Host "🚀 CSV Dashboard - Instalación para Windows" -ForegroundColor Green
Write-Host ""

# Verificar si Python está instalado
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "💡 Instala Python desde: https://python.org" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "✅ Python encontrado: $(python --version)" -ForegroundColor Green

# Verificar si pip está disponible
if (-not (Get-Command pip -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Pip no está disponible" -ForegroundColor Red
    Write-Host "💡 Reinstala Python y marca 'Add to PATH'" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "✅ Pip encontrado: $(pip --version)" -ForegroundColor Green

# Actualizar pip
Write-Host "📦 Actualizando pip..." -ForegroundColor Blue
python -m pip install --upgrade pip

# Instalar dependencias básicas
Write-Host "📦 Instalando Flask y dependencias básicas..." -ForegroundColor Blue
pip install flask flask-cors werkzeug

# Instalar pandas precompilado
Write-Host "📦 Instalando pandas precompilado (evita errores de compilación)..." -ForegroundColor Blue
pip install --only-binary=all pandas numpy

# Verificar instalación
Write-Host "🔍 Verificando instalación..." -ForegroundColor Blue
$packages = @("flask", "flask-cors", "pandas", "numpy", "werkzeug")
foreach ($package in $packages) {
    try {
        $version = pip show $package | Select-String "Version" | ForEach-Object { $_.ToString().Split(":")[1].Trim() }
        Write-Host "✅ $package v$version" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ $package no instalado correctamente" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Instalación completada!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Para ejecutar el backend:" -ForegroundColor Blue
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   python app.py" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Para ejecutar el frontend:" -ForegroundColor Blue
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm install" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""

# Preguntar si quiere ejecutar ahora
$runNow = Read-Host "¿Quieres ejecutar la aplicación ahora? (s/n)"
if ($runNow -eq "s" -or $runNow -eq "S" -or $runNow -eq "si" -or $runNow -eq "SI") {
    Write-Host "🚀 Iniciando aplicación..." -ForegroundColor Green
    
    # Iniciar backend en una nueva ventana
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python app.py"
    
    # Esperar un poco y luego iniciar frontend
    Start-Sleep -Seconds 3
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm install; npm run dev"
    
    Write-Host "✅ Aplicación iniciada en ventanas separadas" -ForegroundColor Green
    Write-Host "🌐 Backend: http://localhost:8000" -ForegroundColor Blue
    Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Blue
}

Read-Host "Presiona Enter para salir"
