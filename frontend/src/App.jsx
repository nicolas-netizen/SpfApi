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
  Line
} from 'recharts';
import { 
  Shield, 
  Users, 
  Activity, 
  AlertTriangle, 
  FileText, 
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
      mttdAutomatico: 3,
      mttrAutomatico: 3,
      mttdManual: 299,
      mttrManual: 496
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
    { name: 'MTTD Auto', value: data.mttdAutomatico, color: '#8B5CF6' },
    { name: 'MTTR Auto', value: data.mttrAutomatico, color: '#A855F7' },
    { name: 'MTTD Manual', value: data.mttdManual, color: '#C084FC' },
    { name: 'MTTR Manual', value: data.mttrManual, color: '#D8B4FE' }
  ];

  const performanceData = [
    { name: 'Super/Workers', value: data.superWorkers, color: '#8B5CF6' },
    { name: 'Colectores', value: data.colectores, color: '#A855F7' },
    { name: 'Monitored Assets', value: data.monitoredAssets, color: '#C084FC' },
    { name: 'UEBA', value: data.ueba, color: '#D8B4FE' },
    { name: 'Unmanaged', value: data.unmanaged, color: '#E879F9' }
  ];

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 lg:p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 h-32 lg:h-36">
      <div className="flex items-start justify-between h-full">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-gray-400 text-sm lg:text-base font-medium mb-2 lg:mb-3 truncate leading-tight">{title}</p>
          <p className="text-lg lg:text-2xl font-bold text-white mb-2 leading-tight">{value.toLocaleString()}</p>
          {subtitle && <p className="text-purple-300 text-sm truncate leading-tight">{subtitle}</p>}
        </div>
                 <div className={`p-1.5 lg:p-2 rounded-lg bg-gradient-to-br ${color} flex-shrink-0`}>
           <Icon className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <img 
                src="/SPF.png" 
                alt="SPF Security" 
                className="h-16 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
            </div>
          </div>
        </div>
      </header>

      <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard
            title="Eventos Analizados"
            value={data.eventosAnalizados}
            icon={Activity}
            color="from-purple-700 to-purple-800"
            subtitle="Total histórico"
          />
          <StatCard
            title="Detectados"
            value={data.incidentesDetectados}
            icon={AlertTriangle}
            color="from-purple-800 to-purple-900"
            subtitle="En tiempo real"
          />
            <StatCard
            title="Automáticos"
            value={data.reportesAutomaticos}
            icon={FileText}
            color="from-indigo-500 to-indigo-600"
            subtitle="Generados automáticamente"
          />
          <StatCard
            title="Manuales"
            value={data.reportesManuales}
            icon={FileText}
            color="from-indigo-600 to-indigo-700"
            subtitle="Generados manualmente"
          />
          <StatCard
            title="SIEM"
            value={data.dispositivosSIEM}
            icon={Shield}
            color="from-purple-600 to-purple-700"
            subtitle="Dispositivos monitoreados"
          />
                    <StatCard
            title="Clientes Activos"
            value={data.clientesActivos}
            icon={Users}
            color="from-purple-500 to-purple-600"
            subtitle="Tenants activos"
          />
        </div>

        {/* Charts Grid */}
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
           {/* Performance Metrics */}
           <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
             <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
               <Database className="w-5 h-5 mr-2 text-purple-400" />
               Dispositivos en SIEM
             </h3>
             <ResponsiveContainer width="100%" height={450}>
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

           {/* Reports */}
           <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                 <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-purple-400" />
                Incidentes Notificados
              </h3>
             <div className="space-y-6">
               {/* Gráfico de torta centrado arriba */}
               <div className="flex justify-center">
                 <ResponsiveContainer width="100%" height={400}>
                   <PieChart>
                     <Pie
                       data={chartData}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={120}
                       paddingAngle={5}
                       dataKey="value"
                       label={({ name, value, percent }) => `${name}: ${value.toLocaleString()}`}
                       labelLine={false}
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
                       formatter={(value, name) => [value.toLocaleString(), name]}
                     />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
             </div>
           </div>

           {/* Incidentes Trend */}
           <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
             <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
               <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
               EPS
             </h3>
             <ResponsiveContainer width="100%" height={450}>
               <LineChart data={[
                 { mes: 'Abril', eps: 43500 },
                 { mes: 'Mayo', eps: 12500 },
                 { mes: 'Junio', eps: 20500 },
                 { mes: 'Julio', eps: 18500 }
               ]}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                 <XAxis dataKey="mes" stroke="#9CA3AF" />
                 <YAxis stroke="#9CA3AF" />
                 <Tooltip 
                   contentStyle={{ 
                     backgroundColor: '#1F2937', 
                     border: '1px solid #374151',
                     borderRadius: '8px',
                     color: 'white'
                   }}
                   formatter={(value) => [value.toLocaleString(), 'EPS']}
                 />
                 <Line 
                   type="monotone" 
                   dataKey="eps" 
                   stroke="#8B5CF6" 
                   strokeWidth={3}
                   dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                   activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                 />
               </LineChart>
             </ResponsiveContainer>
           </div>
         </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                     <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
             <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
               <Zap className="w-5 h-5 mr-2 text-purple-400" />
               Eventos por Segundo
             </h3>
             <div className="text-center">
               <div className="text-4xl font-bold text-purple-400">
                 {data.eventosPorSegundo}
               </div>
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
  