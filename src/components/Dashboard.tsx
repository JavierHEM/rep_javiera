'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  MapPin, 
  TrendingUp, 
  FileText,
  Plus,
  Eye,
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
  cliente_campana?: boolean;
  cliente_reclamo?: boolean;
  cliente_sec?: boolean;
}

interface Stats {
  totalChecklists: number;
  thisMonth: number;
  thisWeek: number;
  today: number;
  uniqueTechnicians: number;
  uniqueSEDs: number;
  uniqueLocations: number;
  clientTypes: {
    campana: number;
    reclamo: number;
    sec: number;
  };
  recentChecklists: Checklist[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/save-checklist');
      const data = await response.json();
      
      if (data.success) {
        const checklists: Checklist[] = data.checklists;
        calculateStats(checklists);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (checklists: Checklist[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats: Stats = {
      totalChecklists: checklists.length,
      thisMonth: checklists.filter(c => new Date(c.createdAt) >= thisMonth).length,
      thisWeek: checklists.filter(c => new Date(c.createdAt) >= thisWeek).length,
      today: checklists.filter(c => new Date(c.createdAt) >= today).length,
      uniqueTechnicians: new Set(checklists.map(c => c.tecnico_nombre).filter(Boolean)).size,
      uniqueSEDs: new Set(checklists.map(c => c.sed).filter(Boolean)).size,
      uniqueLocations: new Set(checklists.map(c => c.ubicacion).filter(Boolean)).size,
      clientTypes: {
        campana: checklists.filter(c => c.cliente_campana).length,
        reclamo: checklists.filter(c => c.cliente_reclamo).length,
        sec: checklists.filter(c => c.cliente_sec).length,
      },
      recentChecklists: checklists
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    };

    setStats(stats);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-xl p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Error al cargar las estadísticas</p>
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
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard ControlPro</h1>
                <p className="text-blue-100">Resumen de actividad y estadísticas</p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/form"
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Checklist
                </Link>
                <Link
                  href="/checklists"
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Ver Todos
                </Link>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Checklists</p>
                    <p className="text-3xl font-bold">{stats.totalChecklists}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Este Mes</p>
                    <p className="text-3xl font-bold">{stats.thisMonth}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Esta Semana</p>
                    <p className="text-3xl font-bold">{stats.thisWeek}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Hoy</p>
                    <p className="text-3xl font-bold">{stats.today}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-200" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tipos de Cliente */}
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-200 mb-4">Tipos de Cliente</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-gray-700 dark:text-gray-300 dark:text-gray-300">Campaña de Medición</span>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{stats.clientTypes.campana}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-gray-700 dark:text-gray-300">Reclamo Cliente</span>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{stats.clientTypes.reclamo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-gray-700 dark:text-gray-300">Requerimiento SEC</span>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{stats.clientTypes.sec}</span>
                  </div>
                </div>
              </div>

              {/* Resumen de Actividad */}
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-200 mb-4">Resumen de Actividad</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Técnicos Únicos</p>
                      <p className="font-bold text-gray-800 dark:text-gray-200">{stats.uniqueTechnicians}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">SEDs Únicos</p>
                      <p className="font-bold text-gray-800 dark:text-gray-200">{stats.uniqueSEDs}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ubicaciones Únicas</p>
                      <p className="font-bold text-gray-800 dark:text-gray-200">{stats.uniqueLocations}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklists Recientes */}
            <div className="mt-8 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 dark:text-gray-200">Checklists Recientes</h3>
                <Link
                  href="/checklists"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Ver todos →
                </Link>
              </div>
              <div className="space-y-3">
                {stats.recentChecklists.map((checklist) => (
                  <div key={checklist.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {checklist.tecnico_nombre || 'Sin técnico'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {checklist.sed} - {checklist.ubicacion}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(checklist.createdAt)}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {checklist.id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

