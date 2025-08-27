# SPF Security Dashboard

Un dashboard moderno y elegante para visualizar métricas de seguridad SPF con una paleta de colores negro y morado.

## 🎨 Características del Diseño

- **Paleta de Colores**: Negro, gris oscuro y tonos morados
- **Diseño Moderno**: Glassmorphism y efectos de transparencia
- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Animaciones**: Transiciones suaves y efectos hover
- **Iconografía**: Iconos de Lucide React para mejor UX

## 📊 Métricas Visualizadas

### Tarjetas de Estadísticas Principales
- **Dispositivos SIEM**: Total de dispositivos monitoreados
- **Eventos Analizados**: Volumen total de eventos procesados
- **Incidentes Detectados**: Número de incidentes identificados
- **Clientes Activos**: Tenants activos en el sistema

### Gráficos y Visualizaciones
- **Distribución de Assets**: Gráfico circular de dispositivos
- **Métricas de Performance**: Gráfico de barras para tiempos de respuesta
- **Tendencia de Eventos**: Gráfico de área para evolución temporal
- **Reportes**: Desglose de reportes automáticos vs manuales

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js 16+ 
- npm o yarn

### Instalación
```bash
cd frontend
npm install
```

### Desarrollo
```bash
npm run dev
```

### Construcción para Producción
```bash
npm run build
```

## 🛠️ Tecnologías Utilizadas

- **React 18**: Framework principal
- **Vite**: Build tool y dev server
- **Tailwind CSS**: Framework de CSS utility-first
- **Recharts**: Biblioteca de gráficos para React
- **Lucide React**: Iconos modernos y ligeros

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── App.jsx          # Componente principal del dashboard
│   ├── main.jsx         # Punto de entrada de la aplicación
│   └── index.css        # Estilos globales y personalizados
├── index.html           # HTML base
├── tailwind.config.js   # Configuración de Tailwind CSS
└── package.json         # Dependencias del proyecto
```

## 🎯 Personalización

### Cambiar Colores
Los colores se pueden modificar en `tailwind.config.js` en la sección `theme.extend.colors`.

### Agregar Nuevas Métricas
Para agregar nuevas métricas, modifica el objeto `mockData` en `App.jsx` y crea nuevos componentes de visualización.

### Modificar Gráficos
Los gráficos se crean usando Recharts. Consulta la [documentación oficial](https://recharts.org/) para más opciones de personalización.

## 🔧 Configuración de Datos

Actualmente el dashboard usa datos mock. Para conectarlo a una API real:

1. Modifica la función `useEffect` en `App.jsx`
2. Implementa llamadas a tu API usando axios
3. Actualiza el estado con los datos reales

## 📱 Responsive Design

El dashboard está optimizado para:
- **Desktop**: Layout completo con sidebar
- **Tablet**: Grid adaptativo
- **Mobile**: Stack vertical de componentes

## 🎨 Paleta de Colores

- **Negro**: `#000000` - Fondo principal
- **Gris Oscuro**: `#1F2937` - Contenedores
- **Morado Principal**: `#8B5CF6` - Acentos y elementos activos
- **Morado Claro**: `#A855F7` - Hover states
- **Morado Oscuro**: `#6D28D9` - Elementos secundarios

## 🚀 Próximas Mejoras

- [ ] Integración con API real
- [ ] Filtros de fecha y tiempo
- [ ] Exportación de datos
- [ ] Notificaciones en tiempo real
- [ ] Temas personalizables
- [ ] Dashboard configurable por usuario

## 📞 Soporte

Para preguntas o problemas, consulta la documentación del proyecto principal o crea un issue en el repositorio.
