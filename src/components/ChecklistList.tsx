'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Eye, Download, Edit, Trash2, MapPin, RefreshCw } from 'lucide-react';
import SearchFilters from './SearchFilters';

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
}

export default function ChecklistList() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    dateFrom?: string;
    dateTo?: string;
    tecnico?: string;
    sed?: string;
  }>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    try {
      const response = await fetch('/api/save-checklist');
      const data = await response.json();
      if (data.success) {
        setChecklists(data.checklists);
      }
    } catch (error) {
      console.error('Error al cargar checklists:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrar checklists basado en búsqueda y filtros
  const filteredChecklists = useMemo(() => {
    return checklists.filter(checklist => {
      // Filtro de búsqueda
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          checklist.tecnico_nombre?.toLowerCase().includes(query) ||
          checklist.sed?.toLowerCase().includes(query) ||
          checklist.ubicacion?.toLowerCase().includes(query) ||
          checklist.id.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }

      // Filtros específicos
      if (filters.dateFrom) {
        const checklistDate = new Date(checklist.createdAt);
        const filterDate = new Date(filters.dateFrom);
        if (checklistDate < filterDate) return false;
      }

      if (filters.dateTo) {
        const checklistDate = new Date(checklist.createdAt);
        const filterDate = new Date(filters.dateTo);
        if (checklistDate > filterDate) return false;
      }

      if (filters.tecnico) {
        if (!checklist.tecnico_nombre?.toLowerCase().includes(filters.tecnico.toLowerCase())) {
          return false;
        }
      }

      if (filters.sed) {
        if (!checklist.sed?.toLowerCase().includes(filters.sed.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [checklists, searchQuery, filters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (filterOptions: {
    dateFrom: string;
    dateTo: string;
    tecnico: string;
    sed: string;
  }) => {
    setFilters(filterOptions);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({});
  };

  const handleEdit = (checklistId: string) => {
    window.location.href = `/edit/${checklistId}`;
  };

  const handleDelete = async (checklistId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este checklist? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeletingId(checklistId);
    try {
      const response = await fetch(`/api/checklist/${checklistId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Actualizar la lista local
        setChecklists(prev => prev.filter(c => c.id !== checklistId));
        alert('Checklist eliminado exitosamente');
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar el checklist. Por favor intenta nuevamente.');
    } finally {
      setDeletingId(null);
    }
  };

  const exportToCSV = () => {
    if (checklists.length === 0) return;

    const headers = [
      'ID', 'Fecha Creación', 'Técnico', 'Día', 'Mes', 'Año', 
      'SED', 'Ubicación', 'Cliente Campaña', 'Cliente Reclamo', 'Cliente SEC',
      'Servicio Orden', 'Descripción Trabajo', 'Red Subterráneo', 'Red Aéreo',
      'Red Preensamblado', 'Red Cable Desnudo', 'Conector UDC', 'Conector Prensa',
      'Conector Terminal', 'Conector Autoperforante', 'Conector Otro',
      'Protección PPF', 'Protección Directo', 'Protección IMT',
      'Orden Normal', 'Orden Alterado', 'Puente Abierto', 'Puente Cerrado',
      'Tierra Existe', 'Tierra No Existe', 'Empalme Concéntrico', 'Empalme Superflex',
      'Empalme Otro', 'Carga 1.5', 'Carga 2.5', 'Carga 4', 'Capacidad 6A',
      'Capacidad 8A', 'Capacidad Otro', 'Cañería Galvanizado', 'Cañería PVC',
      'Cañería Otro', 'Movilidad Sí', 'Movilidad No', 'Ubicación Fachada',
      'Ubicación Otro', 'Condición Cerrado', 'Condición Abierto',
      'Condición Conexionado', 'Condición Normalización', 'Estado Medidor',
      'Foto Empalme-Medidor', 'Foto Empalme', 'Foto Medidor',
      'Fecha Validación', 'Hora Validación'
    ];

    const csvContent = [
      headers.join(','),
      ...checklists.map(checklist => [
        checklist.id,
        checklist.createdAt,
        checklist.tecnico_nombre || '',
        checklist.fecha_dia || '',
        checklist.fecha_mes || '',
        checklist.fecha_ano || '',
        checklist.sed || '',
        checklist.ubicacion || '',
        // Agregar más campos según sea necesario
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `checklists_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-2xl p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-8">
            <h1 className="text-3xl font-bold text-center mb-2">
              CHECKLISTS GUARDADOS
            </h1>
            <p className="text-center text-blue-100 text-sm">
              Gestión de formularios ControlPro
            </p>
          </div>

          <div className="p-8">
            {/* Componente de búsqueda y filtros */}
            <SearchFilters 
              onSearch={handleSearch}
              onFilter={handleFilter}
              onClear={handleClearFilters}
            />

            {checklists.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No hay checklists guardados</p>
                <Link
                  href="/form"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
                >
                  Crear nuevo checklist
                </Link>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-700">
                    {filteredChecklists.length} de {checklists.length} checklists
                    {searchQuery && ` (filtrados por "${searchQuery}")`}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={exportToCSV}
                      className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Exportar CSV
                    </button>
                    <Link
                      href="/form"
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Nuevo Checklist
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredChecklists.map((checklist) => (
                    <div
                      key={checklist.id}
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {checklist.tecnico_nombre || 'Sin técnico'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(checklist.createdAt)}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                          {checklist.id.split('_')[1]}
                        </span>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">SED</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {checklist.sed || 'No especificado'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Ubicación</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {checklist.ubicacion || 'No especificado'}
                            </p>
                          </div>
                        </div>

                        {(checklist as any).cliente_campana && ( // eslint-disable-line @typescript-eslint/no-explicit-any
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                              Campaña
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedChecklist(checklist)}
                          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                        <button
                          onClick={() => handleEdit(checklist.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(checklist.id)}
                          disabled={deletingId === checklist.id}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {deletingId === checklist.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          {deletingId === checklist.id ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal para ver detalles */}
      {selectedChecklist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Detalles del Checklist</h3>
                <button
                  onClick={() => setSelectedChecklist(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-6">
                {/* Información General */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-3">Información General</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold text-gray-700">ID:</span>
                      <p className="text-gray-600">{selectedChecklist.id}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Fecha de creación:</span>
                      <p className="text-gray-600">{formatDate(selectedChecklist.createdAt)}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Técnico:</span>
                      <p className="text-gray-600">{selectedChecklist.tecnico_nombre || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">SED:</span>
                      <p className="text-gray-600">{selectedChecklist.sed || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Ubicación:</span>
                      <p className="text-gray-600">{selectedChecklist.ubicacion || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Fecha del trabajo:</span>
                      <p className="text-gray-600">
                        {selectedChecklist.fecha_dia && selectedChecklist.fecha_mes && selectedChecklist.fecha_ano 
                          ? `${selectedChecklist.fecha_dia}/${selectedChecklist.fecha_mes}/${selectedChecklist.fecha_ano}`
                          : 'No especificada'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tipos de Cliente */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-3">Tipos de Cliente</h4>
                  <div className="flex flex-wrap gap-4">
                    {(selectedChecklist as any).cliente_campana && ( // eslint-disable-line @typescript-eslint/no-explicit-any
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Campaña de Medición</span>
                    )}
                    {(selectedChecklist as any).cliente_reclamo && ( // eslint-disable-line @typescript-eslint/no-explicit-any
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">Reclamo Cliente</span>
                    )}
                    {(selectedChecklist as any).cliente_sec && ( // eslint-disable-line @typescript-eslint/no-explicit-any
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Requerimiento SEC</span>
                    )}
                    {!(selectedChecklist as any).cliente_campana && !(selectedChecklist as any).cliente_reclamo && !(selectedChecklist as any).cliente_sec && ( // eslint-disable-line @typescript-eslint/no-explicit-any
                      <span className="text-gray-500 text-sm">No especificado</span>
                    )}
                  </div>
                </div>

                {/* Descripción del Trabajo */}
                {(selectedChecklist as any).descripcion_trabajo && ( // eslint-disable-line @typescript-eslint/no-explicit-any
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-800 mb-3">Descripción del Trabajo</h4>
                    <p className="text-gray-700">{(selectedChecklist as any).descripcion_trabajo}</p> {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
                  </div>
                )}

                {/* Estado del Medidor */}
                {(selectedChecklist as any).estado_medidor && ( // eslint-disable-line @typescript-eslint/no-explicit-any
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-800 mb-3">Estado del Medidor</h4>
                    <p className="text-gray-700">{(selectedChecklist as any).estado_medidor}</p> {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
