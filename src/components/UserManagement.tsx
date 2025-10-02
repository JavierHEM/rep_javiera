'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  User, 
  Mail, 
  Calendar,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import ToastContainer from './ToastContainer';

interface User {
  email: string;
  name: string;
  role: 'admin' | 'usuario';
  createdAt: string;
  isActive: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface UserManagementProps {}

export default function UserManagement({}: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'usuario' as 'admin' | 'usuario'
  });
  
  const { toasts, removeToast, showSuccess, showError } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        showError('Error', 'No se pudieron cargar los usuarios');
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      showError('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.name) {
      showError('Error', 'Por favor completa todos los campos');
      return;
    }

    if (formData.password.length < 6) {
      showError('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('¡Éxito!', 'Usuario creado correctamente');
        setShowCreateForm(false);
        setFormData({ email: '', name: '', password: '', role: 'usuario' });
        fetchUsers();
      } else {
        showError('Error', data.message || 'No se pudo crear el usuario');
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      showError('Error', 'Error de conexión');
    }
  };

  const handleUpdateUser = async (email: string, updates: Partial<User & { newPassword?: string }>) => {
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('¡Éxito!', 'Usuario actualizado correctamente');
        setEditingUser(null);
        fetchUsers();
      } else {
        showError('Error', data.message || 'No se pudo actualizar el usuario');
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      showError('Error', 'Error de conexión');
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario ${email}?`)) {
      return;
    }

    setDeletingUser(email);
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('¡Éxito!', 'Usuario eliminado correctamente');
        fetchUsers();
      } else {
        showError('Error', data.message || 'No se pudo eliminar el usuario');
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      showError('Error', 'Error de conexión');
    } finally {
      setDeletingUser(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
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
                <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
                <p className="text-blue-100">Administra los usuarios del sistema ControlPro</p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Nuevo Usuario
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Usuarios</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{users.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">Administradores</p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                      {users.filter(u => u.role === 'admin').length}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 dark:text-green-400 text-sm font-medium">Usuarios Activos</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {users.filter(u => u.isActive).length}
                    </p>
                  </div>
                  <User className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Fecha de Creación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-50 dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                    {users.map((user) => (
                      <tr key={user.email} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                          }`}>
                            {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                            {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                          }`}>
                            {user.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingUser(user.email)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.email)}
                              disabled={deletingUser === user.email}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                            >
                              {deletingUser === user.email ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nuevo Usuario</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rol
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'usuario' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="usuario">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Crear Usuario
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
