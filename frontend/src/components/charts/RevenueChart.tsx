'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueData {
  period: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  periodType?: 'daily' | 'weekly' | 'monthly';
}

export default function RevenueChart({ data, periodType = 'daily' }: RevenueChartProps) {
  // Formatar o label do período
  const formatPeriod = (period: string) => {
    if (periodType === 'monthly') {
      const [year, month] = period.split('-');
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${monthNames[parseInt(month) - 1]}/${year.slice(2)}`;
    }
    if (periodType === 'weekly') {
      const date = new Date(period);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }
    // daily
    const date = new Date(period);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Formatar valor em reais
  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 mb-1">{formatPeriod(label)}</p>
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="period" 
            tickFormatter={formatPeriod}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            tickFormatter={(value) => `R$ ${value}`}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={() => 'Receita'}
            wrapperStyle={{ paddingTop: '20px' }}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}






