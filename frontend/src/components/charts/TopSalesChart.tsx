'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface TopSale {
  name: string;
  valor: number;
  quantidade: number;
}

interface TopSalesChartProps {
  data: TopSale[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function TopSalesChart({ data }: TopSalesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Nenhum dado disponível</p>
      </div>
    );
  }

  const chartData = data.slice(0, 5).map((item, index) => ({
    ...item,
    valor: Number(item.valor.toFixed(2))
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Total: <span className="font-medium text-green-600">R$ {data.valor.toFixed(2).replace('.', ',')}</span>
          </p>
          <p className="text-sm text-gray-600">
            Quantidade: <span className="font-medium">{data.quantidade}</span> vendas
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="valor" name="Valor Total (R$)" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}


