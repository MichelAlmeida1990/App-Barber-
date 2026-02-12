'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconFallback } from './IconFallback';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [logoError, setLogoError] = useState(true); // Usando ícone ao invés de imagem
  const router = useRouter();

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: 'barber-pole',
      description: 'Visão geral do sistema'
    },
    {
      label: 'Agendamentos',
      href: '/admin/appointments',
      icon: 'barber-chair',
      description: 'Gerir agendamentos'
    },
    {
      label: 'Clientes',
      href: '/admin/clients',
      icon: 'comb',
      description: 'Gestão de clientes'
    },
    {
      label: 'Barbeiros',
      href: '/admin/barbers',
      icon: 'scissors',
      description: 'Gerir barbeiros'
    },
    {
      label: 'Serviços',
      href: '/admin/services',
      icon: 'hair-clipper',
      description: 'Catálogo de serviços'
    },
    {
      label: 'Produtos',
      href: '/admin/products',
      icon: 'razor',
      description: 'Gestão de estoque'
    },
    {
      label: 'Vendas',
      href: '/admin/sales',
      icon: 'barber-pole',
      description: 'Sistema POS'
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: 'logo',
      description: 'Relatórios e métricas'
    },
    {
      label: 'Retenção',
      href: '/admin/retention',
      icon: 'barber-pole',
      description: 'Clientes em risco'
    },
    {
      label: 'Comissões',
      href: '/admin/commissions',
      icon: 'barber-pole',
      description: 'Gestão de comissões'
    }
  ];

  return (
    <aside className={`bg-gray-900 border-r border-gray-700 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } ${className}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {!logoError ? (
                    <img 
                      src="/images/logo-dudao.png" 
                      alt="EliteBarber" 
                      className="h-10 w-10 object-contain"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-2 rounded-lg">
                      <IconFallback type="barber-pole" size="md" className="text-black" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">EliteBarber</h2>
                  <p className="text-gray-400 text-xs">Admin Panel</p>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="flex justify-center mb-4">
                {!logoError ? (
                  <img 
                    src="/images/logo-dudao.png" 
                    alt="EliteBarber" 
                    className="h-8 w-8 object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-2 rounded-lg">
                    <IconFallback type="barber-pole" size="sm" className="text-black" />
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              title={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
            >
              {isCollapsed ? '→' : '←'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-3">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className="group flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200"
                  title={isCollapsed ? item.label : item.description}
                >
                  <div className="flex-shrink-0">
                    <IconFallback 
                      type={item.icon as any} 
                      size="md" 
                      className="text-yellow-500 group-hover:text-yellow-400 transition-colors" 
                    />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.label}</p>
                      <p className="text-gray-500 text-sm truncate">{item.description}</p>
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className={`mb-3 ${isCollapsed ? 'flex justify-center' : ''}`}>
            <Link
              href="/"
              className={`inline-flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white transition-colors ${
                isCollapsed ? 'w-10 h-10 p-0' : ''
              }`}
              title="Voltar para a página principal"
            >
              <IconFallback type="barber-chair" size="sm" className="text-yellow-400" />
              {!isCollapsed && <span className="text-sm font-medium">Voltar ao site</span>}
            </Link>
          </div>

          <div className={`${isCollapsed ? 'flex justify-center' : ''}`}>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                } catch {}
                router.push('/admin/login');
              }}
              className={`inline-flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-red-600/20 text-red-200 hover:bg-red-600/30 hover:text-white transition-colors ${
                isCollapsed ? 'w-10 h-10 p-0' : ''
              }`}
              title="Sair do admin"
            >
              <IconFallback type="razor" size="sm" className="text-red-300" />
              {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
            </button>
          </div>

          {!isCollapsed ? (
            <div className="text-center">
              <p className="text-gray-400 text-xs mb-2">Sistema Online</p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Conectado</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
} 