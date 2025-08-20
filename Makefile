.PHONY: help install-dev run-backend run-frontend build build-frontend test clean deploy

help: ## Mostrar ayuda
	@echo "CSV Dashboard - Comandos disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install-dev: ## Instalar dependencias de desarrollo
	@echo "Instalando dependencias de desarrollo..."
	cd backend && pip3 install -r requirements.txt
	cd frontend && npm install

run-backend: ## Ejecutar backend en modo desarrollo
	@echo "Ejecutando backend..."
	cd backend && python3 -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload

run-frontend: ## Ejecutar frontend en modo desarrollo
	@echo "Ejecutando frontend..."
	cd frontend && npm run dev

build-frontend: ## Construir frontend para producción
	@echo "Construyendo frontend..."
	cd frontend && npm run build

build: build-frontend ## Construir todo el proyecto
	@echo "Proyecto construido"

test: ## Ejecutar tests
	@echo "Ejecutando tests..."
	cd backend && python3 -m pytest tests/ || echo "No hay tests configurados"

clean: ## Limpiar archivos generados
	@echo "Limpiando archivos..."
	rm -rf frontend/dist
	rm -rf frontend/node_modules
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete

deploy: build ## Desplegar en Ubuntu (requiere sudo)
	@echo "Desplegando en Ubuntu..."
	@echo "Asegúrate de estar en el servidor Ubuntu y tener permisos sudo"
	sudo chmod +x scripts/deploy.sh
	sudo ./scripts/deploy.sh

docker-up: ## Levantar servicios con Docker Compose
	@echo "Levantando servicios con Docker..."
	docker-compose up -d

docker-down: ## Detener servicios de Docker Compose
	@echo "Deteniendo servicios de Docker..."
	docker-compose down

docker-logs: ## Ver logs de Docker Compose
	docker-compose logs -f

dev: install-dev ## Configurar entorno de desarrollo completo
	@echo "Entorno de desarrollo configurado"
	@echo "Ejecuta 'make run-backend' en una terminal"
	@echo "Ejecuta 'make run-frontend' en otra terminal"

status: ## Ver estado de los servicios
	@echo "Estado de los servicios:"
	@echo "Backend (puerto 8000):"
	@curl -s http://localhost:8000/ > /dev/null && echo "  ✅ Funcionando" || echo "  ❌ No responde"
	@echo "Frontend (puerto 3000):"
	@curl -s http://localhost:3000/ > /dev/null && echo "  ✅ Funcionando" || echo "  ❌ No responde"
	@echo "NGINX (puerto 80):"
	@curl -s http://localhost/ > /dev/null && echo "  ✅ Funcionando" || echo "  ❌ No responde"
