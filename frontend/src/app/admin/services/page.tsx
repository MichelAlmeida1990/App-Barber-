'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  SparklesIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { servicesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import ServiceForm from '@/components/forms/ServiceForm';

const ADMIN_SERVICES_LS_KEY = 'admin_services_v1';

const mockServices = [
  {
    id: '1',
    name: 'Corte Masculino',
    description: 'Corte tradicional masculino com acabamento',
    price: 30.00,
    duration: 30,
    category: 'Corte',
    active: true,
    popularity: 85
  },
  {
    id: '2',
    name: 'Barba Completa',
    description: 'Aparar e modelar barba com navalha',
    price: 25.00,
    duration: 30,
    category: 'Barba',
    active: true,
    popularity: 72
  },
  {
    id: '3',
    name: 'Corte + Barba',
    description: 'Combo completo corte e barba',
    price: 45.00,
    duration: 60,
    category: 'Combo',
    active: true,
    popularity: 95
  },
  {
    id: '4',
    name: 'Corte Premium',
    description: 'Corte moderno com styling e produtos premium',
    price: 50.00,
    duration: 45,
    category: 'Corte',
    active: true,
    popularity: 68
  },
  {
    id: '5',
    name: 'Sobrancelha',
    description: 'Modelagem e aparar sobrancelha masculina',
    price: 15.00,
    duration: 15,
    category: 'Acabamento',
    active: true,
    popularity: 45
  },
  {
    id: '6',
    name: 'Tratamento Capilar',
    description: 'Hidratação e tratamento do couro cabeludo',
    price: 35.00,
    duration: 40,
    category: 'Tratamento',
    active: false,
    popularity: 25
  },
];

export default function ServicesPage() {
  const [hydrated, setHydrated] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADMIN_SERVICES_LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) setServices(parsed);
        else setServices(mockServices);
      } else {
        setServices(mockServices);
      }
    } catch (e) {
      console.warn('Falha ao ler serviços do localStorage:', e);
      setServices(mockServices);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(ADMIN_SERVICES_LS_KEY, JSON.stringify(services));
      // Notificar outras telas no MESMO TAB (o evento "storage" não dispara no mesmo documento)
      window.dispatchEvent(new Event('admin_services_updated'));
    } catch (e) {
      console.warn('Falha ao salvar serviços no localStorage:', e);
    }
  }, [hydrated, services]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADMIN_SERVICES_LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      setServices(parsed);
    } catch (e) {
      console.warn('Falha ao ler serviços do localStorage:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_SERVICES_LS_KEY, JSON.stringify(services));
    } catch (e) {
      console.warn('Falha ao salvar serviços no localStorage:', e);
    }
  }, [services]);

  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'todos' || service.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await servicesAPI.test();
      console.log('Services API Response:', response.data);
      toast.success('API de serviços funcionando!');
    } catch (error) {
      console.error('Erro na API de serviços:', error);
      toast.error('Erro ao conectar com API de serviços');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = (newService: any) => {
    setServices(prev => {
      const exists = prev.some((s: any) => s.id === newService.id);
      return exists ? prev.map((s: any) => (s.id === newService.id ? { ...s, ...newService } : s)) : [...prev, newService];
    });
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      setServices(prev => prev.filter(s => s.id !== serviceId));
      toast.success('Serviço excluído com sucesso!');
    }
  };

  const categories = [...new Set(services.map(s => s.category))];

  return (
    <AdminLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold leading-6 text-gray-900">Serviços</h1>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            Gerencie todos os serviços oferecidos pela sua barbearia
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
            Novo Serviço
          </button>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <SparklesIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Serviços</dt>
                  <dd className="text-lg font-medium text-gray-900">{services.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <SparklesIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Serviços Ativos</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {services.filter(s => s.active).length}
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
                <CurrencyDollarIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Preço Médio</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    R$ {(services.reduce((acc, s) => acc + s.price, 0) / services.length).toFixed(2)}
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
                <ClockIcon className="h-6 w-6 text-purple-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Duração Média</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {Math.round(services.reduce((acc, s) => acc + s.duration, 0) / services.length)}min
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="max-w-lg w-full lg:max-w-xs">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Pesquisar serviços..."
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="max-w-xs">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="todos">Todas as categorias</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de serviços */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <SparklesIcon className="h-8 w-8 text-indigo-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingService(service);
                      setIsModalOpen(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Editar"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteService(service.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-600">{service.description}</p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm font-medium text-gray-900">R$ {service.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">{service.duration}min</span>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  service.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {service.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Popularidade</span>
                  <span className="text-xs text-gray-900">{service.popularity}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${service.popularity}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum serviço encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || categoryFilter !== 'todos' ? 'Tente ajustar os filtros.' : 'Comece criando um novo serviço.'}
          </p>
        </div>
      )}

      {/* Modal para criar serviço */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
        maxWidth="2xl"
      >
        <ServiceForm
          onSuccess={handleAddService}
          initialData={editingService ?? undefined}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingService(null);
          }}
        />
      </Modal>
    </AdminLayout>
  );
} 