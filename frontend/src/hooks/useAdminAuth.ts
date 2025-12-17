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
      validateToken(token).then(isValid => {
        if (!isValid) {
          console.log('❌ Token inválido - redirecionando para login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/admin/login');
        } else {
          console.log('✅ Autenticação válida - usuário:', userData.email);
          setUser(userData);
          setLoading(false);
        }
      });

    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      router.push('/admin/login');
    }
  };

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  return { user, loading, logout };
}






