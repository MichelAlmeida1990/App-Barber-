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

interface StatsData {
  todayAppointments: number;
  totalClients: number;
  monthlyRevenue: number;
  activeBarbers: number;
}

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
  const [stats, setStats] = useState<StatsData>({
    todayAppointments: 0,
    totalClients: 0,
    monthlyRevenue: 0,
    activeBarbers: 0
  });

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const token = localStorage.getItem('token');
      
      if (!token) {
        setApiStatus('❌ Token não encontrado');
        return;
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Carregar agendamentos de hoje
      const appointmentsRes = await fetch(`${API_BASE_URL}/api/v1/appointments/`, {
        headers
      });

      const barberRes = await fetch(`${API_BASE_URL}/api/v1/barbers/`, {
        headers
      });

      const clientsRes = await fetch(`${API_BASE_URL}/api/v1/clients/`, {
        headers
      });

      let todayCount = 0;
      let monthlyRevenue = 0;

      if (appointmentsRes.ok) {
        const appointments = await appointmentsRes.json();
        const today = new Date().toDateString();
        todayCount = appointments.filter((a: any) => 
          new Date(a.appointment_date).toDateString() === today
        ).length;
        
        // Calcular receita mensal
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        monthlyRevenue = appointments.reduce((acc: number, a: any) => {
          const aptDate = new Date(a.appointment_date);
          if (aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear) {
            return acc + (a.total_price || 0);
          }
          return acc;
        }, 0);
      }

      let barberCount = 0;
      if (barberRes.ok) {
        const barbers = await barberRes.json();
        barberCount = Array.isArray(barbers) ? barbers.length : 0;
      }

      let clientCount = 0;
      if (clientsRes.ok) {
        const clients = await clientsRes.json();
        clientCount = Array.isArray(clients) ? clients.length : 0;
      }

      setStats({
        todayAppointments: todayCount,
        totalClients: clientCount,
        monthlyRevenue: monthlyRevenue,
        activeBarbers: barberCount
      });

      setApiStatus('✅ Dados carregados com sucesso');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setApiStatus('❌ Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const testApiConnection = async () => {
    try {
      console.log('🔄 Testando conexão com backend...');
      
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
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      return;
    }
    
    loadDashboardData();
    testApiConnection();
    loadClientsAtRisk();
  }, []);

  const loadClientsAtRisk = async () => {
    setLoadingRisk(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('Token não encontrado');
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

      <div className="pb-6 mb-8 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-shrink-0">
            <IconFallback type="barber-pole" size="lg" className="opacity-90 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">DASHBOARD</h1>
              <IconFallback type="scissors" size="md" className="opacity-70 text-orange-400 hidden sm:block" />
            </div>
            <p className="text-gray-300">
              Estatísticas e informações importantes da Elite Barber Shop
            </p>
          </div>
        </div>
        <div className="mt-4">
          <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
            apiStatus.includes('✅') 
              ? 'bg-green-900/30 text-green-300 border border-green-700'
              : apiStatus.includes('❌')
              ? 'bg-red-900/30 text-red-300 border border-red-700'
              : 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
          }`}>
            {apiStatus}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { name: 'Agendamentos Hoje', value: stats.todayAppointments, icon: 'scissors', color: 'from-blue-600 to-blue-700' },
          { name: 'Clientes Totais', value: stats.totalClients, icon: 'barber-chair', color: 'from-purple-600 to-purple-700' },
          { name: 'Receita Mensal', value: `R$ ${stats.monthlyRevenue.toFixed(2)}`, icon: 'comb', color: 'from-green-600 to-green-700' },
          { name: 'Barbeiros Ativos', value: stats.activeBarbers, icon: 'hair-clipper', color: 'from-orange-600 to-orange-700' }
        ].map((item) => (
          <div key={item.name} className="relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.color} rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300`}></div>
            <div className="relative bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-750 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{item.name}</p>
                  <p className="text-3xl font-bold text-white mt-2">{item.value}</p>
                </div>
                <div className={`bg-gradient-to-br ${item.color} p-3 rounded-lg`}>
                  <IconFallback type={item.icon as any} size="md" className="text-white opacity-90" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Clientes em Risco */}
      {clientsAtRisk.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
              Clientes em Risco
            </h2>
            <Link 
              href="/admin/retention"
              className="text-sm text-orange-400 hover:text-orange-300 font-medium"
            >
              Ver todos →
            </Link>
          </div>
          <div className="bg-gray-800 border border-gray-700 shadow-lg rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-700">
              {clientsAtRisk.map((item) => (
                <li key={item.client.client_id}>
                  <div className="px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <ExclamationTriangleIcon className={`h-6 w-6 ${
                            item.client.risk_level === 'critical' ? 'text-red-500' : 'text-orange-500'
                          }`} />
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-semibold text-white">
                              {item.client.client_name}
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getRiskColor(item.client.risk_level)}`}>
                              {item.client.risk_level}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            Sem retorno há {formatDays(item.client.days_since_last_visit)}
                            {item.client.barber_name && ` • ${item.client.barber_name}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/30 rounded-lg transition-colors"
                          title="Contatar"
                        >
                          <PhoneIcon className="h-5 w-5" />
                        </button>
                        <button 
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Enviar mensagem"
                        >
                          <EnvelopeIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-300 bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
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
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
          Próximos Agendamentos
          <Link 
            href="/admin/appointments" 
            className="text-sm text-orange-400 hover:text-orange-300 font-medium"
          >
            Ver todos →
          </Link>
        </h2>
        <div className="bg-gray-800 border border-gray-700 shadow-lg rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-700">
            {[
              { id: 1, cliente: 'Acesse a página de agendamentos para ver dados reais', servico: 'Todos os agendamentos estarão listados', barbeiro: 'Admin', horario: '--:--', status: 'pendente' },
            ].map((agendamento) => (
              <li key={agendamento.id}>
                <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <CalendarIcon className="h-6 w-6 text-gray-500" />
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{agendamento.cliente}</div>
                      <div className="text-xs text-gray-400 truncate">{agendamento.servico} com {agendamento.barbeiro}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-sm text-gray-400">{agendamento.horario}</div>
                    <span className={classNames(
                      agendamento.status === 'confirmado' ? 'bg-green-900/30 text-green-300 border-green-700' : 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
                      'inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border flex-shrink-0'
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