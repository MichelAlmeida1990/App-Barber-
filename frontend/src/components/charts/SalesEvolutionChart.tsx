'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SalesEvolutionData {
  date: string;
  vendas: number;
  receita: number;
}

interface SalesEvolutionChartProps {
  data: SalesEvolutionData[];
  period: '7d' | '30d' | 'month';
}

export default function SalesEvolutionChart({ data, period }: SalesEvolutionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Nenhum dado disponível</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'vendas' ? 'Vendas' : 'Receita'}:{' '}
              {entry.name === 'vendas' ? (
                <span className="font-medium">{entry.value}</span>
              ) : (
                <span className="font-medium">R$ {entry.value.toFixed(2).replace('.', ',')}</span>
              )}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (period === '7d' || period === '30d') {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const chartData = data.map(item => ({
    ...item,
    dateFormatted: formatDate(item.date)
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="dateFormatted" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          yAxisId="left"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => value.toString()}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="vendas"
          name="Quantidade de Vendas"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="receita"
          name="Receita (R$)"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}


