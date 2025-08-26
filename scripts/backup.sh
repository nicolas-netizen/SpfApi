
set -e

echo "💾 Iniciando backup de CSV Dashboard..."


PROJECT_DIR="/var/www/csv-dashboard"
BACKUP_DIR="/var/backups/csv-dashboard"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="csv-dashboard_$DATE.tar.gz"

mkdir -p $BACKUP_DIR

echo "📦 Creando backup..."
tar -czf $BACKUP_DIR/$BACKUP_NAME \
    -C $PROJECT_DIR \
    backend/ \
    data/ \
    scripts/ \
    --exclude='frontend/node_modules' \
    --exclude='frontend/dist'

gzip -f $BACKUP_DIR/$BACKUP_NAME

echo "🧹 Limpiando backups antiguos..."
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

if [ -f "$BACKUP_DIR/$BACKUP_NAME.gz" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME.gz" | cut -f1)
    echo "✅ Backup creado exitosamente: $BACKUP_NAME.gz ($BACKUP_SIZE)"
    echo "📁 Ubicación: $BACKUP_DIR/$BACKUP_NAME.gz"
else
    echo "❌ Error creando backup"
    exit 1
fi

# Mostrar backups disponibles
echo ""
echo "📋 Backups disponibles:"
ls -lh $BACKUP_DIR/*.tar.gz 2>/dev/null || echo "No hay backups disponibles"

echo ""
echo "💡 Para restaurar: tar -xzf $BACKUP_DIR/$BACKUP_NAME.gz -C /tmp/"
echo "💡 Para programar backups automáticos, agrega este script al crontab"
