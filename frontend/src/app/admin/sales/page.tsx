'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { IconFallback } from '@/components/IconFallback';
import {
  CurrencyDollarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { salesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import SaleForm from '@/components/forms/SaleForm';
import PaymentMethodChart from '@/components/charts/PaymentMethodChart';
import TopSalesChart from '@/components/charts/TopSalesChart';
import SalesEvolutionChart from '@/components/charts/SalesEvolutionChart';

const ADMIN_SALES_LS_KEY = 'admin_sales_v1';

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

interface SaleItem {
  tipo: 'servico' | 'produto';
  nome: string;
}

interface SaleFormData {
  cliente_nome: string;
  barbeiro_nome: string;
  itens: SaleItem[];
  valor_bruto: number;
  desconto: number;
  valor_final: number;
  forma_pagamento: string;
  observacoes?: string;
}

// Dados mock para demonstração
const mockSales: Sale[] = [
  {
    id: '1',
    cliente: 'João Silva',
    barbeiro: 'Carlos Santos',
    servicos: ['Corte Masculino', 'Barba Completa'],
    produtos: ['Pomada Modeladora', 'Shampoo Anticaspa'],
    valor: 85.00,
    desconto: 5.00,
    valorFinal: 80.00,
    formaPagamento: 'Cartão de Crédito',
    data: '2025-01-11',
    hora: '14:30',
    status: 'concluida',
    observacoes: 'Cliente satisfeito, retorno em 15 dias'
  },
  {
    id: '2',
    cliente: 'Pedro Costa',
    barbeiro: 'André Lima',
    servicos: ['Corte + Barba'],
    produtos: ['Óleo para Barba'],
    valor: 65.00,
    desconto: 0,
    valorFinal: 65.00,
    formaPagamento: 'PIX',
    data: '2025-01-11',
    hora: '15:00',
    status: 'concluida',
    observacoes: ''
  },
  {
    id: '3',
    cliente: 'Rafael Oliveira',
    barbeiro: 'Carlos Santos',
    servicos: ['Corte Masculino'],
    produtos: [],
    valor: 45.00,
    desconto: 0,
    valorFinal: 45.00,
    formaPagamento: 'Dinheiro',
    data: '2025-01-11',
    hora: '16:15',
    status: 'pendente',
    observacoes: 'Aguardando pagamento'
  },
  {
    id: '4',
    cliente: 'Lucas Mendes',
    barbeiro: 'André Lima',
    servicos: ['Barba Completa', 'Sobrancelha'],
    produtos: ['Balm Hidratante'],
    valor: 55.00,
    desconto: 10.00,
    valorFinal: 45.00,
    formaPagamento: 'Cartão de Débito',
    data: '2025-01-10',
    hora: '18:30',
    status: 'concluida',
    observacoes: 'Desconto fidelidade'
  }
];

const statusOptions = [
  { value: 'pendente', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'concluida', label: 'Concluída', color: 'bg-green-100 text-green-800' },
  { value: 'cancelada', label: 'Cancelada', color: 'bg-red-100 text-red-800' }
];

export default function SalesPage() {
  const [hydrated, setHydrated] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | 'month'>('7d');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADMIN_SALES_LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Sale[];
        if (Array.isArray(parsed) && parsed.length > 0) setSales(parsed);
        else setSales(mockSales);
      } else {
        setSales(mockSales);
      }
    } catch (e) {
      console.warn('Falha ao ler vendas do localStorage:', e);
      setSales(mockSales);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(ADMIN_SALES_LS_KEY, JSON.stringify(sales));
      // Notificar outras telas no MESMO TAB (o evento "storage" não dispara no mesmo documento)
      window.dispatchEvent(new Event('admin_sales_updated'));
    } catch (e) {
      console.warn('Falha ao salvar vendas no localStorage:', e);
    }
  }, [hydrated, sales]);

  // Filtrar vendas
  const filteredSales = sales.filter(sale => {
    const matchesSearch =
      sale.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.barbeiro.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.formaPagamento.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || sale.status === statusFilter;
    const matchesDate = !dateFilter || sale.data === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calcular estatísticas
  const totalVendas = filteredSales.length;
  const vendasConcluidas = filteredSales.filter(s => s.status === 'concluida').length;
  const vendasPendentes = filteredSales.filter(s => s.status === 'pendente').length;
  const receitaTotal = filteredSales
    .filter(s => s.status === 'concluida')
    .reduce((acc, sale) => acc + sale.valorFinal, 0);

  // Calcular dados para gráfico de pagamento
  const paymentMethodData = (() => {
    const completedSales = sales.filter(s => s.status === 'concluida');
    const paymentMap = new Map<string, { value: number; count: number }>();
    
    completedSales.forEach(sale => {
      const method = sale.formaPagamento || 'Não informado';
      const existing = paymentMap.get(method) || { value: 0, count: 0 };
      paymentMap.set(method, {
        value: existing.value + sale.valorFinal,
        count: existing.count + 1
      });
    });

    return Array.from(paymentMap.entries()).map(([name, data]) => ({
      name,
      value: data.value,
      count: data.count
    })).sort((a, b) => b.value - a.value);
  })();

  // Calcular top 5 vendas (por serviço/produto)
  const topSalesData = (() => {
    const completedSales = sales.filter(s => s.status === 'concluida');
    const itemMap = new Map<string, { valor: number; quantidade: number }>();
    
    completedSales.forEach(sale => {
      // Contar serviços
      sale.servicos.forEach(servico => {
        const existing = itemMap.get(servico) || { valor: 0, quantidade: 0 };
        itemMap.set(servico, {
          valor: existing.valor + (sale.valorFinal / (sale.servicos.length + sale.produtos.length || 1)),
          quantidade: existing.quantidade + 1
        });
      });
      
      // Contar produtos
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
  })();

  // Calcular evolução de vendas
  const salesEvolutionData = (() => {
    const completedSales = sales.filter(s => s.status === 'concluida');
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (chartPeriod === '7d') {
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);
    } else if (chartPeriod === '30d') {
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 29);
    } else { // month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const dateMap = new Map<string, { vendas: number; receita: number }>();
    
    // Inicializar todas as datas do período
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dateMap.set(dateStr, { vendas: 0, receita: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Preencher com dados reais
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
  })();

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await salesAPI.test();
      console.log('Sales API Response:', response.data);
      toast.success('✅ API de vendas funcionando!');
    } catch (error) {
      console.error('Erro na API de vendas:', error);
      toast.error('❌ Erro ao conectar com API de vendas');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSale = () => {
    setSelectedSale(null);
    setIsOpen(true);
  };

  const handleEditSale = (sale: Sale) => {
    setSelectedSale(sale);
    setIsOpen(true);
  };

  const handleDeleteSale = (saleId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      setSales(prev => prev.filter(s => s.id !== saleId));
      toast.success('Venda excluída com sucesso!');
    }
  };

  const handleSaleSubmit = async (saleData: SaleFormData) => {
    try {
      console.log('📝 Dados da venda:', saleData);

      // Simular chamada da API
      const newSale: Sale = {
        id: String(sales.length + 1),
        cliente: saleData.cliente_nome,
        barbeiro: saleData.barbeiro_nome,
        servicos: saleData.itens.filter((item: SaleItem) => item.tipo === 'servico').map((item: SaleItem) => item.nome),
        produtos: saleData.itens.filter((item: SaleItem) => item.tipo === 'produto').map((item: SaleItem) => item.nome),
        valor: saleData.valor_bruto,
        desconto: saleData.desconto,
        valorFinal: saleData.valor_final,
        formaPagamento: saleData.forma_pagamento,
        data: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: 'concluida',
        observacoes: saleData.observacoes || ''
      };

      if (selectedSale) {
        // Atualizar venda existente
        setSales((prev: Sale[]) => prev.map((s: Sale) => s.id === selectedSale.id ? { ...newSale, id: selectedSale.id } : s));
        toast.success('✅ Venda atualizada com sucesso!');
      } else {
        // Adicionar nova venda
        setSales((prev: Sale[]) => [...prev, newSale]);
        toast.success('✅ Nova venda registrada com sucesso!');
      }

      setIsOpen(false);
      setSelectedSale(null);

      // Tentar enviar para a API (opcional)
      try {
        await salesAPI.create(saleData);
        console.log('✅ Venda enviada para API');
      } catch {
        console.log('⚠️ API não disponível, dados salvos localmente');
      }

    } catch (error) {
      console.error('❌ Erro ao processar venda:', error);
      toast.error('Erro ao processar venda. Tente novamente.');
    }
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  // Se ainda não hidratou, mostrar loading
  if (!hydrated) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando vendas...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Cabeçalho */}
      <div className="pb-4 sm:pb-5 border-b border-red-200 mb-4 sm:mb-6 bg-gradient-to-r from-gray-50 to-red-50 rounded-lg p-4 sm:p-6 shadow-sm border-2 border-yellow-500">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center mb-3 sm:mb-0">
            <div className="mr-3 sm:mr-4 flex-shrink-0">
              <IconFallback type="scissors" size="lg" className="opacity-70" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-1 sm:mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold leading-6 text-gray-900">VENDAS</h1>
                <IconFallback type="barber-pole" size="md" className="ml-2 sm:ml-3 opacity-50 hidden sm:block" />
              </div>
              <p className="max-w-4xl text-xs sm:text-sm text-gray-700">
                Gestão completa de vendas da BARBEARIA DO DUDÃO
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:mt-0 sm:ml-4">
            <button
              onClick={testAPI}
              disabled={loading}
              className="inline-flex items-center justify-center px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 sm:mr-3"
            >
              {loading ? 'Testando...' : 'Testar API'}
            </button>
            <button
              type="button"
              onClick={handleAddSale}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-red-600 to-black hover:from-red-700 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              <span className="whitespace-nowrap">Nova Venda</span>
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 overflow-hidden shadow-lg rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-green-700 truncate">Receita Total</dt>
                  <dd className="text-lg font-medium text-green-900">
                    R$ {receitaTotal.toFixed(2).replace('.', ',')}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 overflow-hidden shadow-lg rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-blue-700 truncate">Total de Vendas</dt>
                  <dd className="text-lg font-medium text-blue-900">{totalVendas}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 overflow-hidden shadow-lg rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <IconFallback type="scissors" size="md" className="opacity-70" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-green-700 truncate">Concluídas</dt>
                  <dd className="text-lg font-medium text-green-900">{vendasConcluidas}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 overflow-hidden shadow-lg rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-yellow-700 truncate">Pendentes</dt>
                  <dd className="text-lg font-medium text-yellow-900">{vendasPendentes}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de Pizza - Formas de Pagamento */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Vendas por Forma de Pagamento</h2>
          </div>
          <PaymentMethodChart data={paymentMethodData} />
        </div>

        {/* Gráfico de Barras - Top 5 Vendas */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top 5 Serviços/Produtos</h2>
          </div>
          <TopSalesChart data={topSalesData} />
        </div>
      </div>

      {/* Gráfico de Evolução */}
      <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-0">Evolução das Vendas</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setChartPeriod('7d')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                chartPeriod === '7d'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              7 Dias
            </button>
            <button
              onClick={() => setChartPeriod('30d')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                chartPeriod === '30d'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              30 Dias
            </button>
            <button
              onClick={() => setChartPeriod('month')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                chartPeriod === 'month'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mês Atual
            </button>
          </div>
        </div>
        <SalesEvolutionChart data={salesEvolutionData} period={chartPeriod} />
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Buscar
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cliente, barbeiro, pagamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            >
              <option value="todos">Todos os Status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Data
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('todos');
                setDateFilter('');
              }}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Vendas */}
      <div className="bg-white shadow overflow-x-auto sm:rounded-lg">
        <div className="px-3 sm:px-4 py-4 sm:py-5 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
            Vendas Recentes ({filteredSales.length})
          </h3>

          {filteredSales.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma venda encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'todos' || dateFilter
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece registrando sua primeira venda.'}
              </p>
            </div>
          ) : (
            <>
              {/* Versão Mobile - Cards */}
              <div className="block md:hidden space-y-4">
                {filteredSales.map((sale) => (
                  <div key={sale.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                    {/* Header com Cliente e Status */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{sale.cliente}</div>
                        <div className="text-xs text-gray-500 mt-0.5">por {sale.barbeiro}</div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${getStatusColor(sale.status)}`}>
                        {statusOptions.find(opt => opt.value === sale.status)?.label}
                      </span>
                    </div>

                    {/* Serviços e Produtos */}
                    <div className="border-t border-gray-200 pt-2">
                      <div className="text-xs font-medium text-gray-700 mb-1">Serviços:</div>
                      <div className="text-xs text-gray-600 mb-2 break-words">{sale.servicos.join(', ')}</div>
                      {sale.produtos.length > 0 && (
                        <>
                          <div className="text-xs font-medium text-gray-700 mb-1">Produtos:</div>
                          <div className="text-xs text-gray-600 break-words">{sale.produtos.join(', ')}</div>
                        </>
                      )}
                    </div>

                    {/* Valores */}
                    <div className="border-t border-gray-200 pt-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Valor:</span>
                        <span className="text-gray-900 font-medium">R$ {sale.valor.toFixed(2).replace('.', ',')}</span>
                      </div>
                      {sale.desconto > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Desconto:</span>
                          <span className="text-red-600 font-medium">-R$ {sale.desconto.toFixed(2).replace('.', ',')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm pt-1 border-t border-gray-200">
                        <span className="font-semibold text-gray-900">Total Final:</span>
                        <span className="font-bold text-green-600">R$ {sale.valorFinal.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>

                    {/* Pagamento e Data */}
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <div className="text-gray-600">Pagamento:</div>
                          <div className="text-gray-900 font-medium">{sale.formaPagamento}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-600">Data:</div>
                          <div className="text-gray-900 font-medium">{sale.data} às {sale.hora}</div>
                        </div>
                      </div>
                    </div>

                    {/* Observações */}
                    {sale.observacoes && (
                      <div className="border-t border-gray-200 pt-2">
                        <div className="text-xs font-medium text-gray-700 mb-1">Observações:</div>
                        <div className="text-xs text-gray-600 break-words">{sale.observacoes}</div>
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                      <button
                        onClick={() => handleEditSale(sale)}
                        className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-colors"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSale(sale.id)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                        title="Excluir"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Versão Desktop - Tabela */}
              <div className="hidden md:block overflow-x-visible">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente / Barbeiro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serviços / Produtos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valores
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pagamento / Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{sale.cliente}</div>
                            <div className="text-sm text-gray-500">por {sale.barbeiro}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="font-medium">Serviços:</div>
                            <div className="text-gray-600">{sale.servicos.join(', ')}</div>
                            {sale.produtos.length > 0 && (
                              <>
                                <div className="font-medium mt-1">Produtos:</div>
                                <div className="text-gray-600">{sale.produtos.join(', ')}</div>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>Valor: R$ {sale.valor.toFixed(2).replace('.', ',')}</div>
                            {sale.desconto > 0 && (
                              <div className="text-red-600">Desconto: -R$ {sale.desconto.toFixed(2).replace('.', ',')}</div>
                            )}
                            <div className="font-bold text-green-600">
                              Final: R$ {sale.valorFinal.toFixed(2).replace('.', ',')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>{sale.formaPagamento}</div>
                            <div className="text-gray-500">{sale.data} às {sale.hora}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                            {statusOptions.find(opt => opt.value === sale.status)?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditSale(sale)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSale(sale.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/*para adicionar/editar venda */}
      {isOpen && (
        <SaleForm
          onSubmit={handleSaleSubmit}
          onCancel={() => {
            setIsOpen(false);
            setSelectedSale(null);
          }}
          initialData={selectedSale}
        />
      )}
    </AdminLayout>
  );
}
