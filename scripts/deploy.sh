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
    pip install -r backend/requirements.txt
    
    echo -e "${BLUE}📦 Instalando dependencias de Node.js...${NC}"
    cd frontend
    npm install
    cd ..
    
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
}

# Función para iniciar servicios
start_services() {
    echo -e "${YELLOW}🔧 Iniciando backend...${NC}"
    source venv/bin/activate
    cd backend
    python3 -m uvicorn app:app --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    cd ..
    
    echo -e "${YELLOW}⏳ Esperando backend...${NC}"
    sleep 3
    
    echo -e "${YELLOW}🌐 Iniciando frontend...${NC}"
    cd frontend
    npm run dev -- --host 0.0.0.0 &
    FRONTEND_PID=$!
    cd ..
    
    # Guardar PIDs
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
    
    echo -e "${GREEN}🎉 ¡Dashboard iniciado!${NC}"
    echo -e "${BLUE}📍 Backend: http://0.0.0.0:8000${NC}"
    echo -e "${BLUE}📍 Frontend: http://0.0.0.0:3000${NC}"
    echo -e "${YELLOW}💡 Para acceder desde Windows, usa tu IP de Ubuntu${NC}"
}

# Función para obtener IP
get_ip() {
    IP=$(hostname -I | awk '{print $1}')
    echo -e "${BLUE}🌐 Tu IP de Ubuntu es: ${IP}${NC}"
    echo -e "${GREEN}📍 URLs para acceder desde Windows:${NC}"
    echo -e "${GREEN}   Backend: http://${IP}:8000${NC}"
    echo -e "${GREEN}   Frontend: http://${IP}:3000${NC}"
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
        get_ip
        ;;
    2)
        start_services
        get_ip
        ;;
    3)
        create_venv
        install_deps
        ;;
    4)
        echo -e "${BLUE}📊 Estado del dashboard:${NC}"
        if [ -f .backend.pid ]; then
            echo -e "${GREEN}✅ Backend ejecutándose${NC}"
        else
            echo -e "${RED}❌ Backend detenido${NC}"
        fi
        if [ -f .frontend.pid ]; then
            echo -e "${GREEN}✅ Frontend ejecutándose${NC}"
        else
            echo -e "${RED}❌ Frontend detenido${NC}"
        fi
        get_ip
        ;;
    5)
        echo -e "${RED}🛑 Deteniendo servicios...${NC}"
        if [ -f .backend.pid ]; then
            kill $(cat .backend.pid) 2>/dev/null
            rm .backend.pid
        fi
        if [ -f .frontend.pid ]; then
            kill $(cat .frontend.pid) 2>/dev/null
            rm .frontend.pid
        fi
        pkill -f "uvicorn" 2>/dev/null
        pkill -f "vite" 2>/dev/null
        echo -e "${GREEN}✅ Servicios detenidos${NC}"
        ;;
    6)
        get_ip
        ;;
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        ;;
esac