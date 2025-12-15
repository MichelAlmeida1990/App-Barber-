'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { IconFallback } from '@/components/IconFallback';
import { 
  CurrencyDollarIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { salesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import SaleForm from '@/components/forms/SaleForm';

// Dados mock para demonstração
const mockSales = [
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

const formasPagamento = [
  'Dinheiro', 'PIX', 'Cartão de Débito', 'Cartão de Crédito', 'Vale'
];

const statusOptions = [
  { value: 'pendente', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'concluida', label: 'Concluída', color: 'bg-green-100 text-green-800' },
  { value: 'cancelada', label: 'Cancelada', color: 'bg-red-100 text-red-800' }
];

export default function SalesPage() {
  const [sales, setSales] = useState(mockSales);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

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
    setIsModalOpen(true);
  };

  const handleEditSale = (sale: any) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  const handleDeleteSale = (saleId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      setSales(prev => prev.filter(s => s.id !== saleId));
      toast.success('Venda excluída com sucesso!');
    }
  };

  const handleSaleSubmit = async (saleData: any) => {
    try {
      console.log('📝 Dados da venda:', saleData);
      
      // Simular chamada da API
      const newSale = {
        id: String(sales.length + 1),
        cliente: saleData.cliente_nome,
        barbeiro: saleData.barbeiro_nome,
        servicos: saleData.itens.filter((item: any) => item.tipo === 'servico').map((item: any) => item.nome),
        produtos: saleData.itens.filter((item: any) => item.tipo === 'produto').map((item: any) => item.nome),
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
        setSales(prev => prev.map(s => s.id === selectedSale.id ? { ...newSale, id: selectedSale.id } : s));
        toast.success('✅ Venda atualizada com sucesso!');
      } else {
        // Adicionar nova venda
        setSales(prev => [...prev, newSale]);
        toast.success('✅ Nova venda registrada com sucesso!');
      }

      setIsModalOpen(false);
      setSelectedSale(null);

      // Tentar enviar para a API (opcional)
      try {
        await salesAPI.create(saleData);
        console.log('✅ Venda enviada para API');
      } catch (apiError) {
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

  return (
    <AdminLayout>
      {/* Cabeçalho */}
      <div className="pb-5 border-b border-red-200 sm:flex sm:items-center sm:justify-between mb-6 bg-gradient-to-r from-gray-50 to-red-50 rounded-lg p-6 shadow-sm border-2 border-yellow-500">
        <div className="flex items-center">
          <div className="mr-4">
            <IconFallback type="scissors" size="lg" className="opacity-70" />
          </div>
          <div>
            <div className="flex items-center mb-2">
              <h1 className="text-3xl font-bold leading-6 text-gray-900">VENDAS</h1>
              <IconFallback type="barber-pole" size="md" className="ml-3 opacity-50" />
            </div>
            <p className="max-w-4xl text-sm text-gray-700">
              Gestão completa de vendas da Elite Barber Shop
            </p>
          </div>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            onClick={testAPI}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 mr-3"
          >
            {loading ? 'Testando...' : 'Testar API'}
          </button>
          <button
            type="button"
            onClick={handleAddSale}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-gradient-to-r from-red-600 to-black hover:from-red-700 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nova Venda
          </button>
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

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cliente, barbeiro, pagamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('todos');
                setDateFilter('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Vendas */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
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
          )}
        </div>
      </div>

      {/* Modal para adicionar/editar venda */}
      {isModalOpen && (
        <SaleForm
          onSubmit={handleSaleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedSale(null);
          }}
          initialData={selectedSale}
        />
      )}
    </AdminLayout>
  );
} 