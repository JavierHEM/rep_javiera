'use client';

import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
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

interface ChecklistFormLinkProps {
  token: string;
}

export default function ChecklistFormLink({ token }: ChecklistFormLinkProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [linkValid, setLinkValid] = useState<boolean | null>(null);
  const [, setLinkData] = useState<{ type: string; metadata: Record<string, unknown> } | null>(null);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  useEffect(() => {
    validateLink();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const validateLink = async () => {
    try {
      const response = await fetch(`/api/checklist-link/${token}`);
      const data = await response.json();
      
      if (data.success) {
        setLinkValid(true);
        setLinkData(data.linkData);
      } else {
        setLinkValid(false);
        showError('Enlace inválido', data.error || 'El enlace no es válido o ha expirado');
      }
    } catch {
      setLinkValid(false);
      showError('Error', 'No se pudo validar el enlace');
    }
  };

  const validateForm = (): boolean => {
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
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
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
    if (!validateForm()) {
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

      const response = await fetch(`/api/checklist-link/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        setSubmitted(true);
        showSuccess('¡Éxito!', 'Checklist completado y enviado correctamente');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar');
      }
    } catch (error) {
      console.error('Error al enviar:', error);
      showError('Error al enviar', 'No se pudieron enviar los datos. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (linkValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Validando enlace...</p>
        </div>
      </div>
    );
  }

  if (linkValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Enlace Inválido</h1>
          <p className="text-gray-600 mb-6">
            Este enlace no es válido, ha expirado o ya ha sido utilizado.
          </p>
          <p className="text-sm text-gray-500">
            Contacta con tu supervisor para obtener un nuevo enlace.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">¡Checklist Completado!</h1>
          <p className="text-gray-600 mb-6">
            Tu checklist ha sido enviado exitosamente. Gracias por completar el formulario.
          </p>
          <p className="text-sm text-gray-500">
            Puedes cerrar esta ventana de forma segura.
          </p>
        </div>
      </div>
    );
  }

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
            {/* Información General */}
            <div className="mb-8">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4 rounded-t-lg">
                INFORMACIÓN GENERAL
              </h2>
              <div className="border border-gray-300 rounded-b-lg p-6 space-y-4 bg-gray-50">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Día</label>
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
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Mes</label>
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
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Año</label>
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
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Cliente</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="cliente_campana" checked={formData.cliente_campana} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800">Campaña de medición</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="cliente_reclamo" checked={formData.cliente_reclamo} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800">Reclamo Cliente</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" name="cliente_sec" checked={formData.cliente_sec} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-sm text-gray-800">Requerimiento SEC</span>
                    </label>
                  </div>
                  {errors.cliente && (
                    <p className="text-red-500 text-sm mt-1">{errors.cliente}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">SED</label>
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
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Ubicación</label>
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
                    <span className="text-sm font-semibold text-gray-800">Orden de Trabajo</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Descripción del Trabajo</label>
                  <textarea name="descripcion_trabajo" value={formData.descripcion_trabajo} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
                </div>
              </div>
            </div>

            {/* Resto del formulario - continuaré en la siguiente parte */}
            <div className="flex justify-center border-t pt-6 no-print">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 text-lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Completar Checklist
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
