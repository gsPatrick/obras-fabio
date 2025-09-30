// components/dashboard/charts/TimeSeriesChart.js
// RENOMEADO para ser mais preciso: LineChart, para simular a evolução do cliente
'use client';

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TimeSeriesChart({ data }) {
    // Formato para tooltip e eixo
    const formatValue = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // Converte a data (YYYY-MM-DD) para um formato mais curto (MM/DD)
    const formatLabel = (label) => {
        const parts = label.split('-');
        if (parts.length === 3) {
            // Se for mês (M), mostra Jan, Fev...
            const date = new Date(label);
            return date.toLocaleDateString('pt-BR', { month: 'short' });
        }
        // Se for dia (D), mostra o dia
        return label;
    };
    
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full min-h-[350px] text-center text-muted-foreground">
                <p>Sem dados de evolução para exibir.</p>
            </div>
        );
    }
    
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date" // Agora é 'date' (campo de data formatada)
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatLabel} // Usa o novo formatador
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip
                    cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                    contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid #ccc',
                        borderRadius: '0.5rem'
                    }}
                    formatter={(value) => [formatValue(value), 'Custo']}
                    labelFormatter={(label) => `Período: ${label}`}
                />
                <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" // Cor principal
                    strokeWidth={2} 
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}