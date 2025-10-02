'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Lock, LogIn, UserPlus, Shield } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import ToastContainer from './ToastContainer';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface LoginFormProps {}

export default function LoginForm({}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role] = useState<'admin' | 'usuario'>('usuario'); // Siempre usuario en registro público
  
  const router = useRouter();
  const { toasts, removeToast, showSuccess, showError } = useToast();

  useEffect(() => {
    // Verificar si ya está autenticado
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      router.push('/');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      showError('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Guardar datos de autenticación
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name);
        
        showSuccess('¡Bienvenido!', `Hola ${data.user.name}`);
        
        // Redirigir según el rol
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        showError('Error de autenticación', data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      showError('Error', 'Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      showError('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      showError('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      showError('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          role,
          name: email.split('@')[0] // Usar parte del email como nombre por defecto
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showSuccess('¡Registro exitoso!', 'Tu cuenta ha sido creada correctamente');
        setIsRegisterMode(false);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        showError('Error de registro', data.message || 'No se pudo crear la cuenta');
      }
    } catch (error) {
      console.error('Error al registrar:', error);
      showError('Error', 'Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ControlPro</h1>
          <p className="text-blue-200">Sistema de Gestión RVE</p>
        </div>

        {/* Formulario */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 rounded-lg p-1 flex">
              <button
                onClick={() => setIsRegisterMode(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  !isRegisterMode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-white hover:text-blue-200'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setIsRegisterMode(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  isRegisterMode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-white hover:text-blue-200'
                }`}
              >
                Registrarse
              </button>
            </div>
          </div>

          <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-white" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password (solo en registro) */}
            {isRegisterMode && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            {/* Role Selection (solo en registro) - SOLO USUARIO */}
            {isRegisterMode && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tipo de Usuario
                </label>
                <div className="p-3 rounded-lg border-2 border-blue-500 bg-blue-500/20 text-white">
                  <div className="flex items-center justify-center gap-2">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">Usuario</span>
                  </div>
                </div>
                <p className="text-xs text-gray-300 mt-2 text-center">
                  Solo los administradores pueden crear otros administradores
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isRegisterMode ? 'Creando cuenta...' : 'Iniciando sesión...'}
                </>
              ) : (
                <>
                  {isRegisterMode ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  {isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'}
                </>
              )}
            </button>
          </form>

          {/* Información adicional */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">
              {isRegisterMode ? (
                <>
                  ¿Ya tienes cuenta?{' '}
                  <button
                    onClick={() => setIsRegisterMode(false)}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Inicia sesión aquí
                  </button>
                </>
              ) : (
                <>
                  ¿No tienes cuenta?{' '}
                  <button
                    onClick={() => setIsRegisterMode(true)}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Regístrate aquí
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400">
            © 2025 ControlPro - Sistema de Gestión 
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Modudia - Líder en Desarrollo de Software
          </p>
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
