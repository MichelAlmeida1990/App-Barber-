'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  UsersIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { clientsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import ClientForm from '@/components/forms/ClientForm';

// Dados de exemplo para demonstração
const mockClients = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    lastVisit: '2024-01-15',
    totalVisits: 12,
    loyaltyPoints: 150,
    status: 'ativo'
  },
  {
    id: '2',
    name: 'Pedro Santos',
    email: 'pedro@email.com',
    phone: '(11) 88888-8888',
    lastVisit: '2024-01-10',
    totalVisits: 8,
    loyaltyPoints: 80,
    status: 'ativo'
  },
  {
    id: '3',
    name: 'Rafael Costa',
    email: 'rafael@email.com',
    phone: '(11) 77777-7777',
    lastVisit: '2023-12-20',
    totalVisits: 5,
    loyaltyPoints: 50,
    status: 'inativo'
  },
];

export default function ClientsPage() {
  const [clients, setClients] = useState(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await clientsAPI.test();
      console.log('Clients API Response:', response.data);
      toast.success('API de clientes funcionando!');
    } catch (error) {
      console.error('Erro na API de clientes:', error);
      toast.error('Erro ao conectar com API de clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = (newClient: any) => {
    setClients(prev => [...prev, newClient]);
    setIsModalOpen(false);
  };

  const handleDeleteClient = (clientId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      setClients(prev => prev.filter(c => c.id !== clientId));
      toast.success('Cliente excluído com sucesso!');
    }
  };

  return (
    <AdminLayout>
      <div className="pb-5 border-b border-red-200 sm:flex sm:items-center sm:justify-between mb-6 bg-gradient-to-r from-gray-50 to-red-50 rounded-lg p-6 shadow-sm border-2 border-yellow-500">
        <div className="flex items-center">
          <div className="mr-4">
            <Image src="/images/barbershop/barber-chair.svg" alt="Clients" width={48} height={48} className="opacity-70" />
          </div>
          <div>
            <div className="flex items-center mb-2">
              <h1 className="text-3xl font-bold leading-6 text-gray-900">CLIENTES</h1>
              <Image src="/images/barbershop/comb.svg" alt="" width={24} height={8} className="ml-3 opacity-50" />
            </div>
            <p className="max-w-4xl text-sm text-gray-700">
              Gerencie todos os clientes da Elite Barber Shop
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
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 overflow-hidden shadow-lg rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Image src="/images/barbershop/barber-chair.svg" alt="" width={24} height={24} className="opacity-70" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-amber-700 truncate">Total de Clientes</dt>
                  <dd className="text-lg font-medium text-amber-900">{clients.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 overflow-hidden shadow-lg rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Image src="/images/barbershop/scissors.svg" alt="" width={24} height={24} className="opacity-70" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-green-700 truncate">Clientes Ativos</dt>
                  <dd className="text-lg font-medium text-green-900">
                    {clients.filter(c => c.status === 'ativo').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 overflow-hidden shadow-lg rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Image src="/images/barbershop/hair-clipper.svg" alt="" width={24} height={24} className="opacity-70" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-blue-700 truncate">Média de Visitas</dt>
                  <dd className="text-lg font-medium text-blue-900">
                    {Math.round(clients.reduce((acc, c) => acc + c.totalVisits, 0) / clients.length)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 overflow-hidden shadow-lg rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Image src="/images/barbershop/comb.svg" alt="" width={24} height={12} className="opacity-70" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-yellow-700 truncate">Total Pontos</dt>
                  <dd className="text-lg font-medium text-yellow-900">
                    {clients.reduce((acc, c) => acc + c.loyaltyPoints, 0)}
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
            Pesquisar clientes
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="search"
              name="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Pesquisar clientes..."
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredClients.map((client) => (
            <li key={client.id}>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {client.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        client.status === 'ativo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {client.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {client.email} • {client.phone}
                    </div>
                    <div className="text-sm text-gray-500">
                      Última visita: {new Date(client.lastVisit).toLocaleDateString('pt-BR')} • 
                      {client.totalVisits} visitas • {client.loyaltyPoints} pontos
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-indigo-600 hover:text-indigo-900">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClient(client.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cliente encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Tente ajustar sua pesquisa.' : 'Comece cadastrando um novo cliente.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Novo Cliente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal para criar cliente */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Cliente"
        maxWidth="xl"
      >
        <ClientForm
          onSuccess={handleAddClient}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </AdminLayout>
  );
} 