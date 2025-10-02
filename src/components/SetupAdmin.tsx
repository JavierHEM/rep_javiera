'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import ToastContainer from './ToastContainer';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface SetupAdminProps {}

export default function SetupAdmin({}: SetupAdminProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  
  const router = useRouter();
  const { toasts, removeToast, showSuccess, showError } = useToast();

  useEffect(() => {
    // Verificar si ya hay usuarios en el sistema
    checkExistingUsers();
  }, []);

  const checkExistingUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (data.success && data.users.length > 0) {
        // Ya hay usuarios, redirigir a login
        router.push('/login');
      }
    } catch (error) {
      console.error('Error al verificar usuarios:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      showError('Error', 'Por favor completa todos los campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      showError('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/init-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('¡Configuración completada!', 'Administrador creado exitosamente');
        setIsSetupComplete(true);
        
        // Redirigir a login después de 3 segundos
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        showError('Error', data.message || 'No se pudo crear el administrador');
      }
    } catch (error) {
      console.error('Error al crear admin:', error);
      showError('Error', 'Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (isSetupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">¡Configuración Completada!</h1>
            <p className="text-blue-200 mb-6">
              El administrador ha sido creado exitosamente. Serás redirigido al login en unos segundos.
            </p>
            <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Configuración Inicial</h1>
          <p className="text-blue-200">Crea el administrador del sistema ControlPro</p>
        </div>

        {/* Formulario */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-200">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Configuración inicial</span>
            </div>
            <p className="text-yellow-100 text-sm mt-2">
              Esta es la primera vez que accedes al sistema. Crea el usuario administrador para comenzar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Nombre del Administrador
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre completo"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@controlpro.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creando administrador...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Crear Administrador
                </>
              )}
            </button>
          </form>

          {/* Información adicional */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">
              Este usuario tendrá acceso completo al sistema
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400">
            © 2024 ControlPro - Sistema de Gestión RVE
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Crell - Luz que crece
          </p>
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
