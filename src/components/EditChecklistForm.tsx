'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, RefreshCw, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import ToastContainer from './ToastContainer';

interface FormData {
  fecha_dia: string;
  fecha_mes: string;
  fecha_ano: string;
  cliente_campana: boolean;
  cliente_reclamo: boolean;
  cliente_sec: boolean;
  sed: string;
  ubicacion: string;
  servicio_orden: boolean;
  descripcion_trabajo: string;
  red_subterraneo: boolean;
  red_aereo: boolean;
  red_preensamblado: boolean;
  red_cable_desnudo: boolean;
  conector_udc: boolean;
  conector_prensa: boolean;
  conector_terminal: boolean;
  conector_autoperforante: boolean;
  conector_otro: boolean;
  conector_otro_especificar: string;
  proteccion_ppf: boolean;
  proteccion_directo: boolean;
  proteccion_imt: boolean;
  orden_normal: boolean;
  orden_alterado: boolean;
  puente_abierto: boolean;
  puente_cerrado: boolean;
  tierra_existe: boolean;
  tierra_no_existe: boolean;
  empalme_concentrico: boolean;
  empalme_superflex: boolean;
  empalme_otro: boolean;
  empalme_otro_especificar: string;
  carga_1_5: boolean;
  carga_2_5: boolean;
  carga_4: boolean;
  capacidad_6: boolean;
  capacidad_8: boolean;
  capacidad_otro: boolean;
  capacidad_otro_especificar: string;
  caneria_galvanizado: boolean;
  caneria_pvc: boolean;
  caneria_otro: boolean;
  caneria_otro_especificar: string;
  movilidad_si: boolean;
  movilidad_no: boolean;
  ubicacion_fachada: boolean;
  ubicacion_otro: boolean;
  ubicacion_otro_especificar: string;
  condicion_cerrado: boolean;
  condicion_abierto: boolean;
  condicion_conexionado: boolean;
  condicion_normalizacion: boolean;
  estado_medidor: string;
  foto_empalme_medidor: boolean;
  foto_empalme: boolean;
  foto_medidor: boolean;
  tecnico_nombre: string;
  validacion_fecha: string;
  validacion_hora: string;
}

interface FormErrors {
  [key: string]: string;
}

interface EditChecklistFormProps {
  checklistId: string;
}

export default function EditChecklistForm({ checklistId }: EditChecklistFormProps) {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();
  const { toasts, removeToast, showSuccess, showError } = useToast();

  useEffect(() => {
    fetchChecklist();
  }, [checklistId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchChecklist = async () => {
    try {
      const response = await fetch('/api/save-checklist');
      const data = await response.json();
      
      if (data.success) {
        const checklist = data.checklists.find((c: any) => c.id === checklistId); // eslint-disable-line @typescript-eslint/no-explicit-any
        if (checklist) {
          setFormData(checklist);
        } else {
          showError('Error', 'Checklist no encontrado');
          router.push('/checklists');
        }
      }
    } catch (error) {
      console.error('Error al cargar checklist:', error);
      showError('Error', 'No se pudo cargar el checklist');
      router.push('/checklists');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData) return false;
    
    const newErrors: FormErrors = {};

    if (!formData.fecha_dia || !formData.fecha_mes || !formData.fecha_ano) {
      newErrors.fecha = 'La fecha es obligatoria';
    }

    if (!formData.sed.trim()) {
      newErrors.sed = 'El SED es obligatorio';
    }

    if (!formData.ubicacion.trim()) {
      newErrors.ubicacion = 'La ubicación es obligatoria';
    }

    if (!formData.tecnico_nombre.trim()) {
      newErrors.tecnico_nombre = 'El nombre del técnico es obligatorio';
    }

    if (!formData.validacion_fecha) {
      newErrors.validacion_fecha = 'La fecha de validación es obligatoria';
    }

    if (!formData.validacion_hora) {
      newErrors.validacion_hora = 'La hora de validación es obligatoria';
    }

    if (!formData.cliente_campana && !formData.cliente_reclamo && !formData.cliente_sec) {
      newErrors.cliente = 'Debe seleccionar al menos un tipo de cliente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev!,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData || !validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSaving(true);
    
    try {
      const response = await fetch(`/api/checklist/${checklistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showSuccess('¡Éxito!', 'Checklist actualizado correctamente');
        setTimeout(() => {
          router.push('/checklists');
        }, 2000);
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      showError('Error al actualizar', 'No se pudieron guardar los cambios. Por favor intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Cargando checklist...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">Checklist no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-center mb-2">
                  EDITAR CHECKLIST - INSTALACIÓN RVE
                </h1>
                <p className="text-center text-blue-100 text-sm">Revisión de Medidores y Equipos</p>
                <div className="text-center mt-4 text-sm text-blue-50">
                  <strong>ControlPro - Sistema de Gestión</strong><br />
                  ID: {checklistId}
                </div>
              </div>
              <button
                onClick={() => router.push('/checklists')}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* Información General */}
            <div className="mb-8">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4 rounded-t-lg">
                INFORMACIÓN GENERAL
              </h2>
              <div className="border border-gray-300 dark:border-gray-600 rounded-b-lg p-6 space-y-4 bg-gray-50 dark:bg-gray-700">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Día</label>
                    <input
                      type="number"
                      name="fecha_dia"
                      value={formData.fecha_dia}
                      onChange={handleChange}
                      min="1"
                      max="31"
                      placeholder="DD"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white ${
                        errors.fecha ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Mes</label>
                    <input
                      type="number"
                      name="fecha_mes"
                      value={formData.fecha_mes}
                      onChange={handleChange}
                      min="1"
                      max="12"
                      placeholder="MM"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white ${
                        errors.fecha ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Año</label>
                    <input
                      type="number"
                      name="fecha_ano"
                      value={formData.fecha_ano}
                      onChange={handleChange}
                      min="2024"
                      placeholder="AAAA"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white ${
                        errors.fecha ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                      }`}
                    />
                  </div>
                </div>
                {errors.fecha && (
                  <p className="text-red-500 text-sm mt-1">{errors.fecha}</p>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Cliente</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="cliente_campana" checked={formData.cliente_campana} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">Campaña de medición</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="cliente_reclamo" checked={formData.cliente_reclamo} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">Reclamo Cliente</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="cliente_sec" checked={formData.cliente_sec} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">Requerimiento SEC</span>
                    </label>
                  </div>
                  {errors.cliente && (
                    <p className="text-red-500 text-sm mt-1">{errors.cliente}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">SED</label>
                  <input 
                    type="text" 
                    name="sed" 
                    value={formData.sed} 
                    onChange={handleChange} 
                    placeholder="Ingrese SED" 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white ${
                      errors.sed ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                    }`} 
                  />
                  {errors.sed && (
                    <p className="text-red-500 text-sm mt-1">{errors.sed}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Ubicación</label>
                  <input 
                    type="text" 
                    name="ubicacion" 
                    value={formData.ubicacion} 
                    onChange={handleChange} 
                    placeholder="Ingrese ubicación" 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white ${
                      errors.ubicacion ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                    }`} 
                  />
                  {errors.ubicacion && (
                    <p className="text-red-500 text-sm mt-1">{errors.ubicacion}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="servicio_orden" checked={formData.servicio_orden} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Orden de Trabajo</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Descripción del Trabajo</label>
                  <textarea 
                    name="descripcion_trabajo" 
                    value={formData.descripcion_trabajo} 
                    onChange={handleChange} 
                    rows={3} 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white" 
                  />
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-wrap gap-4 justify-center border-t pt-6">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 text-lg"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Actualizar Checklist
                  </>
                )}
              </button>

              <button
                onClick={() => router.push('/checklists')}
                className="flex items-center gap-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg hover:shadow-xl text-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
