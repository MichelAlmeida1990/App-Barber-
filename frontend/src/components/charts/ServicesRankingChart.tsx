'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ServiceRanking {
  service_id: number;
  service_name: string;
  category: string;
  times_sold: number;
  total_revenue: number;
  price: number;
}

interface ServicesRankingChartProps {
  data: ServiceRanking[];
}

export default function ServicesRankingChart({ data }: ServicesRankingChartProps) {
  // Cores vibrantes para cada serviço
  const COLORS = [
    '#3b82f6', // Azul
    '#10b981', // Verde
    '#f59e0b', // Laranja
    '#ef4444', // Vermelho
    '#8b5cf6', // Roxo
    '#ec4899', // Rosa
    '#14b8a6', // Teal
    '#f97316', // Orange
  ];

  // Filtrar apenas serviços com vendas
  const chartData = data
    .filter(item => item.times_sold > 0)
    .map(item => ({
      name: item.service_name,
      value: item.times_sold,
      revenue: item.total_revenue
    }));

  // Se não houver dados, mostrar serviços base com valores mock
  const displayData = chartData.length > 0 ? chartData : data.slice(0, 5).map((item, index) => ({
    name: item.service_name,
    value: 10 - index * 2, // Valores mock decrescentes
    revenue: item.price * (10 - index * 2)
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-800 mb-2">{data.name}</p>
          <p className="text-xs text-gray-600">
            <span className="font-medium">Vendas:</span> {data.value}
          </p>
          <p className="text-xs text-green-600">
            <span className="font-medium">Receita:</span> R$ {data.payload.revenue.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Não mostrar label se < 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full h-[400px]">
      {displayData.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Nenhum serviço vendido no período</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => {
                return `${value} (${entry.payload.value})`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
      
      {chartData.length === 0 && (
        <p className="text-xs text-gray-400 text-center mt-2">
          * Dados mock para demonstração
        </p>
      )}
    </div>
  );
}






