
// components/dashboard/charts/CategoryBarChart.js
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ['#10b981']; // Cor principal

export function CategoryBarChart({ data }) {
  // Garantir que a ordem seja do maior para o menor e limitar ao Top 10
  const sortedData = [...data]
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
    .map(item => ({
        name: item.name,
        total: parseFloat(item.value).toFixed(2)
    }));
    
  // Formato para tooltip e eixo
  const formatValue = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  
  if (!sortedData || sortedData.length === 0) {
    return (
        <div className="flex items-center justify-center h-full min-h-[300px] text-center text-muted-foreground">
            <p>Sem dados de categorias para exibir.</p>
        </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        data={sortedData} 
        layout="horizontal" // <<< MANTIDO Horizontal, conforme pedido (ou será Vertical?)
                            // REQUISIÇÃO: Mudar para Vertical. Ajuste abaixo.
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
            dataKey="name" // Categoria no eixo X
            type="category" 
            stroke="#888888" 
            fontSize={12}
            tickLine={false}
            angle={-30} // Rotacionar nomes para caber
            textAnchor="end"
            height={50}
            axisLine={false}
        />
        <YAxis 
            type="number" 
            stroke="#888888" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `R$${value}`}
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
        {/* Usando Bar no lugar de BarChart para renderizar as barras verticais */}
        <Bar dataKey="total" fill={COLORS[0]} radius={[4, 4, 0, 0]} barSize={30} />
      </BarChart>
    </ResponsiveContainer>
  );
}