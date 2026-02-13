'use client';

import { useEffect, useState } from 'react';

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => void;
  onError: (error: any) => void;
  disabled?: boolean;
  text?: string;
}

export default function GoogleLoginButton({ 
  onSuccess, 
  onError, 
  disabled = false,
  text = "Continuar com Google"
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "411190439185-648kbj8erbrq4kvcappp3ncspoeoam1t.apps.googleusercontent.com";
      const redirectUri = "http://localhost:3000/auth/google/callback";
      const scope = "email profile";
      
      // Criar URL de autorização do Google
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', clientId);
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', scope);
      authUrl.searchParams.append('access_type', 'offline');
      authUrl.searchParams.append('prompt', 'consent');
      
      // Abrir popup
      const popup = window.open(
        authUrl.toString(),
        'google-login',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      if (!popup) {
        setIsLoading(false);
        onError('Popup foi bloqueado pelo navegador');
        return;
      }
      
      // Monitorar o popup
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsLoading(false);
          onError('Login cancelado pelo usuário');
        }
      }, 1000);
      
      // Escutar mensagens do popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup.close();
          setIsLoading(false);
          onSuccess(event.data.token);
          window.removeEventListener('message', handleMessage);
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          clearInterval(checkClosed);
          popup.close();
          setIsLoading(false);
          onError(event.data.error);
          window.removeEventListener('message', handleMessage);
        }
      };
      
      window.addEventListener('message', handleMessage);
      
    } catch (error) {
      setIsLoading(false);
      onError(error);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={disabled || isLoading}
        className="w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-3"></div>
            Conectando com Google...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {text}
          </>
        )}
      </button>
    </div>
  );
} 