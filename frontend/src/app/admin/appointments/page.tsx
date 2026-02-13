'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import toast from 'react-hot-toast';
import { appointmentsAPI } from '@/lib/api';
import { CalendarIcon, MagnifyingGlassIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/Modal';
import AppointmentForm from '@/components/forms/AppointmentForm';
import { useRouter } from 'next/navigation';

type AppointmentStatus = 'agendado' | 'concluido' | 'cancelado';

type Appointment = {
  id: string;
  cliente: string;
  barbeiro: string;
  servico: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:mm
  status: AppointmentStatus;
};

type AppointmentFormResult = {
  id: string;
  clientName: string;
  barberName: string;
  service: string;
  date: string;
  time: string;
  clientId?: string;
  barberId?: string;
  serviceId?: string;
  notes?: string;
};

const mockAppointments: Appointment[] = [
  { id: '1', cliente: 'João Silva', barbeiro: 'Carlos Santos', servico: 'Corte Masculino', data: '2025-01-11', hora: '10:00', status: 'agendado' },
  { id: '2', cliente: 'Maria Souza', barbeiro: 'André Lima', servico: 'Corte + Barba', data: '2025-01-11', hora: '11:00', status: 'agendado' },
  { id: '3', cliente: 'Pedro Oliveira', barbeiro: 'Roberto Costa', servico: 'Barba Completa', data: '2025-01-10', hora: '16:30', status: 'concluido' },
];

const ADMIN_APPOINTMENTS_LS_KEY = 'admin_appointments_v1';

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | AppointmentStatus>('todos');
  const [hydrated, setHydrated] = useState(false);
  const [items, setItems] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<(Appointment & { clientId?: string; barberId?: string; serviceId?: string; notes?: string }) | null>(null);

  // Persistir agendamentos no localStorage para não "sumirem" com Fast Refresh
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADMIN_APPOINTMENTS_LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Appointment[];
        if (Array.isArray(parsed) && parsed.length > 0) setItems(parsed);
        else setItems(mockAppointments);
      } else {
        setItems(mockAppointments);
      }
    } catch (e) {
      console.warn('Falha ao ler agendamentos do localStorage:', e);
      setItems(mockAppointments);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(ADMIN_APPOINTMENTS_LS_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Falha ao salvar agendamentos no localStorage:', e);
    }
  }, [hydrated, items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((a) => {
      const matchesSearch =
        !term ||
        a.cliente.toLowerCase().includes(term) ||
        a.barbeiro.toLowerCase().includes(term) ||
        a.servico.toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'todos' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const testAPI = async () => {
    setLoading(true);
    try {
      const res = await appointmentsAPI.test();
      console.log('Appointments API Response:', res.data);
      toast.success('✅ API de agendamentos funcionando!');
    } catch (e) {
      console.error('Erro na API de agendamentos:', e);
      toast.error('❌ Erro ao conectar com API de agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = (result: AppointmentFormResult) => {
    const newAppointment: (Appointment & { clientId?: string; barberId?: string; serviceId?: string; notes?: string }) = {
      id: result.id,
      cliente: result.clientName,
      barbeiro: result.barberName,
      servico: result.service,
      data: result.date,
      hora: result.time,
      status: 'agendado',
      clientId: result.clientId,
      barberId: result.barberId,
      serviceId: result.serviceId,
      notes: result.notes,
    };
    setItems((prev) => {
      const exists = prev.some((a) => a.id === newAppointment.id);
      return exists ? prev.map((a) => (a.id === newAppointment.id ? { ...a, ...newAppointment } : a)) : [newAppointment, ...prev];
    });
    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  const handleDeleteAppointment = (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) return;
    setItems((prev) => prev.filter((a) => a.id !== id));
    toast.success('Agendamento excluído com sucesso!');
  };

  const openDetails = (a: Appointment) => {
    setSelectedAppointment(a);
    setIsDetailsOpen(true);
  };

  return (
    <AdminLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold leading-6 text-gray-900">Agendamentos</h1>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">Gerencie e acompanhe os agendamentos da barbearia</p>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 mr-3"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Agendar
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
              placeholder="Buscar por cliente, barbeiro ou serviço"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'todos' | AppointmentStatus)}
              className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm"
            >
              <option value="todos">Todos os status</option>
              <option value="agendado">Agendado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
            Total: <span className="ml-1 font-semibold text-gray-900">{filtered.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barbeiro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quando</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <button
                      type="button"
                      onClick={() => openDetails(a)}
                      className="text-indigo-700 hover:underline"
                      title="Ver detalhes do agendamento"
                    >
                      {a.cliente}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{a.barbeiro}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{a.servico}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {a.data} {a.hora}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      type="button"
                      onClick={() => openDetails(a)}
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold underline-offset-2 hover:underline ${
                        a.status === 'concluido'
                          ? 'bg-green-100 text-green-800'
                          : a.status === 'cancelado'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                      title="Ver detalhes do agendamento"
                    >
                      {a.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAppointment(a as any);
                          setIsModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Editar"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAppointment(a.id)}
                        className="text-red-600 hover:text-red-900"
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
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
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
              <div className="rounded-md border border-gray-200 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Cliente</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{selectedAppointment.cliente}</p>
              </div>
              <div className="rounded-md border border-gray-200 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Barbeiro</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{selectedAppointment.barbeiro}</p>
              </div>
              <div className="rounded-md border border-gray-200 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Serviço</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{selectedAppointment.servico}</p>
              </div>
              <div className="rounded-md border border-gray-200 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Data/Hora</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {selectedAppointment.data} {selectedAppointment.hora}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                <span
                  className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedAppointment.status === 'concluido'
                      ? 'bg-green-100 text-green-800'
                      : selectedAppointment.status === 'cancelado'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {selectedAppointment.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDetailsOpen(false);
                  setSelectedAppointment(null);
                }}
                className="inline-flex items-center px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Nenhum agendamento selecionado.</div>
        )}
      </Modal>
    </AdminLayout>
  );
}


