'use client';

import { CheckCircleIcon, CalendarIcon, ClockIcon, UserIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface BookingConfirmationProps {
  appointmentCode: string;
  barberName?: string;
  services?: string[];
  date?: string;
  time?: string;
  total?: number;
  onClose: () => void;
}

export default function BookingConfirmation({
  appointmentCode,
  barberName,
  services,
  date,
  time,
  total,
  onClose
}: BookingConfirmationProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appointmentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-400 rounded-2xl max-w-2xl w-full p-8 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Ícone de Sucesso */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full p-4">
            <CheckCircleIcon className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Título */}
        <h2 className="text-3xl font-bold text-center text-white mb-2">
          Agendamento Confirmado!
        </h2>
        <p className="text-center text-gray-400 mb-8">
          Seu horário foi reservado com sucesso
        </p>

        {/* Código do Agendamento */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-6 mb-6">
          <p className="text-center text-black text-sm font-semibold mb-2">
            Código do Agendamento
          </p>
          <div className="flex items-center justify-center gap-3">
            <p className="text-4xl font-bold text-black tracking-wider">
              {appointmentCode}
            </p>
            <button
              onClick={handleCopyCode}
              className="bg-black/20 hover:bg-black/30 rounded-lg p-2 transition-colors"
              title="Copiar código"
            >
              <DocumentDuplicateIcon className="w-6 h-6 text-black" />
            </button>
          </div>
          {copied && (
            <p className="text-center text-black text-sm mt-2">
              ✓ Código copiado!
            </p>
          )}
          <p className="text-center text-black/80 text-sm mt-3">
            Use este código para consultar, reagendar ou cancelar
          </p>
        </div>

        {/* Detalhes do Agendamento */}
        {(barberName || date || services || total) && (
          <div className="space-y-4 mb-6">
            {barberName && (
              <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-4">
                <div className="bg-blue-500/20 rounded-lg p-3">
                  <UserIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Barbeiro</p>
                  <p className="text-white font-semibold">{barberName}</p>
                </div>
              </div>
            )}

            {date && time && (
              <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-4">
                <div className="bg-green-500/20 rounded-lg p-3">
                  <CalendarIcon className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Data e Horário</p>
                  <p className="text-white font-semibold">{date} às {time}</p>
                </div>
              </div>
            )}

            {services && services.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-purple-500/20 rounded-lg p-3">
                    <ClockIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Serviços</p>
                  </div>
                </div>
                <ul className="ml-16 space-y-1">
                  {services.map((service, idx) => (
                    <li key={idx} className="text-white text-sm">• {service}</li>
                  ))}
                </ul>
              </div>
            )}

            {total !== undefined && (
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-medium">Valor Total</span>
                  <span className="text-2xl font-bold text-green-400">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informações Adicionais */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <p className="text-blue-300 text-sm text-center">
            <strong>📱 Dica:</strong> Salve o código do agendamento! Você receberá um lembrete próximo ao horário marcado.
          </p>
        </div>

        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold py-4 rounded-lg transition-all transform hover:scale-105"
        >
          Entendi, Obrigado!
        </button>
      </div>
    </div>
  );
}

