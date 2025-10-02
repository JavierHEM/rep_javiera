'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Save, Printer, RefreshCw, CheckCircle } from 'lucide-react';
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

const initialFormData: FormData = {
  fecha_dia: '',
  fecha_mes: '',
  fecha_ano: '',
  cliente_campana: false,
  cliente_reclamo: false,
  cliente_sec: false,
  sed: '',
  ubicacion: '',
  servicio_orden: false,
  descripcion_trabajo: '',
  red_subterraneo: false,
  red_aereo: false,
  red_preensamblado: false,
  red_cable_desnudo: false,
  conector_udc: false,
  conector_prensa: false,
  conector_terminal: false,
  conector_autoperforante: false,
  conector_otro: false,
  conector_otro_especificar: '',
  proteccion_ppf: false,
  proteccion_directo: false,
  proteccion_imt: false,
  orden_normal: false,
  orden_alterado: false,
  puente_abierto: false,
  puente_cerrado: false,
  tierra_existe: false,
  tierra_no_existe: false,
  empalme_concentrico: false,
  empalme_superflex: false,
  empalme_otro: false,
  empalme_otro_especificar: '',
  carga_1_5: false,
  carga_2_5: false,
  carga_4: false,
  capacidad_6: false,
  capacidad_8: false,
  capacidad_otro: false,
  capacidad_otro_especificar: '',
  caneria_galvanizado: false,
  caneria_pvc: false,
  caneria_otro: false,
  caneria_otro_especificar: '',
  movilidad_si: false,
  movilidad_no: false,
  ubicacion_fachada: false,
  ubicacion_otro: false,
  ubicacion_otro_especificar: '',
  condicion_cerrado: false,
  condicion_abierto: false,
  condicion_conexionado: false,
  condicion_normalizacion: false,
  estado_medidor: '',
  foto_empalme_medidor: false,
  foto_empalme: false,
  foto_medidor: false,
  tecnico_nombre: '',
  validacion_fecha: '',
  validacion_hora: ''
};

interface FormErrors {
  [key: string]: string;
}

export default function ChecklistForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar campos obligatorios
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

    // Validar que al menos un tipo de cliente esté seleccionado
    if (!formData.cliente_campana && !formData.cliente_reclamo && !formData.cliente_sec) {
      newErrors.cliente = 'Debe seleccionar al menos un tipo de cliente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Auto-guardado después de 2 segundos de inactividad
    clearTimeout((window as unknown as { autoSaveTimeout?: NodeJS.Timeout }).autoSaveTimeout);
    (window as unknown as { autoSaveTimeout?: NodeJS.Timeout }).autoSaveTimeout = setTimeout(() => {
      autoSave();
    }, 2000);
  };

  const autoSave = async () => {
    if (!formData.sed || !formData.ubicacion) return; // Solo auto-guardar si hay datos mínimos
    
    setAutoSaveStatus('saving');
    try {
      const response = await fetch('/api/save-checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          autoSave: true
        })
      });

      if (response.ok) {
        setAutoSaveStatus('saved');
        showInfo('Auto-guardado', 'Datos guardados automáticamente');
        setTimeout(() => setAutoSaveStatus(null), 2000);
      } else {
        setAutoSaveStatus('error');
        showError('Error de auto-guardado', 'No se pudieron guardar los datos automáticamente');
        setTimeout(() => setAutoSaveStatus(null), 3000);
      }
    } catch {
      setAutoSaveStatus('error');
      showError('Error de auto-guardado', 'No se pudieron guardar los datos automáticamente');
      setTimeout(() => setAutoSaveStatus(null), 3000);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      // Scroll al primer error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);
    
    try {
      const dataToSend = {
        timestamp: new Date().toISOString(),
        ...formData
      };

      const response = await fetch('/api/save-checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        setSubmitted(true);
        showSuccess('¡Éxito!', 'Checklist guardado correctamente');
        setTimeout(() => setSubmitted(false), 3000);
        // Limpiar el formulario después de guardar exitosamente
        setTimeout(() => {
          setFormData(initialFormData);
          setErrors({});
        }, 3000);
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      console.error('Error al enviar:', error);
      showError('Error al guardar', 'No se pudieron guardar los datos. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro de que quieres limpiar el formulario?')) {
      setFormData(initialFormData);
      setErrors({});
      showInfo('Formulario limpiado', 'Todos los campos han sido restablecidos');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden print-area border border-gray-200">
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-8">
            <h1 className="text-3xl font-bold text-center mb-2">
              CHECKLIST - TOMA DE EVIDENCIAS E INSTALACIÓN RVE
            </h1>
            <p className="text-center text-blue-100 text-sm">Revisión de Medidores y Equipos</p>
            <div className="text-center mt-4 text-sm text-blue-50">
              <strong>Crell - Luz que crece</strong><br />
              Giro: Distribución de Energía Eléctrica | R.U.T: 81.106.900-0
            </div>
          </div>

          <div className="p-8">
            {/* Indicador de Auto-guardado */}
            {autoSaveStatus && (
              <div className="mb-4 p-3 rounded-lg text-sm font-medium">
                {autoSaveStatus === 'saving' && (
                  <div className="flex items-center gap-2 text-blue-600 bg-blue-50 border border-blue-200">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Guardando automáticamente...
                  </div>
                )}
                {autoSaveStatus === 'saved' && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200">
                    <CheckCircle className="w-4 h-4" />
                    Guardado automáticamente
                  </div>
                )}
                {autoSaveStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200">
                    Error al guardar automáticamente
                  </div>
                )}
              </div>
            )}

            {/* Información General */}
            <div className="mb-8">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4 rounded-t-lg">
                INFORMACIÓN GENERAL
              </h2>
              <div className="border border-gray-300 rounded-b-lg p-6 space-y-4 bg-gray-50">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Día</label>
                    <input
                      type="number"
                      name="fecha_dia"
                      value={formData.fecha_dia}
                      onChange={handleChange}
                      min="1"
                      max="31"
                      placeholder="DD"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                        errors.fecha ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mes</label>
                    <input
                      type="number"
                      name="fecha_mes"
                      value={formData.fecha_mes}
                      onChange={handleChange}
                      min="1"
                      max="12"
                      placeholder="MM"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                        errors.fecha ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Año</label>
                    <input
                      type="number"
                      name="fecha_ano"
                      value={formData.fecha_ano}
                      onChange={handleChange}
                      min="2024"
                      placeholder="AAAA"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                        errors.fecha ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                {errors.fecha && (
                  <p className="text-red-500 text-sm mt-1">{errors.fecha}</p>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Cliente</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="cliente_campana" checked={formData.cliente_campana} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Campaña de medición</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="cliente_reclamo" checked={formData.cliente_reclamo} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Reclamo Cliente</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="cliente_sec" checked={formData.cliente_sec} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Requerimiento SEC</span>
                    </label>
                  </div>
                  {errors.cliente && (
                    <p className="text-red-500 text-sm mt-1">{errors.cliente}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">SED</label>
                  <input 
                    type="text" 
                    name="sed" 
                    value={formData.sed} 
                    onChange={handleChange} 
                    placeholder="Ingrese SED" 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                      errors.sed ? 'border-red-500' : 'border-gray-300'
                    }`} 
                  />
                  {errors.sed && (
                    <p className="text-red-500 text-sm mt-1">{errors.sed}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ubicación</label>
                  <input 
                    type="text" 
                    name="ubicacion" 
                    value={formData.ubicacion} 
                    onChange={handleChange} 
                    placeholder="Ingrese ubicación" 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                      errors.ubicacion ? 'border-red-500' : 'border-gray-300'
                    }`} 
                  />
                  {errors.ubicacion && (
                    <p className="text-red-500 text-sm mt-1">{errors.ubicacion}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="servicio_orden" checked={formData.servicio_orden} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="text-sm font-semibold">Orden de Trabajo</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción del Trabajo</label>
                  <textarea name="descripcion_trabajo" value={formData.descripcion_trabajo} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
                </div>
              </div>
            </div>

            {/* Características Instalación */}
            <div className="mb-8">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4 rounded-t-lg">
                CARACTERÍSTICAS DE LA INSTALACIÓN
              </h2>
              <div className="border border-gray-300 rounded-b-lg p-6 space-y-6 bg-gray-50">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Red</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="red_subterraneo" checked={formData.red_subterraneo} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Subterráneo</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="red_aereo" checked={formData.red_aereo} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Aéreo</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="red_preensamblado" checked={formData.red_preensamblado} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Preensamblado</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="red_cable_desnudo" checked={formData.red_cable_desnudo} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Cable desnudo</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Conector</label>
                  <div className="flex flex-wrap gap-4 mb-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="conector_udc" checked={formData.conector_udc} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">UDC</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="conector_prensa" checked={formData.conector_prensa} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Prensa</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="conector_terminal" checked={formData.conector_terminal} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Terminal</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="conector_autoperforante" checked={formData.conector_autoperforante} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Autoperforante</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="conector_otro" checked={formData.conector_otro} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Otro</span>
                    </label>
                  </div>
                  {formData.conector_otro && (
                    <input type="text" name="conector_otro_especificar" value={formData.conector_otro_especificar} onChange={handleChange} placeholder="Especificar..." className="w-full px-3 py-2 border rounded-lg mt-2 placeholder-gray-600" />
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Protección</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="proteccion_ppf" checked={formData.proteccion_ppf} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-800 font-medium">PPF</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="proteccion_directo" checked={formData.proteccion_directo} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-800 font-medium">Directo</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="proteccion_imt" checked={formData.proteccion_imt} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-800 font-medium">IMT</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Orden de Conexión</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="orden_normal" checked={formData.orden_normal} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-800 font-medium">Normal</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="orden_alterado" checked={formData.orden_alterado} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-800 font-medium">Alterado</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Estado Puente Potencial</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="puente_abierto" checked={formData.puente_abierto} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-800 font-medium">Abierto</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="puente_cerrado" checked={formData.puente_cerrado} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-800 font-medium">Cerrado</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Tierra Protección</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="tierra_existe" checked={formData.tierra_existe} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-800 font-medium">Existe</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="tierra_no_existe" checked={formData.tierra_no_existe} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-800 font-medium">No existe</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Características Cableado */}
            <div className="mb-8">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4 rounded-t-lg">
                CARACTERÍSTICAS DEL CABLEADO
              </h2>
              <div className="border border-gray-300 rounded-b-lg p-6 space-y-4 bg-gray-50">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo Cable Empalme</label>
                  <div className="flex flex-wrap gap-4 mb-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="empalme_concentrico" checked={formData.empalme_concentrico} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Concéntrico</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="empalme_superflex" checked={formData.empalme_superflex} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Superflex</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="empalme_otro" checked={formData.empalme_otro} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Otro</span>
                    </label>
                  </div>
                  {formData.empalme_otro && (
                    <input type="text" name="empalme_otro_especificar" value={formData.empalme_otro_especificar} onChange={handleChange} placeholder="Especificar..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-gray-600" />
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo Cable Carga</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="carga_1_5" checked={formData.carga_1_5} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-800 font-medium">1.5 mm²</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="carga_2_5" checked={formData.carga_2_5} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-800 font-medium">2.5 mm²</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="carga_4" checked={formData.carga_4} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-800 font-medium">4 mm²</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Capacidad Automático</label>
                    <div className="space-y-2 mb-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="capacidad_6" checked={formData.capacidad_6} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-800 font-medium">6 A</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="capacidad_8" checked={formData.capacidad_8} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-800 font-medium">8 A</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="capacidad_otro" checked={formData.capacidad_otro} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm text-gray-800 font-medium">Otro</span>
                      </label>
                    </div>
                    {formData.capacidad_otro && (
                      <input type="text" name="capacidad_otro_especificar" value={formData.capacidad_otro_especificar} onChange={handleChange} placeholder="Especificar..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-gray-600" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Cañería</label>
                  <div className="flex flex-wrap gap-4 mb-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="caneria_galvanizado" checked={formData.caneria_galvanizado} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Galvanizado</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="caneria_pvc" checked={formData.caneria_pvc} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">PVC</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="caneria_otro" checked={formData.caneria_otro} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Otro</span>
                    </label>
                  </div>
                  {formData.caneria_otro && (
                    <input type="text" name="caneria_otro_especificar" value={formData.caneria_otro_especificar} onChange={handleChange} placeholder="Especificar..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-gray-600" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Movilidad del Cable</label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="movilidad_si" checked={formData.movilidad_si} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Sí</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="movilidad_no" checked={formData.movilidad_no} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Estado Medidor */}
            <div className="mb-8">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4 rounded-t-lg">
                ESTADO DEL MEDIDOR
              </h2>
              <div className="border border-gray-300 rounded-b-lg p-6 space-y-4 bg-gray-50">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Ubicación</label>
                  <div className="flex flex-wrap gap-4 mb-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="ubicacion_fachada" checked={formData.ubicacion_fachada} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Fachada</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="ubicacion_otro" checked={formData.ubicacion_otro} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Otro</span>
                    </label>
                  </div>
                  {formData.ubicacion_otro && (
                    <input type="text" name="ubicacion_otro_especificar" value={formData.ubicacion_otro_especificar} onChange={handleChange} placeholder="Especificar..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-gray-600" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Condición del Medidor</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="condicion_cerrado" checked={formData.condicion_cerrado} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Medidor cerrado</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="condicion_abierto" checked={formData.condicion_abierto} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Medidor abierto</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="condicion_conexionado" checked={formData.condicion_conexionado} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Conexionado medidor</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="condicion_normalizacion" checked={formData.condicion_normalizacion} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800 font-medium">Normalización</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Especificar Estado</label>
                  <textarea name="estado_medidor" value={formData.estado_medidor} onChange={handleChange} rows={3} placeholder="Detalle el estado del medidor..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder-gray-600" />
                </div>
              </div>
            </div>

            {/* Registro Fotográfico */}
            <div className="mb-8">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4 rounded-t-lg">
                REGISTRO FOTOGRÁFICO
              </h2>
              <div className="border border-gray-300 rounded-b-lg p-6 space-y-3 bg-gray-50">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="foto_empalme_medidor" checked={formData.foto_empalme_medidor} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-sm font-semibold">Medición Empalme y Medidor (simultáneo)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="foto_empalme" checked={formData.foto_empalme} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-sm font-semibold">Foto Empalme</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="foto_medidor" checked={formData.foto_medidor} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-sm font-semibold">Foto Medidor</span>
                </label>
              </div>
            </div>

            {/* Validación */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-4">VALIDACIÓN</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Técnico</label>
                  <input 
                    type="text" 
                    name="tecnico_nombre" 
                    value={formData.tecnico_nombre} 
                    onChange={handleChange} 
                    placeholder="Nombre completo" 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                      errors.tecnico_nombre ? 'border-red-500' : 'border-gray-300'
                    }`} 
                  />
                  {errors.tecnico_nombre && (
                    <p className="text-red-500 text-sm mt-1">{errors.tecnico_nombre}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
                  <input 
                    type="date" 
                    name="validacion_fecha" 
                    value={formData.validacion_fecha} 
                    onChange={handleChange} 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                      errors.validacion_fecha ? 'border-red-500' : 'border-gray-300'
                    }`} 
                  />
                  {errors.validacion_fecha && (
                    <p className="text-red-500 text-sm mt-1">{errors.validacion_fecha}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hora</label>
                  <input 
                    type="time" 
                    name="validacion_hora" 
                    value={formData.validacion_hora} 
                    onChange={handleChange} 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                      errors.validacion_hora ? 'border-red-500' : 'border-gray-300'
                    }`} 
                  />
                  {errors.validacion_hora && (
                    <p className="text-red-500 text-sm mt-1">{errors.validacion_hora}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-wrap gap-4 justify-center border-t pt-6 no-print">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    Guardar en Vercel
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl"
              >
                <Printer className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                Imprimir / PDF
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                Limpiar Formulario
              </button>

              <Link
                href="/checklists"
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl"
              >
                Ver Checklists Guardados
              </Link>

              <Link
                href="/"
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-lg hover:shadow-xl"
              >
                Dashboard
              </Link>
            </div>

            {/* Mensaje de Confirmación */}
            {submitted && (
              <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 no-print">
                <CheckCircle className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="font-semibold">¡Datos guardados exitosamente!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenedor de notificaciones toast */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
