'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function GoogleCallback() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando login...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        
        if (error) {
          setStatus('error');
          setMessage(`Erro do Google: ${error}`);
          // Enviar erro para o parent window
          window.opener?.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: error
          }, window.location.origin);
          return;
        }
        
        if (!code) {
          setStatus('error');
          setMessage('Código de autorização não encontrado');
          window.opener?.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: 'Código de autorização não encontrado'
          }, window.location.origin);
          return;
        }
        
        // Enviar código para o backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Erro ao processar login');
        }
        
        const data = await response.json();
        
        setStatus('success');
        setMessage('Login realizado com sucesso!');
        
        // Enviar token para o parent window
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_SUCCESS',
          token: data.access_token,
          user: data.user
        }, window.location.origin);
        
        // Fechar popup automaticamente após 2 segundos
        setTimeout(() => {
          window.close();
        }, 2000);
        
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Erro desconhecido');
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }, window.location.origin);
      }
    };
    
    handleCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Processando Login</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="text-green-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Login Realizado!</h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500 mt-4">Esta janela será fechada automaticamente...</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Erro no Login</h2>
              <p className="text-gray-600">{message}</p>
              <button 
                onClick={() => window.close()} 
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Fechar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 