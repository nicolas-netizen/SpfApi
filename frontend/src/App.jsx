import React, { useState, useEffect } from 'react'
import { PieChart, LineChart, BarChart, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, Bar, Pie, Cell } from 'recharts'
import { Shield, ActivitySquare, TrendingUp, Users, Server, AlertTriangle, BarChart3, PieChart as PieChartIcon, RefreshCw, MousePointer, Settings } from 'lucide-react'
import axios from 'axios'

const API_BASE_URL = `http://${window.location.hostname}:8000`

function App() {
  const [kpiData, setKpiData] = useState(null)
  const [loading, setLoading] = useState(true) // Cambiado a true inicialmente
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [countdown, setCountdown] = useState(180) // 3 minutos en segundos
  const [currentHighlight, setCurrentHighlight] = useState(0)

  useEffect(() => {
    fetchKPIData()
    
    // Configurar recarga automática cada 3 minutos
    const interval = setInterval(() => {
      fetchKPIData()
    }, 3 * 60 * 1000) // 3 minutos

    // Configurar countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 180 // Reset a 3 minutos
        }
        return prev - 1
      })
    }, 1000)

    // Destacar cada elemento lentamente de manera continua
    const highlightInterval = setInterval(() => {
      setCurrentHighlight(prev => (prev + 1) % 9) // 9 elementos en total
    }, 5000) // Cada 5 segundos

    return () => {
      clearInterval(interval)
      clearInterval(countdownInterval)
      clearInterval(highlightInterval)
    }
  }, []) // Removido kpiData de las dependencias

  const fetchKPIData = async () => {
    setLoading(true)
    setIsRefreshing(true)
    setError(null)
    try {
      // Intentar cargar desde el backend
      const response = await axios.get(`${API_BASE_URL}/data/KPISPF.csv`)
      
      // Verificar que la respuesta tenga datos válidos
      if (response.data && response.data.data && response.data.data.length > 0) {
        setKpiData(response.data)
        setLastUpdate(new Date())
        console.log('Datos KPI cargados exitosamente:', response.data)
      } else {
        console.error('Respuesta sin datos válidos:', response.data)
        setKpiData(null)
        setError('No se encontraron datos válidos en la respuesta')
      }
      
      // Animación de éxito mucho más lenta
      setTimeout(() => {
        setIsRefreshing(false)
      }, 5000) // 5 segundos en lugar de 2
    } catch (error) {
      console.error('Error fetching KPI data:', error)
      
      // Si falla el backend, usar datos de prueba temporales
      console.log('Usando datos de prueba temporales...')
      const testData = {
        data: [{
          'Dispositivos en SIEM': 362,
          'Super/Workers': 5,
          'Colectores': 29,
          'Unmanaged': 30,
          'Monitored Assets': 298,
          'Agentes': 160,
          'UEBA': 149,
          'Eventos Analizados': 7098200000,
          'Incidentes Detectados': 122400,
          'Total de Reportes': 6131,
          'Total Reportes Automáticos': 5249,
          'Total Reportes Manuales': 882,
          'Reportes Automáticos': 3055,
          'Remediaciones Automáticas': 2194,
          'Reportes Manuales': 594,
          'Remediaciones Manuales': 288,
          'Tenants': 21,
          'Clientes Activos': 15,
          'Cliente Interno': 2,
          'Bajas de Trial': 2,
          'Trial Activos': 2,
          'Eventos por Segundo': 18649,
          'MTTD Automático': 3,
          'MTTR Automático': 3,
          'MTTD Manual': 299,
          'MTTR Manual': 496
        }]
      }
      
      setKpiData(testData)
      setLastUpdate(new Date())
      setError('Backend no disponible - usando datos de prueba')
      
      // Limpiar el error después de 5 segundos para que no sea intrusivo
      setTimeout(() => {
        setError(null)
      }, 5000)
      
      setTimeout(() => {
        setIsRefreshing(false)
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

     // Colores para el dashboard - Paleta naranja y azul
   const COLORS = {
     primary: '#00D4FF',    // Azul principal
     secondary: '#FF6B35',  // Naranja principal
     success: '#FF8A40',    // Naranja claro
     warning: '#FFB366',    // Naranja suave
     danger: '#FF4500',     // Naranja rojizo
     info: '#1E90FF',       // Azul medio
     purple: '#4169E1',     // Azul real
     gold: '#FFA500'        // Naranja dorado
   }

  // Preparar datos para gráficos
  const prepareChartData = () => {
    if (!kpiData || !kpiData.data || kpiData.data.length === 0) return null
    
    const data = kpiData.data[0] // Solo una fila de datos
    
    return {
      dispositivos: [
        { name: 'SIEM', value: parseInt(data['Dispositivos en SIEM']), color: COLORS.primary },
        { name: 'Super/Workers', value: parseInt(data['Super/Workers']), color: COLORS.secondary },
        { name: 'Colectores', value: parseInt(data['Colectores']), color: COLORS.success },
        { name: 'Unmanaged', value: parseInt(data['Unmanaged']), color: COLORS.warning }
      ],
      reportes: [
        { name: 'Automáticos', value: parseInt(data['Total Reportes Automáticos']), color: COLORS.success },
        { name: 'Manuales', value: parseInt(data['Total Reportes Manuales']), color: COLORS.danger }
      ],
      remediaciones: [
        { name: 'Automáticas', value: parseInt(data['Remediaciones Automáticas']), color: COLORS.success },
        { name: 'Manuales', value: parseInt(data['Remediaciones Manuales']), color: COLORS.danger }
      ],
      detecciones: [
        { name: 'Reportes', value: parseInt(data['Total de Reportes']), color: COLORS.secondary },
        { name: 'Incidentes', value: parseInt(data['Incidentes Detectados']), color: COLORS.warning }
      ],
      operacion: [
        { mes: 'Abril', incidentes: 30, reportes: 85, automaticos: 70, manuales: 15 },
        { mes: 'Mayo', incidentes: 25, reportes: 80, automaticos: 65, manuales: 15 },
        { mes: 'Junio', incidentes: 35, reportes: 90, automaticos: 75, manuales: 15 },
        { mes: 'Julio', incidentes: 28, reportes: 82, automaticos: 68, manuales: 14 }
      ],
      eps: [
        { mes: 'Abril', eps: 40000 },
        { mes: 'Mayo', eps: 10000 },
        { mes: 'Junio', eps: 20000 },
        { mes: 'Julio', eps: 18649 }
      ]
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-400 border-t-orange-400 mx-auto mb-4"></div>
          <p className="text-cyan-400 text-lg">Cargando Dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="bg-red-900 p-6 rounded-2xl border-2 border-red-400">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-red-400 text-xl font-bold mb-2">Error al cargar datos</h2>
            <p className="text-red-300 mb-4">{error}</p>
            <button 
              onClick={fetchKPIData}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!kpiData || !kpiData.data || kpiData.data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="bg-gray-900 p-6 rounded-2xl border-2 border-gray-400">
            <Server className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-gray-400 text-xl font-bold mb-2">Sin datos disponibles</h2>
            <p className="text-gray-300 mb-4">No se encontraron datos para mostrar</p>
            <button 
              onClick={fetchKPIData}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Recargar
            </button>
          </div>
        </div>
      </div>
    )
  }

  const chartData = prepareChartData()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-2xl border-b-4 border-blue-400">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <img src="/SPF.png" alt="SPARKFOUND" className="h-32" />
          </div>
          <div className="flex justify-center mt-2">
            <a

            >

            </a>
          </div>
        </div>
      </div>

      <div className={`w-full px-2 py-4 transition-opacity duration-5000 ${kpiData ? 'opacity-100' : 'opacity-0'}`}>
        

                 {/* KPIs Principales - Reorganizados según la imagen */}
         <div className="mb-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Lado Izquierdo - Métricas en filas */}
                         <div className="space-y-6 flex flex-col flex-1">
               <h3 className="text-2xl font-bold text-white mb-6 text-center border-b-2 border-cyan-400 pb-3 bg-gradient-to-r from-cyan-900/20 to-transparent px-6 py-3 rounded-xl">
                 Dispositivos y Infraestructura
               </h3>
              
                             {/* Primera Fila - Dispositivos */}
               <div className="grid grid-cols-4 gap-4 flex-1">
                 <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 rounded-3xl border-l-4 border-blue-300 shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
                   <div className="relative z-10">
                     <div className="flex items-center justify-between mb-4">
                       <Server className="h-10 w-10 text-blue-300" />
                       <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                     </div>
                     <p className="text-blue-100 text-lg font-semibold mb-3">Dispositivos en SIEM</p>
                     <p className="text-5xl font-bold text-white mb-2">{kpiData?.data?.[0]?.['Dispositivos en SIEM'] || '--'}</p>
                     <p className="text-blue-200 text-base opacity-75">Infraestructura Total</p>
                   </div>
                 </div>
                 
                 <div className="bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 p-5 rounded-2xl border-l-4 border-orange-300 shadow-2xl hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-20 h-20 bg-orange-400/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
                   <div className="relative z-10">
                     <div className="flex items-center justify-between mb-3">
                       <ActivitySquare className="h-6 w-6 text-orange-300" />
                       <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                     </div>
                     <p className="text-orange-100 text-sm font-semibold mb-2">Super/Workers</p>
                     <p className="text-3xl font-bold text-white mb-1">{kpiData?.data?.[0]?.['Super/Workers'] || '--'}</p>
                     <p className="text-orange-200 text-xs opacity-75">Procesadores</p>
                   </div>
                 </div>
                 
                 <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-5 rounded-2xl border-l-4 border-blue-200 shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-20 h-20 bg-blue-300/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
                   <div className="relative z-10">
                     <div className="flex items-center justify-between mb-3">
                       <TrendingUp className="h-6 w-6 text-blue-200" />
                       <div className="w-3 h-3 bg-blue-300 rounded-full animate-pulse"></div>
                     </div>
                     <p className="text-blue-100 text-sm font-semibold mb-2">Colectores</p>
                     <p className="text-3xl font-bold text-white mb-1">{kpiData?.data?.[0]?.['Colectores'] || '--'}</p>
                     <p className="text-blue-200 text-xs opacity-75">Recolectores</p>
                   </div>
                 </div>
                 
                 <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-5 rounded-2xl border-l-4 border-orange-200 shadow-2xl hover:shadow-orange-500/30 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-20 h-20 bg-orange-300/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
                   <div className="relative z-10">
                     <div className="flex items-center justify-between mb-3">
                       <AlertTriangle className="h-6 w-6 text-orange-200" />
                       <div className="w-3 h-3 bg-orange-300 rounded-full animate-pulse"></div>
                     </div>
                     <p className="text-orange-100 text-sm font-semibold mb-2">Unmanaged</p>
                     <p className="text-3xl font-bold text-white mb-1">{kpiData?.data?.[0]?.['Unmanaged'] || '--'}</p>
                     <p className="text-orange-200 text-xs opacity-75">Sin Gestión</p>
                   </div>
                 </div>
               </div>

              {/* Segunda Fila - Eventos e Incidentes */}
              <div className="grid grid-cols-3 gap-4 flex-1">
                                 <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl border-l-4 border-blue-300 shadow-xl hover:scale-105 transition-transform">
                   <p className="text-blue-100 text-base font-semibold mb-2">Eventos Analizados</p>
                   <p className="text-3xl font-bold text-white">{kpiData?.data?.[0]?.['Eventos Analizados']?.toLocaleString() || '--'}</p>
                 </div>
                                 <div className="bg-gradient-to-br from-red-600 to-red-700 p-6 rounded-2xl border-l-4 border-red-300 shadow-xl hover:scale-105 transition-transform">
                   <p className="text-red-100 text-base font-semibold mb-2">Incidentes Detectados</p>
                   <p className="text-3xl font-bold text-white">{kpiData?.data?.[0]?.['Incidentes Detectados']?.toLocaleString() || '--'}</p>
                 </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-2xl border-l-4 border-purple-300 shadow-xl hover:scale-105 transition-transform">
                  <p className="text-purple-100 text-base font-semibold mb-2">Total de Reportes</p>
                  <p className="text-3xl font-bold text-white">{kpiData?.data?.[0]?.['Total de Reportes']?.toLocaleString() || '--'}</p>
                </div>
              </div>

              {/* Tercera Fila - Tenants y Clientes */}
              <div className="grid grid-cols-3 gap-4 flex-1">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl border-l-4 border-indigo-300 shadow-xl hover:scale-105 transition-transform">
                  <p className="text-indigo-100 text-lg font-semibold mb-3">Tenants</p>
                  <p className="text-4xl font-bold text-white">{kpiData?.data?.[0]?.['Tenants'] || '--'}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 rounded-2xl border-l-4 border-emerald-300 shadow-xl hover:scale-105 transition-transform">
                  <p className="text-emerald-100 text-lg font-semibold mb-3">Clientes Activos</p>
                  <p className="text-4xl font-bold text-white">{kpiData?.data?.[0]?.['Clientes Activos'] || '--'}</p>
                </div>
                <div className="bg-gradient-to-br from-pink-600 to-pink-700 p-6 rounded-2xl border-l-4 border-pink-300 shadow-xl hover:scale-105 transition-transform">
                  <p className="text-pink-100 text-lg font-semibold mb-3">Cliente Interno</p>
                  <p className="text-4xl font-bold text-white">{kpiData?.data?.[0]?.['Cliente Interno'] || '--'}</p>
                </div>
              </div>

              {/* Cuarta Fila - EPS y Trials */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-amber-600 to-amber-700 p-6 rounded-2xl border-l-4 border-amber-300 shadow-xl hover:scale-105 transition-transform">
                  <p className="text-amber-100 text-lg font-semibold mb-3">Eventos por Segundo</p>
                  <p className="text-4xl font-bold text-white">{kpiData?.data?.[0]?.['Eventos por Segundo']?.toLocaleString() || '--'}</p>
                </div>
                <div className="bg-gradient-to-br from-rose-600 to-rose-700 p-6 rounded-2xl border-l-4 border-rose-300 shadow-xl hover:scale-105 transition-transform">
                  <p className="text-rose-100 text-lg font-semibold mb-3">Bajas de Trial</p>
                  <p className="text-4xl font-bold text-white">{kpiData?.data?.[0]?.['Bajas de Trial'] || '--'}</p>
                </div>
                <div className="bg-gradient-to-br from-violet-600 to-violet-700 p-6 rounded-2xl border-l-4 border-violet-300 shadow-xl hover:scale-105 transition-transform">
                  <p className="text-violet-100 text-lg font-semibold mb-3">Trial Activos</p>
                  <p className="text-4xl font-bold text-white">{kpiData?.data?.[0]?.['Trial Activos'] || '--'}</p>
                </div>
              </div>
            </div>

                         {/* Lado Derecho - Bloques de Reportes y Remediaciones */}
             <div className="space-y-4 h-full flex flex-col">
               <h3 className="text-2xl font-bold text-white mb-6 text-center border-b-2 border-blue-400 pb-3 bg-gradient-to-r from-blue-900/20 to-transparent px-6 py-3 rounded-xl">
                 Gestión de Reportes y Remediaciones
               </h3>
               
                               {/* Grid de 2 columnas para Reportes Automáticos y Manuales - Agrandados */}
                <div className="grid grid-cols-2 gap-6 flex-1">
                                    {/* Bloque Azul - Reportes Automáticos */}
                   <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 rounded-3xl shadow-2xl border-l-4 border-blue-300 hover:shadow-blue-500/40 transition-all duration-500 h-full flex flex-col">
                     <div className="flex-1">
                       <h4 className="text-4xl font-bold text-white mb-10 text-center flex items-center justify-center">
                         🤖 Automáticos
                       </h4>
                       <div className="space-y-6 text-lg">
                         <div className="flex justify-between items-center p-6 bg-blue-800/30 rounded-2xl backdrop-blur-sm border border-blue-700/50 hover:bg-blue-800/50 hover:border-blue-600/50 transition-all duration-300 group/item">
                           <span className="text-blue-100 font-semibold text-xl">
                             Total:
                           </span>
                           <span className="text-white font-bold text-3xl">{kpiData?.data?.[0]?.['Total Reportes Automáticos']?.toLocaleString() || '--'}</span>
                         </div>
                         <div className="flex justify-between items-center p-6 bg-blue-800/30 rounded-2xl backdrop-blur-sm border border-blue-700/50 hover:bg-blue-800/50 hover:border-blue-600/50 transition-all duration-300 group/item">
                           <span className="text-blue-100 font-semibold text-xl">
                             Reportes:
                           </span>
                           <span className="text-white font-bold text-3xl">{kpiData?.data?.[0]?.['Reportes Automáticos']?.toLocaleString() || '--'}</span>
                         </div>
                         <div className="flex justify-between items-center p-6 bg-blue-800/30 rounded-2xl backdrop-blur-sm border border-blue-700/50 hover:bg-blue-800/50 hover:border-blue-600/50 transition-all duration-300 group/item">
                           <span className="text-blue-100 font-semibold text-xl">
                             Remediaciones:
                           </span>
                           <span className="text-white font-bold text-3xl">{kpiData?.data?.[0]?.['Remediaciones Automáticas']?.toLocaleString() || '--'}</span>
                         </div>
                         <div className="flex justify-between items-center p-6 bg-blue-800/30 rounded-2xl backdrop-blur-sm border border-blue-700/50 hover:bg-blue-800/50 hover:border-blue-600/50 transition-all duration-300 group/item">
                           <span className="text-blue-100 font-semibold text-xl">
                             MTTD:
                           </span>
                           <span className="text-white font-bold text-3xl">{kpiData?.data?.[0]?.['MTTD Automático'] || '--'} min</span>
                         </div>
                         <div className="flex justify-between items-center p-6 bg-blue-800/30 rounded-2xl backdrop-blur-sm border border-blue-700/50 hover:bg-blue-800/50 hover:border-blue-600/50 transition-all duration-300 group/item">
                           <span className="text-blue-100 font-semibold text-xl">
                             MTTR:
                           </span>
                           <span className="text-white font-bold text-3xl">{kpiData?.data?.[0]?.['MTTR Automático'] || '--'} min</span>
                         </div>
                       </div>
                     </div>
                   </div>

                                    {/* Bloque Naranja - Reportes Manuales */}
                   <div className="bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 p-8 rounded-3xl shadow-2xl border-l-4 border-orange-300 hover:shadow-orange-500/40 transition-all duration-500 h-full flex flex-col">
                     <div className="flex-1">
                       <h4 className="text-4xl font-bold text-white mb-10 text-center flex items-center justify-center">
                         👤 Manuales
                       </h4>
                       <div className="space-y-6 text-lg">
                         <div className="flex justify-between items-center p-6 bg-orange-800/30 rounded-2xl backdrop-blur-sm border border-orange-700/50 hover:bg-orange-800/50 hover:border-orange-600/50 transition-all duration-300 group/item">
                           <span className="text-orange-100 font-semibold text-xl">
                             Total:
                           </span>
                           <span className="text-white font-bold text-3xl">{kpiData?.data?.[0]?.['Total Reportes Manuales']?.toLocaleString() || '--'}</span>
                         </div>
                         <div className="flex justify-between items-center p-6 bg-orange-800/30 rounded-2xl backdrop-blur-sm border border-orange-700/50 hover:bg-orange-800/50 hover:border-orange-600/50 transition-all duration-300 group/item">
                           <span className="text-orange-100 font-semibold text-xl">
                             Reportes:
                           </span>
                           <span className="text-white font-bold text-3xl">{kpiData?.data?.[0]?.['Reportes Manuales']?.toLocaleString() || '--'}</span>
                         </div>
                         <div className="flex justify-between items-center p-6 bg-orange-800/30 rounded-2xl backdrop-blur-sm border border-orange-700/50 hover:bg-orange-800/50 hover:border-orange-600/50 transition-all duration-300 group/item">
                           <span className="text-orange-100 font-semibold text-xl">
                             Remediaciones:
                           </span>
                           <span className="text-white font-bold text-3xl">{kpiData?.data?.[0]?.['Remediaciones Manuales']?.toLocaleString() || '--'}</span>
                         </div>
                         <div className="flex justify-between items-center p-6 bg-orange-800/30 rounded-2xl backdrop-blur-sm border border-orange-700/50 hover:bg-orange-800/50 hover:border-orange-600/50 transition-all duration-300 group/item">
                           <span className="text-orange-100 font-semibold text-xl">
                             MTTD:
                           </span>
                           <span className="text-white font-bold text-3xl">{kpiData?.data?.[0]?.['MTTD Manual'] || '--'} min</span>
                         </div>
                         <div className="flex justify-between items-center p-6 bg-orange-800/30 rounded-2xl backdrop-blur-sm border border-orange-700/50 hover:bg-orange-800/50 hover:border-orange-600/50 transition-all duration-300 group/item">
                           <span className="text-orange-100 font-semibold text-xl">
                             MTTR:
                           </span>
                           <span className="text-white font-bold text-3xl">{kpiData?.data?.[0]?.['MTTR Manual'] || '--'} min</span>
                         </div>
                       </div>
                     </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        

                 {/* Gráficos Circulares */}
         <div className="mb-12">
           <h2 className="text-3xl font-bold text-white mb-8 text-center border-b-4 border-blue-400 pb-4 bg-gradient-to-r from-blue-900/20 to-transparent px-8 py-4 rounded-2xl">
             Análisis de Distribución y Proporciones
           </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         {/* Detecciones vs Reportes */}
             <div className={`bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border-l-4 border-orange-400 min-h-[400px] transition-all duration-3000 hover:shadow-orange-500/30 ${currentHighlight === 4 ? 'ring-4 ring-orange-400 ring-opacity-50 scale-105 shadow-orange-500/30' : ''}`}>
               <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-center">
                 <PieChartIcon className="h-6 w-6 mr-3 text-orange-400" />
                 🔍 Detecciones vs Reportes
               </h3>
              <ResponsiveContainer width="100%" height={300}>
                {chartData ? (
                  <PieChart>
                                         <Pie
                       data={chartData.detecciones}
                       cx="50%"
                       cy="50%"
                       labelLine={false}
                       label={({ name, percent }) => `${name}: ${Math.ceil(percent * 100)}%`}
                       outerRadius={100}
                       innerRadius={30}
                       fill="#8884d8"
                       dataKey="value"
                       paddingAngle={5}
                     >
                      {chartData.detecciones.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#1F2937" strokeWidth={4} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '2px solid #FF6B35',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        fontSize: '14px'
                      }}
                    />
                  </PieChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <PieChartIcon className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                    <p className="text-lg">Cargando datos...</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>

                         {/* Reportes */}
             <div className={`bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border-l-4 border-orange-400 min-h-[400px] transition-all duration-3000 hover:shadow-orange-500/30 ${currentHighlight === 5 ? 'ring-4 ring-orange-400 ring-opacity-50 scale-105 shadow-orange-500/30' : ''}`}>
               <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-center">
                 <PieChartIcon className="h-6 w-6 mr-3 text-orange-400" />
                 📊 Distribución de Reportes
               </h3>
              <ResponsiveContainer width="100%" height={300}>
                {chartData ? (
                  <PieChart>
                                         <Pie
                       data={chartData.reportes}
                       cx="50%"
                       cy="50%"
                       labelLine={false}
                       label={({ name, percent }) => `${name}: ${Math.ceil(percent * 100)}%`}
                       outerRadius={100}
                       innerRadius={30}
                       fill="#8884d8"
                       dataKey="value"
                       paddingAngle={5}
                     >
                      {chartData.reportes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#1F2937" strokeWidth={4} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '2px solid #4ECDC4',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        fontSize: '14px'
                      }}
                    />
                  </PieChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <PieChartIcon className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                    <p className="text-lg">Cargando datos...</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>

                         {/* Remediaciones */}
             <div className={`bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border-l-4 border-blue-500 min-h-[400px] transition-all duration-3000 hover:shadow-blue-500/30 ${currentHighlight === 6 ? 'ring-4 ring-blue-500 ring-opacity-50 scale-105 shadow-blue-500/30' : ''}`}>
               <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-center">
                 <PieChartIcon className="h-6 w-6 mr-3 text-blue-500" />
                 🛠️ Remediaciones
               </h3>
              <ResponsiveContainer width="100%" height={300}>
                {chartData ? (
                  <PieChart>
                                         <Pie
                       data={chartData.remediaciones}
                       cx="50%"
                       cy="50%"
                       labelLine={false}
                       label={({ name, percent }) => `${name}: ${Math.ceil(percent * 100)}%`}
                       outerRadius={100}
                       innerRadius={30}
                       fill="#8884d8"
                       dataKey="value"
                       paddingAngle={5}
                     >
                      {chartData.remediaciones.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#1F2937" strokeWidth={4} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '2px solid #FF6B35',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        fontSize: '14px'
                      }}
                    />
                  </PieChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <PieChartIcon className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                    <p className="text-lg">Cargando datos...</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>

                 {/* Gráficos de Líneas y Barras */}
         <div className="mb-12">
           <h2 className="text-3xl font-bold text-white mb-8 text-center border-b-4 border-orange-400 pb-4 bg-gradient-to-r from-orange-900/20 to-transparent px-8 py-4 rounded-2xl">
            📈 Análisis de Tendencias y Operación
           </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         {/* Operación - Gráfico de Barras */}
             <div className={`bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border-l-4 border-blue-500 transition-all duration-3000 hover:shadow-blue-500/30 ${currentHighlight === 7 ? 'ring-4 ring-blue-500 ring-opacity-50 scale-105 shadow-blue-500/30' : ''}`}>
               <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                 <BarChart className="h-6 w-6 mr-3 text-blue-500" />
                 Operación Mensual
               </h3>
              <ResponsiveContainer width="100%" height={350}>
                {chartData ? (
                  <BarChart data={chartData.operacion}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                         <XAxis 
                       dataKey="mes" 
                       tick={{ fontSize: 12, fill: '#9CA3AF' }}
                       tickLine={false}
                       axisLine={{ stroke: '#FF6B35', strokeWidth: 2 }}
                     />
                     <YAxis 
                       tick={{ fontSize: 12, fill: '#9CA3AF' }}
                       tickLine={false}
                       axisLine={{ stroke: '#FF6B35', strokeWidth: 2 }}
                     />
                     <Tooltip 
                       contentStyle={{
                         backgroundColor: '#1F2937',
                         border: '2px solid #FF6B35',
                         borderRadius: '12px',
                         boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                         color: 'white'
                       }}
                     />
                    <Legend />
                    <Bar dataKey="incidentes" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="reportes" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="automaticos" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="manuales" fill={COLORS.danger} radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <BarChart className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                    <p className="text-lg">Cargando datos...</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>

                         {/* EPS - Gráfico de Líneas */}
             <div className={`bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border-l-4 border-orange-500 transition-all duration-3000 hover:shadow-orange-500/30 ${currentHighlight === 8 ? 'ring-4 ring-orange-500 ring-opacity-50 scale-105 shadow-orange-500/30' : ''}`}>
               <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                 <LineChart className="h-6 w-6 mr-3 text-orange-500" />
                 ⚡ Eventos por Segundo (EPS)
               </h3>
              <ResponsiveContainer width="100%" height={350}>
                {chartData ? (
                  <LineChart data={chartData.eps}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                         <XAxis 
                       dataKey="mes" 
                       tick={{ fontSize: 12, fill: '#9CA3AF' }}
                       tickLine={false}
                       axisLine={{ stroke: '#FFA500', strokeWidth: 2 }}
                     />
                     <YAxis 
                       tick={{ fontSize: 12, fill: '#9CA3AF' }}
                       tickLine={false}
                       axisLine={{ stroke: '#FFA500', strokeWidth: 2 }}
                     />
                     <Tooltip 
                       contentStyle={{
                         backgroundColor: '#1F2937',
                         border: '2px solid #FFA500',
                         borderRadius: '12px',
                         boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                         color: 'white'
                       }}
                     />
                    <Legend />
                                         <Line 
                       type="monotone" 
                       dataKey="eps" 
                       stroke={COLORS.secondary} 
                       strokeWidth={4}
                       dot={{ fill: COLORS.secondary, strokeWidth: 2, r: 6 }}
                       activeDot={{ r: 8, stroke: COLORS.secondary, strokeWidth: 3 }}
                       name="Eventos por Segundo"
                     />
                  </LineChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <LineChart className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                    <p className="text-lg">Cargando datos...</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App