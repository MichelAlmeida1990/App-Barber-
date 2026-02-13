let idCounter = 1;

// Gerador de ID consistente e sequencial
export function generateId(prefix: string = 'item'): string {
  // Durante o SSR, usar apenas o contador para ser determinístico
  if (typeof window === 'undefined') {
    return `${prefix}_${idCounter++}`;
  }
  // No cliente, adicionar timestamp para garantir unicidade
  return `${prefix}_${idCounter++}_${Date.now()}`;
}

// Formatação de data consistente entre servidor e cliente
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    // Usar toISOString e formatar manualmente para evitar problemas de timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

// Formatação de data com dia da semana consistente
export function formatDateWithWeekday(dateString: string): string {
  try {
    // Se a data já está no formato YYYY-MM-DD, usar diretamente
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      const weekday = weekdays[date.getDay()];
      const dayStr = String(date.getDate()).padStart(2, '0');
      const monthStr = months[date.getMonth()];
      
      return `${weekday}, ${dayStr} ${monthStr}`;
    } else {
      // Para outros formatos, usar a conversão normal
      const date = new Date(dateString);
      const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      const weekday = weekdays[date.getDay()];
      const day = String(date.getDate()).padStart(2, '0');
      const month = months[date.getMonth()];
      
      return `${weekday}, ${day} ${month}`;
    }
  } catch {
    return dateString;
  }
}

// Função para verificar se está no cliente
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

// Hook para valor que só existe no cliente
export function useClientValue<T>(clientValue: T, serverValue: T): T {
  return isClient() ? clientValue : serverValue;
} 