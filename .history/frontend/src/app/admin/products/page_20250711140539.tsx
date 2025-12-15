'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  CubeIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { productsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import ProductForm from '@/components/forms/ProductForm';

const mockProducts = [
  {
    id: '1',
    name: 'Pomada Fixadora Premium',
    description: 'Pomada para cabelo com fixação forte e brilho natural',
    price: 35.00,
    costPrice: 18.00,
    stock: 15,
    minStock: 5,
    category: 'Cabelo',
    brand: 'BarberPro',
    active: true,
    sales: 42
  },
  {
    id: '2',
    name: 'Óleo para Barba',
    description: 'Óleo nutritivo para barba com fragrância amadeirada',
    price: 28.00,
    costPrice: 14.00,
    stock: 8,
    minStock: 10,
    category: 'Barba',
    brand: 'BeardCare',
    active: true,
    sales: 28
  },
  {
    id: '3',
    name: 'Shampoo Anticaspa',
    description: 'Shampoo especial para tratamento de caspa',
    price: 25.00,
    costPrice: 12.00,
    stock: 22,
    minStock: 8,
    category: 'Cabelo',
    brand: 'CleanHair',
    active: true,
    sales: 35
  },
  {
    id: '4',
    name: 'Cera Modeladora',
    description: 'Cera para modelagem com efeito matte',
    price: 32.00,
    costPrice: 16.00,
    stock: 3,
    minStock: 5,
    category: 'Cabelo',
    brand: 'StyleMax',
    active: true,
    sales: 18
  },
  {
    id: '5',
    name: 'Gel Pós-Barba',
    description: 'Gel calmante e hidratante pós-barba',
    price: 22.00,
    costPrice: 11.00,
    stock: 0,
    minStock: 6,
    category: 'Barba',
    brand: 'SkinCare',
    active: false,
    sales: 15
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [stockFilter, setStockFilter] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'todos' || product.category === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === 'baixo') {
      matchesStock = product.stock <= product.minStock;
    } else if (stockFilter === 'zerado') {
      matchesStock = product.stock === 0;
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.test();
      console.log('Products API Response:', response.data);
      toast.success('API de produtos funcionando!');
    } catch (error) {
      console.error('Erro na API de produtos:', error);
      toast.error('Erro ao conectar com API de produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (newProduct: any) => {
    setProducts(prev => [...prev, newProduct]);
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Produto excluído com sucesso!');
    }
  };

  const categories = [...new Set(products.map(p => p.category))];

  const getStockStatus = (product: { stock: number; minStock: number }) => {
    if (product.stock === 0) {
      return { status: 'zerado', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon };
    } else if (product.stock <= product.minStock) {
      return { status: 'baixo', color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon };
    } else {
      return { status: 'normal', color: 'bg-green-100 text-green-800', icon: CheckIcon };
    }
  };

  const calculateMargin = (price: number, cost: number) => {
    return ((price - cost) / price * 100).toFixed(1);
  };

  return (
    <AdminLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold leading-6 text-gray-900">Produtos</h1>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            Gerencie o estoque e vendas de produtos da sua barbearia
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
            Novo Produto
          </button>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CubeIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Produtos</dt>
                  <dd className="text-lg font-medium text-gray-900">{products.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Estoque Baixo</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {products.filter(p => p.stock <= p.minStock && p.stock > 0).length}
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
                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Sem Estoque</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {products.filter(p => p.stock === 0).length}
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
                <div className="h-6 w-6 bg-green-400 rounded"></div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Valor Total Estoque</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    R$ {products.reduce((acc, p) => acc + (p.price * p.stock), 0).toFixed(2)}
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
              placeholder="Pesquisar produtos..."
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

        <div className="max-w-xs">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="todos">Todos os estoques</option>
            <option value="baixo">Estoque baixo</option>
            <option value="zerado">Sem estoque</option>
          </select>
        </div>
      </div>

      {/* Lista de produtos */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product);
            const StatusIcon = stockStatus.icon;
            
            return (
              <li key={product.id}>
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <CubeIcon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {product.stock} un.
                          </span>
                          {!product.active && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inativo
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.brand} • {product.category}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.description}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Preço: R$ {product.price.toFixed(2)} • 
                          Custo: R$ {product.costPrice.toFixed(2)} • 
                          Margem: {calculateMargin(product.price, product.costPrice)}% • 
                          {product.sales} vendas
                        </div>
                        {product.stock <= product.minStock && (
                          <div className="text-xs text-red-600 mt-1">
                            ⚠️ Estoque mínimo: {product.minStock} unidades
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || categoryFilter !== 'todos' || stockFilter !== 'todos' 
              ? 'Tente ajustar os filtros.' 
              : 'Comece cadastrando um novo produto.'}
          </p>
        </div>
      )}
    </AdminLayout>
  );
} 