'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WeekdayData {
  weekday: string;
  appointments: number;
  revenue: number;
}

interface WeekdayChartProps {
  data: WeekdayData[];
  showRevenue?: boolean;
}

export default function WeekdayChart({ data, showRevenue = true }: WeekdayChartProps) {
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
          <p className="text-sm text-blue-600">
            <span className="font-medium">Agendamentos:</span> {payload[0].value}
          </p>
          {showRevenue && payload[1] && (
            <p className="text-sm text-green-600">
              <span className="font-medium">Receita:</span> R$ {payload[1].value.toFixed(2)}
            </p>
          )}
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
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="weekday" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar 
            dataKey="appointments" 
            fill="#3b82f6" 
            name="Agendamentos"
            radius={[8, 8, 0, 0]}
          />
          {showRevenue && (
            <Bar 
              dataKey="revenue" 
              fill="#10b981" 
              name="Receita (R$)"
              radius={[8, 8, 0, 0]}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}











