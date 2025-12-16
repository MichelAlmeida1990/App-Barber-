/**
 * Configuração centralizada da API
 * 
 * Em desenvolvimento: usa http://localhost:8000
 * Em produção: usa NEXT_PUBLIC_API_URL da variável de ambiente
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = 'v1';
const API_PREFIX = `${API_BASE_URL}/api/${API_VERSION}`;

/**
 * URLs completas dos endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_PREFIX}/auth/login`,
    REGISTER: `${API_PREFIX}/auth/register`,
    GOOGLE: `${API_PREFIX}/auth/google`,
    ME: `${API_PREFIX}/auth/me`,
    CREATE_TEST_DATA: `${API_PREFIX}/auth/create-test-data`,
  },
  
  // Appointments
  APPOINTMENTS: {
    BASE: `${API_PREFIX}/appointments`,
    MY_APPOINTMENTS: `${API_PREFIX}/appointments/my-appointments`,
    BARBER_APPOINTMENTS: `${API_PREFIX}/appointments/barber-appointments`,
    STATUS_SIMPLE: (id: number) => `${API_PREFIX}/appointments/${id}/status-simple`,
  },
  
  // Barbers
  BARBERS: {
    BASE: `${API_PREFIX}/barbers`,
    LIST: `${API_PREFIX}/barbers/`,
  },
  
  // Services
  SERVICES: {
    BASE: `${API_PREFIX}/services`,
    LIST: `${API_PREFIX}/services/`,
  },
  
  // Clients
  CLIENTS: {
    BASE: `${API_PREFIX}/clients`,
  },
  
  // Commissions
  COMMISSIONS: {
    ALL: `${API_PREFIX}/commissions/all`,
    SUMMARY: `${API_PREFIX}/commissions/summary`,
    AUTO_GENERATE: `${API_PREFIX}/commissions/auto-generate`,
  },
  
  // Barber Blocks
  BARBER_BLOCKS: {
    BASE: `${API_PREFIX}/barber-blocks`,
    LIST: `${API_PREFIX}/barber-blocks`,
    CREATE: `${API_PREFIX}/barber-blocks`,
    UPDATE: (id: number) => `${API_PREFIX}/barber-blocks/${id}`,
    DELETE: (id: number) => `${API_PREFIX}/barber-blocks/${id}`,
    TOGGLE: (id: number) => `${API_PREFIX}/barber-blocks/${id}/toggle`,
  },
  
  // Analytics
  ANALYTICS: {
    BASE: `${API_PREFIX}/analytics`,
  },
  
  // Health
  HEALTH: `${API_BASE_URL}/health`,
} as const;

/**
 * Função helper para fazer requisições autenticadas
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Pequenos wrappers de API usados pelas telas admin.
 * Mantém compatibilidade com imports existentes (ex.: { servicesAPI }).
 */
async function apiTest(url: string) {
  const response = await authenticatedFetch(url, { method: 'GET' });
  if (!response.ok) {
    throw new Error(`API test failed (${response.status})`);
  }
  // manter formato parecido com axios: { data }
  const data = await response.json().catch(() => ({}));
  return { data };
}

export const appointmentsAPI = {
  test: () => apiTest(API_ENDPOINTS.APPOINTMENTS.BASE),
};

export const analyticsAPI = {
  test: () => apiTest(API_ENDPOINTS.ANALYTICS.BASE),
};

export const servicesAPI = {
  test: () => apiTest(API_ENDPOINTS.SERVICES.BASE),
};

// Alguns endpoints existem no backend, mas nem todos estão listados em API_ENDPOINTS.
// Para as telas atuais, precisamos só do "test" e do "create" em sales.
export const productsAPI = {
  test: () => apiTest(`${API_PREFIX}/products`),
};

export const salesAPI = {
  test: () => apiTest(`${API_PREFIX}/sales`),
  create: async (payload: any) => {
    const response = await authenticatedFetch(`${API_PREFIX}/sales`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.text().catch(() => '');
      throw new Error(err || `Erro ao criar venda (${response.status})`);
    }
    const data = await response.json().catch(() => ({}));
    return { data };
  },
};

/**
 * Exportar URL base para uso em outros lugares
 */
export { API_BASE_URL, API_PREFIX };
