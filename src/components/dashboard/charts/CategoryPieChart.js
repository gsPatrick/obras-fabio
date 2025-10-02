// components/dashboard/charts/CategoryPieChart.js
'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

// NOVA PALETA DE CORES (inspirada no turquesa/roxo/azul da referência)
const COLORS = ['#22d3ee', '#3b82f6', '#8b5cf6', '#10b981', '#4ade80', '#ec4899', '#f97316', '#ef4444', '#f59e0b', '#06b6d4'];

// Função para formatar o valor na tooltip
const formatValue = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function CategoryPieChart({ data }) {
  if (!data || data.length === 0) {
    return (
        <div className="flex items-center justify-center h-full min-h-[350px] text-center text-muted-foreground">
            <p>Sem categorias para exibir.</p>
        </div>
    );
  }
  
  const total = data.reduce((sum, entry) => sum + parseFloat(entry.value), 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      const percentage = total > 0 ? (entry.value / total) * 100 : 0;
      return (
        <div className="bg-white p-2 border rounded-md shadow-lg text-sm dark:bg-gray-900">
          <p className="font-semibold">{entry.name}</p>
          <p>Valor: {formatValue(entry.value)}</p>
          <p>Percentual: {percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };


  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Tooltip content={<CustomTooltip />} />
        <Legend layout="vertical" verticalAlign="middle" align="right" />
        <Pie
          data={data}
          cx="30%" 
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}