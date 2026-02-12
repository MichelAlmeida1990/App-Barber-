'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  CurrencyDollarIcon, 
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ADMIN_SALES_LS_KEY = 'admin_sales_v1';
const ADMIN_BARBERS_LS_KEY = 'admin_barbers_v1';
const ADMIN_COMMISSION_RATES_LS_KEY = 'admin_commission_rates_v1';

type Sale = {
  id: string;
  barbeiro: string;
  valorFinal: number;
  data: string;
  status: 'pendente' | 'concluida' | 'cancelada';
};

interface Commission {
  id: number;
  barber_id: number;
  barber_name: string;
  appointment_id?: number;
  product_id?: number;
  commission_type: 'service' | 'product';
  amount: number;
  percentage: number;
  description: string;
  date: string;
  created_at: string;
}

interface CommissionSummary {
  total_commission: number;
  service_commissions: number;
  product_commissions: number;
  total_commissions_count: number;
  barber_commissions: Record<number, {
    barber_name: string;
    total_commission: number;
    commissions_count: number;
  }>;
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showManualDetails, setShowManualDetails] = useState(false);
  const reportRef = useRef<HTMLDivElement | null>(null);

  // modo manual (local) de comissão por barbeiro
  const [manualMode, setManualMode] = useState(true);
  const [commissionRates, setCommissionRates] = useState<Record<string, number>>({});
  const [sales, setSales] = useState<Sale[]>([]);
  const [barbersLocal, setBarbersLocal] = useState<{ id: string; name: string }[]>([]);

  const getAuthHeaders = () => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const handleUnauthorized = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {}
    window.location.href = '/admin/login';
  };

  // Carregar comissões
  const loadCommissions = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/commissions/all`;
      const params = new URLSearchParams();
      
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, { headers: getAuthHeaders() });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setCommissions(data);
      } else {
        console.error('Erro ao carregar comissões');
        toast.error('Erro ao carregar comissões');
      }
    } catch (error) {
      console.error('Erro ao carregar comissões:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Carregar resumo
  const loadSummary = useCallback(async () => {
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/commissions/summary`;
      const params = new URLSearchParams();
      
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, { headers: getAuthHeaders() });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    }
  }, [startDate, endDate]);

  // Carregar dados na inicialização
  useEffect(() => {
    if (manualMode) {
      setLoading(false);
      return;
    }
    loadCommissions();
    loadSummary();
  }, [loadCommissions, loadSummary, manualMode]);

  const reloadLocalData = useCallback(() => {
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

    // Pode existir objeto completo do barbeiro no storage (com outros campos).
    // Normalizamos para {id, name}.
    const rawBarbers = safeRead<any[]>(ADMIN_BARBERS_LS_KEY, []);
    const normalized = (Array.isArray(rawBarbers) ? rawBarbers : [])
      .map((b) => ({ id: String(b?.id ?? ''), name: String(b?.name ?? '') }))
      .filter((b) => b.id && b.name);
    setBarbersLocal(normalized);

    setCommissionRates(safeRead<Record<string, number>>(ADMIN_COMMISSION_RATES_LS_KEY, {}));
  }, []);

  useEffect(() => {
    reloadLocalData();
  }, [reloadLocalData]);

  // Atualizar automaticamente quando uma venda for registrada no mesmo tab (Vendas -> localStorage)
  useEffect(() => {
    if (!manualMode) return;
    const onSalesUpdated = () => {
      reloadLocalData();
    };
    window.addEventListener('admin_sales_updated', onSalesUpdated);
    return () => window.removeEventListener('admin_sales_updated', onSalesUpdated);
  }, [manualMode, reloadLocalData]);

  const saveCommissionRates = (next: Record<string, number>) => {
    setCommissionRates(next);
    try {
      localStorage.setItem(ADMIN_COMMISSION_RATES_LS_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Falha ao salvar comissão no localStorage:', e);
    }
  };

  const salesFilteredForManual = useMemo(() => {
    return sales.filter((s) => {
      if (s.status !== 'concluida') return false;
      if (startDate && s.data < startDate) return false;
      if (endDate && s.data > endDate) return false;
      return true;
    });
  }, [sales, startDate, endDate]);

  const manualCommissionsByBarber = useMemo(() => {
    const byName: Record<string, { totalSales: number; rate: number; commission: number; count: number }> = {};
    for (const s of salesFilteredForManual) {
      const name = s.barbeiro || 'Sem barbeiro';
      const rate = Number.isFinite(commissionRates[name]) ? commissionRates[name] : 0;
      if (!byName[name]) byName[name] = { totalSales: 0, rate, commission: 0, count: 0 };
      byName[name].totalSales += Number(s.valorFinal) || 0;
      byName[name].count += 1;
      byName[name].rate = rate;
      byName[name].commission = byName[name].totalSales * (rate / 100);
    }
    return byName;
  }, [salesFilteredForManual, commissionRates]);

  const manualBarberNames = useMemo(() => {
    // Preferir barbeiros cadastrados; se vazio, inferir dos nomes nas vendas
    if (barbersLocal.length > 0) return barbersLocal.map((b) => b.name);
    return Object.keys(manualCommissionsByBarber).length > 0
      ? Object.keys(manualCommissionsByBarber)
      : [];
  }, [barbersLocal, manualCommissionsByBarber]);

  const manualTotalCommission = useMemo(() => {
    return Object.values(manualCommissionsByBarber).reduce((acc, v) => acc + v.commission, 0);
  }, [manualCommissionsByBarber]);

  const manualCommissionsList = useMemo<Commission[]>(() => {
    // No modo manual não existem "service/product" reais; tratamos como "service" genérico.
    // Geramos uma lista baseada em vendas concluídas + % configurada.
    const list: Commission[] = [];
    let idCounter = 1;
    for (const s of salesFilteredForManual) {
      const barberName = s.barbeiro || 'Sem barbeiro';
      const pct = Number.isFinite(commissionRates[barberName]) ? commissionRates[barberName] : 0;
      if (!pct || pct <= 0) continue;
      const amount = (Number(s.valorFinal) || 0) * (pct / 100);
      if (!amount || amount <= 0) continue;
      list.push({
        id: idCounter++,
        barber_id: 0,
        barber_name: barberName,
        commission_type: 'service',
        amount,
        percentage: pct,
        description: `Venda ${s.id}`,
        date: s.data,
        created_at: new Date().toISOString(),
      });
    }
    return list;
  }, [salesFilteredForManual, commissionRates]);

  const manualSummaryRows = useMemo(() => {
    return manualBarberNames.map((name) => {
      const row = manualCommissionsByBarber[name];
      return {
        name,
        totalSales: row?.totalSales || 0,
        count: row?.count || 0,
        rate: Number.isFinite(commissionRates[name]) ? commissionRates[name] : 0,
        commission: row?.commission || 0,
      };
    });
  }, [manualBarberNames, manualCommissionsByBarber, commissionRates]);

  const manualDetailsRows = useMemo(() => {
    return salesFilteredForManual
      .map((s) => {
        const barberName = s.barbeiro || 'Sem barbeiro';
        const pct = Number.isFinite(commissionRates[barberName]) ? commissionRates[barberName] : 0;
        const saleAmount = Number(s.valorFinal) || 0;
        return {
          id: s.id,
          barberName,
          saleAmount,
          pct,
          commissionAmount: saleAmount * (pct / 100),
          date: s.data,
        };
      })
      .filter((r) => r.saleAmount > 0);
  }, [salesFilteredForManual, commissionRates]);

  const exportPdf = useCallback(() => {
    const html = reportRef.current?.innerHTML;
    if (!html) {
      toast.error('Nada para exportar.');
      return;
    }
    const w = window.open('', '_blank', 'width=1100,height=800');
    if (!w) {
      toast.error('Bloqueio de pop-up impedindo exportação. Libere pop-ups e tente novamente.');
      return;
    }
    w.document.open();
    w.document.write(`
      <html>
        <head>
          <title>Relatório de Comissões</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1,h2,h3 { margin: 0 0 8px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; }
            th { background: #f9fafb; text-transform: uppercase; letter-spacing: .04em; font-size: 11px; }
            .muted { color: #6b7280; font-size: 12px; }
            .right { text-align: right; }
          </style>
        </head>
        <body>
          ${html}
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `);
    w.document.close();
  }, []);

  // Gerar comissões automaticamente
  const generateCommissions = useCallback(async () => {
    // No modo manual, “gerar” significa apenas validar/mostrar os lançamentos calculados via vendas.
    if (manualMode) {
      if (salesFilteredForManual.length === 0) {
        toast.error('Nenhuma venda concluída encontrada no período para gerar comissão.');
        return;
      }
      const generatedCount = manualCommissionsList.length;
      if (generatedCount === 0) {
        toast.error('Defina a % de comissão para pelo menos um barbeiro com vendas concluídas.');
        return;
      }
      toast.success(`Comissões manuais calculadas: ${generatedCount} lançamentos (${formatCurrency(manualTotalCommission)})`);
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/commissions/auto-generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        loadCommissions();
        loadSummary();
      } else {
        toast.error('Erro ao gerar comissões');
      }
    } catch (error) {
      console.error('Erro ao gerar comissões:', error);
      toast.error('Erro ao conectar com o servidor');
    }
  }, [loadCommissions, loadSummary, manualMode, manualCommissionsList, manualTotalCommission, salesFilteredForManual.length]);

  // Filtrar comissões por barbeiro
  const filteredCommissions = useMemo(() => {
    if (!selectedBarber) return commissions;
    return commissions.filter(comm => comm.barber_id === selectedBarber);
  }, [commissions, selectedBarber]);

  const displayedCommissions = useMemo(() => {
    return manualMode ? manualCommissionsList : filteredCommissions;
  }, [manualMode, manualCommissionsList, filteredCommissions]);

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Formatar valor
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <AdminLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold leading-6 text-gray-900">Comissões</h1>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            Gerencie as comissões dos barbeiros por serviços e produtos vendidos
          </p>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            onClick={generateCommissions}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 mr-3"
          >
            <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
            Gerar Comissões
          </button>
          <button
            onClick={exportPdf}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
          >
            Exportar PDF
          </button>
          <button
            onClick={() => {
              loadCommissions();
              loadSummary();
            }}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-4">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={manualMode}
              onChange={(e) => setManualMode(e.target.checked)}
            />
            Modo manual (comissão por barbeiro) — calcula em cima das VENDAS (tela Vendas)
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Se desligar, volta pro modo API (endpoints /commissions/*).
          </p>
          {manualMode ? (
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  reloadLocalData();
                  toast.success('Barbeiros/dados recarregados');
                }}
                className="inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Recarregar barbeiros (cadastro) e vendas
              </button>
              <p className="text-xs text-gray-500 self-center">
                Dica: se ainda aparecer vazio, abra a aba <b>Barbeiros</b> uma vez para gravar o cadastro no navegador.
              </p>
            </div>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Barbeiro
          </label>
          <select
            value={selectedBarber || ''}
            onChange={(e) => setSelectedBarber(e.target.value ? parseInt(e.target.value) : null)}
            disabled={manualMode}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Todos os barbeiros</option>
            {summary?.barber_commissions && Object.entries(summary.barber_commissions).map(([id, barber]) => (
              <option key={id} value={id}>
                {barber.barber_name}
              </option>
            ))}
          </select>
          {manualMode ? (
            <p className="mt-1 text-xs text-gray-500">No modo manual o filtro por barbeiro é pelo nome nas vendas.</p>
          ) : null}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Inicial
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Final
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
        
        <div className="flex items-end">
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setSelectedBarber(null);
            }}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      {manualMode ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total de Comissões (manual)</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(manualTotalCommission)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Barbeiros com taxa</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Object.keys(commissionRates).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Vendas concluídas</dt>
                    <dd className="text-lg font-medium text-gray-900">{salesFilteredForManual.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Modelo</dt>
                    <dd className="text-lg font-medium text-gray-900">Manual (%)</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : summary && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total de Comissões</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(summary.total_commission)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Comissões por Serviços</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(summary.service_commissions)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Comissões por Produtos</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(summary.product_commissions)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total de Registros</dt>
                    <dd className="text-lg font-medium text-gray-900">{summary.total_commissions_count}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {manualMode ? (
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configurar porcentagem de comissão (manual)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Defina a porcentagem por barbeiro. O sistema calcula automaticamente com base nas vendas concluídas.
          </p>

          <div className="space-y-3">
            {manualBarberNames.length > 0 ? manualBarberNames.map((name) => (
              <div key={name} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center border border-gray-100 rounded-md p-3">
                <div className="sm:col-span-2">
                  <div className="font-medium text-gray-900">{name}</div>
                  <div className="text-xs text-gray-500">
                    Vendas: {formatCurrency(manualCommissionsByBarber[name]?.totalSales || 0)} ({manualCommissionsByBarber[name]?.count || 0})
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">% comissão</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="^\\d{0,3}([\\.,]\\d{0,2})?$"
                    min={0}
                    max={100}
                    step={0.5}
                    value={(commissionRates[name] ?? 0) === 0 ? '' : String(commissionRates[name])}
                    onFocus={(e) => {
                      // facilita digitar "50" sem virar "050"
                      e.currentTarget.select();
                    }}
                    onChange={(e) => {
                      const raw = e.target.value.replace(',', '.').trim();
                      const val = raw === '' ? 0 : Number(raw);
                      saveCommissionRates({ ...commissionRates, [name]: val });
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2 text-sm text-gray-700">
                  Comissão calculada: <span className="font-semibold">{formatCurrency(manualCommissionsByBarber[name]?.commission || 0)}</span>
                </div>
              </div>
            )) : (
              <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                Nenhum barbeiro encontrado. Abra a aba <b>Barbeiros</b> (para salvar no navegador) ou registre uma venda para inferir o barbeiro.
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Lista de comissões */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md" ref={reportRef}>
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Comissões {selectedBarber && `- ${summary?.barber_commissions[selectedBarber]?.barber_name}`}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Detalhes de todas as comissões registradas
          </p>
          {manualMode ? (
            <div className="mt-3 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={showManualDetails}
                  onChange={(e) => setShowManualDetails(e.target.checked)}
                />
                Detalhar por venda
              </label>
              <span className="text-xs text-gray-500">
                Padrão: resumo por barbeiro (total de vendas × %)
              </span>
            </div>
          ) : null}
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Carregando comissões...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barbeiro
                  </th>
                  {manualMode && !showManualDetails ? (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendas (total)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qtde
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentual
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Comissão (total)
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentual
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {manualMode && !showManualDetails
                  ? manualSummaryRows.map((r) => (
                      <tr key={r.name} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(r.totalSales)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.count}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.rate}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{formatCurrency(r.commission)}</td>
                      </tr>
                    ))
                  : manualMode && showManualDetails
                    ? manualDetailsRows.map((r) => (
                        <tr key={`${r.id}-${r.barberName}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.barberName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Manual (vendas)
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">Venda {r.id} (base {formatCurrency(r.saleAmount)})</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{formatCurrency(r.commissionAmount)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.pct}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(r.date)}</td>
                        </tr>
                      ))
                    : displayedCommissions.map((commission) => (
                        <tr key={commission.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {commission.barber_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              commission.commission_type === 'service' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {commission.commission_type === 'service' ? 'Serviço' : 'Produto'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {commission.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatCurrency(commission.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {commission.percentage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(commission.date)}
                          </td>
                        </tr>
                      ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {((manualMode && !showManualDetails && manualSummaryRows.length === 0) || (manualMode && showManualDetails && manualDetailsRows.length === 0) || (!manualMode && displayedCommissions.length === 0)) && !loading && (
        <div className="text-center py-12">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma comissão encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            {manualMode
              ? 'Finalize vendas e defina a % por barbeiro para ver as comissões manuais aqui.'
              : (selectedBarber || startDate || endDate ? 'Tente ajustar os filtros.' : 'Comece gerando comissões automaticamente.')}
          </p>
          {!manualMode && !selectedBarber && !startDate && !endDate && (
            <div className="mt-6">
              <button
                onClick={generateCommissions}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
                Gerar Comissões
              </button>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
} 