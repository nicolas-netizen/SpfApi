import React, { useState, useEffect } from 'react'
import { Upload, FileText, BarChart3, PieChart, TrendingUp, Download, Trash2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileData, setFileData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [chartType, setChartType] = useState('line')

  // Colores mejorados para los gráficos
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

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
      setLoading(true)
      await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      setUploadFile(null)
      fetchFiles()
      alert('Archivo subido exitosamente')
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error subiendo archivo')
    } finally {
      setLoading(false)
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
      alert('Archivo eliminado exitosamente')
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Error eliminando archivo')
    }
  }

  const downloadCSV = (data, filename) => {
    if (!data || !data.data) return

    const csvContent = convertToCSV(data.data)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvRows = [headers.join(',')]
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header]
        return typeof value === 'string' ? `"${value}"` : value
      })
      csvRows.push(values.join(','))
    }
    
    return csvRows.join('\n')
  }

  // Función mejorada para detectar tipos de columnas
  const analyzeColumns = (data) => {
    if (!data || data.length === 0) return { numeric: [], text: [], date: [] }
    
    const columns = Object.keys(data[0])
    const numeric = []
    const text = []
    const date = []
    
    columns.forEach(col => {
      const sampleValues = data.slice(0, 10).map(row => row[col])
      
      // Detectar fechas (formato YYYY-MM-DD)
      if (sampleValues.some(val => /^\d{4}-\d{2}-\d{2}$/.test(val))) {
        date.push(col)
      }
      // Detectar números
      else if (sampleValues.some(val => !isNaN(parseFloat(val)) && parseFloat(val) !== 0)) {
        numeric.push(col)
      }
      // El resto son texto
      else {
        text.push(col)
      }
    })
    
    return { numeric, text, date }
  }

  // Función para formatear tooltips
  const formatTooltip = (value, name) => {
    if (typeof value === 'number') {
      return [value.toLocaleString(), name]
    }
    return [value, name]
  }

  const renderChart = () => {
    if (!fileData || !fileData.data || fileData.data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No hay datos para mostrar</p>
          </div>
        </div>
      )
    }

    const data = fileData.data
    const { numeric, text, date } = analyzeColumns(data)
    
    // Priorizar fechas para el eje X, luego texto
    const xAxisKey = date[0] || text[0] || Object.keys(data[0])[0]
    const yAxisKeys = numeric.length > 0 ? numeric : [Object.keys(data[0])[1]]

    // Ordenar datos si hay fechas
    let sortedData = [...data]
    if (date.length > 0) {
      sortedData.sort((a, b) => new Date(a[date[0]]) - new Date(b[date[0]]))
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={xAxisKey} 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip 
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              {yAxisKeys.map((col, index) => (
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
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={xAxisKey} 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip 
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              {yAxisKeys.map((col, index) => (
                <Bar 
                  key={col}
                  dataKey={col} 
                  fill={COLORS[index % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )

      case 'pie':
        // Solo mostrar las primeras 8 filas para el gráfico de pie
        const pieData = sortedData.slice(0, 8).map((item, index) => ({
          name: item[xAxisKey] || `Item ${index + 1}`,
          value: parseFloat(item[yAxisKeys[0]]) || 0
        }))

        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsPieChart margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent, value }) => 
                  `${name}: ${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [value.toLocaleString(), 'Valor']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">CSV Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 cursor-pointer flex items-center transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir CSV
                </label>
                {uploadFile && (
                  <button
                    onClick={handleFileUpload}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Subiendo...' : 'Confirmar'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Lista de archivos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Archivos CSV
              </h2>
              
              {files.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay archivos CSV disponibles</p>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedFile === file
                          ? 'bg-primary-100 border border-primary-300'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => fetchFileData(file)}
                          className="flex-1 text-left text-sm font-medium text-gray-700 hover:text-primary-600"
                        >
                          {file}
                        </button>
                        <button
                          onClick={() => handleFileDelete(file)}
                          className="text-red-500 hover:text-red-700 p-1 transition-colors"
                          title="Eliminar archivo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main content - Dashboard */}
          <div className="lg:col-span-3">
            {!selectedFile ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona un archivo CSV
                </h3>
                <p className="text-gray-500">
                  Elige un archivo de la lista para comenzar a visualizar los datos
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* File info */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedFile}
                      </h2>
                      {fileData && (
                        <p className="text-gray-600">
                          {fileData.info.rows} filas • {fileData.info.columns.length} columnas
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => downloadCSV(fileData, selectedFile)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center transition-colors"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </button>
                    </div>
                  </div>

                  {/* Chart type selector */}
                  <div className="flex items-center space-x-4 mb-6">
                    <span className="text-sm font-medium text-gray-700">Tipo de gráfico:</span>
                    <div className="flex space-x-2">
                      {[
                        { key: 'line', label: 'Línea', icon: TrendingUp },
                        { key: 'bar', label: 'Barras', icon: BarChart3 },
                        { key: 'pie', label: 'Circular', icon: PieChart }
                      ].map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          onClick={() => setChartType(key)}
                          className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                            chartType === key
                              ? 'bg-primary-100 text-primary-700 border border-primary-300'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    {loading ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    ) : (
                      renderChart()
                    )}
                  </div>
                </div>

                {/* Data preview */}
                {fileData && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Vista previa de datos
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {fileData.info.columns.map((column) => (
                              <th
                                key={column}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {fileData.info.sample_data.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              {fileData.info.columns.map((column) => (
                                <td
                                  key={column}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                >
                                  {typeof row[column] === 'number' 
                                    ? row[column].toLocaleString() 
                                    : row[column]
                                  }
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
