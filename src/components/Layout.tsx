'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  FileText, 
  List, 
  BarChart3, 
  User, 
  LogOut, 
  LogIn,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isDark, setIsDark] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'usuario' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Configurar modo oscuro por defecto
    const savedTheme = localStorage.getItem('theme');
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedRole = localStorage.getItem('userRole');
    
    // Si no hay tema guardado, usar modo oscuro por defecto
    if (!savedTheme) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
    
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      setUserRole(savedRole as 'admin' | 'usuario' || 'usuario');
    } else {
      // Si no está autenticado y no está en la página de login o setup, redirigir
      if (pathname !== '/login' && pathname !== '/setup') {
        // Verificar si hay usuarios en el sistema
        checkUsersAndRedirect();
      }
    }
  }, [pathname]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogin = (role: 'admin' | 'usuario' = 'usuario') => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
  };

  const checkUsersAndRedirect = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (data.success && data.users.length === 0) {
        // No hay usuarios, redirigir a setup
        window.location.href = '/setup';
      } else {
        // Hay usuarios, redirigir a login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error al verificar usuarios:', error);
      // En caso de error, redirigir a login
      window.location.href = '/login';
    }
  };

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home, roles: ['admin', 'usuario'] },
    { href: '/form', label: 'Nuevo Checklist', icon: FileText, roles: ['admin', 'usuario'] },
    { href: '/checklists', label: 'Checklists', icon: List, roles: ['admin', 'usuario'] },
    { href: '/dashboard', label: 'Estadísticas', icon: BarChart3, roles: ['admin'] },
    { href: '/users', label: 'Usuarios', icon: User, roles: ['admin'] },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // No mostrar navbar en la página de login o setup
  if (pathname === '/login' || pathname === '/setup') {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-900 text-white' 
          : 'bg-gray-50 text-gray-900'
      }`}>
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Navbar */}
      <nav className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">ControlPro</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems
                .filter(item => !userRole || item.roles.includes(userRole))
                .map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? isDark
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-700'
                        : isDark
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Auth */}
              {isAuthenticated && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm capitalize">{userRole}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isDark
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Salir</span>
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t transition-colors duration-300 ${
            isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems
                .filter(item => !userRole || item.roles.includes(userRole))
                .map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? isDark
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-700'
                        : isDark
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

    </div>
  );
}
