'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, PencilIcon, PhoneIcon, PlusIcon, ScissorsIcon, TrashIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/Modal';
import BarberForm from '@/components/forms/BarberForm';
import { useRouter } from 'next/navigation';

type Barber = {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  specialties?: string[];
  experience?: string;
  commission?: number;
  schedule?: string;
  notes?: string;
  active: boolean;
};

export default function AdminBarbersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadBarbers();
  }, [router]);

  const loadBarbers = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/api/v1/barbers/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBarbers(Array.isArray(data) ? data : []);
      } else {
        toast.error('Erro ao carregar barbeiros');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return barbers.filter((b) => {
      const matchesSearch = !term || b.name.toLowerCase().includes(term) || (b.specialties?.join(' ').toLowerCase().includes(term) ?? false);
      const matchesStatus = statusFilter === 'todos' || (statusFilter === 'ativos' ? b.active : !b.active);
      return matchesSearch && matchesStatus;
    });
  }, [barbers, search, statusFilter]);

  const handleUpsertBarber = (barber: any) => {
    // After creating/updating barber, reload the list
    loadBarbers();
    setIsModalOpen(false);
    setEditingBarber(null);
    toast.success(editingBarber ? 'Barbeiro atualizado com sucesso!' : 'Barbeiro criado com sucesso!');
  };

  const handleDeleteBarber = async (id: string | number) => {
    if (!confirm('Tem certeza que deseja excluir este barbeiro?')) return;

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/api/v1/barbers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Barbeiro excluído com sucesso!');
        loadBarbers();
      } else {
        toast.error('Erro ao excluir barbeiro');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao excluir barbeiro');
    }
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

      {filtered.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center text-sm text-gray-500">
          Nenhum barbeiro encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((b) => (
            <div key={b.id} className="bg-white shadow rounded-lg p-4 sm:p-5 border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{b.name}</h3>
                  {b.email && (
                    <div className="mt-1 text-xs sm:text-sm text-gray-600 truncate">{b.email}</div>
                  )}
                  {b.phone ? (
                    <div className="mt-1 flex items-center text-xs sm:text-sm text-gray-600">
                      <PhoneIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{b.phone}</span>
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${b.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {b.active ? 'ativo' : 'inativo'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBarber({
                        id: b.id,
                        name: b.name,
                        email: b.email || '',
                        phone: b.phone || '',
                        specialty: b.specialty || b.specialties?.[0] || '',
                        experience: b.experience || '',
                        commission: b.commission || 35,
                        schedule: b.schedule || '',
                        notes: b.notes || '',
                        status: b.active ? 'ativo' : 'inativo',
                      });
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 sm:p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-colors"
                    title="Editar"
                  >
                    <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBarber(b.id)}
                    className="p-1.5 sm:p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                    title="Excluir"
                  >
                    <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>
              
              {b.specialties && b.specialties.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Especialidades</p>
                  <div className="flex flex-wrap gap-2">
                    {b.specialties.map((s) => (
                      <span key={s} className="inline-flex px-2 py-1 rounded-md text-xs bg-indigo-50 text-indigo-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(b.experience || b.commission || b.schedule) && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                  {b.experience && (
                    <div className="text-xs">
                      <span className="text-gray-600">Experiência: </span>
                      <span className="text-gray-900 font-medium">{b.experience}</span>
                    </div>
                  )}
                  {b.commission && (
                    <div className="text-xs">
                      <span className="text-gray-600">Comissão: </span>
                      <span className="text-gray-900 font-medium">{b.commission}%</span>
                    </div>
                  )}
                  {b.schedule && (
                    <div className="text-xs">
                      <span className="text-gray-600">Horário: </span>
                      <span className="text-gray-900 font-medium">{b.schedule}</span>
                    </div>
                  )}
                </div>
              )}

              {b.notes && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Observações</p>
                  <p className="text-xs text-gray-700 line-clamp-2">{b.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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


