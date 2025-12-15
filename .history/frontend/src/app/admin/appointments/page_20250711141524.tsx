'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import dynamic from 'next/dynamic';
import AdminLayout from '@/components/AdminLayout';
import { 
  CalendarIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { appointmentsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import HydrationSafe from '@/components/HydrationSafe';
import { formatDateWithWeekday, generateId } from '@/lib/utils';

// Lazy load components
const Modal = dynamic(() => import('@/components/Modal'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
});

const AppointmentForm = dynamic(() => import('@/components/forms/AppointmentForm'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
});

// Memoized components
const StatCard = memo(({ icon: Icon, title, value, color = "text-gray-400" }: {
  icon: any;
  title: string;
  value: number | string;
  color?: string;
}) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${color}`} aria-hidden="true" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

const AppointmentItem = memo(({ 
  appointment, 
  onStatusChange, 
  onDelete 
}: {
  appointment: any;
  onStatusChange: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      case 'concluido': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'confirmado': return <CheckIcon className="h-4 w-4" />;
      case 'pendente': return <ClockIcon className="h-4 w-4" />;
      case 'cancelado': return <XMarkIcon className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  }, []);

  const formatDate = useCallback((date: string) => {
    return formatDateWithWeekday(date);
  }, []);

  return (
    <li key={appointment.id}>
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getStatusColor(appointment.status)}`}>
                {getStatusIcon(appointment.status)}
              </div>
            </div>
            <div className="ml-4">
              <div className="flex items-center">
                <div className="text-sm font-medium text-gray-900">{appointment.clientName || 'Cliente'}</div>
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {appointment.service || 'Serviço'} com {appointment.barberName || 'Barbeiro'}
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(appointment.date)} às {appointment.time} • {appointment.duration}min • R$ {appointment.price.toFixed(2)}
              </div>
              {appointment.notes && (
                <div className="text-xs text-gray-400 mt-1">
                  Obs: {appointment.notes}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onStatusChange(appointment.id)}
              className="text-indigo-600 hover:text-indigo-900"
              title="Alterar status"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={() => onDelete(appointment.id)}
              className="text-red-600 hover:text-red-900"
              title="Cancelar agendamento"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
});

AppointmentItem.displayName = 'AppointmentItem';

const mockAppointments = [
  {
    id: '1',
    clientName: 'João Silva',
    barberName: 'Carlos Silva',
    service: 'Corte + Barba',
    date: '2024-01-17',
    time: '14:00',
    duration: 60,
    price: 45.00,
    status: 'confirmado',
    notes: 'Cliente regular, gosta do corte baixo nas laterais'
  },
  {
    id: '2',
    clientName: 'Pedro Santos',
    barberName: 'André Santos',
    service: 'Corte Moderno',
    date: '2024-01-17',
    time: '14:30',
    duration: 45,
    price: 35.00,
    status: 'confirmado',
    notes: ''
  },
  {
    id: '3',
    clientName: 'Rafael Costa',
    barberName: 'Carlos Silva',
    service: 'Barba',
    date: '2024-01-17',
    time: '15:00',
    duration: 30,
    price: 25.00,
    status: 'pendente',
    notes: 'Primeira vez na barbearia'
  },
  {
    id: '4',
    clientName: 'Marcos Oliveira',
    barberName: 'Roberto Costa',
    service: 'Corte + Barba + Sobrancelha',
    date: '2024-01-17',
    time: '15:30',
    duration: 90,
    price: 65.00,
    status: 'confirmado',
    notes: 'Evento especial - casamento no fim de semana'
  },
  {
    id: '5',
    clientName: 'Lucas Ferreira',
    barberName: 'André Santos',
    service: 'Corte',
    date: '2024-01-18',
    time: '09:00',
    duration: 30,
    price: 30.00,
    status: 'cancelado',
    notes: 'Cliente cancelou por motivos pessoais'
  },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoized filtered appointments with safe property access
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      // Safe property access with fallbacks
      const clientName = appointment.clientName || '';
      const barberName = appointment.barberName || '';
      const service = appointment.service || '';
      const status = appointment.status || '';

      const matchesSearch = searchTerm === '' || 
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        barberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'todos' || status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  // Memoized statistics
  const statistics = useMemo(() => {
    return {
      total: appointments.length,
      confirmed: appointments.filter(a => a.status === 'confirmado').length,
      pending: appointments.filter(a => a.status === 'pendente').length,
      revenue: appointments.filter(a => a.status !== 'cancelado').reduce((acc, a) => acc + (a.price || 0), 0)
    };
  }, [appointments]);

  const testAPI = useCallback(async () => {
    setLoading(true);
    try {
      const response = await appointmentsAPI.test();
      console.log('Appointments API Response:', response.data);
      toast.success('API de agendamentos funcionando!');
    } catch (error) {
      console.error('Erro na API de agendamentos:', error);
      toast.error('Erro ao conectar com API de agendamentos');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddAppointment = useCallback((newAppointment: any) => {
    setAppointments(prev => [...prev, {
      ...newAppointment,
      id: generateId('appointment'),
      // Ensure all required fields have default values
      clientName: newAppointment.clientName || newAppointment.client || '',
      barberName: newAppointment.barberName || newAppointment.barber || '',
      service: newAppointment.service || '',
      status: newAppointment.status || 'pendente'
    }]);
    setIsModalOpen(false);
  }, []);

  const handleDeleteAppointment = useCallback((appointmentId: string) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      setAppointments(prev => prev.filter(a => a.id !== appointmentId));
      toast.success('Agendamento cancelado com sucesso!');
    }
  }, []);

  const handleStatusChange = useCallback((appointmentId: string) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === appointmentId) {
        const newStatus = a.status === 'confirmado' ? 'pendente' : 'confirmado';
        toast.success(`Status alterado para ${newStatus}`);
        return { ...a, status: newStatus };
      }
      return a;
    }));
  }, []);

  return (
    <AdminLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold leading-6 text-gray-900">Agendamentos</h1>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            Gerencie todos os agendamentos da sua barbearia
          </p>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            onClick={testAPI}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 mr-3"
          >
            {loading ? 'Testando...' : 'Testar API'}
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          icon={CalendarIcon}
          title="Total de Agendamentos"
          value={statistics.total}
        />
        <StatCard
          icon={CheckIcon}
          title="Confirmados"
          value={statistics.confirmed}
          color="text-green-400"
        />
        <StatCard
          icon={ClockIcon}
          title="Pendentes"
          value={statistics.pending}
          color="text-yellow-400"
        />
        <StatCard
          icon={() => <div className="h-6 w-6 bg-blue-400 rounded"></div>}
          title="Receita Esperada"
          value={`R$ ${statistics.revenue.toFixed(2)}`}
        />
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="max-w-lg w-full lg:max-w-xs">
          <label htmlFor="search" className="sr-only">
            Pesquisar agendamentos
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="search"
              name="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Pesquisar agendamentos..."
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="max-w-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="todos">Todos os status</option>
            <option value="confirmado">Confirmado</option>
            <option value="pendente">Pendente</option>
            <option value="cancelado">Cancelado</option>
            <option value="concluido">Concluído</option>
          </select>
        </div>
      </div>

      {/* Lista de agendamentos */}
      <HydrationSafe 
        fallback={
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="animate-pulse p-4 space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        }
      >
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <AppointmentItem
                key={appointment.id}
                appointment={appointment}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteAppointment}
              />
            ))}
          </ul>
        </div>
      </HydrationSafe>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum agendamento encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'todos' ? 'Tente ajustar os filtros.' : 'Comece criando um novo agendamento.'}
          </p>
          {!searchTerm && statusFilter === 'todos' && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Novo Agendamento
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal para criar agendamento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Agendamento"
        maxWidth="2xl"
      >
        <AppointmentForm
          onSuccess={handleAddAppointment}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </AdminLayout>
  );
} 