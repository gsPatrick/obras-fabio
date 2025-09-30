// components/dashboard/charts/CategoryBarChart.js
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ['#3b82f6']; // Cor principal

export function CategoryBarChart({ data }) {
  // Garantir que a ordem seja do maior para o menor e limitar ao Top 5
  const sortedData = [...data]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map(item => ({
        name: item.name,
        total: parseFloat(item.value).toFixed(2)
    }));
    
  // Formato para tooltip e eixo
  const formatValue = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (!sortedData || sortedData.length === 0) {
    return (
        <div className="flex items-center justify-center h-full min-h-[350px] text-center text-muted-foreground">
            <p>Sem dados de categorias para exibir.</p>
        </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        data={sortedData} 
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
            type="number" 
            stroke="#888888" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `R$${value}`}
        />
        <YAxis 
            dataKey="name" 
            type="category" 
            stroke="#888888" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={120} // Espaço para o nome da categoria
        />
        <Tooltip
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid #ccc',
                borderRadius: '0.5rem'
            }}
            formatter={(value) => [formatValue(value), 'Total']}
            labelFormatter={(label) => `Categoria: ${label}`}
        />
        <Bar dataKey="total" fill={COLORS[0]} radius={[4, 4, 4, 4]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}