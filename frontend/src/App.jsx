import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  Shield, 
  Users, 
  Activity, 
  AlertTriangle, 
  FileText, 
  Clock,
  TrendingUp,
  Database,
  Monitor,
  Zap
} from 'lucide-react';

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos - en producción esto vendría de una API
    const mockData = {
      dispositivosSIEM: 362,
      superWorkers: 5,
      colectores: 29,
      unmanaged: 30,
      monitoredAssets: 298,
      agentes: 160,
      ueba: 149,
      eventosAnalizados: 7098200000,
      incidentesDetectados: 122400,
      totalReportes: 6131,
      reportesAutomaticos: 5249,
      reportesManuales: 882,
      remediacionesAutomaticas: 3055,
      remediacionesManuales: 2194,
      tenants: 21,
      clientesActivos: 15,
      eventosPorSegundo: 2,
      mttdAutomatico: 18649,
      mttrAutomatico: 3,
      mttdManual: 3,
      mttrManual: 299
    };
    
    setData(mockData);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-purple-300 mt-4 text-xl">Cargando Dashboard...</p>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Dispositivos SIEM', value: data.dispositivosSIEM, color: '#8B5CF6' },
    { name: 'Monitored Assets', value: data.monitoredAssets, color: '#A855F7' },
    { name: 'Agentes', value: data.agentes, color: '#C084FC' },
    { name: 'UEBA', value: data.ueba, color: '#D8B4FE' }
  ];

  const performanceData = [
    { name: 'MTTD Auto', value: data.mttdAutomatico, color: '#8B5CF6' },
    { name: 'MTTR Auto', value: data.mttrAutomatico, color: '#A855F7' },
    { name: 'MTTD Manual', value: data.mttdManual, color: '#C084FC' },
    { name: 'MTTR Manual', value: data.mttrManual, color: '#D8B4FE' }
  ];

  const reportesData = [
    { name: 'Automáticos', value: data.reportesAutomaticos, color: '#8B5CF6' },
    { name: 'Manuales', value: data.reportesManuales, color: '#A855F7' }
  ];

  const eventosData = [
    { name: 'Enero', eventos: 590000000 },
    { name: 'Febrero', eventos: 620000000 },
    { name: 'Marzo', eventos: 580000000 },
    { name: 'Abril', eventos: 650000000 },
    { name: 'Mayo', eventos: 700000000 },
    { name: 'Junio', eventos: 720000000 }
  ];

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{value.toLocaleString()}</p>
          {subtitle && <p className="text-purple-300 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <img 
                src="/SPF.png" 
                alt="SPF Security" 
                className="h-16 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">Sistema Activo</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Dispositivos SIEM"
            value={data.dispositivosSIEM}
            icon={Shield}
            color="from-purple-500 to-purple-600"
            subtitle="Monitoreados"
          />
          <StatCard
            title="Eventos Analizados"
            value={data.eventosAnalizados}
            icon={Activity}
            color="from-purple-600 to-purple-700"
            subtitle="Total histórico"
          />
          <StatCard
            title="Incidentes Detectados"
            value={data.incidentesDetectados}
            icon={AlertTriangle}
            color="from-purple-700 to-purple-800"
            subtitle="En tiempo real"
          />
          <StatCard
            title="Clientes Activos"
            value={data.clientesActivos}
            icon={Users}
            color="from-purple-800 to-purple-900"
            subtitle="Tenants activos"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Assets Distribution */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-purple-400" />
              Distribución de Assets
            </h3>
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Leyenda con nombres y valores */}
              <div className="w-1/2 pl-6 space-y-4">
                {chartData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="text-gray-300 text-sm font-medium">
                        {entry.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">
                        {entry.value.toLocaleString()}
                      </div>
                      <div className="text-purple-300 text-xs">
                        {((entry.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Total */}
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <div className="text-right">
                      <div className="text-white font-bold text-xl">
                        {chartData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                      </div>
                      <div className="text-purple-300 text-xs">100%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-400" />
              Métricas de Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-400" />
              Reportes
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Automáticos</span>
                <span className="text-purple-400 font-semibold">{data.reportesAutomaticos.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Manuales</span>
                <span className="text-purple-400 font-semibold">{data.reportesManuales.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-white font-bold text-xl">{data.totalReportes.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-purple-400" />
              Eventos por Segundo
            </h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">
                {data.eventosPorSegundo}
              </div>
              <p className="text-gray-400 text-sm">Eventos procesados</p>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Monitor className="w-5 h-5 mr-2 text-purple-400" />
              Infraestructura
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Super/Workers</span>
                <span className="text-purple-400 font-semibold">{data.superWorkers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Colectores</span>
                <span className="text-purple-400 font-semibold">{data.colectores}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Unmanaged</span>
                <span className="text-purple-400 font-semibold">{data.unmanaged}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Eventos Trend */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
            Tendencia de Eventos (Últimos 6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={eventosData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: 'white'
                }}
                formatter={(value) => [(value / 1000000).toFixed(1) + 'M', 'Eventos']}
              />
              <Area 
                type="monotone" 
                dataKey="eventos" 
                stroke="#8B5CF6" 
                fill="url(#gradient)" 
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
};

export default App;
