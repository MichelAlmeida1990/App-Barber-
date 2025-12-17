'use client';

import { useEffect, useMemo, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { IconFallback } from '../IconFallback';
import toast from 'react-hot-toast';

interface SaleFormProps {
  onSubmit: (saleData: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const ADMIN_BARBERS_LS_KEY = 'admin_barbers_v1';
const ADMIN_SERVICES_LS_KEY = 'admin_services_v1';
const ADMIN_PRODUCTS_LS_KEY = 'admin_products_v1';
const ADMIN_CLIENTS_LS_KEY = 'admin_clients_v1';

const servicosDisponiveis = [
  { id: '1', nome: 'Corte Masculino', preco: 45.00 },
  { id: '2', nome: 'Corte Feminino', preco: 60.00 },
  { id: '3', nome: 'Barba Completa', preco: 25.00 },
  { id: '4', nome: 'Barba Simples', preco: 15.00 },
  { id: '5', nome: 'Sobrancelha', preco: 12.00 },
  { id: '6', nome: 'Corte + Barba', preco: 65.00 },
  { id: '7', nome: 'Bigode', preco: 8.00 },
  { id: '8', nome: 'Relaxamento', preco: 80.00 }
];

const produtosDisponiveis = [
  { id: '1', nome: 'Pomada Modeladora', preco: 35.00 },
  { id: '2', nome: 'Shampoo Anticaspa', preco: 28.00 },
  { id: '3', nome: 'Óleo para Barba', preco: 42.00 },
  { id: '4', nome: 'Balm Hidratante', preco: 38.00 },
  { id: '5', nome: 'Cera Modeladora', preco: 32.00 },
  { id: '6', nome: 'Tônico Capilar', preco: 45.00 },
  { id: '7', nome: 'Loção Pós-Barba', preco: 29.00 },
  { id: '8', nome: 'Kit Completo', preco: 85.00 }
];

const barbeiros = [
  { id: '1', nome: 'Carlos Santos' },
  { id: '2', nome: 'André Lima' },
  { id: '3', nome: 'Roberto Costa' }
];

const formasPagamento = [
  'Dinheiro',
  'PIX',
  'Cartão de Débito',
  'Cartão de Crédito',
  'Vale Presente'
];

export default function SaleForm({ onSubmit, onCancel, initialData }: SaleFormProps) {
  const [formData, setFormData] = useState({
    cliente_nome: initialData?.cliente_nome || '',
    barbeiro_id: initialData?.barbeiro_id || '',
    barbeiro_nome: initialData?.barbeiro_nome || '',
    servicos_selecionados: initialData?.servicos || [],
    produtos_selecionados: initialData?.produtos || [],
    desconto: initialData?.desconto || 0,
    forma_pagamento: initialData?.forma_pagamento || '',
    observacoes: initialData?.observacoes || ''
  });

  const [servicosSelecionados, setServicosSelecionados] = useState<any[]>([]);
  const [produtosSelecionados, setProdutosSelecionados] = useState<any[]>([]);

  // fontes "amarradas" com cadastros do admin (localStorage)
  const [barbeirosFonte, setBarbeirosFonte] = useState<{ id: string; nome: string }[]>(barbeiros);
  const [servicosFonte, setServicosFonte] = useState<{ id: string; nome: string; preco: number }[]>(servicosDisponiveis);
  const [produtosFonte, setProdutosFonte] = useState<{ id: string; nome: string; preco: number }[]>(produtosDisponiveis);
  const [clientesFonte, setClientesFonte] = useState<{ id: string; nome: string }[]>([]);

  useEffect(() => {
    const safeRead = <T,>(key: string, fallback: T): T => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    };

    // Barbeiros
    const b = safeRead<any[]>(ADMIN_BARBERS_LS_KEY, []);
    const barbersNorm = (Array.isArray(b) ? b : [])
      .map((x) => ({ id: String(x?.id ?? ''), nome: String(x?.name ?? x?.nome ?? '') }))
      .filter((x) => x.id && x.nome);
    if (barbersNorm.length > 0) setBarbeirosFonte(barbersNorm);

    // Serviços
    const s = safeRead<any[]>(ADMIN_SERVICES_LS_KEY, []);
    const servicesNorm = (Array.isArray(s) ? s : [])
      .map((x) => ({ id: String(x?.id ?? ''), nome: String(x?.name ?? x?.nome ?? ''), preco: Number(x?.price ?? x?.preco ?? 0) }))
      .filter((x) => x.id && x.nome && Number.isFinite(x.preco) && x.preco > 0);
    if (servicesNorm.length > 0) setServicosFonte(servicesNorm);

    // Produtos
    const p = safeRead<any[]>(ADMIN_PRODUCTS_LS_KEY, []);
    const productsNorm = (Array.isArray(p) ? p : [])
      .map((x) => ({ id: String(x?.id ?? ''), nome: String(x?.name ?? x?.nome ?? ''), preco: Number(x?.price ?? x?.salePrice ?? x?.preco ?? 0) }))
      .filter((x) => x.id && x.nome && Number.isFinite(x.preco) && x.preco > 0);
    if (productsNorm.length > 0) setProdutosFonte(productsNorm);

    // Clientes (opcional: sugerir)
    const c = safeRead<any[]>(ADMIN_CLIENTS_LS_KEY, []);
    const clientsNorm = (Array.isArray(c) ? c : [])
      .map((x) => ({ id: String(x?.id ?? ''), nome: String(x?.name ?? x?.cliente_nome ?? '') }))
      .filter((x) => x.id && x.nome);
    setClientesFonte(clientsNorm);
  }, []);

  const clientesSugeridos = useMemo(() => {
    const term = formData.cliente_nome.trim().toLowerCase();
    if (!term || term.length < 2) return [];
    return clientesFonte.filter((c) => c.nome.toLowerCase().includes(term)).slice(0, 6);
  }, [clientesFonte, formData.cliente_nome]);

  // Calcular valores
  const valorServicos = servicosSelecionados.reduce((acc, s) => acc + (s.preco * s.quantidade), 0);
  const valorProdutos = produtosSelecionados.reduce((acc, p) => acc + (p.preco * p.quantidade), 0);
  const valorBruto = valorServicos + valorProdutos;
  const valorFinal = valorBruto - formData.desconto;

  const adicionarServico = (servico: any) => {
    const novoServico = { ...servico, quantidade: 1 };
    setServicosSelecionados(prev => [...prev, novoServico]);
  };

  const adicionarProduto = (produto: any) => {
    const novoProduto = { ...produto, quantidade: 1 };
    setProdutosSelecionados(prev => [...prev, novoProduto]);
  };

  const removerServico = (index: number) => {
    setServicosSelecionados(prev => prev.filter((_, i) => i !== index));
  };

  const removerProduto = (index: number) => {
    setProdutosSelecionados(prev => prev.filter((_, i) => i !== index));
  };

  const atualizarQuantidadeServico = (index: number, quantidade: number) => {
    if (quantidade < 1) return;
    setServicosSelecionados(prev => 
      prev.map((item, i) => i === index ? { ...item, quantidade } : item)
    );
  };

  const atualizarQuantidadeProduto = (index: number, quantidade: number) => {
    if (quantidade < 1) return;
    setProdutosSelecionados(prev => 
      prev.map((item, i) => i === index ? { ...item, quantidade } : item)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cliente_nome.trim()) {
      toast.error('Nome do cliente é obrigatório');
      return;
    }

    if (!formData.barbeiro_nome.trim()) {
      toast.error('Selecione um barbeiro');
      return;
    }

    if (servicosSelecionados.length === 0 && produtosSelecionados.length === 0) {
      toast.error('Adicione pelo menos um serviço ou produto');
      return;
    }

    if (!formData.forma_pagamento) {
      toast.error('Selecione a forma de pagamento');
      return;
    }

    const itens = [
      ...servicosSelecionados.map(s => ({ tipo: 'servico', nome: s.nome, preco: s.preco, quantidade: s.quantidade })),
      ...produtosSelecionados.map(p => ({ tipo: 'produto', nome: p.nome, preco: p.preco, quantidade: p.quantidade }))
    ];

    const saleData = {
      cliente_nome: formData.cliente_nome,
      barbeiro_nome: formData.barbeiro_nome,
      itens,
      desconto: formData.desconto,
      forma_pagamento: formData.forma_pagamento,
      observacoes: formData.observacoes,
      valor_bruto: valorBruto,
      valor_final: valorFinal
    };

    onSubmit(saleData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <IconFallback type="scissors" size="lg" className="mr-3" />
            <h3 className="text-lg font-bold text-gray-900">
              {initialData ? 'Editar Venda' : 'Nova Venda'}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome do Cliente *
              </label>
              <input
                type="text"
                required
                value={formData.cliente_nome}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente_nome: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                placeholder="Nome completo do cliente"
              />
              {clientesSugeridos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {clientesSugeridos.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, cliente_nome: c.nome }))}
                      className="px-2 py-1 rounded-md text-xs bg-gray-100 hover:bg-gray-200 text-gray-700"
                      title="Usar cliente cadastrado"
                    >
                      {c.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Barbeiro *
              </label>
              <select
                required
                value={formData.barbeiro_nome}
                onChange={(e) => setFormData(prev => ({ ...prev, barbeiro_nome: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Selecione o barbeiro</option>
                {barbeirosFonte.map(barbeiro => (
                  <option key={barbeiro.id} value={barbeiro.nome}>
                    {barbeiro.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Serviços */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Serviços</h4>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adicionar Serviço
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {servicosFonte.map(servico => (
                  <button
                    key={servico.id}
                    type="button"
                    onClick={() => adicionarServico(servico)}
                    className="p-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {servico.nome} - R$ {servico.preco.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>

            {/* Serviços Selecionados */}
            {servicosSelecionados.length > 0 && (
              <div className="border border-gray-200 rounded-md p-4">
                <h5 className="font-medium text-gray-900 mb-2">Serviços Selecionados:</h5>
                {servicosSelecionados.map((servico, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <span className="font-medium">{servico.nome}</span>
                      <span className="text-gray-500 ml-2">R$ {servico.preco.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        value={servico.quantidade}
                        onChange={(e) => atualizarQuantidadeServico(index, parseInt(e.target.value))}
                        className="w-16 border-gray-300 rounded-md text-center"
                      />
                      <span className="text-green-600 font-medium">
                        R$ {(servico.preco * servico.quantidade).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removerServico(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Produtos */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Produtos</h4>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adicionar Produto
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {produtosFonte.map(produto => (
                  <button
                    key={produto.id}
                    type="button"
                    onClick={() => adicionarProduto(produto)}
                    className="p-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {produto.nome} - R$ {produto.preco.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>

            {/* Produtos Selecionados */}
            {produtosSelecionados.length > 0 && (
              <div className="border border-gray-200 rounded-md p-4">
                <h5 className="font-medium text-gray-900 mb-2">Produtos Selecionados:</h5>
                {produtosSelecionados.map((produto, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <span className="font-medium">{produto.nome}</span>
                      <span className="text-gray-500 ml-2">R$ {produto.preco.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        value={produto.quantidade}
                        onChange={(e) => atualizarQuantidadeProduto(index, parseInt(e.target.value))}
                        className="w-16 border-gray-300 rounded-md text-center"
                      />
                      <span className="text-green-600 font-medium">
                        R$ {(produto.preco * produto.quantidade).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removerProduto(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Valores e Pagamento */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Desconto (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.desconto}
                onChange={(e) => setFormData(prev => ({ ...prev, desconto: parseFloat(e.target.value) || 0 }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Forma de Pagamento *
              </label>
              <select
                required
                value={formData.forma_pagamento}
                onChange={(e) => setFormData(prev => ({ ...prev, forma_pagamento: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Selecione a forma de pagamento</option>
                {formasPagamento.map(forma => (
                  <option key={forma} value={forma}>
                    {forma}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              rows={3}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              placeholder="Observações sobre a venda..."
            />
          </div>

          {/* Resumo dos Valores */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Resumo da Venda</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Serviços:</span>
                <span>R$ {valorServicos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Produtos:</span>
                <span>R$ {valorProdutos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {valorBruto.toFixed(2)}</span>
              </div>
              {formData.desconto > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Desconto:</span>
                  <span>- R$ {formData.desconto.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-green-600 border-t pt-2">
                <span>Total Final:</span>
                <span>R$ {valorFinal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-600 to-black hover:from-red-700 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {initialData ? 'Atualizar Venda' : 'Registrar Venda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 