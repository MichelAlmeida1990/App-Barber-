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
      {/* Header */}
      <div className="pb-6 mb-8 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded-lg">
              <UsersIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Clientes</h1>
              <p className="text-gray-300 text-sm mt-1">Gestão de clientes e histórico de visitas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Cadastrar Cliente
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
              placeholder="Buscar por nome, email ou telefone"
              className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'todos' | 'ativo' | 'inativo')}
              className="w-full py-2 px-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          <div className="flex items-center text-sm text-gray-400 px-4 py-2 bg-gray-700 rounded-lg border border-gray-600">
            <UsersIcon className="h-5 w-5 mr-2" />
            <span>Total: <span className="ml-1 font-semibold text-white">{filtered.length}</span></span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="px-6 py-10 text-center text-gray-400">Carregando clientes...</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400">Nenhum cliente encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-750 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Telefone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Última visita</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-750 transition-colors cursor-pointer" onClick={() => setViewingClient(c)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{c.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{c.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{c.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{c.lastVisit ? new Date(c.lastVisit).toLocaleDateString('pt-BR') : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${(c.active || c.status === 'ativo') ? 'bg-green-900/30 text-green-400 border border-green-700' : 'bg-gray-700 text-gray-400 border border-gray-600'}`}>
                        {(c.active || c.status === 'ativo') ? 'ativo' : 'inativo'}
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
                          className="text-green-400 hover:text-green-300 transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClient(c.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
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
        )}
      </div>

      {/* Modal de edição */}
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

      {/* Modal de detalhes */}
      <Modal isOpen={!!viewingClient} onClose={() => setViewingClient(null)} title="Detalhes do Cliente" maxWidth="2xl">
        {viewingClient && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400">Nome</label>
                <p className="mt-1 text-xs sm:text-sm text-white break-words">{viewingClient.name}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400">Email</label>
                <p className="mt-1 text-xs sm:text-sm text-white break-words">{viewingClient.email || '-'}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400">Telefone</label>
                <p className="mt-1 text-xs sm:text-sm text-white">{viewingClient.phone || '-'}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400">Data de Nascimento</label>
                <p className="mt-1 text-xs sm:text-sm text-white">{viewingClient.birthDate ? new Date(viewingClient.birthDate).toLocaleDateString('pt-BR') : '-'}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400">Última Visita</label>
                <p className="mt-1 text-xs sm:text-sm text-white">{viewingClient.lastVisit ? new Date(viewingClient.lastVisit).toLocaleDateString('pt-BR') : '-'}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400">Status</label>
                <p className="mt-1">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${(viewingClient.active || viewingClient.status === 'ativo') ? 'bg-green-900/30 text-green-400 border border-green-700' : 'bg-gray-700 text-gray-400 border border-gray-600'}`}>
                    {(viewingClient.active || viewingClient.status === 'ativo') ? 'ativo' : 'inativo'}
                  </span>
                </p>
              </div>
            </div>
            {viewingClient.address && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400">Endereço</label>
                <p className="mt-1 text-xs sm:text-sm text-white break-words">{viewingClient.address}</p>
              </div>
            )}
            {viewingClient.notes && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400">Observações</label>
                <p className="mt-1 text-xs sm:text-sm text-white whitespace-pre-wrap break-words">{viewingClient.notes}</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setViewingClient(null);
                  setEditingClient(viewingClient);
                  setIsModalOpen(true);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setViewingClient(null)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors border border-gray-600"
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


