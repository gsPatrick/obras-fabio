"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

// Dados mockados para o gráfico
const data = [
  { name: "Jan", total: Math.floor(Math.random() * 20) + 5 },
  { name: "Fev", total: Math.floor(Math.random() * 20) + 5 },
  { name: "Mar", total: Math.floor(Math.random() * 20) + 5 },
  { name: "Abr", total: Math.floor(Math.random() * 20) + 5 },
  { name: "Mai", total: Math.floor(Math.random() * 20) + 5 },
  { name: "Jun", total: Math.floor(Math.random() * 20) + 5 },
  { name: "Jul", total: Math.floor(Math.random() * 20) + 5 },
  { name: "Ago", total: Math.floor(Math.random() * 20) + 5 },
  { name: "Set", total: Math.floor(Math.random() * 20) + 5 },
  { name: "Out", total: Math.floor(Math.random() * 20) + 5 },
  { name: "Nov", total: Math.floor(Math.random() * 20) + 5 },
  { name: "Dez", total: Math.floor(Math.random() * 20) + 5 },
]

export function OverviewChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
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
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
            cursor={{ fill: 'transparent' }}
            contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
        />
        <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}