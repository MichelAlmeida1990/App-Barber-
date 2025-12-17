'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import toast from 'react-hot-toast';
import { clientsAPI } from '@/lib/api';
import { MagnifyingGlassIcon, PencilIcon, PlusIcon, TrashIcon, UsersIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/Modal';
import ClientForm from '@/components/forms/ClientForm';

type Client = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  lastVisit?: string;
  status: 'ativo' | 'inativo';
};

type ClientFormResult = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  lastVisit?: string;
  status?: 'ativo' | 'inativo';
};

const mockClients: Client[] = [
  { id: '1', name: 'João Silva', email: 'joao@email.com', phone: '(11) 98888-1001', lastVisit: '2025-01-10', status: 'ativo' },
  { id: '2', name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 98888-1002', lastVisit: '2025-01-05', status: 'ativo' },
  { id: '3', name: 'Pedro Oliveira', email: 'pedro@email.com', phone: '(11) 98888-1003', lastVisit: '2024-12-22', status: 'inativo' },
];

const ADMIN_CLIENTS_LS_KEY = 'admin_clients_v1';

export default function AdminClientsPage() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [hydrated, setHydrated] = useState(false);
  const [items, setItems] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADMIN_CLIENTS_LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Client[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        } else {
          setItems(mockClients);
        }
      } else {
        setItems(mockClients);
      }
    } catch (e) {
      console.warn('Falha ao ler clientes do localStorage:', e);
      setItems(mockClients);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(ADMIN_CLIENTS_LS_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Falha ao salvar clientes no localStorage:', e);
    }
  }, [items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((c) => {
      const matchesSearch =
        !term || c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term) || (c.phone ?? '').toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'todos' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const testAPI = async () => {
    setLoading(true);
    try {
      const res = await clientsAPI.test();
      console.log('Clients API Response:', res.data);
      toast.success('✅ API de clientes funcionando!');
    } catch (e) {
      console.error('Erro na API de clientes:', e);
      toast.error('❌ Erro ao conectar com API de clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = (result: ClientFormResult) => {
    const newClient: Client = {
      id: result.id,
      name: result.name,
      email: result.email ?? '',
      phone: result.phone,
      lastVisit: result.lastVisit,
      status: result.status ?? 'ativo',
    };
    setItems((prev) => {
      const exists = prev.some((c) => c.id === newClient.id);
      return exists ? prev.map((c) => (c.id === newClient.id ? { ...c, ...newClient } : c)) : [newClient, ...prev];
    });
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleDeleteClient = (clientId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    setItems((prev) => prev.filter((c) => c.id !== clientId));
    toast.success('Cliente excluído com sucesso!');
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última visita</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div>{c.email}</div>
                    {c.phone ? <div className="text-gray-500">{c.phone}</div> : null}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.lastVisit ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${c.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="inline-flex items-center gap-2">
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Cliente" maxWidth="2xl">
        <ClientForm
          initialData={editingClient ?? undefined}
          onSuccess={(c) => handleCreateClient(c as ClientFormResult)}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingClient(null);
          }}
        />
      </Modal>
    </AdminLayout>
  );
}


