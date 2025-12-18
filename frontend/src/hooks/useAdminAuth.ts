import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

export function useAdminAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      // Verificar se há token
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        console.log('❌ Sem autenticação - redirecionando para login');
        setLoading(false);
        router.push('/admin/login');
        return;
      }

      // Parse do usuário
      const userData = JSON.parse(userStr);

      // Verificar se é admin ou barber
      if (userData.role !== 'admin' && userData.role !== 'barber') {
        console.log('❌ Acesso negado - role:', userData.role);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        router.push('/admin/login');
        return;
      }

      // Permitir acesso imediato se houver token e user válidos
      // Validação do backend será feita em background (não bloqueia)
      console.log('✅ Token encontrado - permitindo acesso imediato');
      setUser(userData);
      setLoading(false);
      
      // Validar token com backend em background (opcional)
      // Não bloqueia o acesso se o backend estiver offline
      validateToken(token)
        .then(isValid => {
          if (isValid) {
            console.log('✅ Token validado com sucesso no backend');
          } else {
            console.warn('⚠️ Validação de token falhou, mas acesso já foi permitido');
          }
        })
        .catch(() => {
          console.warn('⚠️ Backend não disponível, mas acesso já foi permitido');
        });

    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setLoading(false);
      router.push('/admin/login');
    }
  };

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      // Timeout de 3 segundos para não travar
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      // Se der erro (rede, timeout, etc), retorna false mas não bloqueia
      console.warn('Erro ao validar token (backend pode estar offline):', error);
      return false; // Retorna false mas o código acima trata isso permitindo acesso local
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  return { user, loading, logout };
}






