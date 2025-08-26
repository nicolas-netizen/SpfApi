#!/bin/bash

echo "🚀 CSV Dashboard - Instalación y inicio fácil"
echo

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Función para crear entorno virtual
create_venv() {
    echo -e "${BLUE}📦 Creando entorno virtual de Python...${NC}"
    python3 -m venv venv
    source venv/bin/activate
    echo -e "${GREEN}✅ Entorno virtual creado${NC}"
}

# Función para instalar dependencias
install_deps() {
    echo -e "${BLUE}📦 Instalando dependencias de Python...${NC}"
    source venv/bin/activate
    echo -e "${YELLOW}⏳ Instalando Flask y dependencias...${NC}"
    pip install flask==2.3.3 flask-cors==4.0.0 numpy==1.26.4 pandas==2.1.4 werkzeug==2.3.7
    
    echo -e "${BLUE}📦 Instalando dependencias de Node.js...${NC}"
    cd frontend
    npm install
    cd ..
    
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
}

# Función para iniciar servicios
start_services() {
    echo -e "${YELLOW}🔧 Iniciando backend Flask...${NC}"
    
    # Verificar puertos antes de iniciar
    check_ports
    
    source venv/bin/activate
    cd backend
    
    # Verificar que app.py existe
    if [ ! -f "app.py" ]; then
        echo -e "${RED}❌ Error: app.py no encontrado en backend/${NC}"
        return 1
    fi
    
    # Iniciar Flask en background
    python3 app.py &
    BACKEND_PID=$!
    cd ..
    
    echo -e "${YELLOW}⏳ Esperando backend Flask...${NC}"
    sleep 8
    
    # Verificar que el backend esté funcionando
    echo -e "${YELLOW}🔍 Verificando conectividad del backend...${NC}"
    if curl -s http://localhost:8000/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend Flask funcionando en puerto 8000${NC}"
    else
        echo -e "${RED}❌ Error: Backend no responde en puerto 8000${NC}"
        echo -e "${YELLOW}💡 Verificando si hay algún error...${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}🌐 Iniciando frontend...${NC}"
    cd frontend
    npm run dev -- --host 0.0.0.0 &
    FRONTEND_PID=$!
    cd ..
    
    # Guardar PIDs
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
    
    echo -e "${GREEN}🎉 ¡Dashboard iniciado!${NC}"
    echo -e "${BLUE}📍 Backend Flask: http://0.0.0.0:8000${NC}"
    echo -e "${BLUE}📍 Frontend: http://0.0.0.0:3000${NC}"
    echo -e "${YELLOW}💡 Para acceder desde Windows, usa tu IP de Ubuntu${NC}"
}

# Función para obtener IP
get_ip() {
    IP=$(hostname -I | awk '{print $1}')
    echo -e "${BLUE}🌐 Tu IP de Ubuntu es: ${IP}${NC}"
    echo -e "${GREEN}📍 URLs para acceder desde Windows:${NC}"
    echo -e "${GREEN}   Backend Flask: http://${IP}:8000${NC}"
    echo -e "${GREEN}   Frontend: http://${IP}:3000${NC}"
    echo -e "${GREEN}   Admin Panel: http://${IP}:3000/admin.html${NC}"
}

# Función para verificar estado
check_status() {
    echo -e "${BLUE}📊 Estado del dashboard:${NC}"
    
    # Verificar backend
    if [ -f .backend.pid ]; then
        PID=$(cat .backend.pid)
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend Flask ejecutándose (PID: $PID)${NC}"
            if curl -s http://localhost:8000/ > /dev/null 2>&1; then
                echo -e "${GREEN}   🌐 Backend responde en puerto 8000${NC}"
                echo -e "${GREEN}   📍 URL: http://192.168.1.72:8000${NC}"
            else
                echo -e "${RED}   ❌ Backend no responde en puerto 8000${NC}"
            fi
        else
            echo -e "${RED}❌ Backend no ejecutándose (PID inválido)${NC}"
            rm .backend.pid
        fi
    else
        echo -e "${RED}❌ Backend no ejecutándose${NC}"
    fi
    
    # Verificar frontend
    if [ -f .frontend.pid ]; then
        PID=$(cat .frontend.pid)
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Frontend ejecutándose (PID: $PID)${NC}"
            if curl -s http://localhost:3000/ > /dev/null 2>&1; then
                echo -e "${GREEN}   🌐 Frontend responde en puerto 3000${NC}"
                echo -e "${GREEN}   📍 URL: http://192.168.1.72:3000${NC}"
            else
                echo -e "${RED}   ❌ Frontend no responde en puerto 3000${NC}"
            fi
        else
            echo -e "${RED}❌ Frontend no ejecutándose (PID inválido)${NC}"
            rm .frontend.pid
        fi
    else
        echo -e "${RED}❌ Frontend no ejecutándose${NC}"
    fi
    
    # Verificar puertos
    echo -e "${BLUE}🔍 Estado de puertos:${NC}"
    if netstat -tlnp | grep :8000 > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Puerto 8000 en uso${NC}"
    else
        echo -e "${RED}   ❌ Puerto 8000 libre${NC}"
    fi
    
    if netstat -tlnp | grep :3000 > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Puerto 3000 en uso${NC}"
    else
        echo -e "${RED}   ❌ Puerto 3000 libre${NC}"
    fi
    
    get_ip
}

# Función para detener servicios
stop_services() {
    echo -e "${RED}🛑 Deteniendo servicios...${NC}"
    
    # Detener por PID si existe
    if [ -f .backend.pid ]; then
        PID=$(cat .backend.pid)
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID 2>/dev/null
            echo -e "${GREEN}✅ Backend detenido${NC}"
        fi
        rm .backend.pid
    fi
    
    if [ -f .frontend.pid ]; then
        PID=$(cat .frontend.pid)
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID 2>/dev/null
            echo -e "${GREEN}✅ Frontend detenido${NC}"
        fi
        rm .frontend.pid
    fi
    
    # Detener procesos por nombre como respaldo
    pkill -f "python3 app.py" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    
    echo -e "${GREEN}✅ Servicios detenidos${NC}"
}

# Función para verificar puertos
check_ports() {
    echo -e "${BLUE}🔍 Verificando puertos disponibles...${NC}"
    
    # Verificar puerto 8000
    if netstat -tlnp | grep :8000 > /dev/null 2>&1; then
        echo -e "${RED}❌ Puerto 8000 ya está en uso${NC}"
        echo -e "${YELLOW}💡 Deteniendo proceso en puerto 8000...${NC}"
        sudo fuser -k 8000/tcp 2>/dev/null || pkill -f "python3 app.py" 2>/dev/null
        sleep 2
    else
        echo -e "${GREEN}✅ Puerto 8000 disponible${NC}"
    fi
    
    # Verificar puerto 3000
    if netstat -tlnp | grep :3000 > /dev/null 2>&1; then
        echo -e "${RED}❌ Puerto 3000 ya está en uso${NC}"
        echo -e "${YELLOW}💡 Deteniendo proceso en puerto 3000...${NC}"
        sudo fuser -k 3000/tcp 2>/dev/null || pkill -f "vite" 2>/dev/null
        sleep 2
    else
        echo -e "${GREEN}✅ Puerto 3000 disponible${NC}"
    fi
}

# Función para reiniciar servicios
restart_services() {
    echo -e "${YELLOW}🔄 Reiniciando servicios...${NC}"
    stop_services
    sleep 3
    start_services
    if [ $? -eq 0 ]; then
        get_ip
        echo -e "${GREEN}✅ Servicios reiniciados exitosamente${NC}"
    else
        echo -e "${RED}❌ Error al reiniciar servicios${NC}"
    fi
}

# Función para ver logs del backend
show_logs() {
    echo -e "${BLUE}📋 Logs del backend:${NC}"
    if [ -f .backend.pid ]; then
        PID=$(cat .backend.pid)
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend ejecutándose (PID: $PID)${NC}"
            echo -e "${YELLOW}💡 Para ver logs en tiempo real, presiona Ctrl+C${NC}"
            echo -e "${BLUE}📝 Últimas líneas del log:${NC}"
            tail -n 20 /proc/$PID/fd/1 2>/dev/null || echo "No se pueden mostrar logs"
        else
            echo -e "${RED}❌ Backend no ejecutándose${NC}"
        fi
    else
        echo -e "${RED}❌ Backend no ejecutándose${NC}"
    fi
}

# Función para limpiar entorno
clean_environment() {
    echo -e "${YELLOW}🧹 Limpiando entorno...${NC}"
    
    # Detener servicios
    stop_services
    
    # Eliminar archivos temporales
    rm -f .backend.pid .frontend.pid
    
    # Eliminar entorno virtual
    if [ -d "venv" ]; then
        echo -e "${YELLOW}🗑️ Eliminando entorno virtual...${NC}"
        rm -rf venv
    fi
    
    # Limpiar cache de pip
    echo -e "${YELLOW}🗑️ Limpiando cache de pip...${NC}"
    pip cache purge 2>/dev/null || true
    
    # Limpiar node_modules (opcional)
    if [ -d "frontend/node_modules" ]; then
        echo -e "${YELLOW}🗑️ Eliminando node_modules...${NC}"
        rm -rf frontend/node_modules
    fi
    
    echo -e "${GREEN}✅ Entorno limpiado completamente${NC}"
    echo -e "${BLUE}💡 Ejecuta opción 1 para reinstalar todo desde cero${NC}"
}

# Función para verificar dependencias
check_dependencies() {
    echo -e "${BLUE}🔍 Verificando dependencias...${NC}"
    
    # Verificar Python
    if command -v python3 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Python3 disponible: $(python3 --version)${NC}"
    else
        echo -e "${RED}❌ Python3 no disponible${NC}"
    fi
    
    # Verificar pip
    if command -v pip >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Pip disponible: $(pip --version)${NC}"
    else
        echo -e "${RED}❌ Pip no disponible${NC}"
    fi
    
    # Verificar Node.js
    if command -v node >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Node.js disponible: $(node --version)${NC}"
    else
        echo -e "${RED}❌ Node.js no disponible${NC}"
    fi
    
    # Verificar npm
    if command -v npm >/dev/null 2>&1; then
        echo -e "${GREEN}✅ NPM disponible: $(npm --version)${NC}"
    else
        echo -e "${RED}❌ NPM no disponible${NC}"
    fi
    
    # Verificar entorno virtual
    if [ -d "venv" ]; then
        echo -e "${GREEN}✅ Entorno virtual existe${NC}"
        source venv/bin/activate
        
        # Verificar dependencias Python instaladas
        echo -e "${BLUE}📦 Dependencias Python instaladas:${NC}"
        if pip show flask >/dev/null 2>&1; then
            echo -e "${GREEN}   ✅ Flask: $(pip show flask | grep Version | cut -d' ' -f2)${NC}"
        else
            echo -e "${RED}   ❌ Flask no instalado${NC}"
        fi
        
        if pip show pandas >/dev/null 2>&1; then
            echo -e "${GREEN}   ✅ Pandas: $(pip show pandas | grep Version | cut -d' ' -f2)${NC}"
        else
            echo -e "${RED}   ❌ Pandas no instalado${NC}"
        fi
        
        if pip show numpy >/dev/null 2>&1; then
            echo -e "${GREEN}   ✅ Numpy: $(pip show numpy | grep Version | cut -d' ' -f2)${NC}"
        else
            echo -e "${RED}   ❌ Numpy no instalado${NC}"
        fi
    else
        echo -e "${RED}❌ Entorno virtual no existe${NC}"
    fi
    
    # Verificar dependencias Node.js
    if [ -d "frontend/node_modules" ]; then
        echo -e "${GREEN}✅ node_modules existe${NC}"
        echo -e "${BLUE}📦 Dependencias Node.js instaladas:${NC}"
        cd frontend
        if [ -f "package-lock.json" ]; then
            echo -e "${GREEN}   ✅ package-lock.json encontrado${NC}"
        else
            echo -e "${RED}   ❌ package-lock.json no encontrado${NC}"
        fi
        cd ..
    else
        echo -e "${RED}❌ node_modules no existe${NC}"
    fi
}

# Función para crear backup
create_backup() {
    echo -e "${BLUE}💾 Creando backup del proyecto...${NC}"
    
    # Crear directorio de backups si no existe
    mkdir -p ../SpfApi_backups
    
    # Crear nombre del backup con timestamp
    BACKUP_NAME="SpfApi_backup_$(date +%Y%m%d_%H%M%S)"
    BACKUP_PATH="../SpfApi_backups/$BACKUP_NAME"
    
    echo -e "${YELLOW}📁 Creando backup: $BACKUP_NAME${NC}"
    
    # Crear backup excluyendo archivos innecesarios
    tar --exclude='venv' --exclude='frontend/node_modules' --exclude='.git' \
        --exclude='*.pyc' --exclude='__pycache__' \
        -czf "$BACKUP_PATH.tar.gz" .
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup creado exitosamente: $BACKUP_PATH.tar.gz${NC}"
        echo -e "${BLUE}📊 Tamaño del backup: $(du -h "$BACKUP_PATH.tar.gz" | cut -f1)${NC}"
    else
        echo -e "${RED}❌ Error al crear backup${NC}"
    fi
}

# Función para restaurar backup
restore_backup() {
    echo -e "${BLUE}🔄 Restaurando backup...${NC}"
    
    # Listar backups disponibles
    if [ ! -d "../SpfApi_backups" ] || [ -z "$(ls -A ../SpfApi_backups 2>/dev/null)" ]; then
        echo -e "${RED}❌ No hay backups disponibles${NC}"
        return 1
    fi
    
    echo -e "${BLUE}📁 Backups disponibles:${NC}"
    ls -la ../SpfApi_backups/*.tar.gz 2>/dev/null | nl
    
    echo -e "${YELLOW}💡 Para restaurar, selecciona el número del backup:${NC}"
    read -p "Número del backup: " backup_num
    
    # Obtener el archivo seleccionado
    BACKUP_FILE=$(ls ../SpfApi_backups/*.tar.gz 2>/dev/null | sed -n "${backup_num}p")
    
    if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}❌ Backup no válido${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}🔄 Restaurando: $(basename "$BACKUP_FILE")${NC}"
    
    # Detener servicios antes de restaurar
    stop_services
    
    # Crear backup del estado actual
    create_backup
    
    # Restaurar backup
    tar -xzf "$BACKUP_FILE" -C . --strip-components=0
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup restaurado exitosamente${NC}"
        echo -e "${BLUE}💡 Ejecuta opción 1 para reinstalar dependencias${NC}"
    else
        echo -e "${RED}❌ Error al restaurar backup${NC}"
    fi
}

# Función para monitoreo en tiempo real
monitor_system() {
    echo -e "${BLUE}📊 Monitoreo del sistema en tiempo real${NC}"
    echo -e "${YELLOW}💡 Presiona Ctrl+C para salir${NC}"
    echo
    
    # Función para mostrar estadísticas
    show_stats() {
        clear
        echo -e "${BLUE}📊 Monitoreo del Sistema - $(date)${NC}"
        echo "=================================================="
        
        # Uso de CPU y memoria
        echo -e "${GREEN}💻 CPU y Memoria:${NC}"
        top -bn1 | grep "Cpu(s)" | awk '{print "CPU: " $2}' | head -1
        free -h | grep "Mem:" | awk '{print "Memoria: " $3 "/" $2 " (" $3/$2*100 "%)"}'
        
        # Uso de disco
        echo -e "${GREEN}💾 Disco:${NC}"
        df -h / | awk 'NR==2 {print "Disco: " $3 "/" $2 " (" $5 ")"}'
        
        # Procesos del proyecto
        echo -e "${GREEN}🚀 Procesos del Proyecto:${NC}"
        if [ -f .backend.pid ]; then
            PID=$(cat .backend.pid)
            if ps -p $PID > /dev/null 2>&1; then
                echo -e "   ✅ Backend Flask (PID: $PID) - $(ps -p $PID -o %cpu,%mem --no-headers)"
            else
                echo -e "   ❌ Backend no ejecutándose"
            fi
        else
            echo -e "   ❌ Backend no ejecutándose"
        fi
        
        if [ -f .frontend.pid ]; then
            PID=$(cat .frontend.pid)
            if ps -p $PID > /dev/null 2>&1; then
                echo -e "   ✅ Frontend (PID: $PID) - $(ps -p $PID -o %cpu,%mem --no-headers)"
            else
                echo -e "   ❌ Frontend no ejecutándose"
            fi
        else
            echo -e "   ❌ Frontend no ejecutándose"
        fi
        
        # Puertos en uso
        echo -e "${GREEN}🌐 Puertos:${NC}"
        if netstat -tlnp | grep :8000 > /dev/null 2>&1; then
            echo -e "   ✅ Puerto 8000 (Backend) - Activo"
        else
            echo -e "   ❌ Puerto 8000 (Backend) - Inactivo"
        fi
        
        if netstat -tlnp | grep :3000 > /dev/null 2>&1; then
            echo -e "   ✅ Puerto 3000 (Frontend) - Activo"
        else
            echo -e "   ❌ Puerto 3000 (Frontend) - Inactivo"
        fi
        
        # Conexiones activas
        echo -e "${GREEN}🔗 Conexiones Activas:${NC}"
        netstat -an | grep :8000 | wc -l | awk '{print "   Backend (8000): " $1 " conexiones"}'
        netstat -an | grep :3000 | wc -l | awk '{print "   Frontend (3000): " $1 " conexiones"}'
        
        echo "=================================================="
        echo -e "${YELLOW}💡 Actualizando cada 5 segundos... Presiona Ctrl+C para salir${NC}"
    }
    
    # Mostrar estadísticas cada 5 segundos
    while true; do
        show_stats
        sleep 5
    done
}

# Menú principal
echo -e "${YELLOW}Selecciona una opción:${NC}"
echo "1) Instalar todo desde cero"
echo "2) Solo iniciar (si ya está instalado)"
echo "3) Solo instalar dependencias"
echo "4) Ver estado"
echo "5) Detener todo"
echo "6) Ver IP y URLs"
echo "7) Verificar puertos"
echo "8) Reiniciar servicios"
echo "9) Ver logs del backend"
echo "10) Limpiar entorno completamente"
echo "11) Verificar dependencias"
echo "12) Crear backup"
echo "13) Restaurar backup"
echo "14) Monitoreo en tiempo real"
echo

read -p "Opción: " choice

case $choice in
    1)
        create_venv
        install_deps
        start_services
        if [ $? -eq 0 ]; then
            get_ip
        else
            echo -e "${RED}❌ Error al iniciar servicios${NC}"
        fi
        ;;
    2)
        start_services
        if [ $? -eq 0 ]; then
            get_ip
        else
            echo -e "${RED}❌ Error al iniciar servicios${NC}"
        fi
        ;;
    3)
        create_venv
        install_deps
        ;;
    4)
        check_status
        ;;
    5)
        stop_services
        ;;
    6)
        get_ip
        ;;
    7)
        check_ports
        ;;
    8)
        restart_services
        ;;
    9)
        show_logs
        ;;
    10)
        clean_environment
        ;;
    11)
        check_dependencies
        ;;
    12)
        create_backup
        ;;
    13)
        restore_backup
        ;;
    14)
        monitor_system
        ;;
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        ;;
esac