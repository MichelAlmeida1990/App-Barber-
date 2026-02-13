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
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const router = useRouter();

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  // Menu otimizado com agrupamentos
  const menuItems = [
    {
      label: 'Dashboard/Analytics',
      href: '/admin',
      icon: 'barber-pole',
      submenu: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Analytics', href: '/admin/analytics' }
      ]
    },
    {
      label: 'Vendas/Comissões',
      href: '/admin/sales',
      icon: 'barber-pole',
      submenu: [
        { label: 'Vendas', href: '/admin/sales' },
        { label: 'Comissões', href: '/admin/commissions' }
      ]
    },
    {
      label: 'Agendamentos',
      href: '/admin/appointments',
      icon: 'barber-chair'
    },
    {
      label: 'Clientes',
      href: '/admin/clients',
      icon: 'comb'
    },
    {
      label: 'Barbeiros',
      href: '/admin/barbers',
      icon: 'scissors'
    },
    {
      label: 'Serviços',
      href: '/admin/services',
      icon: 'hair-clipper'
    },
    {
      label: 'Produtos',
      href: '/admin/products',
      icon: 'razor'
    },
    {
      label: 'Retenção',
      href: '/admin/retention',
      icon: 'barber-pole'
    }
  ] as const;

  return (
    <aside className={`bg-[rgba(255,255,255,0.1)] backdrop-blur-[20px] border-r border-[rgba(255,255,255,0.08)] transition-all duration-300 h-full ${
      isCollapsed ? 'w-16' : 'w-56'
    } ${className}`} style={{ WebkitBackdropFilter: 'blur(20px)' }}>
      <div className="flex flex-col h-full">
        {/* Header - Compacto com Glassmorphism */}
        <div className="p-4 border-b border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <img 
                  src="/images/logo-dudao.png" 
                  alt="DUDÃO" 
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div>
                  <h2 className="text-white font-bold text-base">DUDÃO</h2>
                  <p className="text-white/70 text-xs">ADMIN</p>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="flex justify-center w-full">
                <img 
                  src="/images/logo-dudao.png" 
                  alt="DUDÃO" 
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl bg-[rgba(255,255,255,0.12)] text-white/80 hover:text-white hover:bg-[rgba(255,255,255,0.2)] transition-all duration-200 text-sm border border-[rgba(255,255,255,0.08)]"
              title={isCollapsed ? "Expandir" : "Recolher"}
            >
              {isCollapsed ? '→' : '←'}
            </button>
          </div>
        </div>

        {/* Navigation - Glassmorphism com mais espaçamento */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-3">
            {menuItems.map((item, index) => {
              const hasSubmenu = 'submenu' in item && item.submenu && Array.isArray(item.submenu);
              const isExpanded = expandedItems.has(index);
              
              return (
                <li key={index}>
                  {hasSubmenu ? (
                    <>
                      <button
                        onClick={() => !isCollapsed && toggleExpand(index)}
                        className="group relative flex items-center justify-between w-full px-4 py-3 rounded-2xl text-white/90 hover:text-white hover:bg-[rgba(255,255,255,0.2)] transition-all duration-200 border border-[rgba(255,255,255,0)] hover:border-[rgba(255,255,255,0.1)]"
                        title={isCollapsed ? item.label : undefined}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <IconFallback 
                            type={item.icon as any} 
                            size="md" 
                            className="text-yellow-400 group-hover:text-yellow-300 transition-colors flex-shrink-0" 
                          />
                          {!isCollapsed && (
                            <span className="font-medium text-sm truncate">{item.label}</span>
                          )}
                        </div>
                        {!isCollapsed && (
                          <span className="text-white/60 text-xs">{isExpanded ? '▼' : '▶'}</span>
                        )}
                      </button>
                      {!isCollapsed && isExpanded && hasSubmenu && item.submenu && (
                        <ul className="ml-8 mt-2 space-y-2">
                          {item.submenu.map((sub, subIndex) => (
                            <li key={subIndex}>
                              <Link
                                href={sub.href}
                                className="flex items-center px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-[rgba(255,255,255,0.15)] text-sm transition-all duration-200 border border-[rgba(255,255,255,0)] hover:border-[rgba(255,255,255,0.08)]"
                              >
                                <span className="mr-2 text-yellow-400">•</span>
                                {sub.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="group relative flex items-center space-x-3 px-4 py-3 rounded-2xl text-white/90 hover:text-white hover:bg-[rgba(255,255,255,0.2)] transition-all duration-200 border border-[rgba(255,255,255,0)] hover:border-[rgba(255,255,255,0.1)]"
                      title={isCollapsed ? item.label : undefined}
                    >
                      <IconFallback 
                        type={item.icon as any} 
                        size="md" 
                        className="text-yellow-400 group-hover:text-yellow-300 transition-colors flex-shrink-0" 
                      />
                      {!isCollapsed && (
                        <span className="font-medium text-sm truncate">{item.label}</span>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer - Glassmorphism estendido até o fundo */}
        <div className="mt-auto p-4 border-t border-[rgba(255,255,255,0.08)] space-y-3">
          <div className={`${isCollapsed ? 'flex justify-center' : ''}`}>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                } catch {}
                router.push('/');
              }}
              className={`inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl bg-[rgba(239,68,68,0.2)] text-red-200 hover:bg-[rgba(239,68,68,0.3)] hover:text-white transition-all duration-200 text-sm font-medium border border-[rgba(239,68,68,0.2)] hover:border-[rgba(239,68,68,0.4)] ${
                isCollapsed ? 'w-12 h-12 p-0' : ''
              }`}
              title="Sair do admin e voltar para página inicial"
            >
              <IconFallback type="razor" size="sm" className="text-red-300" />
              {!isCollapsed && <span>Sair</span>}
            </button>
          </div>
          
          {!isCollapsed && (
            <div className="flex items-center justify-center space-x-2 pt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <span className="text-green-300 text-xs font-medium">Online</span>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center pt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
} 