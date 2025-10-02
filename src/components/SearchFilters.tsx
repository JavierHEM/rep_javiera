'use client';

import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  onClear: () => void;
}

interface FilterOptions {
  dateFrom: string;
  dateTo: string;
  tecnico: string;
  sed: string;
}

export default function SearchFilters({ onSearch, onFilter, onClear }: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dateFrom: '',
    dateTo: '',
    tecnico: '',
    sed: ''
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      dateFrom: '',
      dateTo: '',
      tecnico: '',
      sed: ''
    });
    onClear();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Barra de búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por técnico, SED, ubicación..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Botón de filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300"
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>

        {/* Botón limpiar */}
        <button
          onClick={handleClearFilters}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300"
        >
          <X className="w-4 h-4" />
          Limpiar
        </button>
      </div>

      {/* Panel de filtros expandible */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha desde
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha hasta
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Técnico
              </label>
              <input
                type="text"
                placeholder="Nombre del técnico"
                value={filters.tecnico}
                onChange={(e) => handleFilterChange('tecnico', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SED
              </label>
              <input
                type="text"
                placeholder="Código SED"
                value={filters.sed}
                onChange={(e) => handleFilterChange('sed', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
