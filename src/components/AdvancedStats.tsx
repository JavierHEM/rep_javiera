'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Clock, 
  MapPin, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Target,
  Zap
} from 'lucide-react';

interface Checklist {
  id: string;
  timestamp: string;
  tecnico_nombre: string;
  fecha_dia: string;
  fecha_mes: string;
  fecha_ano: string;
  sed: string;
  ubicacion: string;
  createdAt: string;
  // Campos adicionales para análisis
  validacion_tecnico?: string;
  validacion_fecha?: string;
  validacion_hora?: string;
  medicion_empalme_medidor?: boolean;
  foto_empalme?: boolean;
  foto_medidor?: boolean;
}

interface KPIData {
  totalChecklists: number;
  checklistsThisMonth: number;
  checklistsThisWeek: number;
  averagePerDay: number;
  uniqueTechnicians: number;
  completionRate: number;
  topTechnician: string;
  topLocation: string;
  trendData: { date: string; count: number }[];
  technicianStats: { name: string; count: number; percentage: number }[];
  locationStats: { location: string; count: number; percentage: number }[];
  monthlyTrend: { month: string; count: number; growth: number }[];
  qualityMetrics: {
    photoCompliance: number;
    validationCompliance: number;
    measurementCompliance: number;
  };
}

export default function AdvancedStats() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchKPIData();
  }, [selectedPeriod]);

  const fetchKPIData = async () => {
    try {
      const response = await fetch('/api/save-checklist');
      const data = await response.json();
      
      if (data.success) {
        const checklists: Checklist[] = data.checklists;
        const processedData = processKPIData(checklists);
        setKpiData(processedData);
      }
    } catch (error) {
      console.error('Error al cargar datos KPI:', error);
    } finally {
      setLoading(false);
    }
  };

  const processKPIData = (checklists: Checklist[]): KPIData => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Filtros por período
    const periodFilters = {
      week: (c: Checklist) => new Date(c.createdAt) >= thisWeek,
      month: (c: Checklist) => new Date(c.createdAt) >= thisMonth,
      quarter: (c: Checklist) => {
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        return new Date(c.createdAt) >= quarterStart;
      },
      year: (c: Checklist) => {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return new Date(c.createdAt) >= yearStart;
      }
    };

    const filteredChecklists = checklists.filter(periodFilters[selectedPeriod]);
    
    // Estadísticas básicas
    const totalChecklists = checklists.length;
    const checklistsThisMonth = checklists.filter(c => new Date(c.createdAt) >= thisMonth).length;
    const checklistsThisWeek = checklists.filter(c => new Date(c.createdAt) >= thisWeek).length;
    
    // Técnicos únicos
    const uniqueTechnicians = new Set(checklists.map(c => c.tecnico_nombre)).size;
    
    // Técnico más activo
    const technicianCounts = checklists.reduce((acc, c) => {
      acc[c.tecnico_nombre] = (acc[c.tecnico_nombre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topTechnician = Object.entries(technicianCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
    
    // Ubicación más frecuente
    const locationCounts = checklists.reduce((acc, c) => {
      acc[c.ubicacion] = (acc[c.ubicacion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topLocation = Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
    
    // Estadísticas de técnicos
    const technicianStats = Object.entries(technicianCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / totalChecklists) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Estadísticas de ubicaciones
    const locationStats = Object.entries(locationCounts)
      .map(([location, count]) => ({
        location,
        count,
        percentage: (count / totalChecklists) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Tendencias por fecha
    const trendData = checklists
      .reduce((acc, c) => {
        const date = new Date(c.createdAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const trendArray = Object.entries(trendData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Últimos 30 días
    
    // Tendencias mensuales
    const monthlyData = checklists.reduce((acc, c) => {
      const date = new Date(c.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const monthlyTrend = Object.entries(monthlyData)
      .map(([month, count], index, array) => {
        const prevMonth = array[index - 1]?.[1] || 0;
        const growth = prevMonth > 0 ? ((count - prevMonth) / prevMonth) * 100 : 0;
        return {
          month: new Date(month + '-01').toLocaleDateString('es-ES', { year: 'numeric', month: 'short' }),
          count,
          growth
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Últimos 12 meses
    
    // Métricas de calidad
    const totalWithPhotos = checklists.filter(c => c.foto_empalme || c.foto_medidor).length;
    const totalWithValidation = checklists.filter(c => c.validacion_tecnico && c.validacion_fecha).length;
    const totalWithMeasurement = checklists.filter(c => c.medicion_empalme_medidor).length;
    
    const qualityMetrics = {
      photoCompliance: totalChecklists > 0 ? (totalWithPhotos / totalChecklists) * 100 : 0,
      validationCompliance: totalChecklists > 0 ? (totalWithValidation / totalChecklists) * 100 : 0,
      measurementCompliance: totalChecklists > 0 ? (totalWithMeasurement / totalChecklists) * 100 : 0
    };
    
    return {
      totalChecklists,
      checklistsThisMonth,
      checklistsThisWeek,
      averagePerDay: checklistsThisMonth / 30,
      uniqueTechnicians,
      completionRate: 95, // Placeholder - se puede calcular basado en criterios específicos
      topTechnician,
      topLocation,
      trendData: trendArray,
      technicianStats,
      locationStats,
      monthlyTrend,
      qualityMetrics
    };
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getTrendIcon = (value: number) => {
    return value > 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getQualityColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!kpiData) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                No hay datos disponibles
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                No se encontraron checklists para mostrar estadísticas.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Tablero de KPI</h1>
                <p className="text-blue-100">Análisis de rendimiento y tendencias</p>
              </div>
              <div className="flex gap-2">
                {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedPeriod === period
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-blue-100'
                    }`}
                  >
                    {period === 'week' ? 'Semana' : 
                     period === 'month' ? 'Mes' :
                     period === 'quarter' ? 'Trimestre' : 'Año'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  {getTrendIcon(kpiData.checklistsThisMonth - kpiData.checklistsThisWeek)}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                  {formatNumber(kpiData.totalChecklists)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Checklists</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {kpiData.checklistsThisMonth} este mes
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  {getTrendIcon(kpiData.uniqueTechnicians)}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                  {formatNumber(kpiData.uniqueTechnicians)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Técnicos Activos</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Técnico líder: {kpiData.topTechnician}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  {getTrendIcon(kpiData.qualityMetrics.photoCompliance - 80)}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                  {formatPercentage(kpiData.qualityMetrics.photoCompliance)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Cumplimiento Fotográfico</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Validación: {formatPercentage(kpiData.qualityMetrics.validationCompliance)}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  {getTrendIcon(kpiData.averagePerDay - 1)}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                  {kpiData.averagePerDay.toFixed(1)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Promedio por Día</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Ubicación líder: {kpiData.topLocation}
                </p>
              </div>
            </div>

            {/* Charts and Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Tendencias */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Tendencias de Actividad
                </h3>
                <div className="space-y-4">
                  {kpiData.trendData.slice(-7).map((item, index) => (
                    <div key={item.date} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(item.date).toLocaleDateString('es-ES', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(item.count / Math.max(...kpiData.trendData.map(d => d.count))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 w-8">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Técnicos */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Top Técnicos
                </h3>
                <div className="space-y-3">
                  {kpiData.technicianStats.slice(0, 5).map((tech, index) => (
                    <div key={tech.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                          {tech.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {tech.count}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          ({formatPercentage(tech.percentage)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quality Metrics */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Métricas de Calidad
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    <span className={getQualityColor(kpiData.qualityMetrics.photoCompliance)}>
                      {formatPercentage(kpiData.qualityMetrics.photoCompliance)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cumplimiento Fotográfico</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${kpiData.qualityMetrics.photoCompliance}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    <span className={getQualityColor(kpiData.qualityMetrics.validationCompliance)}>
                      {formatPercentage(kpiData.qualityMetrics.validationCompliance)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cumplimiento Validación</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${kpiData.qualityMetrics.validationCompliance}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    <span className={getQualityColor(kpiData.qualityMetrics.measurementCompliance)}>
                      {formatPercentage(kpiData.qualityMetrics.measurementCompliance)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cumplimiento Medición</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${kpiData.qualityMetrics.measurementCompliance}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights y Recomendaciones */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Insights y Recomendaciones
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Tendencia Positiva
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Los checklists han aumentado un {((kpiData.checklistsThisMonth - kpiData.checklistsThisWeek) / kpiData.checklistsThisWeek * 100).toFixed(1)}% este mes
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Distribución de Carga
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {kpiData.technicianStats[0]?.name} maneja el {formatPercentage(kpiData.technicianStats[0]?.percentage || 0)} del trabajo
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Oportunidad de Mejora
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        El cumplimiento fotográfico está en {formatPercentage(kpiData.qualityMetrics.photoCompliance)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Concentración Geográfica
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {kpiData.topLocation} concentra la mayor actividad
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
