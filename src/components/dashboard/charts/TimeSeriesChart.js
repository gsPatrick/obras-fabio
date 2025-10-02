// components/dashboard/charts/TimeSeriesChart.js
'use client';

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TimeSeriesChart({ data }) {
    // ... (formatValue e formatLabel inalterados)
    
    // Converte a data (YYYY-MM-DD) para um formato mais curto (MM/DD)
    const formatLabel = (label) => {
        const parts = label.split('-');
        if (parts.length === 3) {
            const date = new Date(label);
            return date.toLocaleDateString('pt-BR', { month: 'short' });
        }
        return label;
    };
    
    // ... (checa de dados)
    
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date" 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatLabel} 
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip
                    cursor={{ stroke: '#8b5cf6', strokeWidth: 2 }} // Cor do cursor roxo
                    contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid #ccc',
                        borderRadius: '0.5rem'
                    }}
                    formatter={(value) => [`R$${value}`, 'Custo']}
                    labelFormatter={(label) => `Período: ${label}`}
                />
                <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#8b5cf6" // <<< COR DA LINHA ALTERADA PARA ROXO/VIOLETA
                    strokeWidth={2} 
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}