'use client';

import { useState, useEffect, useMemo } from 'react';
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
  EnvelopeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { analyticsAPI, appointmentsAPI, salesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import PaymentMethodChart from '@/components/charts/PaymentMethodChart';
import TopSalesChart from '@/components/charts/TopSalesChart';
import SalesEvolutionChart from '@/components/charts/SalesEvolutionChart';

const ADMIN_APPOINTMENTS_LS_KEY = 'admin_appointments_v1';
const ADMIN_SALES_LS_KEY = 'admin_sales_v1';
const ADMIN_CLIENTS_LS_KEY = 'admin_clients_v1';
const ADMIN_BARBERS_LS_KEY = 'admin_barbers_v1';
const ADMIN_EXPENSES_LS_KEY = 'admin_expenses_v1';

interface Sale {
  id: string;
  cliente: string;
  barbeiro: string;
  servicos: string[];
  produtos: string[];
  valor: number;
  desconto: number;
  valorFinal: number;
  formaPagamento: string;
  data: string;
  hora: string;
  status: 'pendente' | 'concluida' | 'cancelada';
  observacoes: string;
}

interface Expense {
  id: string;
  descricao: string;
  categoria: 'aluguel' | 'luz' | 'agua' | 'produtos' | 'insumos' | 'outros';
  valor: number;
  data: string;
  observacoes?: string;
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

// Stats serão calculados dinamicamente baseado no período

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminDashboard() {
  const [apiStatus, setApiStatus] = useState('🔄 Verificando conexão...');
  const [loading, setLoading] = useState(false);
  const [clientsAtRisk, setClientsAtRisk] = useState<ClientAtRisk[]>([]);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [chartPeriod, setChartPeriod] = useState<'7days' | '30days' | 'month'>('7days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const testApiConnection = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      return;
    }
    
    testApiConnection();
    loadClientsAtRisk();
    loadUpcomingAppointments();
    loadSales();
    loadExpenses();
    loadAppointments();
  }, []);

  const loadSales = () => {
    try {
      const raw = localStorage.getItem(ADMIN_SALES_LS_KEY);
      if (raw) {
        const salesData = JSON.parse(raw);
        if (Array.isArray(salesData)) {
          setSales(salesData);
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar vendas:', e);
    }
  };

  const loadExpenses = () => {
    try {
      const raw = localStorage.getItem(ADMIN_EXPENSES_LS_KEY);
      if (raw) {
        const expensesData = JSON.parse(raw);
        if (Array.isArray(expensesData)) {
          setExpenses(expensesData);
        } else {
          // Inicializar com despesas exemplo se não existir
          const hoje = new Date();
          const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          const dataFormatada = primeiroDiaMes.toISOString().split('T')[0];
          
          const despesasExemplo: Expense[] = [
            { id: 'exp-1', descricao: 'Aluguel do mês', categoria: 'aluguel', valor: 1500.00, data: dataFormatada },
            { id: 'exp-2', descricao: 'Conta de luz', categoria: 'luz', valor: 250.00, data: dataFormatada },
            { id: 'exp-3', descricao: 'Giletes descartáveis (pacote 100 unidades)', categoria: 'insumos', valor: 85.00, data: dataFormatada },
            { id: 'exp-4', descricao: 'Lâminas para máquina', categoria: 'insumos', valor: 120.00, data: dataFormatada },
            { id: 'exp-5', descricao: 'Toalhas descartáveis', categoria: 'insumos', valor: 95.00, data: dataFormatada },
            { id: 'exp-6', descricao: 'Álcool 70% e produtos de limpeza', categoria: 'insumos', valor: 150.00, data: dataFormatada },
            { id: 'exp-7', descricao: 'Pomadas, ceras e produtos para venda', categoria: 'produtos', valor: 450.00, data: dataFormatada },
            { id: 'exp-8', descricao: 'Shampoos e condicionadores profissionais', categoria: 'produtos', valor: 280.00, data: dataFormatada },
            { id: 'exp-9', descricao: 'Papel toalha e lenços', categoria: 'insumos', valor: 65.00, data: dataFormatada },
            { id: 'exp-10', descricao: 'Capa de corte (unidades)', categoria: 'insumos', valor: 180.00, data: dataFormatada }
          ];
          
          setExpenses(despesasExemplo);
          localStorage.setItem(ADMIN_EXPENSES_LS_KEY, JSON.stringify(despesasExemplo));
        }
      } else {
        // Mesmo código de inicialização
        const hoje = new Date();
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const dataFormatada = primeiroDiaMes.toISOString().split('T')[0];
        
        const despesasExemplo: Expense[] = [
          { id: 'exp-1', descricao: 'Aluguel do mês', categoria: 'aluguel', valor: 1500.00, data: dataFormatada },
          { id: 'exp-2', descricao: 'Conta de luz', categoria: 'luz', valor: 250.00, data: dataFormatada },
          { id: 'exp-3', descricao: 'Giletes descartáveis (pacote 100 unidades)', categoria: 'insumos', valor: 85.00, data: dataFormatada },
          { id: 'exp-4', descricao: 'Lâminas para máquina', categoria: 'insumos', valor: 120.00, data: dataFormatada },
          { id: 'exp-5', descricao: 'Toalhas descartáveis', categoria: 'insumos', valor: 95.00, data: dataFormatada },
          { id: 'exp-6', descricao: 'Álcool 70% e produtos de limpeza', categoria: 'insumos', valor: 150.00, data: dataFormatada },
          { id: 'exp-7', descricao: 'Pomadas, ceras e produtos para venda', categoria: 'produtos', valor: 450.00, data: dataFormatada },
          { id: 'exp-8', descricao: 'Shampoos e condicionadores profissionais', categoria: 'produtos', valor: 280.00, data: dataFormatada },
          { id: 'exp-9', descricao: 'Papel toalha e lenços', categoria: 'insumos', valor: 65.00, data: dataFormatada },
          { id: 'exp-10', descricao: 'Capa de corte (unidades)', categoria: 'insumos', valor: 180.00, data: dataFormatada }
        ];
        
        setExpenses(despesasExemplo);
        localStorage.setItem(ADMIN_EXPENSES_LS_KEY, JSON.stringify(despesasExemplo));
      }
    } catch (e) {
      console.warn('Erro ao carregar despesas:', e);
    }
  };

  const loadAppointments = () => {
    try {
      const raw = localStorage.getItem(ADMIN_APPOINTMENTS_LS_KEY);
      if (raw) {
        const appointmentsData = JSON.parse(raw);
        if (Array.isArray(appointmentsData)) {
          setAppointments(appointmentsData);
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar agendamentos:', e);
    }
  };

  const loadUpcomingAppointments = () => {
    try {
      const raw = localStorage.getItem(ADMIN_APPOINTMENTS_LS_KEY);
      if (raw) {
        const appointments = JSON.parse(raw);
        if (Array.isArray(appointments) && appointments.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const upcoming = appointments
            .filter((apt: any) => {
              const aptDate = apt.data || apt.date;
              return aptDate >= today && apt.status === 'agendado';
            })
            .sort((a: any, b: any) => {
              const dateA = `${a.data || a.date} ${a.hora || a.time || '00:00'}`;
              const dateB = `${b.data || b.date} ${b.hora || b.time || '00:00'}`;
              return dateA.localeCompare(dateB);
            })
            .slice(0, 5);
          setUpcomingAppointments(upcoming);
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar agendamentos:', e);
    }
  };

  const loadClientsAtRisk = async () => {
    setLoadingRisk(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const token = localStorage.getItem('token');
      
      if (!token) {
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setClientsAtRisk(data.slice(0, 5));
      }
    } catch (error) {
      console.error('Erro ao carregar clientes em risco:', error);
    } finally {
      setLoadingRisk(false);
    }
  };

  // Calcular dados para gráficos de vendas
  const paymentMethodData = useMemo(() => {
    const completedSales = sales.filter(s => s.status === 'concluida');
    const paymentMap = new Map<string, { value: number; count: number }>();
    
    completedSales.forEach(sale => {
      const existing = paymentMap.get(sale.formaPagamento) || { value: 0, count: 0 };
      paymentMap.set(sale.formaPagamento, {
        value: existing.value + sale.valorFinal,
        count: existing.count + 1
      });
    });
    
    return Array.from(paymentMap.entries()).map(([name, data]) => ({
      name,
      value: data.value,
      count: data.count
    })).sort((a, b) => b.value - a.value);
  }, [sales]);

  const topSalesData = useMemo(() => {
    const completedSales = sales.filter(s => s.status === 'concluida');
    const itemMap = new Map<string, { valor: number; quantidade: number }>();
    
    completedSales.forEach(sale => {
      sale.servicos.forEach(servico => {
        const existing = itemMap.get(servico) || { valor: 0, quantidade: 0 };
        itemMap.set(servico, {
          valor: existing.valor + (sale.valorFinal / (sale.servicos.length + sale.produtos.length || 1)),
          quantidade: existing.quantidade + 1
        });
      });
      
      sale.produtos.forEach(produto => {
        const existing = itemMap.get(produto) || { valor: 0, quantidade: 0 };
        itemMap.set(produto, {
          valor: existing.valor + (sale.valorFinal / (sale.servicos.length + sale.produtos.length || 1)),
          quantidade: existing.quantidade + 1
        });
      });
    });

    return Array.from(itemMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  }, [sales]);

  const salesEvolutionData = useMemo(() => {
    const completedSales = sales.filter(s => s.status === 'concluida');
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (chartPeriod === '7days') {
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);
    } else if (chartPeriod === '30days') {
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 29);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const dateMap = new Map<string, { vendas: number; receita: number }>();
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dateMap.set(dateStr, { vendas: 0, receita: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    completedSales.forEach(sale => {
      const saleDate = new Date(sale.data);
      if (saleDate >= startDate && saleDate <= endDate) {
        const dateStr = sale.data;
        const existing = dateMap.get(dateStr) || { vendas: 0, receita: 0 };
        dateMap.set(dateStr, {
          vendas: existing.vendas + 1,
          receita: existing.receita + sale.valorFinal
        });
      }
    });

    return Array.from(dateMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [sales, chartPeriod]);

  // Calcular métricas de vendas
  const salesStats = useMemo(() => {
    const receitaTotal = sales.filter(s => s.status === 'concluida').reduce((acc, s) => acc + s.valorFinal, 0);
    const totalVendas = sales.length;
    const concluidas = sales.filter(s => s.status === 'concluida').length;
    const pendentes = sales.filter(s => s.status === 'pendente').length;
    
    return { receitaTotal, totalVendas, concluidas, pendentes };
  }, [sales]);

  // Calcular métricas de analytics
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (startDate && s.data < startDate) return false;
      if (endDate && s.data > endDate) return false;
      return true;
    });
  }, [sales, startDate, endDate]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (startDate && (a.data || a.date) < startDate) return false;
      if (endDate && (a.data || a.date) > endDate) return false;
      return true;
    });
  }, [appointments, startDate, endDate]);

  const receitaPeriodo = useMemo(() => {
    return filteredSales.filter((s) => s.status === 'concluida').reduce((acc, s) => acc + (Number(s.valorFinal) || 0), 0);
  }, [filteredSales]);

  const despesasPeriodo = useMemo(() => {
    return expenses.filter((e) => {
      if (startDate && e.data < startDate) return false;
      if (endDate && e.data > endDate) return false;
      return true;
    }).reduce((acc, e) => acc + (Number(e.valor) || 0), 0);
  }, [expenses, startDate, endDate]);

  const lucroLiquido = useMemo(() => {
    return receitaPeriodo - despesasPeriodo;
  }, [receitaPeriodo, despesasPeriodo]);

  const totalAgendamentos = filteredAppointments.length;
  
  // Calcular stats dinâmicos baseado no período
  const [clients, setClients] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  
  useEffect(() => {
    try {
      const rawClients = localStorage.getItem(ADMIN_CLIENTS_LS_KEY);
      if (rawClients) {
        const clientsData = JSON.parse(rawClients);
        if (Array.isArray(clientsData)) setClients(clientsData);
      }
      
      const rawBarbers = localStorage.getItem(ADMIN_BARBERS_LS_KEY);
      if (rawBarbers) {
        const barbersData = JSON.parse(rawBarbers);
        if (Array.isArray(barbersData)) setBarbers(barbersData);
      }
    } catch (e) {
      console.warn('Erro ao carregar clientes/barbeiros:', e);
    }
  }, []);
  
  const dynamicStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter((a: any) => {
      const aptDate = a.data || a.date;
      return aptDate === today && a.status === 'agendado';
    }).length;
    
    const activeClients = clients.filter((c: any) => !c.status || c.status === 'ativo').length;
    const monthlyRevenue = filteredSales
      .filter(s => s.status === 'concluida')
      .reduce((acc, s) => acc + s.valorFinal, 0);
    const activeBarbers = barbers.filter((b: any) => !b.status || b.status === 'ativo').length;
    
    return {
      agendamentosHoje: todayAppointments,
      clientesAtivos: activeClients,
      receitaMensal: monthlyRevenue,
      barbeirosAtivos: activeBarbers
    };
  }, [appointments, filteredSales, clients, barbers, startDate, endDate]);
  
  const recentSales = useMemo(() => {
    return filteredSales.slice().sort((a, b) => {
      const dateA = new Date(`${a.data} ${a.hora}`);
      const dateB = new Date(`${b.data} ${b.hora}`);
      return dateB.getTime() - dateA.getTime();
    }).slice(0, 5);
  }, [filteredSales]);

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <AdminLayout>
      {/* Banner Principal */}
      <div className="mb-6">
        <BarberBanner 
          title="BARBEARIA DO DUDÃO - Dashboard" 
          subtitle="Visão geral da sua barbearia - Since 2020" 
          variant="promo"
        />
      </div>

      {/* Header com ícones e seletor de período */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <IconFallback type="scissors" size="md" className="text-red-600" />
            <span className="text-sm font-medium text-gray-700">Cortes Modernos</span>
          </div>
          <div className="flex items-center gap-2">
            <IconFallback type="comb" size="md" className="text-red-600" />
            <span className="text-sm font-medium text-gray-700">Barbas Clássicas</span>
          </div>
          <div className="flex items-center gap-2">
            <IconFallback type="barber-pole" size="md" className="text-red-600" />
            <span className="text-sm font-medium text-gray-700">Tradição & Qualidade</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Período:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            placeholder="Data inicial"
          />
          <span className="text-sm text-gray-600">até</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            placeholder="Data final"
          />
        </div>
      </div>

      {/* Seção DASHBOARD */}
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
              Estatísticas e informações importantes da BARBEARIA DO DUDÃO
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

      {/* Cards de Estatísticas */}
      <div>
        <dl className="mt-4 sm:mt-5 grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative bg-[rgba(147,197,253,0.2)] backdrop-blur-[15px] border border-[rgba(147,197,253,0.4)] pt-4 sm:pt-5 px-3 sm:px-4 pb-10 sm:pb-12 sm:pt-6 sm:px-6 shadow-xl rounded-2xl overflow-hidden hover:bg-[rgba(147,197,253,0.3)] hover:border-[rgba(147,197,253,0.5)] transition-all duration-300" style={{ WebkitBackdropFilter: 'blur(15px)' }}>
            <dt>
              <div className="absolute bg-[rgba(59,130,246,0.4)] backdrop-blur-[10px] rounded-xl p-2 sm:p-3 border border-[rgba(59,130,246,0.5)] shadow-lg" style={{ WebkitBackdropFilter: 'blur(10px)' }}>
                <IconFallback type="scissors" size="md" className="opacity-90 text-white" />
              </div>
              <p className="ml-14 sm:ml-16 text-xs sm:text-sm font-bold text-gray-900 truncate">Agendamentos Hoje</p>
            </dt>
            <dd className="ml-14 sm:ml-16 pb-4 sm:pb-6 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-0 sm:pb-7">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{dynamicStats.agendamentosHoje}</p>
            </dd>
          </div>
          
          <div className="relative bg-[rgba(147,197,253,0.2)] backdrop-blur-[15px] border border-[rgba(147,197,253,0.4)] pt-4 sm:pt-5 px-3 sm:px-4 pb-10 sm:pb-12 sm:pt-6 sm:px-6 shadow-xl rounded-2xl overflow-hidden hover:bg-[rgba(147,197,253,0.3)] hover:border-[rgba(147,197,253,0.5)] transition-all duration-300" style={{ WebkitBackdropFilter: 'blur(15px)' }}>
            <dt>
              <div className="absolute bg-[rgba(59,130,246,0.4)] backdrop-blur-[10px] rounded-xl p-2 sm:p-3 border border-[rgba(59,130,246,0.5)] shadow-lg" style={{ WebkitBackdropFilter: 'blur(10px)' }}>
                <IconFallback type="barber-chair" size="md" className="opacity-90 text-white" />
              </div>
              <p className="ml-14 sm:ml-16 text-xs sm:text-sm font-bold text-gray-900 truncate">Clientes Ativos</p>
            </dt>
            <dd className="ml-14 sm:ml-16 pb-4 sm:pb-6 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-0 sm:pb-7">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{dynamicStats.clientesAtivos}</p>
            </dd>
          </div>
          
          <div className="relative bg-[rgba(147,197,253,0.2)] backdrop-blur-[15px] border border-[rgba(147,197,253,0.4)] pt-4 sm:pt-5 px-3 sm:px-4 pb-10 sm:pb-12 sm:pt-6 sm:px-6 shadow-xl rounded-2xl overflow-hidden hover:bg-[rgba(147,197,253,0.3)] hover:border-[rgba(147,197,253,0.5)] transition-all duration-300" style={{ WebkitBackdropFilter: 'blur(15px)' }}>
            <dt>
              <div className="absolute bg-[rgba(59,130,246,0.4)] backdrop-blur-[10px] rounded-xl p-2 sm:p-3 border border-[rgba(59,130,246,0.5)] shadow-lg" style={{ WebkitBackdropFilter: 'blur(10px)' }}>
                <IconFallback type="comb" size="md" className="opacity-90 text-white" />
              </div>
              <p className="ml-14 sm:ml-16 text-xs sm:text-sm font-bold text-gray-900 truncate">Receita {startDate || endDate ? 'do Período' : 'Mensal'}</p>
            </dt>
            <dd className="ml-14 sm:ml-16 pb-4 sm:pb-6 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-0 sm:pb-7">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(dynamicStats.receitaMensal)}</p>
            </dd>
          </div>
          
          <div className="relative bg-[rgba(147,197,253,0.2)] backdrop-blur-[15px] border border-[rgba(147,197,253,0.4)] pt-4 sm:pt-5 px-3 sm:px-4 pb-10 sm:pb-12 sm:pt-6 sm:px-6 shadow-xl rounded-2xl overflow-hidden hover:bg-[rgba(147,197,253,0.3)] hover:border-[rgba(147,197,253,0.5)] transition-all duration-300" style={{ WebkitBackdropFilter: 'blur(15px)' }}>
            <dt>
              <div className="absolute bg-[rgba(59,130,246,0.4)] backdrop-blur-[10px] rounded-xl p-2 sm:p-3 border border-[rgba(59,130,246,0.5)] shadow-lg" style={{ WebkitBackdropFilter: 'blur(10px)' }}>
                <IconFallback type="hair-clipper" size="md" className="opacity-90 text-white" />
              </div>
              <p className="ml-14 sm:ml-16 text-xs sm:text-sm font-bold text-gray-900 truncate">Barbeiros Ativos</p>
            </dt>
            <dd className="ml-14 sm:ml-16 pb-4 sm:pb-6 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-0 sm:pb-7">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{dynamicStats.barbeirosAtivos}</p>
            </dd>
          </div>
        </dl>
      </div>

      {/* Seção VENDAS */}
      <div className="mt-8">
        <div className="pb-4 sm:pb-5 border-b border-red-200 mb-4 sm:mb-6 bg-gradient-to-r from-gray-50 to-red-50 rounded-lg p-4 sm:p-6 shadow-sm border-2 border-yellow-500">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">VENDAS</h2>
              <p className="mt-1 text-sm text-gray-700">Gestão completa de vendas da BARBEARIA DO DUDÃO</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={testApiConnection}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Testando...' : 'Testar API'}
              </button>
              <Link
                href="/admin/sales"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Nova Venda
              </Link>
            </div>
          </div>
        </div>

        {/* Cards de Resumo de Vendas - Glassmorphism Azul Claro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[rgba(147,197,253,0.2)] backdrop-blur-[15px] border border-[rgba(147,197,253,0.4)] text-gray-900 rounded-2xl p-4 shadow-xl hover:bg-[rgba(147,197,253,0.3)] hover:border-[rgba(147,197,253,0.5)] transition-all duration-300" style={{ WebkitBackdropFilter: 'blur(15px)' }}>
            <p className="text-sm font-medium text-gray-700">Receita Total</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">{formatCurrency(salesStats.receitaTotal)}</p>
          </div>
          <div className="bg-[rgba(147,197,253,0.2)] backdrop-blur-[15px] border border-[rgba(147,197,253,0.4)] text-gray-900 rounded-2xl p-4 shadow-xl hover:bg-[rgba(147,197,253,0.3)] hover:border-[rgba(147,197,253,0.5)] transition-all duration-300" style={{ WebkitBackdropFilter: 'blur(15px)' }}>
            <p className="text-sm font-medium text-gray-700">Total de Vendas</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">{salesStats.totalVendas}</p>
          </div>
          <div className="bg-[rgba(147,197,253,0.2)] backdrop-blur-[15px] border border-[rgba(147,197,253,0.4)] text-gray-900 rounded-2xl p-4 shadow-xl hover:bg-[rgba(147,197,253,0.3)] hover:border-[rgba(147,197,253,0.5)] transition-all duration-300" style={{ WebkitBackdropFilter: 'blur(15px)' }}>
            <p className="text-sm font-medium text-gray-700">Concluídas</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">{salesStats.concluidas}</p>
          </div>
          <div className="bg-[rgba(147,197,253,0.2)] backdrop-blur-[15px] border border-[rgba(147,197,253,0.4)] text-gray-900 rounded-2xl p-4 shadow-xl hover:bg-[rgba(147,197,253,0.3)] hover:border-[rgba(147,197,253,0.5)] transition-all duration-300" style={{ WebkitBackdropFilter: 'blur(15px)' }}>
            <p className="text-sm font-medium text-gray-700">Pendentes</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">{salesStats.pendentes}</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vendas por Forma de Pagamento</h3>
            <PaymentMethodChart data={paymentMethodData} />
          </div>
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top 5 Serviços/Produtos Vendidos</h3>
            <TopSalesChart data={topSalesData} />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Evolução das Vendas</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartPeriod('7days')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${chartPeriod === '7days' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                7 Dias
              </button>
              <button
                onClick={() => setChartPeriod('30days')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${chartPeriod === '30days' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                30 Dias
              </button>
              <button
                onClick={() => setChartPeriod('month')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${chartPeriod === 'month' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Mês Atual
              </button>
            </div>
          </div>
          <SalesEvolutionChart data={salesEvolutionData} period={chartPeriod === '7days' ? '7d' : chartPeriod === '30days' ? '30d' : 'month'} />
        </div>

        {/* Tabela de Vendas Recentes */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Vendas Recentes (5)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CLIENTE / BARBEIRO</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SERVIÇOS / PRODUTOS</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VALORES</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PAGAMENTO / DATA</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentSales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Nenhuma venda registrada ainda
                    </td>
                  </tr>
                ) : (
                  recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{sale.cliente}</div>
                        <div className="text-sm text-gray-500">{sale.barbeiro}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {sale.servicos.length > 0 && (
                            <div>Serviços: {sale.servicos.join(', ')}</div>
                          )}
                          {sale.produtos.length > 0 && (
                            <div>Produtos: {sale.produtos.join(', ')}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">R$ {sale.valor.toFixed(2)}</div>
                        {sale.desconto > 0 && (
                          <div className="text-sm text-gray-500">Desc: R$ {sale.desconto.toFixed(2)}</div>
                        )}
                        <div className="text-sm font-medium text-gray-900">Final: {formatCurrency(sale.valorFinal)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{sale.formaPagamento}</div>
                        <div className="text-sm text-gray-500">{formatDate(sale.data)} {sale.hora}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sale.status === 'concluida' ? 'bg-green-100 text-green-800' :
                          sale.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {sale.status === 'concluida' ? 'Concluída' : sale.status === 'pendente' ? 'Pendente' : 'Cancelada'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Link href={`/admin/sales?edit=${sale.id}`} className="text-indigo-600 hover:text-indigo-900">
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button className="text-red-600 hover:text-red-900">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Seção Analytics/Resumo */}
      <div className="mt-8">
        <div className="pb-4 sm:pb-5 border-b border-red-200 mb-4 sm:mb-6 bg-gradient-to-r from-gray-50 to-red-50 rounded-lg p-4 sm:p-6 shadow-sm border-2 border-yellow-500">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Resumo do período</h2>
            <p className="mt-1 text-sm text-gray-700">Calculado a partir de Vendas/Agendamentos/Clientes salvos no sistema.</p>
          </div>
        </div>

        {/* Cards de Resumo - Glassmorphism Azul Claro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[rgba(147,197,253,0.2)] backdrop-blur-[15px] border border-[rgba(147,197,253,0.4)] text-gray-900 rounded-2xl p-4 shadow-xl hover:bg-[rgba(147,197,253,0.3)] hover:border-[rgba(147,197,253,0.5)] transition-all duration-300" style={{ WebkitBackdropFilter: 'blur(15px)' }}>
            <p className="text-sm font-medium text-gray-700">RECEITA (PERÍODO)</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">{formatCurrency(receitaPeriodo)}</p>
          </div>
          <div className="bg-[rgba(147,197,253,0.2)] backdrop-blur-[15px] border border-[rgba(147,197,253,0.4)] text-gray-900 rounded-2xl p-4 shadow-xl hover:bg-[rgba(147,197,253,0.3)] hover:border-[rgba(147,197,253,0.5)] transition-all duration-300" style={{ WebkitBackdropFilter: 'blur(15px)' }}>
            <p className="text-sm font-medium text-gray-700">DESPESAS (PERÍODO)</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">{formatCurrency(despesasPeriodo)}</p>
            <p className="text-sm text-gray-600 mt-1">{expenses.length} despesas</p>
          </div>
          <div className="bg-[rgba(147,197,253,0.2)] backdrop-blur-[15px] border border-[rgba(147,197,253,0.4)] text-gray-900 rounded-2xl p-4 shadow-xl hover:bg-[rgba(147,197,253,0.3)] hover:border-[rgba(147,197,253,0.5)] transition-all duration-300" style={{ WebkitBackdropFilter: 'blur(15px)' }}>
            <p className="text-sm font-medium text-gray-700">LUCRO LÍQUIDO</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">{formatCurrency(lucroLiquido)}</p>
            <p className="text-sm text-gray-600 mt-1">receita - despesas</p>
          </div>
          <div className="bg-[rgba(147,197,253,0.2)] backdrop-blur-[15px] border border-[rgba(147,197,253,0.4)] text-gray-900 rounded-2xl p-4 shadow-xl hover:bg-[rgba(147,197,253,0.3)] hover:border-[rgba(147,197,253,0.5)] transition-all duration-300" style={{ WebkitBackdropFilter: 'blur(15px)' }}>
            <p className="text-sm font-medium text-gray-700">AGENDAMENTOS</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">{totalAgendamentos}</p>
            <p className="text-sm text-gray-600 mt-1">no período</p>
          </div>
        </div>

        {/* Tabela de Despesas */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Despesas do Período</h3>
            <Link
              href="/admin/analytics"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Nova Despesa
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATA</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DESCRIÇÃO</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CATEGORIA</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VALOR</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Nenhuma despesa registrada ainda
                    </td>
                  </tr>
                ) : (
                  expenses.slice().sort((a, b) => b.data.localeCompare(a.data)).map((expense) => (
                    <tr key={expense.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatDate(expense.data)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{expense.descricao}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {expense.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(expense.valor)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Link href={`/admin/analytics?edit=${expense.id}`} className="text-indigo-600 hover:text-indigo-900">
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button className="text-red-600 hover:text-red-900">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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

          <Link 
            href="/admin/clients"
            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          >
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
          </Link>

          <Link 
            href="/admin/appointments"
            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          >
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
          </Link>

          <Link 
            href="/admin/sales"
            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          >
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
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
