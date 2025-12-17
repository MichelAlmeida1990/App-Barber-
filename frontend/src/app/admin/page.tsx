'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import BarberBanner from '@/components/BarberBanner';
import { IconFallback } from '@/components/IconFallback';
import { 
  CalendarIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { analyticsAPI, appointmentsAPI } from '@/lib/api';

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

interface ClientAtRisk {
  client: {
    client_id: number;
    client_name: string;
    days_since_last_visit: number | null;
    average_return_days: number | null;
    risk_level: string;
    barber_name: string | null;
  };
  suggested_action: string;
  days_overdue: number | null;
}

export default function AdminDashboard() {
  const [apiStatus, setApiStatus] = useState('🔄 Verificando conexão...');
  const [loading, setLoading] = useState(false);
  const [clientsAtRisk, setClientsAtRisk] = useState<ClientAtRisk[]>([]);
  const [loadingRisk, setLoadingRisk] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    try {
      console.log('🔄 Testando conexão com backend...');
      
      // Testar múltiplos endpoints
      const tests = [
        { name: 'Health Check', call: () => fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/health`) },
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Verificar autenticação antes de fazer requisições
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      // Se não estiver autenticado, o AdminLayout vai redirecionar
      return;
    }
    
    testApiConnection();
    loadClientsAtRisk();
  }, []);

  const loadClientsAtRisk = async () => {
    setLoadingRisk(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('Token não encontrado, pulando carregamento de clientes em risco');
        setLoadingRisk(false);
        return;
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const response = await fetch(`${API_BASE_URL}/api/v1/clients/at-risk/list?risk_level=high&risk_level=critical`, {
        method: 'GET',
        headers
      });

      if (response.status === 401) {
        // Token inválido ou expirado
        console.warn('Token inválido ou expirado, redirecionando para login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setClientsAtRisk(data.slice(0, 5)); // Top 5 mais críticos
      } else {
        console.error('Erro ao carregar clientes em risco:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes em risco:', error);
    } finally {
      setLoadingRisk(false);
    }
  };

  const formatDays = (days: number | null) => {
    if (days === null) return 'N/A';
    if (days === 0) return 'Hoje';
    if (days === 1) return '1 dia';
    return `${days} dias`;
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

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

      <div className="pb-4 sm:pb-5 border-b border-red-200 mb-4 sm:mb-6 bg-gradient-to-r from-gray-50 to-red-50 rounded-lg p-4 sm:p-6 shadow-sm border-2 border-yellow-500">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0">
          <div className="mr-0 sm:mr-4 flex-shrink-0">
            <IconFallback type="barber-pole" size="lg" className="opacity-70" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold leading-6 text-gray-900">DASHBOARD</h1>
              <IconFallback type="scissors" size="md" className="ml-0 sm:ml-3 opacity-50 hidden sm:block" />
            </div>
            <p className="max-w-4xl text-xs sm:text-sm text-gray-700">
              Estatísticas e informações importantes da Elite Barber Shop
            </p>
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
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
        <dl className="mt-4 sm:mt-5 grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.name}
              className="relative bg-gradient-to-br from-white to-gray-50 border-2 border-red-200 pt-4 sm:pt-5 px-3 sm:px-4 pb-10 sm:pb-12 sm:pt-6 sm:px-6 shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <dt>
                <div className="absolute bg-gradient-to-br from-red-600 to-black rounded-lg p-2 sm:p-3 border border-yellow-500">
                  <IconFallback 
                    type={item.icon as any} 
                    size="md" 
                    className="opacity-90 text-white" 
                  />
                </div>
                <p className="ml-14 sm:ml-16 text-xs sm:text-sm font-bold text-gray-700 truncate">{item.name}</p>
              </dt>
              <dd className="ml-14 sm:ml-16 pb-4 sm:pb-6 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-0 sm:pb-7">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{item.stat}</p>
                <p
                  className={classNames(
                    item.changeType === 'increase' ? 'text-green-600' : 
                    item.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500',
                    'sm:ml-2 flex items-baseline text-xs sm:text-sm font-semibold'
                  )}
                >
                  {item.changeType === 'increase' ? (
                    <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 text-green-500" aria-hidden="true" />
                  ) : item.changeType === 'decrease' ? (
                    <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 text-red-500 transform rotate-180" aria-hidden="true" />
                  ) : null}
                  <span className="sr-only">{item.changeType === 'increase' ? 'Increased' : 'Decreased'} by</span>
                  {item.change}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Clientes em Risco */}
      {clientsAtRisk.length > 0 && (
        <div className="mt-6 sm:mt-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
              Clientes em Risco
            </h2>
            <Link 
              href="/admin/retention"
              className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
            >
              Ver todos →
            </Link>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {clientsAtRisk.map((item) => (
                <li key={item.client.client_id}>
                  <div className="px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <ExclamationTriangleIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${
                            item.client.risk_level === 'critical' ? 'text-red-500' : 'text-orange-500'
                          }`} />
                        </div>
                        <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {item.client.client_name}
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${getRiskColor(item.client.risk_level)}`}>
                              {item.client.risk_level}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate mt-1">
                            Sem retorno há {formatDays(item.client.days_since_last_visit)}
                            {item.client.barber_name && ` • Barbeiro: ${item.client.barber_name}`}
                          </div>
                          {item.days_overdue && item.days_overdue > 0 && (
                            <div className="text-xs text-red-600 font-medium mt-1">
                              {item.days_overdue} dias em atraso
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:ml-4">
                        <button 
                          className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors"
                          title="Contatar"
                        >
                          <PhoneIcon className="h-5 w-5" />
                        </button>
                        <button 
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                          title="Enviar mensagem"
                        >
                          <EnvelopeIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <span className="font-medium">Ação sugerida:</span> {item.suggested_action}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Próximos Agendamentos */}
      <div className="mt-6 sm:mt-8">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4 flex items-center justify-between">
          Próximos Agendamentos
          <Link 
            href="/admin/appointments" 
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Ver todos →
          </Link>
        </h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {[
              { id: 1, cliente: 'Carregando...', servico: 'Verifique a página de agendamentos', barbeiro: 'Admin', horario: '--:--', status: 'pendente' },
            ].map((agendamento) => (
              <li key={agendamento.id}>
                <div className="px-3 sm:px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                    </div>
                    <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{agendamento.cliente}</div>
                      <div className="text-xs sm:text-sm text-gray-500 truncate">{agendamento.servico} com {agendamento.barbeiro}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-0">
                    <div className="text-xs sm:text-sm text-gray-900 sm:mr-4">{agendamento.horario}</div>
                    <span className={classNames(
                      agendamento.status === 'confirmado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
                      'inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0'
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
      <div className="mt-6 sm:mt-8">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
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