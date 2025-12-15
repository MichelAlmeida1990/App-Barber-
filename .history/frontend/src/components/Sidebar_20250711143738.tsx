'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import IconFallback from './IconFallback';
import { 
  HomeIcon, 
  UsersIcon, 
  ScissorsIcon, 
  CalendarIcon, 
  CogIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  SparklesIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Agendamentos', href: '/admin/appointments', icon: CalendarIcon },
  { name: 'Clientes', href: '/admin/clients', icon: UsersIcon },
  { name: 'Barbeiros', href: '/admin/barbers', icon: ScissorsIcon },
  { name: 'Serviços', href: '/admin/services', icon: SparklesIcon },
  { name: 'Produtos', href: '/admin/products', icon: CubeIcon },
  { name: 'Vendas', href: '/admin/sales', icon: ShoppingBagIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Configurações', href: '/admin/settings', icon: CogIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-gray-900 via-black to-gray-800 border-r-2 border-yellow-500">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4 mb-6">
          <div className="flex flex-col items-center w-full">
            {/* Logo */}
            <div className="mb-3 p-3 bg-gradient-to-r from-yellow-500 to-red-600 rounded-lg">
              <IconFallback type="logo" size="lg" className="text-4xl" />
            </div>
            <h1 className="text-lg font-bold text-yellow-400 text-center tracking-wider">ELITE BARBER</h1>
            <p className="text-xs text-red-400 text-center font-semibold">ADMIN PANEL</p>
            
            {/* Decorative icons */}
            <div className="flex items-center justify-center space-x-2 mt-2">
              <IconFallback type="scissors" size="sm" className="opacity-60" />
              <div className="w-px h-2 bg-yellow-500 opacity-60"></div>
              <IconFallback type="razor" size="sm" className="opacity-60" />
              <div className="w-px h-2 bg-red-500 opacity-60"></div>
              <IconFallback type="comb" size="sm" className="opacity-60" />
            </div>
          </div>
        </div>
        <nav className="mt-4 flex-1 space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  isActive
                    ? 'bg-gradient-to-r from-yellow-600 to-red-600 text-white border-l-4 border-yellow-400'
                    : 'text-gray-300 hover:bg-gradient-to-r hover:from-gray-700 hover:to-red-700 hover:text-yellow-400 border-l-4 border-transparent',
                  'group flex items-center px-3 py-3 text-sm font-medium rounded-r-md transition-all duration-200'
                )}
              >
                <item.icon
                  className={classNames(
                    isActive ? 'text-yellow-300' : 'text-gray-400 group-hover:text-yellow-400',
                    'mr-3 h-5 w-5 flex-shrink-0'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Decorative barber pole */}
      <div className="flex justify-center py-2">
        <IconFallback type="barber-pole" size="md" className="opacity-30" />
      </div>
      
      <div className="flex flex-shrink-0 bg-gradient-to-r from-black to-gray-800 border-t-2 border-yellow-500 p-4">
        <div className="group block w-full flex-shrink-0">
          <div className="flex items-center">
            <div className="inline-block h-9 w-9 rounded-full bg-gradient-to-br from-yellow-500 to-red-600 border-2 border-yellow-400 p-1">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-black">
                <IconFallback type="scissors" size="sm" className="opacity-80" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-bold text-yellow-400">ADMINISTRADOR</p>
              <p className="text-xs font-medium text-red-400">Elite Barber Shop</p>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center mt-2">
            <div className="h-2 w-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-xs text-gray-400">Sistema Online</span>
          </div>
        </div>
      </div>
    </div>
  );
} 