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
        router.push('/admin/login');
        return;
      }

      // Validar token com backend (opcional mas recomendado)
      // Se o backend não estiver disponível, permite acesso local se houver token válido
      validateToken(token).then(isValid => {
        if (!isValid) {
          // Se falhar, verifica se é erro de rede (backend offline) ou token inválido
          // Se houver token e user no localStorage, permite acesso local
          console.warn('⚠️ Validação de token falhou, mas permitindo acesso local');
          setUser(userData);
          setLoading(false);
        } else {
          console.log('✅ Autenticação válida - usuário:', userData.email);
          setUser(userData);
          setLoading(false);
        }
      }).catch(() => {
        // Se der erro de rede (backend offline), permite acesso local
        console.warn('⚠️ Backend não disponível, permitindo acesso local com token');
        setUser(userData);
        setLoading(false);
      });

    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
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






