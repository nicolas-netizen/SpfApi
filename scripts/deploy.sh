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
    pip install flask==2.3.3 flask-cors==4.0.0 pandas==2.0.3 werkzeug==2.3.7
    
    echo -e "${BLUE}📦 Instalando dependencias de Node.js...${NC}"
    cd frontend
    npm install
    cd ..
    
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
}

# Función para iniciar servicios
start_services() {
    echo -e "${YELLOW}🔧 Iniciando backend Flask...${NC}"
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
    sleep 5
    
    # Verificar que el backend esté funcionando
    if curl -s http://localhost:8000/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend Flask funcionando en puerto 8000${NC}"
    else
        echo -e "${RED}❌ Error: Backend no responde en puerto 8000${NC}"
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

# Menú principal
echo -e "${YELLOW}Selecciona una opción:${NC}"
echo "1) Instalar todo desde cero"
echo "2) Solo iniciar (si ya está instalado)"
echo "3) Solo instalar dependencias"
echo "4) Ver estado"
echo "5) Detener todo"
echo "6) Ver IP y URLs"
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
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        ;;
esac