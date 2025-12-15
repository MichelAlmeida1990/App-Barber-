'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface BarberPerformance {
  barber_id: number;
  barber_name: string;
  total_appointments: number;
  total_revenue: number;
  average_rating: number;
  average_revenue_per_appointment: number;
}

interface BarbersPerformanceChartProps {
  data: BarberPerformance[];
  metric?: 'appointments' | 'revenue' | 'rating';
}

export default function BarbersPerformanceChart({ 
  data, 
  metric = 'revenue' 
}: BarbersPerformanceChartProps) {
  
  // Cores para cada barbeiro (gradiente)
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Determinar qual métrica mostrar
  const getMetricData = () => {
    switch (metric) {
      case 'appointments':
        return {
          dataKey: 'total_appointments',
          name: 'Agendamentos',
          color: '#3b82f6',
          formatter: (value: number) => value.toString()
        };
      case 'rating':
        return {
          dataKey: 'average_rating',
          name: 'Avaliação Média',
          color: '#f59e0b',
          formatter: (value: number) => value.toFixed(1)
        };
      default: // revenue
        return {
          dataKey: 'total_revenue',
          name: 'Receita (R$)',
          color: '#10b981',
          formatter: (value: number) => `R$ ${value.toFixed(2)}`
        };
    }
  };

  const metricConfig = getMetricData();

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-800 mb-3">{data.barber_name}</p>
          <div className="space-y-1">
            <p className="text-xs text-gray-600">
              <span className="font-medium">Agendamentos:</span> {data.total_appointments}
            </p>
            <p className="text-xs text-gray-600">
              <span className="font-medium">Receita:</span> R$ {data.total_revenue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600">
              <span className="font-medium">Avaliação:</span> {data.average_rating.toFixed(1)} ⭐
            </p>
            <p className="text-xs text-gray-600">
              <span className="font-medium">Média/Agendamento:</span> R$ {data.average_revenue_per_appointment.toFixed(2)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={metricConfig.formatter}
          />
          <YAxis 
            type="category"
            dataKey="barber_name" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={() => metricConfig.name}
            wrapperStyle={{ paddingTop: '20px' }}
          />
          <Bar 
            dataKey={metricConfig.dataKey}
            radius={[0, 8, 8, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}




