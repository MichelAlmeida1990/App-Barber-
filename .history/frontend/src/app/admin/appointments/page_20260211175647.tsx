'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import toast from 'react-hot-toast';
import { CalendarIcon, MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

type Appointment = {
  id: number;
  client_name: string;
  barber_name: string;
  services: Array<{ name: string; price: number }>;
  appointment_date: string;
  status: string;
  total_price: number;
};

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadAppointments();
  }, [router]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/api/v1/appointments/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(Array.isArray(data) ? data : []);
      } else {
        toast.error('Erro ao carregar agendamentos');
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
    return appointments.filter((a) => {
      const matchesSearch =
        !term ||
        a.client_name.toLowerCase().includes(term) ||
        a.barber_name.toLowerCase().includes(term) ||
        a.services.some(s => s.name.toLowerCase().includes(term));
      const matchesStatus = statusFilter === 'todos' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, statusFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja remover este agendamento?')) return;

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/api/v1/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Agendamento removido!');
        loadAppointments();
      } else {
        toast.error('Erro ao remover agendamento');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao remover agendamento');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-900/30 text-blue-300 border-blue-700';
      case 'completed': return 'bg-green-900/30 text-green-300 border-green-700';
      case 'cancelled': return 'bg-red-900/30 text-red-300 border-red-700';
      default: return 'bg-yellow-900/30 text-yellow-300 border-yellow-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="pb-6 mb-8 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-lg">
            <CalendarIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Agendamentos</h1>
            <p className="text-gray-300 text-sm mt-1">Gerencie e acompanhe todos os agendamentos</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8 shadow-lg">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cliente, barbeiro ou serviço"
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-4 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div className="flex items-center text-sm text-gray-400 px-4 py-2 bg-gray-700 rounded-lg border border-gray-600">
            <CalendarIcon className="h-5 w-5 mr-2" />
            <span>Total: <span className="ml-1 font-semibold text-white">{filtered.length}</span></span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-750 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Barbeiro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    <button
                      type="button"
                      onClick={() => openDetails(a)}
                      className="text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline"
                      title="Ver detalhes do agendamento"
                    >
                      {a.client_name || 'N/A'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{a.barber_name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {a.services && a.services.length > 0 ? a.services.map(s => s.name).join(', ') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {a.appointment_date ? new Date(a.appointment_date).toLocaleString('pt-BR') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      a.status === 'completed'
                        ? 'bg-green-900/30 text-green-400 border border-green-700'
                        : a.status === 'cancelled'
                          ? 'bg-red-900/30 text-red-400 border border-red-700'
                          : a.status === 'confirmed'
                            ? 'bg-blue-900/30 text-blue-400 border border-blue-700'
                            : 'bg-yellow-900/30 text-yellow-400 border border-yellow-700'
                    }`}>
                      {a.status === 'completed' ? 'Concluído' : a.status === 'cancelled' ? 'Cancelado' : a.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAppointment(a as any);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Editar"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAppointment(a.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Excluir"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                    Nenhum agendamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Agendamento" maxWidth="2xl">
        <AppointmentForm
          initialData={
            editingAppointment
              ? {
                  id: editingAppointment.id,
                  clientId: (editingAppointment as any).clientId,
                  barberId: (editingAppointment as any).barberId,
                  serviceId: (editingAppointment as any).serviceId,
                  date: editingAppointment.data,
                  time: editingAppointment.hora,
                  notes: (editingAppointment as any).notes,
                }
              : undefined
          }
          onSuccess={(a) => handleCreateAppointment(a as AppointmentFormResult)}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingAppointment(null);
          }}
          onGoToClientCadastro={() => router.push('/admin/clients')}
        />
      </Modal>

      <Modal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedAppointment(null);
        }}
        title="Detalhes do Agendamento"
        maxWidth="lg"
      >
        {selectedAppointment ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-md border border-gray-700 bg-gray-750 p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Cliente</p>
                <p className="mt-1 text-sm font-semibold text-white">{selectedAppointment.client_name || 'N/A'}</p>
              </div>
              <div className="rounded-md border border-gray-700 bg-gray-750 p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Barbeiro</p>
                <p className="mt-1 text-sm font-semibold text-white">{selectedAppointment.barber_name || 'N/A'}</p>
              </div>
              <div className="rounded-md border border-gray-700 bg-gray-750 p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Serviço</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {selectedAppointment.services && selectedAppointment.services.length > 0 
                    ? selectedAppointment.services.map(s => s.name).join(', ') 
                    : 'N/A'}
                </p>
              </div>
              <div className="rounded-md border border-gray-700 bg-gray-750 p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Data/Hora</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {selectedAppointment.appointment_date ? new Date(selectedAppointment.appointment_date).toLocaleString('pt-BR') : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Status</p>
                <span
                  className={`mt-1 inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedAppointment.status === 'completed'
                      ? 'bg-green-900/30 text-green-400 border border-green-700'
                      : selectedAppointment.status === 'cancelled'
                        ? 'bg-red-900/30 text-red-400 border border-red-700'
                        : selectedAppointment.status === 'confirmed'
                          ? 'bg-blue-900/30 text-blue-400 border border-blue-700'
                          : 'bg-yellow-900/30 text-yellow-400 border border-yellow-700'
                  }`}
                >
                  {selectedAppointment.status === 'completed' ? 'Concluído' : selectedAppointment.status === 'cancelled' ? 'Cancelado' : selectedAppointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDetailsOpen(false);
                  setSelectedAppointment(null);
                }}
                className="inline-flex items-center px-4 py-2 rounded-md border border-gray-600 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400">Nenhum agendamento selecionado.</div>
        )}
      </Modal>
    </AdminLayout>
  );
}


