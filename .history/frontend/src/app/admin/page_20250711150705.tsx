'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import BarberBanner from '@/components/BarberBanner';
import IconFallback from '@/components/IconFallback';
import { 
  CalendarIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { analyticsAPI, appointmentsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const stats = [
  { 
    name: 'Agendamentos Hoje', 
    stat: '12', 
    icon: 'scissors',
    change: '+4.75%', 
    changeType: 'increase' 
  },
  { 
    name: 'Clientes Ativos', 
    stat: '127', 
    icon: 'barber-chair',
    change: '+12.34%', 
    changeType: 'increase' 
  },
  { 
    name: 'Receita Mensal', 
    stat: 'R$ 8.450', 
    icon: 'comb',
    change: '+23.45%', 
    changeType: 'increase' 
  },
  { 
    name: 'Barbeiros Ativos', 
    stat: '3', 
    icon: 'hair-clipper',
    change: '0%', 
    changeType: 'neutral' 
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminDashboard() {
  const [apiStatus, setApiStatus] = useState('🔄 Verificando conexão...');
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    try {
      console.log('🔄 Testando conexão com backend...');
      
      // Testar múltiplos endpoints
      const tests = [
        { name: 'Health Check', call: () => fetch('http://127.0.0.1:8002/health') },
        { name: 'Clientes API', call: appointmentsAPI.test },
        { name: 'Analytics API', call: analyticsAPI.test }
      ];
      
      let successCount = 0;
      let totalTests = tests.length;
      
      for (const test of tests) {
        try {
          await test.call();
          successCount++;
          console.log(`✅ ${test.name}: OK`);
        } catch (error) {
          console.log(`❌ ${test.name}: ERRO`, error);
        }
      }
      
      if (successCount === totalTests) {
        setApiStatus('✅ Todas as APIs funcionando');
      } else if (successCount > 0) {
        setApiStatus(`⚠️ ${successCount}/${totalTests} APIs funcionando`);
      } else {
        setApiStatus('❌ Nenhuma API respondendo - Verifique o backend');
      }
      
    } catch (error) {
      console.error('❌ Erro geral nos testes:', error);
      setApiStatus('❌ Erro ao testar APIs');
    }
  };

  useEffect(() => {
    testApiConnection();
  }, []);

  return (
    <AdminLayout>
      {/* Banner Principal */}
      <div className="mb-8">
        <BarberBanner 
          title="Elite Barber Shop - Dashboard" 
          subtitle="Visão geral da sua barbearia" 
          variant="promo"
        />
      </div>

      <div className="pb-5 border-b border-red-200 mb-6 bg-gradient-to-r from-gray-50 to-red-50 rounded-lg p-6 shadow-sm border-2 border-yellow-500">
        <div className="flex items-center">
          <div className="mr-4">
            <IconFallback type="barber-pole" size="lg" className="opacity-70" />
          </div>
          <div>
            <div className="flex items-center mb-2">
              <h1 className="text-3xl font-bold leading-6 text-gray-900">DASHBOARD</h1>
              <IconFallback type="scissors" size="md" className="ml-3 opacity-50" />
            </div>
            <p className="max-w-4xl text-sm text-gray-700">
              Estatísticas e informações importantes da Elite Barber Shop
            </p>
          </div>
        </div>
        <div className="mt-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            apiStatus.includes('✅') 
              ? 'bg-green-100 text-green-800 border border-green-300'
              : apiStatus.includes('❌')
              ? 'bg-red-100 text-red-800 border border-red-300'
              : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
          }`}>
            {apiStatus}
          </span>
        </div>
      </div>

      <div>
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.name}
              className="relative bg-gradient-to-br from-white to-gray-50 border-2 border-red-200 pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <dt>
                <div className="absolute bg-gradient-to-br from-red-600 to-black rounded-lg p-3 border border-yellow-500">
                  <IconFallback 
                    type={item.icon as any} 
                    size="md" 
                    className="opacity-90 text-white" 
                  />
                </div>
                <p className="ml-16 text-sm font-bold text-gray-700 truncate">{item.name}</p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-bold text-gray-900">{item.stat}</p>
                <p
                  className={classNames(
                    item.changeType === 'increase' ? 'text-green-600' : 
                    item.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500',
                    'ml-2 flex items-baseline text-sm font-semibold'
                  )}
                >
                  {item.changeType === 'increase' ? (
                    <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                  ) : item.changeType === 'decrease' ? (
                    <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-5 w-5 text-red-500 transform rotate-180" aria-hidden="true" />
                  ) : null}
                  <span className="sr-only">{item.changeType === 'increase' ? 'Increased' : 'Decreased'} by</span>
                  {item.change}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Próximos Agendamentos */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Próximos Agendamentos</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {[
              { id: 1, cliente: 'João Silva', servico: 'Corte + Barba', barbeiro: 'Carlos', horario: '14:00', status: 'confirmado' },
              { id: 2, cliente: 'Pedro Santos', servico: 'Corte', barbeiro: 'André', horario: '14:30', status: 'confirmado' },
              { id: 3, cliente: 'Rafael Costa', servico: 'Barba', barbeiro: 'Carlos', horario: '15:00', status: 'pendente' },
            ].map((agendamento) => (
              <li key={agendamento.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClockIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{agendamento.cliente}</div>
                      <div className="text-sm text-gray-500">{agendamento.servico} com {agendamento.barbeiro}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-sm text-gray-900 mr-4">{agendamento.horario}</div>
                    <span className={classNames(
                      agendamento.status === 'confirmado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
                    )}>
                      {agendamento.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button 
            onClick={testApiConnection}
            disabled={loading}
            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md transition-shadow disabled:opacity-50"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                <CalendarIcon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-medium">
                <span className="absolute inset-0" aria-hidden="true" />
                {loading ? 'Testando...' : 'Testar API'}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Verificar conexão com o backend
              </p>
            </div>
          </button>

          <div className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md transition-shadow">
            <div>
              <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                <UsersIcon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-medium">
                <span className="absolute inset-0" aria-hidden="true" />
                Novo Cliente
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Cadastrar um novo cliente
              </p>
            </div>
          </div>

          <div className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md transition-shadow">
            <div>
              <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                <CalendarIcon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-medium">
                <span className="absolute inset-0" aria-hidden="true" />
                Novo Agendamento
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Agendar um novo serviço
              </p>
            </div>
          </div>

          <div className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md transition-shadow">
            <div>
              <span className="rounded-lg inline-flex p-3 bg-orange-50 text-orange-700 ring-4 ring-white">
                <CurrencyDollarIcon className="h-6 w-6" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-medium">
                <span className="absolute inset-0" aria-hidden="true" />
                Registrar Venda
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Registrar uma nova venda
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 