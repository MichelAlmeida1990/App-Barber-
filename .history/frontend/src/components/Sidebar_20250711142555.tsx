'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
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
    <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-amber-900 via-amber-800 to-yellow-900 border-r border-yellow-600/30">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4 mb-6">
          <div className="flex flex-col items-center w-full">
            {/* Logo */}
            <div className="mb-3">
              <Image 
                src="/images/barbershop/logo.svg" 
                alt="Barber Shop Logo" 
                width={80} 
                height={40} 
                className="mx-auto"
              />
            </div>
            <h1 className="text-lg font-bold text-yellow-100 text-center">Elite Barber</h1>
            <p className="text-xs text-yellow-300 text-center">Admin Panel</p>
            
            {/* Decorative icons */}
            <div className="flex items-center justify-center space-x-2 mt-2">
              <Image src="/images/barbershop/scissors.svg" alt="" width={12} height={12} className="opacity-60" />
              <div className="w-px h-2 bg-yellow-400 opacity-60"></div>
              <Image src="/images/barbershop/razor.svg" alt="" width={16} height={10} className="opacity-60" />
              <div className="w-px h-2 bg-yellow-400 opacity-60"></div>
              <Image src="/images/barbershop/comb.svg" alt="" width={18} height={8} className="opacity-60" />
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
                    ? 'bg-yellow-600 bg-opacity-30 text-yellow-100 border-l-4 border-yellow-400'
                    : 'text-yellow-200 hover:bg-yellow-600 hover:bg-opacity-20 hover:text-yellow-100 border-l-4 border-transparent',
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-r-md transition-all duration-200'
                )}
              >
                <item.icon
                  className={classNames(
                    isActive ? 'text-yellow-300' : 'text-yellow-400 group-hover:text-yellow-300',
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
      <div className="flex flex-shrink-0 bg-gray-700 p-4">
        <div className="group block w-full flex-shrink-0">
          <div className="flex items-center">
            <div className="inline-block h-9 w-9 rounded-full bg-gray-500">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600">
                <span className="text-sm font-medium text-white">A</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs font-medium text-gray-300">Administrador</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 