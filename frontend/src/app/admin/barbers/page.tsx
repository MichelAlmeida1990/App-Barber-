'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import toast from 'react-hot-toast';
import { barbersAPI } from '@/lib/api';
import { MagnifyingGlassIcon, PencilIcon, PhoneIcon, PlusIcon, ScissorsIcon, TrashIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/Modal';
import BarberForm from '@/components/forms/BarberForm';

type Barber = {
  id: string;
  name: string;
  phone?: string;
  specialties: string[];
  active: boolean;
};

const mockBarbers: Barber[] = [
  { id: '1', name: 'Carlos Santos', phone: '(11) 99999-0001', specialties: ['Corte', 'Barba'], active: true },
  { id: '2', name: 'André Lima', phone: '(11) 99999-0002', specialties: ['Corte', 'Combo'], active: true },
  { id: '3', name: 'Roberto Costa', phone: '(11) 99999-0003', specialties: ['Barba', 'Acabamento'], active: false },
];

const ADMIN_BARBERS_LS_KEY = 'admin_barbers_v1';

export default function AdminBarbersPage() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [hydrated, setHydrated] = useState(false);
  const [items, setItems] = useState<Barber[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADMIN_BARBERS_LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Barber[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        } else {
          // Se não existe nada salvo, iniciamos com mock apenas para não deixar a tela vazia.
          // IMPORTANTE: isso NÃO sobrescreve o storage automaticamente (só após hidratar).
          setItems(mockBarbers);
        }
      } else {
        setItems(mockBarbers);
      }
    } catch (e) {
      console.warn('Falha ao ler barbeiros do localStorage:', e);
      setItems(mockBarbers);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(ADMIN_BARBERS_LS_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Falha ao salvar barbeiros no localStorage:', e);
    }
  }, [items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((b) => {
      const matchesSearch = !term || b.name.toLowerCase().includes(term) || b.specialties.join(' ').toLowerCase().includes(term);
      const matchesStatus =
        statusFilter === 'todos' || (statusFilter === 'ativos' ? b.active : !b.active);
      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const testAPI = async () => {
    setLoading(true);
    try {
      const res = await barbersAPI.test();
      console.log('Barbers API Response:', res.data);
      toast.success('✅ API de barbeiros funcionando!');
    } catch (e) {
      console.error('Erro na API de barbeiros:', e);
      toast.error('❌ Erro ao conectar com API de barbeiros');
    } finally {
      setLoading(false);
    }
  };

  const handleUpsertBarber = (barber: any) => {
    // BarberForm usa { specialty } e outros campos; aqui convertemos para { specialties: string[] } + active
    const normalized: Barber = {
      id: barber.id,
      name: barber.name,
      phone: barber.phone,
      specialties: Array.isArray(barber.specialties)
        ? barber.specialties
        : barber.specialty
          ? [String(barber.specialty)]
          : [],
      active: barber.status ? barber.status === 'ativo' : barber.active ?? true,
    };

    setItems((prev) => {
      const exists = prev.some((b) => b.id === normalized.id);
      return exists ? prev.map((b) => (b.id === normalized.id ? { ...b, ...normalized } : b)) : [normalized, ...prev];
    });
    setIsModalOpen(false);
    setEditingBarber(null);
  };

  const handleDeleteBarber = (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este barbeiro?')) return;
    setItems((prev) => prev.filter((b) => b.id !== id));
    toast.success('Barbeiro excluído com sucesso!');
  };

  return (
    <AdminLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold leading-6 text-gray-900">Barbeiros</h1>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">Gerencie equipe, especialidades e status</p>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={() => {
              setEditingBarber(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 mr-3"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Novo Barbeiro
          </button>
          <button
            onClick={testAPI}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar API'}
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou especialidade"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'todos' | 'ativos' | 'inativos')}
              className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm"
            >
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ScissorsIcon className="h-5 w-5 mr-2 text-gray-400" />
            Total: <span className="ml-1 font-semibold text-gray-900">{filtered.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((b) => (
          <div key={b.id} className="bg-white shadow rounded-lg p-5 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{b.name}</h3>
                {b.phone ? (
                  <div className="mt-1 flex items-center text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {b.phone}
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${b.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {b.active ? 'ativo' : 'inativo'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBarber({
                      id: b.id,
                      name: b.name,
                      phone: b.phone,
                      specialty: b.specialties?.[0] || '',
                      status: b.active ? 'ativo' : 'inativo',
                    });
                    setIsModalOpen(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-900"
                  title="Editar"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteBarber(b.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Excluir"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Especialidades</p>
              <div className="flex flex-wrap gap-2">
                {b.specialties.map((s) => (
                  <span key={s} className="inline-flex px-2 py-1 rounded-md text-xs bg-indigo-50 text-indigo-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white shadow rounded-lg p-8 text-center text-sm text-gray-500 md:col-span-2 xl:col-span-3">
            Nenhum barbeiro encontrado.
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBarber(null);
        }}
        title={editingBarber ? 'Editar Barbeiro' : 'Novo Barbeiro'}
        maxWidth="2xl"
      >
        <BarberForm
          initialData={editingBarber ?? undefined}
          onSuccess={handleUpsertBarber}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingBarber(null);
          }}
        />
      </Modal>
    </AdminLayout>
  );
}


