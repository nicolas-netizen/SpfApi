import React, { useState, useEffect } from 'react'
import { BarChart3, Upload, FileText, TrendingUp, Activity } from 'lucide-react'
import { PieChart, LineChart, BarChart, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, Bar, Pie, Cell } from 'recharts'
import axios from 'axios'

const API_BASE_URL = `http://${window.location.hostname}:8000`

function App() {
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileData, setFileData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')

  // Colores optimizados para fondo negro
  const COLORS = ['#00D4FF', '#FF6B35', '#4ECDC4', '#FFE66D', '#FF8A80', '#A8E6CF', '#FFB3BA', '#FFD93D']

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/files`)
      setFiles(response.data.files)
    } catch (error) {
      console.error('Error fetching files:', error)
    }
  }

  const fetchFileData = async (filename) => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/data/${filename}`)
      setFileData(response.data)
      setSelectedFile(filename)
    } catch (error) {
      console.error('Error fetching file data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!uploadFile) return

    const formData = new FormData()
    formData.append('file', uploadFile)

    try {
      setUploadLoading(true)
      setUploadMessage('')
      
      await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      setUploadFile(null)
      setUploadMessage('✅ Archivo subido exitosamente!')
      fetchFiles()
      
      setTimeout(() => setUploadMessage(''), 3000)
      
    } catch (error) {
      console.error('Error uploading file:', error)
      setUploadMessage('❌ Error subiendo archivo')
      setTimeout(() => setUploadMessage(''), 3000)
    } finally {
      setUploadLoading(false)
    }
  }

  const handleFileDelete = async (filename) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar ${filename}?`)) return

    try {
      await axios.delete(`${API_BASE_URL}/files/${filename}`)
      fetchFiles()
      if (selectedFile === filename) {
        setSelectedFile(null)
        setFileData(null)
      }
      setUploadMessage('🗑️ Archivo eliminado exitosamente!')
      setTimeout(() => setUploadMessage(''), 3000)
    } catch (error) {
      console.error('Error deleting file:', error)
      setUploadMessage('❌ Error eliminando archivo')
      setTimeout(() => setUploadMessage(''), 3000)
    }
  }

  // Función para detectar tipos de columnas
  const analyzeColumns = (data) => {
    if (!data || data.length === 0) return { numeric: [], text: [], date: [] }
    
    const columns = Object.keys(data[0])
    const numeric = []
    const text = []
    const date = []
    
    columns.forEach(col => {
      const sampleValues = data.slice(0, 10).map(row => row[col])
      
      if (sampleValues.some(val => /^\d{4}-\d{2}-\d{2}$/.test(val))) {
        date.push(col)
      }
      else if (sampleValues.some(val => !isNaN(parseFloat(val)) && parseFloat(val) !== 0)) {
        numeric.push(col)
      }
      else {
        text.push(col)
      }
    })
    
    return { numeric, text, date }
  }

  // Generar datos para gráfico de radar
  const getRadarData = () => {
    if (!fileData || !fileData.data || fileData.data.length === 0) return []
    
    const data = fileData.data
    const { numeric } = analyzeColumns(data)
    
    if (numeric.length === 0) return []
    
    const selectedColumns = numeric.slice(0, 6)
    
    return selectedColumns.map((col, index) => {
      const avgValue = data.reduce((sum, row) => sum + (parseFloat(row[col]) || 0), 0) / data.length
      return {
        metric: col,
        value: parseFloat(avgValue.toFixed(1)),
        fullMark: Math.max(100, avgValue * 1.2)
      }
    })
  }

  // Generar datos para gráfico de pie
  const getPieData = () => {
    if (!fileData || !fileData.data || fileData.data.length === 0) return []
    
    const data = fileData.data
    const { numeric } = analyzeColumns(data)
    
    if (numeric.length === 0) return []
    
    const selectedColumns = numeric.slice(0, 5)
    
    return selectedColumns.map((col, index) => {
      const totalValue = data.reduce((sum, row) => sum + (parseFloat(row[col]) || 0), 0)
      return {
        name: col,
        value: totalValue,
        color: COLORS[index % COLORS.length]
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-400 border-t-orange-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header principal */}
      <div className="bg-gray-900 shadow-2xl border-b-4 border-cyan-400">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <BarChart3 className="h-10 w-10 text-cyan-400 mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-white">CSV Dashboard</h1>
                <p className="text-gray-300">Análisis de datos en tiempo real</p>
              </div>
            </div>
            
            {/* Panel de upload */}
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 cursor-pointer flex items-center transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Upload className="h-5 w-5 mr-2" />
                Subir CSV
              </label>
              
              {uploadFile && (
                <button
                  onClick={handleFileUpload}
                  disabled={uploadLoading}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {uploadLoading ? 'Subiendo...' : 'Confirmar'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {uploadMessage && (
          <div className={`mb-8 p-4 rounded-lg border-2 ${
            uploadMessage.includes('Error') 
              ? 'bg-red-900 border-red-500 text-red-200' 
              : 'bg-green-900 border-green-500 text-green-200'
          }`}>
            {uploadMessage}
          </div>
        )}

        {/* Selector de archivo */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-white mb-3">Archivo CSV activo:</label>
          <select
            value={selectedFile || ''}
            onChange={(e) => e.target.value && fetchFileData(e.target.value)}
            className="w-80 px-4 py-3 border-2 border-cyan-400 rounded-lg focus:outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200 text-lg bg-gray-800 text-white"
          >
            <option value="">Seleccionar archivo CSV</option>
            {files.map((file) => (
              <option key={file} value={file}>{file}</option>
            ))}
          </select>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-6 rounded-xl text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Total Filas</p>
                <p className="text-4xl font-bold">{fileData && fileData.data ? fileData.data.length : '--'}</p>
              </div>
              <BarChart3 className="h-12 w-12 text-cyan-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Columnas</p>
                <p className="text-4xl font-bold">{fileData && fileData.info ? fileData.info.columns.length : '--'}</p>
              </div>
              <FileText className="h-12 w-12 text-orange-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 p-6 rounded-xl text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Columnas Numéricas</p>
                <p className="text-4xl font-bold">{fileData && fileData.data ? analyzeColumns(fileData.data).numeric.length : '--'}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-cyan-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 rounded-xl text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Columnas de Fecha</p>
                <p className="text-4xl font-bold">{fileData && fileData.data ? analyzeColumns(fileData.data).date.length : '--'}</p>
              </div>
              <Activity className="h-12 w-12 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Primera fila de gráficos - Pantalla completa */}
        <div className="grid grid-cols-1 gap-8 mb-12">
          {/* Gráfico de línea principal - Pantalla completa */}
          <div className="bg-gray-900 p-8 rounded-xl shadow-2xl border-l-4 border-cyan-400 min-h-[500px]">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <LineChart className="h-8 w-8 mr-3 text-cyan-400" />
              Análisis de Datos Principales
            </h3>
            <ResponsiveContainer width="100%" height={450}>
              {fileData && fileData.data && fileData.data.length > 0 ? (
                <LineChart data={fileData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey={analyzeColumns(fileData.data).date[0] || Object.keys(fileData.data[0])[0]} 
                    tick={{ fontSize: 14, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={{ stroke: '#00D4FF', strokeWidth: 2 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 14, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={{ stroke: '#00D4FF', strokeWidth: 2 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '2px solid #00D4FF',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                      color: 'white'
                    }}
                  />
                  <Legend />
                  {analyzeColumns(fileData.data).numeric.slice(0, 4).map((col, index) => (
                    <Line 
                      key={col}
                      type="monotone" 
                      dataKey={col} 
                      stroke={COLORS[index % COLORS.length]} 
                      strokeWidth={4}
                      dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: COLORS[index % COLORS.length], strokeWidth: 3 }}
                    />
                  ))}
                </LineChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <BarChart3 className="h-20 w-20 mx-auto mb-4 text-gray-500" />
                    <p className="text-xl">Selecciona un archivo CSV para ver los datos</p>
                  </div>
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Segunda fila - Gráficos en grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Gráfico de área */}
          <div className="bg-gray-900 p-8 rounded-xl shadow-2xl border-l-4 border-orange-500 min-h-[400px]">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <AreaChart className="h-6 w-6 mr-3 text-orange-400" />
              Análisis de Datos Secundarios
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              {fileData && fileData.data && fileData.data.length > 0 ? (
                <AreaChart data={fileData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey={analyzeColumns(fileData.data).date[0] || Object.keys(fileData.data[0])[0]} 
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
                  {analyzeColumns(fileData.data).numeric.slice(3, 6).map((col, index) => (
                    <Area 
                      key={col}
                      type="monotone" 
                      dataKey={col} 
                      stackId="1" 
                      stroke={COLORS[index % COLORS.length]} 
                      fill={COLORS[index % COLORS.length]} 
                      fillOpacity={0.7}
                    />
                  ))}
                </AreaChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <AreaChart className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                  <p className="text-lg">Selecciona un archivo CSV para ver los datos</p>
                </div>
              )}
            </ResponsiveContainer>
          </div>

          {/* Gráfico de barras */}
          <div className="bg-gray-900 p-8 rounded-xl shadow-2xl border-l-4 border-cyan-600 min-h-[400px]">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <BarChart className="h-6 w-6 mr-3 text-cyan-400" />
              Comparación de Datos
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              {fileData && fileData.data && fileData.data.length > 0 ? (
                <BarChart data={fileData.data.slice(-10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey={analyzeColumns(fileData.data).date[0] || Object.keys(fileData.data[0])[0]} 
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={{ stroke: '#00D4FF', strokeWidth: 2 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={{ stroke: '#00D4FF', strokeWidth: 2 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '2px solid #00D4FF',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                      color: 'white'
                    }}
                  />
                  <Legend />
                  {analyzeColumns(fileData.data).numeric.slice(0, 3).map((col, index) => (
                    <Bar key={col} dataKey={col} fill={COLORS[index % COLORS.length]} radius={[6, 6, 0, 0]} />
                  ))}
                </BarChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <BarChart className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                  <p className="text-lg">Selecciona un archivo CSV para ver los datos</p>
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tercera fila - Gráficos especializados */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Gráfico de radar */}
          <div className="bg-gray-900 p-6 rounded-xl shadow-2xl border-l-4 border-orange-600 min-h-[350px]">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <RadarChart className="h-5 w-5 mr-2 text-orange-400" />
              Métricas de Datos
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              {fileData && fileData.data && fileData.data.length > 0 ? (
                <RadarChart data={getRadarData()}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis 
                    dataKey="metric" 
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                  />
                  <PolarRadiusAxis 
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    axisLine={{ stroke: '#FF6B35', strokeWidth: 2 }}
                  />
                  <Radar 
                    name="Datos" 
                    dataKey="value" 
                    stroke="#FF6B35" 
                    fill="#FF6B35" 
                    fillOpacity={0.4}
                    strokeWidth={3}
                  />
                </RadarChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <RadarChart className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                </div>
              )}
            </ResponsiveContainer>
          </div>

          {/* Gráfico de pie */}
          <div className="bg-gray-900 p-6 rounded-xl shadow-2xl border-l-4 border-cyan-700 min-h-[350px]">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-cyan-400" />
              Distribución de Datos
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              {fileData && fileData.data && fileData.data.length > 0 ? (
                <PieChart>
                  <Pie
                    data={getPieData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPieData().map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="#1F2937"
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '2px solid #00D4FF',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                      color: 'white'
                    }}
                  />
                </PieChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <PieChart className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                </div>
              )}
            </ResponsiveContainer>
          </div>

          {/* Gráfico de línea adicional */}
          <div className="bg-gray-900 p-6 rounded-xl shadow-2xl border-l-4 border-orange-700 min-h-[350px]">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-orange-400" />
              Tendencias
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              {fileData && fileData.data && fileData.data.length > 0 ? (
                <LineChart data={fileData.data.slice(-15)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey={analyzeColumns(fileData.data).date[0] || Object.keys(fileData.data[0])[0]} 
                    tick={{ fontSize: 8, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={{ stroke: '#FF6B35', strokeWidth: 2 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
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
                  {analyzeColumns(fileData.data).numeric.slice(6, 8).map((col, index) => (
                    <Line 
                      key={col}
                      type="monotone" 
                      dataKey={col} 
                      stroke={COLORS[index % COLORS.length]} 
                      strokeWidth={3}
                      dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: COLORS[index % COLORS.length], strokeWidth: 2 }}
                    />
                  ))}
                </LineChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 p-8 rounded-xl shadow-2xl border-t-4 border-gradient-to-r from-cyan-500 to-orange-500">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-6">
              📊 Dashboard CSV - Análisis Completo
            </h3>
            <p className="text-gray-300 text-lg">
              Visualización de datos en tiempo real con tema oscuro optimizado
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
