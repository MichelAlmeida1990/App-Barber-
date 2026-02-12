'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import toast from 'react-hot-toast';
import { analyticsAPI } from '@/lib/api';
import { ChartBarIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/Modal';

const ADMIN_SALES_LS_KEY = 'admin_sales_v1';
const ADMIN_APPOINTMENTS_LS_KEY = 'admin_appointments_v1';
const ADMIN_CLIENTS_LS_KEY = 'admin_clients_v1';
const ADMIN_BARBERS_LS_KEY = 'admin_barbers_v1';
const ADMIN_EXPENSES_LS_KEY = 'admin_expenses_v1';

type Sale = {
  id: string;
  cliente: string;
  barbeiro: string;
  valorFinal: number;
  data: string; // YYYY-MM-DD
  status: 'pendente' | 'concluida' | 'cancelada';
};

type Appointment = {
  id: string;
  cliente: string;
  barbeiro: string;
  servico: string;
  data: string;
  hora: string;
  status: 'agendado' | 'concluido' | 'cancelado';
};

type Client = { id: string; name: string; status?: 'ativo' | 'inativo' };
type Barber = { id: string; name: string };
type Expense = {
  id: string;
  descricao: string;
  categoria: 'aluguel' | 'luz' | 'agua' | 'produtos' | 'insumos' | 'outros';
  valor: number;
  data: string; // YYYY-MM-DD
  observacoes?: string;
};

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [barberFilter, setBarberFilter] = useState<string>('todos');

  const [sales, setSales] = useState<Sale[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    const safeRead = <T,>(key: string, fallback: T): T => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    };

    setSales(safeRead<Sale[]>(ADMIN_SALES_LS_KEY, []));
    setAppointments(safeRead<Appointment[]>(ADMIN_APPOINTMENTS_LS_KEY, []));
    setClients(safeRead<Client[]>(ADMIN_CLIENTS_LS_KEY, []));
    setBarbers((safeRead<{ id: string; name: string }[]>(ADMIN_BARBERS_LS_KEY, []) || []).map((b) => ({ id: b.id, name: b.name })));
    
    // Carregar despesas ou inicializar com exemplos
    const expensesData = safeRead<Expense[]>(ADMIN_EXPENSES_LS_KEY, []);
    if (expensesData.length === 0) {
      // Inicializar com despesas comuns de uma barbearia
      const hoje = new Date();
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const dataFormatada = primeiroDiaMes.toISOString().split('T')[0];
      
      const despesasExemplo: Expense[] = [
        {
          id: 'exp-1',
          descricao: 'Aluguel do mês',
          categoria: 'aluguel',
          valor: 1500.00,
          data: dataFormatada,
          observacoes: 'Aluguel mensal do espaço'
        },
        {
          id: 'exp-2',
          descricao: 'Conta de luz',
          categoria: 'luz',
          valor: 250.00,
          data: dataFormatada,
          observacoes: 'Energia elétrica do mês'
        },
        {
          id: 'exp-3',
          descricao: 'Giletes descartáveis (pacote 100 unidades)',
          categoria: 'insumos',
          valor: 85.00,
          data: dataFormatada,
          observacoes: 'Giletes profissionais para barba'
        },
        {
          id: 'exp-4',
          descricao: 'Lâminas para máquina',
          categoria: 'insumos',
          valor: 120.00,
          data: dataFormatada,
          observacoes: 'Lâminas de reposição para cortadores'
        },
        {
          id: 'exp-5',
          descricao: 'Toalhas descartáveis',
          categoria: 'insumos',
          valor: 95.00,
          data: dataFormatada,
          observacoes: 'Toalhas para uso nos atendimentos'
        },
        {
          id: 'exp-6',
          descricao: 'Álcool 70% e produtos de limpeza',
          categoria: 'insumos',
          valor: 150.00,
          data: dataFormatada,
          observacoes: 'Higiênização e desinfecção'
        },
        {
          id: 'exp-7',
          descricao: 'Pomadas, ceras e produtos para venda',
          categoria: 'produtos',
          valor: 450.00,
          data: dataFormatada,
          observacoes: 'Estoque de produtos para revenda'
        },
        {
          id: 'exp-8',
          descricao: 'Shampoos e condicionadores profissionais',
          categoria: 'produtos',
          valor: 280.00,
          data: dataFormatada,
          observacoes: 'Produtos para uso nos serviços'
        },
        {
          id: 'exp-9',
          descricao: 'Papel toalha e lenços',
          categoria: 'insumos',
          valor: 65.00,
          data: dataFormatada,
          observacoes: 'Material de higiene'
        },
        {
          id: 'exp-10',
          descricao: 'Cape de corte (unidades)',
          categoria: 'insumos',
          valor: 180.00,
          data: dataFormatada,
          observacoes: 'Capas descartáveis para proteção'
        }
      ];
      
      setExpenses(despesasExemplo);
      try {
        localStorage.setItem(ADMIN_EXPENSES_LS_KEY, JSON.stringify(despesasExemplo));
      } catch (e) {
        console.warn('Falha ao salvar despesas exemplo:', e);
      }
    } else {
      setExpenses(expensesData);
    }
  }, []);

  // Salvar despesas no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_EXPENSES_LS_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.warn('Falha ao salvar despesas:', e);
    }
  }, [expenses]);

  // Atualizar métricas em tempo real quando uma venda é registrada no mesmo tab
  useEffect(() => {
    const onSalesUpdated = () => {
      try {
        const raw = localStorage.getItem(ADMIN_SALES_LS_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSales(parsed as Sale[]);
      } catch {}
    };
    window.addEventListener('admin_sales_updated', onSalesUpdated);
    return () => window.removeEventListener('admin_sales_updated', onSalesUpdated);
  }, []);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (barberFilter !== 'todos' && s.barbeiro !== barberFilter) return false;
      if (startDate && s.data < startDate) return false;
      if (endDate && s.data > endDate) return false;
      return true;
    });
  }, [sales, barberFilter, startDate, endDate]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (barberFilter !== 'todos' && a.barbeiro !== barberFilter) return false;
      if (startDate && a.data < startDate) return false;
      if (endDate && a.data > endDate) return false;
      return true;
    });
  }, [appointments, barberFilter, startDate, endDate]);

  const receitaPeriodo = useMemo(() => {
    return filteredSales.filter((s) => s.status === 'concluida').reduce((acc, s) => acc + (Number(s.valorFinal) || 0), 0);
  }, [filteredSales]);

  // Calcular despesas do período
  const despesasPeriodo = useMemo(() => {
    return expenses.filter((e) => {
      if (startDate && e.data < startDate) return false;
      if (endDate && e.data > endDate) return false;
      return true;
    }).reduce((acc, e) => acc + (Number(e.valor) || 0), 0);
  }, [expenses, startDate, endDate]);

  // Calcular lucro líquido
  const lucroLiquido = useMemo(() => {
    return receitaPeriodo - despesasPeriodo;
  }, [receitaPeriodo, despesasPeriodo]);

  const totalAgendamentos = filteredAppointments.length;
  const clientesAtivos = useMemo(() => clients.filter((c) => (c.status ? c.status === 'ativo' : true)).length, [clients]);

  const testAPI = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.test();
      console.log('Analytics API Response:', res.data);
      toast.success('✅ API de analytics funcionando!');
    } catch (e) {
      console.error('Erro na API de analytics:', e);
      toast.error('❌ Erro ao conectar com API de analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = () => {
    setSelectedExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      setExpenses(prev => prev.filter(e => e.id !== expenseId));
      toast.success('Despesa excluída com sucesso!');
    }
  };

  const handleExpenseSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const expense: Expense = {
      id: selectedExpense?.id || String(Date.now()),
      descricao: formData.get('descricao') as string,
      categoria: formData.get('categoria') as Expense['categoria'],
      valor: Number(formData.get('valor')),
      data: formData.get('data') as string,
      observacoes: formData.get('observacoes') as string || ''
    };

    if (selectedExpense) {
      setExpenses(prev => prev.map(e => e.id === selectedExpense.id ? expense : e));
      toast.success('Despesa atualizada com sucesso!');
    } else {
      setExpenses(prev => [...prev, expense]);
      toast.success('Despesa cadastrada com sucesso!');
    }

    setIsExpenseModalOpen(false);
    setSelectedExpense(null);
  };

  return (
    <AdminLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold leading-6 text-gray-900">Analytics</h1>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">Relatórios e métricas (visão geral)</p>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            onClick={testAPI}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar API'}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-4 mb-6 border border-gray-100">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Barbeiro</label>
            <select
              value={barberFilter}
              onChange={(e) => setBarberFilter(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm"
            >
              <option value="todos">Todos</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setBarberFilter('todos');
              }}
              className="w-full py-2 px-3 rounded-md text-sm font-medium bg-gray-700 text-white hover:bg-gray-800"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 border border-gray-100">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-indigo-50 mr-4">
            <ChartBarIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Resumo do período</h2>
            <p className="text-sm text-gray-600">
              Calculado a partir de Vendas/Agendamentos/Clientes salvos no sistema.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-xs text-green-700 uppercase tracking-wide font-medium">Receita (período)</p>
            <p className="mt-2 text-2xl font-bold text-green-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receitaPeriodo)}
            </p>
            <p className="text-sm text-green-600 mt-1">vendas concluídas</p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-xs text-red-700 uppercase tracking-wide font-medium">Despesas (período)</p>
            <p className="mt-2 text-2xl font-bold text-red-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesasPeriodo)}
            </p>
            <p className="text-sm text-red-600 mt-1">{expenses.filter(e => {
              if (startDate && e.data < startDate) return false;
              if (endDate && e.data > endDate) return false;
              return true;
            }).length} despesas</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs text-blue-700 uppercase tracking-wide font-medium">Lucro Líquido</p>
            <p className={`mt-2 text-2xl font-bold ${lucroLiquido >= 0 ? 'text-blue-900' : 'text-red-600'}`}>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lucroLiquido)}
            </p>
            <p className="text-sm text-blue-600 mt-1">receita - despesas</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Agendamentos</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{totalAgendamentos}</p>
            <p className="text-sm text-gray-500 mt-1">no período</p>
          </div>
        </div>
      </div>

      {/* Seção de Despesas */}
      <div className="bg-white shadow rounded-lg p-6 border border-gray-100 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Despesas do Período</h2>
            <p className="text-sm text-gray-600 mt-1">
              Gerencie aluguel, luz, produtos, insumos e outras despesas
            </p>
          </div>
          <button
            onClick={handleAddExpense}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nova Despesa
          </button>
        </div>

        {expenses.filter(e => {
          if (startDate && e.data < startDate) return false;
          if (endDate && e.data > endDate) return false;
          return true;
        }).length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma despesa cadastrada no período</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses
                  .filter(e => {
                    if (startDate && e.data < startDate) return false;
                    if (endDate && e.data > endDate) return false;
                    return true;
                  })
                  .sort((a, b) => b.data.localeCompare(a.data))
                  .map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {new Date(expense.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{expense.descricao}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {expense.categoria}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-red-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.valor)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <PencilIcon className="h-4 w-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Despesa */}
      <Modal
        isOpen={isExpenseModalOpen}
        title={selectedExpense ? 'Editar Despesa' : 'Nova Despesa'}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setSelectedExpense(null);
        }}
        maxWidth="md"
      >
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição *
              </label>
              <input
                type="text"
                name="descricao"
                required
                defaultValue={selectedExpense?.descricao || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                placeholder="Ex: Aluguel do mês, Conta de luz..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                name="categoria"
                required
                defaultValue={selectedExpense?.categoria || 'outros'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              >
                <option value="aluguel">Aluguel</option>
                <option value="luz">Luz</option>
                <option value="agua">Água</option>
                <option value="produtos">Produtos</option>
                <option value="insumos">Insumos</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor (R$) *
                </label>
                <input
                  type="number"
                  name="valor"
                  required
                  step="0.01"
                  min="0"
                  defaultValue={selectedExpense?.valor || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  name="data"
                  required
                  defaultValue={selectedExpense?.data || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                name="observacoes"
                rows={3}
                defaultValue={selectedExpense?.observacoes || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                placeholder="Observações adicionais..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsExpenseModalOpen(false);
                  setSelectedExpense(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                {selectedExpense ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </Modal>
    </AdminLayout>
  );
}


