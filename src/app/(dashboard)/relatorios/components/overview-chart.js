"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

// O componente agora recebe a propriedade 'data'
export function OverviewChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name" // A API retorna 'name' para o rótulo do eixo X (ex: 'set, 2025')
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`} // Formata o eixo Y
        />
        <Tooltip
            cursor={{ fill: 'transparent' }}
            // Estilos para o tooltip se adequar ao tema light/dark
            contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius-md)'
            }}
        />
        {/* A API retorna 'total' para o valor da barra */}
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}