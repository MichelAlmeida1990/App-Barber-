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
    <div className="flex min-h-0 flex-1 flex-col bg-gray-800">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4">
          <div className="flex items-center">
            <ScissorsIcon className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-bold text-white">
              Admin Barbearia
            </span>
          </div>
        </div>
        <nav className="mt-8 flex-1 space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200'
                )}
              >
                <item.icon
                  className={classNames(
                    isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300',
                    'mr-3 h-6 w-6 flex-shrink-0'
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