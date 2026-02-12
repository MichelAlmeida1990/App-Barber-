'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, PencilIcon, PlusIcon, TrashIcon, UsersIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/Modal';
import ClientForm from '@/components/forms/ClientForm';
import { useRouter } from 'next/navigation';

type Client = {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  notes?: string;
  lastVisit?: string;
  status?: string;
  active?: boolean;
};

type ClientFormResult = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  lastVisit?: string;
  status?: 'ativo' | 'inativo';
};

export default function AdminClientsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    loadClients();
  }, [router]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/api/v1/clients/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClients(Array.isArray(data) ? data : []);
      } else {
        toast.error('Erro ao carregar clientes');
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
    return clients.filter((c) => {
      const matchesSearch =
        !term || c.name.toLowerCase().includes(term) || (c.email?.toLowerCase() ?? '').includes(term) || (c.phone ?? '').toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'todos' || (statusFilter === 'ativo' ? c.active || c.status === 'ativo' : !(c.active || c.status === 'ativo'));
      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  const handleCreateClient = (result: ClientFormResult) => {
    // After creation/update, reload the list
    loadClients();
    setIsModalOpen(false);
    setEditingClient(null);
    toast.success(editingClient ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!');
  };

  const handleDeleteClient = async (clientId: string | number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/api/v1/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Cliente excluído com sucesso!');
        loadClients();
      } else {
        toast.error('Erro ao excluir cliente');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao excluir cliente');
    }
  };

  return (
    <AdminLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold leading-6 text-gray-900">Clientes</h1>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">Gestão de clientes e histórico de visitas</p>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 mr-3"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Cadastrar Cliente
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
              placeholder="Buscar por nome, email ou telefone"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'todos' | 'ativo' | 'inativo')}
              className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm"
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <UsersIcon className="h-5 w-5 mr-2 text-gray-400" />
            Total: <span className="ml-1 font-semibold text-gray-900">{filtered.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            Nenhum cliente encontrado.
          </div>
        ) : (
          <>
            {/* Versão Mobile - Cards */}
            <div className="block md:hidden">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="p-4 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-50"
                  onClick={() => setViewingClient(c)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{c.name}</div>
                      {c.email && <div className="text-xs text-gray-600 mt-0.5 truncate">{c.email}</div>}
                      {c.phone && <div className="text-xs text-gray-500 mt-0.5">{c.phone}</div>}
                    </div>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ml-2 ${c.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {c.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    <div>
                      <div className="text-gray-600">Última visita:</div>
                      <div className="font-medium text-gray-900">{c.lastVisit ? new Date(c.lastVisit).toLocaleDateString('pt-BR') : '-'}</div>
                    </div>
                    {c.birthDate && (
                      <div>
                        <div className="text-gray-600">Nascimento:</div>
                        <div className="font-medium text-gray-900">{new Date(c.birthDate).toLocaleDateString('pt-BR')}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingClient(c);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-colors"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClient(c.id)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                      title="Excluir"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Versão Desktop - Tabela */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última visita</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setViewingClient(c)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div>{c.email}</div>
                        {c.phone ? <div className="text-gray-500">{c.phone}</div> : null}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.lastVisit ? new Date(c.lastVisit).toLocaleDateString('pt-BR') : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${c.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <div className="inline-flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingClient(c);
                              setIsModalOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClient(c.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClient ? 'Editar Cliente' : 'Novo Cliente'} maxWidth="2xl">
        <ClientForm
          initialData={editingClient ?? undefined}
          onSuccess={(c) => handleCreateClient(c as ClientFormResult)}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingClient(null);
          }}
        />
      </Modal>

      <Modal isOpen={!!viewingClient} onClose={() => setViewingClient(null)} title="Detalhes do Cliente" maxWidth="2xl">
        {viewingClient && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Nome</label>
                <p className="mt-1 text-xs sm:text-sm text-gray-900 break-words">{viewingClient.name}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-xs sm:text-sm text-gray-900 break-words">{viewingClient.email || '-'}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Telefone</label>
                <p className="mt-1 text-xs sm:text-sm text-gray-900">{viewingClient.phone || '-'}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Data de Nascimento</label>
                <p className="mt-1 text-xs sm:text-sm text-gray-900">{viewingClient.birthDate ? new Date(viewingClient.birthDate).toLocaleDateString('pt-BR') : '-'}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Última Visita</label>
                <p className="mt-1 text-xs sm:text-sm text-gray-900">{viewingClient.lastVisit ? new Date(viewingClient.lastVisit).toLocaleDateString('pt-BR') : '-'}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${viewingClient.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {viewingClient.status}
                  </span>
                </p>
              </div>
            </div>
            {viewingClient.address && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Endereço</label>
                <p className="mt-1 text-xs sm:text-sm text-gray-900 break-words">{viewingClient.address}</p>
              </div>
            )}
            {viewingClient.notes && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Observações</label>
                <p className="mt-1 text-xs sm:text-sm text-gray-900 whitespace-pre-wrap break-words">{viewingClient.notes}</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setViewingClient(null);
                  setEditingClient(viewingClient);
                  setIsModalOpen(true);
                }}
                className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setViewingClient(null)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}


