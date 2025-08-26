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

  // Colores para el dashboard
  const COLORS = {
    primary: '#00D4FF',    // Cyan
    secondary: '#FF6B35',  // Naranja
    success: '#4ECDC4',    // Verde
    warning: '#FFE66D',    // Amarillo
    danger: '#FF8A80',     // Rojo
    info: '#A8E6CF',       // Verde claro
    purple: '#FFB3BA',     // Rosa
    gold: '#FFD93D'        // Dorado
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
        { name: 'Reportes', value: parseInt(data['Total de Reportes']), color: COLORS.primary },
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
        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className={`bg-gradient-to-br from-cyan-600 to-cyan-700 p-4 rounded-2xl text-white shadow-2xl border-l-4 border-cyan-300 transition-all duration-3000 ease-in-out hover:scale-105 ${isRefreshing ? 'animate-pulse' : ''} ${currentHighlight === 0 ? 'ring-4 ring-cyan-300 ring-opacity-50 scale-105 shadow-cyan-500/30' : ''}`} style={{animationDuration: '6s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Dispositivos SIEM</p>
                <p className="text-3xl font-bold transition-all duration-3000">{kpiData?.data?.[0]?.['Dispositivos en SIEM'] || '--'}</p>
              </div>
              <Server className="h-10 w-10 text-cyan-200" />
            </div>
          </div>

          <div className={`bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl text-white shadow-2xl border-l-4 border-orange-300 transition-all duration-3000 ease-in-out hover:scale-105 ${isRefreshing ? 'animate-pulse' : ''} ${currentHighlight === 1 ? 'ring-4 ring-orange-300 ring-opacity-50 scale-105 shadow-orange-500/30' : ''}`} style={{animationDuration: '6s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Eventos por Segundo</p>
                <p className="text-3xl font-bold transition-all duration-3000">{kpiData?.data?.[0]?.['Eventos por Segundo']?.toLocaleString() || '--'}</p>
              </div>
              <ActivitySquare className="h-10 w-10 text-orange-200" />
            </div>
          </div>

          <div className={`bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl text-white shadow-2xl border-l-4 border-green-300 transition-all duration-3000 ease-in-out hover:scale-105 ${isRefreshing ? 'animate-pulse' : ''} ${currentHighlight === 2 ? 'ring-4 ring-green-300 ring-opacity-50 scale-105 shadow-green-500/30' : ''}`} style={{animationDuration: '6s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Reportes</p>
                <p className="text-3xl font-bold transition-all duration-3000">{kpiData?.data?.[0]?.['Total de Reportes']?.toLocaleString() || '--'}</p>
              </div>
              <BarChart3 className="h-10 w-10 text-green-200" />
            </div>
          </div>

          <div className={`bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-2xl text-white shadow-2xl border-l-4 border-red-300 transition-all duration-3000 ease-in-out hover:scale-105 ${isRefreshing ? 'animate-pulse' : ''} ${currentHighlight === 3 ? 'ring-4 ring-red-300 ring-opacity-50 scale-105 shadow-red-500/30' : ''}`} style={{animationDuration: '6s'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Incidentes</p>
                <p className="text-3xl font-bold transition-all duration-3000">{kpiData?.data?.[0]?.['Incidentes Detectados']?.toLocaleString() || '--'}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-200" />
            </div>
          </div>
        </div>

        {/* Gráficos Circulares */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Detecciones vs Reportes */}
          <div className={`bg-gray-900 p-6 rounded-2xl shadow-2xl border-l-4 border-cyan-400 min-h-[350px] transition-all duration-3000 ${currentHighlight === 4 ? 'ring-4 ring-cyan-400 ring-opacity-50 scale-105 shadow-cyan-500/30' : ''}`}>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-center">
              <PieChartIcon className="h-6 w-6 mr-3 text-cyan-400" />
              Detecciones vs Reportes
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              {chartData ? (
                <PieChart>
                  <Pie
                    data={chartData.detecciones}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
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
                      border: '2px solid #00D4FF',
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
          <div className={`bg-gray-900 p-6 rounded-2xl shadow-2xl border-l-4 border-green-400 min-h-[350px] transition-all duration-3000 ${currentHighlight === 5 ? 'ring-4 ring-green-400 ring-opacity-50 scale-105 shadow-green-500/30' : ''}`}>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-center">
              <PieChartIcon className="h-6 w-6 mr-3 text-green-400" />
              Distribución de Reportes
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              {chartData ? (
                <PieChart>
                  <Pie
                    data={chartData.reportes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
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
          <div className={`bg-gray-900 p-6 rounded-2xl shadow-2xl border-l-4 border-orange-400 min-h-[350px] transition-all duration-3000 ${currentHighlight === 6 ? 'ring-4 ring-orange-400 ring-opacity-50 scale-105 shadow-orange-500/30' : ''}`}>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-center">
              <PieChartIcon className="h-6 w-6 mr-3 text-orange-400" />
              Remediaciones
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              {chartData ? (
                <PieChart>
                  <Pie
                    data={chartData.remediaciones}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
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

        {/* Gráficos de Líneas y Barras */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Operación - Gráfico de Barras */}
          <div className={`bg-gray-900 p-6 rounded-2xl shadow-2xl border-l-4 border-purple-400 transition-all duration-3000 ${currentHighlight === 7 ? 'ring-4 ring-purple-400 ring-opacity-50 scale-105 shadow-purple-500/30' : ''}`}>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <BarChart className="h-6 w-6 mr-3 text-purple-400" />
              Operación Mensual
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              {chartData ? (
                <BarChart data={chartData.operacion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="mes" 
                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={{ stroke: '#FFB3BA', strokeWidth: 2 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={{ stroke: '#FFB3BA', strokeWidth: 2 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '2px solid #FFB3BA',
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
                </div>
              )}
            </ResponsiveContainer>
          </div>

          {/* EPS - Gráfico de Líneas */}
          <div className={`bg-gray-900 p-6 rounded-2xl shadow-2xl border-l-4 border-gold transition-all duration-3000 ${currentHighlight === 8 ? 'ring-4 ring-yellow-400 ring-opacity-50 scale-105 shadow-yellow-500/30' : ''}`}>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <LineChart className="h-6 w-6 mr-3 text-yellow-400" />
              Eventos por Segundo (EPS)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              {chartData ? (
                <LineChart data={chartData.eps}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="mes" 
                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={{ stroke: '#FFD93D', strokeWidth: 2 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={{ stroke: '#FFD93D', strokeWidth: 2 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '2px solid #FFD93D',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                      color: 'white'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="eps" 
                    stroke={COLORS.gold} 
                    strokeWidth={4}
                    dot={{ fill: COLORS.gold, strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: COLORS.gold, strokeWidth: 3 }}
                    name="Eventos por Segundo"
                  />
                </LineChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <LineChart className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Métricas Detalladas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Métricas de Dispositivos */}
          <div className="bg-gray-900 p-4 rounded-2xl shadow-2xl border-l-4 border-info">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Server className="h-5 w-5 mr-2 text-green-400" />
              Métricas de Dispositivos
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-300">Monitored Assets:</span>
                <span className="text-white font-semibold">{kpiData?.data?.[0]?.['Monitored Assets'] || '--'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-300">Agentes:</span>
                <span className="text-white font-semibold">{kpiData?.data?.[0]?.['Agentes'] || '--'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-300">UEBA:</span>
                <span className="text-white font-semibold">{kpiData?.data?.[0]?.['UEBA'] || '--'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-300">Tenants:</span>
                <span className="text-white font-semibold">{kpiData?.data?.[0]?.['Tenants'] || '--'}</span>
              </div>
            </div>
          </div>

          {/* Métricas de Tiempo */}
          <div className="bg-gray-900 p-4 rounded-2xl shadow-2xl border-l-4 border-warning">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <ActivitySquare className="h-5 w-5 mr-2 text-yellow-400" />
              Métricas de Tiempo (MTTD/MTTR)
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-300">MTTD Automático:</span>
                <span className="text-green-400 font-semibold">{kpiData?.data?.[0]?.['MTTD Automático'] || '--'} min</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-300">MTTR Automático:</span>
                <span className="text-green-400 font-semibold">{kpiData?.data?.[0]?.['MTTR Automático'] || '--'} min</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-300">MTTD Manual:</span>
                <span className="text-red-400 font-semibold">{kpiData?.data?.[0]?.['MTTD Manual'] || '--'} min</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-300">MTTR Manual:</span>
                <span className="text-red-400 font-semibold">{kpiData?.data?.[0]?.['MTTR Manual'] || '--'} min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App