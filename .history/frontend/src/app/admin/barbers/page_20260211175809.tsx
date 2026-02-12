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
      {/* Header */}
      <div className="pb-6 mb-8 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-3 rounded-lg">
              <ScissorsIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Barbeiros</h1>
              <p className="text-gray-300 text-sm mt-1">Gerencie equipe, especialidades e status</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingBarber(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Novo Barbeiro
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou especialidade"
              className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'todos' | 'ativos' | 'inativos')}
              className="w-full py-2 px-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
          </div>
          <div className="flex items-center text-sm text-gray-400 px-4 py-2 bg-gray-700 rounded-lg border border-gray-600">
            <ScissorsIcon className="h-5 w-5 mr-2" />
            <span>Total: <span className="ml-1 font-semibold text-white">{filtered.length}</span></span>
          </div>
        </div>
      </div>

      {/* Barbers Grid */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-400">Carregando barbeiros...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
          <ScissorsIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Nenhum barbeiro encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((b) => (
            <div key={b.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-5 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white truncate">{b.name}</h3>
                  {b.email && (
                    <div className="mt-1 text-xs sm:text-sm text-gray-400 truncate">{b.email}</div>
                  )}
                  {b.phone ? (
                    <div className="mt-1 flex items-center text-xs sm:text-sm text-gray-400">
                      <PhoneIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-500 flex-shrink-0" />
                      <span className="truncate">{b.phone}</span>
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${b.active ? 'bg-green-900/30 text-green-400 border border-green-700' : 'bg-gray-700 text-gray-400 border border-gray-600'}`}>
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
                    className="p-1.5 sm:p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 rounded-md transition-colors"
                    title="Editar"
                  >
                    <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBarber(b.id)}
                    className="p-1.5 sm:p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-md transition-colors"
                    title="Excluir"
                  >
                    <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>
              
              {b.specialties && b.specialties.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Especialidades</p>
                  <div className="flex flex-wrap gap-2">
                    {b.specialties.map((s) => (
                      <span key={s} className="inline-flex px-2 py-1 rounded-md text-xs bg-purple-900/30 text-purple-400 border border-purple-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(b.experience || b.commission || b.schedule) && (
                <div className="mt-3 pt-3 border-t border-gray-700 space-y-1">
                  {b.experience && (
                    <div className="text-xs">
                      <span className="text-gray-400">Experiência: </span>
                      <span className="text-white font-medium">{b.experience}</span>
                    </div>
                  )}
                  {b.commission && (
                    <div className="text-xs">
                      <span className="text-gray-400">Comissão: </span>
                      <span className="text-white font-medium">{b.commission}%</span>
                    </div>
                  )}
                  {b.schedule && (
                    <div className="text-xs">
                      <span className="text-gray-400">Horário: </span>
                      <span className="text-white font-medium">{b.schedule}</span>
                    </div>
                  )}
                </div>
              )}

              {b.notes && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Observações</p>
                  <p className="text-xs text-gray-300 line-clamp-2">{b.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
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


