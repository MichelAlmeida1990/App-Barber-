'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CalendarIcon,
  PlusIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface BarberBlock {
  id: number;
  barber_id: number;
  block_date: string;
  start_time: string | null;
  end_time: string | null;
  all_day: boolean;
  reason: string | null;
  notes: string | null;
  is_active: boolean;
  formatted_period: string;
  created_at: string;
}

export default function BarberBlocksPage() {
  const [blocks, setBlocks] = useState<BarberBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BarberBlock | null>(null);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    block_date: '',
    all_day: true,
    start_time: '',
    end_time: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/barber/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'barber') {
      router.push('/barber/login');
      return;
    }

    loadBlocks(token);
  }, [router]);

  const loadBlocks = async (token: string) => {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_BASE_URL}/api/v1/barber-blocks/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBlocks(data);
      } else {
        toast.error('Erro ao carregar bloqueios');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      
      // Preparar dados
      const payload: any = {
        block_date: formData.block_date,
        all_day: formData.all_day,
        reason: formData.reason || null,
        notes: formData.notes || null
      };

      // Se não for dia inteiro, adicionar horários
      if (!formData.all_day) {
        if (!formData.start_time || !formData.end_time) {
          toast.error('Informe os horários de início e fim');
          return;
        }
        payload.start_time = `${formData.block_date}T${formData.start_time}:00`;
        payload.end_time = `${formData.block_date}T${formData.end_time}:00`;
      }

      const url = editingBlock 
        ? `${API_BASE_URL}/api/v1/barber-blocks/${editingBlock.id}`
        : `${API_BASE_URL}/api/v1/barber-blocks/`;
      
      const method = editingBlock ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(editingBlock ? 'Bloqueio atualizado!' : 'Bloqueio criado!');
        setShowModal(false);
        resetForm();
        loadBlocks(token);
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Erro ao salvar bloqueio');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar bloqueio');
    }
  };

  const handleDelete = async (blockId: number) => {
    if (!confirm('Deseja remover este bloqueio?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_BASE_URL}/api/v1/barber-blocks/${blockId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Bloqueio removido!');
        loadBlocks(token);
      } else {
        toast.error('Erro ao remover bloqueio');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao remover bloqueio');
    }
  };

  const handleToggleActive = async (block: BarberBlock) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_BASE_URL}/api/v1/barber-blocks/${block.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_active: !block.is_active
        })
      });

      if (response.ok) {
        toast.success(block.is_active ? 'Bloqueio desativado' : 'Bloqueio ativado');
        loadBlocks(token);
      } else {
        toast.error('Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const openEditModal = (block: BarberBlock) => {
    setEditingBlock(block);
    setFormData({
      block_date: block.block_date,
      all_day: block.all_day,
      start_time: block.start_time ? new Date(block.start_time).toTimeString().slice(0, 5) : '',
      end_time: block.end_time ? new Date(block.end_time).toTimeString().slice(0, 5) : '',
      reason: block.reason || '',
      notes: block.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      block_date: '',
      all_day: true,
      start_time: '',
      end_time: '',
      reason: '',
      notes: ''
    });
    setEditingBlock(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Separar bloqueios ativos e inativos
  const activeBlocks = blocks.filter(b => b.is_active);
  const inactiveBlocks = blocks.filter(b => !b.is_active);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Voltar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bloqueios de Agenda</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Gerencie os períodos em que você não estará disponível
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Novo Bloqueio
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando bloqueios...</p>
          </div>
        )}

        {/* Bloqueios Ativos */}
        {!loading && (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Bloqueios Ativos ({activeBlocks.length})
              </h2>
              
              {activeBlocks.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum bloqueio ativo</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeBlocks.map(block => (
                    <BlockCard 
                      key={block.id}
                      block={block}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                      onToggle={handleToggleActive}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Bloqueios Inativos */}
            {inactiveBlocks.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Bloqueios Inativos ({inactiveBlocks.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inactiveBlocks.map(block => (
                    <BlockCard 
                      key={block.id}
                      block={block}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                      onToggle={handleToggleActive}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingBlock ? 'Editar Bloqueio' : 'Novo Bloqueio'}
                  </h2>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Data */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.block_date}
                      onChange={(e) => setFormData({...formData, block_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  {/* Tipo de Bloqueio */}
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.all_day}
                        onChange={(e) => setFormData({...formData, all_day: e.target.checked})}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Dia inteiro</span>
                    </label>
                  </div>

                  {/* Horários (se não for dia inteiro) */}
                  {!formData.all_day && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Início *
                        </label>
                        <input
                          type="time"
                          required={!formData.all_day}
                          value={formData.start_time}
                          onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fim *
                        </label>
                        <input
                          type="time"
                          required={!formData.all_day}
                          value={formData.end_time}
                          onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {/* Motivo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo
                    </label>
                    <input
                      type="text"
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      placeholder="Ex: Férias, Consulta médica..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Detalhes adicionais..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  {/* Botões */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      {editingBlock ? 'Atualizar' : 'Criar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente do Card
function BlockCard({ 
  block, 
  onEdit, 
  onDelete, 
  onToggle 
}: { 
  block: BarberBlock;
  onEdit: (block: BarberBlock) => void;
  onDelete: (id: number) => void;
  onToggle: (block: BarberBlock) => void;
}) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isPast = new Date(block.block_date) < new Date();

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${!block.is_active ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-red-600" />
          <span className="text-sm font-medium text-gray-900">
            {formatDate(block.block_date)}
          </span>
        </div>
        {block.is_active ? (
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
        ) : (
          <ExclamationCircleIcon className="h-5 w-5 text-gray-400" />
        )}
      </div>

      {/* Período */}
      <div className="flex items-center space-x-2 mb-3">
        <ClockIcon className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-600">{block.formatted_period}</span>
      </div>

      {/* Motivo */}
      {block.reason && (
        <p className="text-sm text-gray-900 font-medium mb-2">{block.reason}</p>
      )}

      {/* Observações */}
      {block.notes && (
        <p className="text-xs text-gray-600 mb-4">{block.notes}</p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {block.all_day && (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
            Dia inteiro
          </span>
        )}
        {isPast && (
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
            Passado
          </span>
        )}
      </div>

      {/* Ações */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(block)}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onToggle(block)}
          className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
            block.is_active
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
        >
          {block.is_active ? 'Desativar' : 'Ativar'}
        </button>
        <button
          onClick={() => onDelete(block.id)}
          className="px-3 py-2 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}

