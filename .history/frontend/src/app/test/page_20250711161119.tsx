'use client';

import { useState } from 'react';

export default function TestPage() {
  const [imageStatus, setImageStatus] = useState<Record<string, string>>({});

  const testImages = [
    {
      name: 'Barbershop Main',
      url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1600&h=900&fit=crop&crop=center&auto=format&q=80'
    },
    {
      name: 'Client Area',
      url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1600&h=900&fit=crop&crop=center&auto=format&q=80'
    },
    {
      name: 'Barber Area',
      url: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=1600&h=900&fit=crop&crop=center&auto=format&q=80'
    }
  ];

  const testImage = (name: string, url: string) => {
    setImageStatus(prev => ({ ...prev, [name]: 'Testando...' }));
    
    const img = new Image();
    img.onload = () => {
      setImageStatus(prev => ({ ...prev, [name]: '✅ Carregou com sucesso!' }));
    };
    img.onerror = () => {
      setImageStatus(prev => ({ ...prev, [name]: '❌ Falha ao carregar' }));
    };
    img.src = url;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Teste de Imagens de Fundo</h1>
        
        <div className="space-y-6">
          {testImages.map((image) => (
            <div key={image.name} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{image.name}</h2>
                <button
                  onClick={() => testImage(image.name, image.url)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Testar Imagem
                </button>
              </div>
              
              <p className="text-gray-400 text-sm mb-2">URL:</p>
              <p className="text-blue-300 text-xs mb-4 break-all">{image.url}</p>
              
              <div className="bg-gray-700 p-3 rounded">
                <p className="text-sm">
                  Status: {imageStatus[image.name] || 'Aguardando teste...'}
                </p>
              </div>
              
              {/* Preview da imagem */}
              <div 
                className="mt-4 h-32 bg-gray-600 rounded-lg bg-cover bg-center"
                style={{
                  backgroundImage: imageStatus[image.name]?.includes('✅') ? `url(${image.url})` : undefined
                }}
              >
                {!imageStatus[image.name]?.includes('✅') && (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Preview da imagem aparecerá aqui
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-yellow-900 bg-opacity-50 border border-yellow-600 rounded-lg p-4">
          <h3 className="text-yellow-400 font-semibold mb-2">💡 Solução para Problemas:</h3>
          <ul className="text-yellow-100 text-sm space-y-1">
            <li>• Se as imagens não carregarem, pode ser problema de conectividade</li>
            <li>• O sistema usa gradientes CSS como fallback automático</li>
            <li>• As imagens são do Unsplash e dependem de acesso à internet</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition-colors"
          >
            ← Voltar para a Página Principal
          </button>
        </div>
      </div>
    </div>
  );
} 