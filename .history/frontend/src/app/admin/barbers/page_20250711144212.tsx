'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import IconFallback from '@/components/IconFallback';
import { 
  ScissorsIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { barbersAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import BarberForm from '@/components/forms/BarberForm';

const mockBarbers = [
  {
    id: '1',
    name: 'Carlos Silva',
    email: 'carlos@barbearia.com',
    phone: '(11) 99999-1111',
    specialty: 'Corte masculino e barba',
    experience: '8 anos',
    commission: 40,
    rating: 4.9,
    totalCuts: 1250,
    status: 'ativo',
    schedule: 'Seg-Sex: 9h-18h, Sáb: 9h-15h'
  },
  {
    id: '2',
    name: 'André Santos',
    email: 'andre@barbearia.com',
    phone: '(11) 88888-2222',
    specialty: 'Cortes modernos e styling',
    experience: '5 anos',
    commission: 35,
    rating: 4.7,
    totalCuts: 890,
    status: 'ativo',
    schedule: 'Ter-Sáb: 10h-19h'
  },
  {
    id: '3',
    name: 'Roberto Costa',
    email: 'roberto@barbearia.com',
    phone: '(11) 77777-3333',
    specialty: 'Barbas e bigodes',
    experience: '12 anos',
    commission: 45,
    rating: 4.8,
    totalCuts: 2100,
    status: 'férias',
    schedule: 'Qui-Dom: 8h-16h'
  },
];

export default function BarbersPage() {
  const [barbers, setBarbers] = useState(mockBarbers);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredBarbers = barbers.filter(barber =>
    barber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barber.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barber.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await barbersAPI.test();
      console.log('Barbers API Response:', response.data);
      toast.success('API de barbeiros funcionando!');
    } catch (error) {
      console.error('Erro na API de barbeiros:', error);
      toast.error('Erro ao conectar com API de barbeiros');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBarber = (newBarber: any) => {
    setBarbers(prev => [...prev, newBarber]);
    setIsModalOpen(false);
  };

  const handleDeleteBarber = (barberId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este barbeiro?')) {
      setBarbers(prev => prev.filter(b => b.id !== barberId));
      toast.success('Barbeiro excluído com sucesso!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'férias': return 'bg-yellow-100 text-yellow-800';
      case 'inativo': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="pb-5 border-b border-red-200 sm:flex sm:items-center sm:justify-between mb-6 bg-gradient-to-r from-gray-50 to-red-50 rounded-lg p-6 shadow-sm border-2 border-yellow-500">
        <div className="flex items-center">
          <div className="mr-4">
            <IconFallback type="scissors" size="lg" className="opacity-70" />
          </div>
          <div>
            <div className="flex items-center mb-2">
              <h1 className="text-3xl font-bold leading-6 text-gray-900">BARBEIROS</h1>
              <IconFallback type="hair-clipper" size="md" className="ml-3 opacity-50" />
            </div>
            <p className="max-w-4xl text-sm text-gray-700">
              Gerencie todos os barbeiros da Elite Barber Shop
            </p>
          </div>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            onClick={testAPI}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 mr-3"
          >
            {loading ? 'Testando...' : 'Testar API'}
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-gradient-to-r from-red-600 to-black hover:from-red-700 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Novo Barbeiro
          </button>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ScissorsIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Barbeiros</dt>
                  <dd className="text-lg font-medium text-gray-900">{barbers.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ScissorsIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Barbeiros Ativos</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {barbers.filter(b => b.status === 'ativo').length}
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
                <StarIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avaliação Média</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {(barbers.reduce((acc, b) => acc + b.rating, 0) / barbers.length).toFixed(1)}
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
                <div className="h-6 w-6 bg-blue-400 rounded"></div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Cortes</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {barbers.reduce((acc, b) => acc + b.totalCuts, 0).toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de pesquisa */}
      <div className="mb-6">
        <div className="max-w-lg w-full lg:max-w-xs">
          <label htmlFor="search" className="sr-only">
            Pesquisar barbeiros
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="search"
              name="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Pesquisar barbeiros..."
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Lista de barbeiros */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredBarbers.map((barber) => (
            <li key={barber.id}>
              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <ScissorsIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{barber.name}</div>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(barber.status)}`}>
                          {barber.status}
                        </span>
                        <div className="ml-2 flex items-center">
                          <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-600">{barber.rating}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {barber.email} • {barber.phone}
                      </div>
                      <div className="text-sm text-gray-500">
                        {barber.specialty} • {barber.experience} de experiência
                      </div>
                      <div className="text-sm text-gray-500">
                        Comissão: {barber.commission}% • {barber.totalCuts} cortes realizados
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {barber.schedule}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteBarber(barber.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filteredBarbers.length === 0 && (
        <div className="text-center py-12">
          <ScissorsIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum barbeiro encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Tente ajustar sua pesquisa.' : 'Comece cadastrando um novo barbeiro.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Novo Barbeiro
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal para criar barbeiro */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Barbeiro"
        maxWidth="xl"
      >
        <BarberForm
          onSuccess={handleAddBarber}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </AdminLayout>
  );
} 