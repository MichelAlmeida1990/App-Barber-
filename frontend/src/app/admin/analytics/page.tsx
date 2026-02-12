'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import toast from 'react-hot-toast';
import { analyticsAPI } from '@/lib/api';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const ADMIN_SALES_LS_KEY = 'admin_sales_v1';
const ADMIN_APPOINTMENTS_LS_KEY = 'admin_appointments_v1';
const ADMIN_CLIENTS_LS_KEY = 'admin_clients_v1';
const ADMIN_BARBERS_LS_KEY = 'admin_barbers_v1';

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

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [barberFilter, setBarberFilter] = useState<string>('todos');

  const [sales, setSales] = useState<Sale[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);

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
  }, []);

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

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Receita (período)</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receitaPeriodo)}
            </p>
            <p className="text-sm text-gray-500 mt-1">vendas concluídas</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Agendamentos</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{totalAgendamentos}</p>
            <p className="text-sm text-gray-500 mt-1">no período</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Clientes ativos</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{clientesAtivos}</p>
            <p className="text-sm text-gray-500 mt-1">cadastros</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


