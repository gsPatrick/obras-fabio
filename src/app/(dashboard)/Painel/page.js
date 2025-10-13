// app/(dashboard)/dashboard/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, List, Package, TrendingUp, Scale } from "lucide-react"; // Adicionado 'Scale' para o Saldo
import api from '@/lib/api'; 

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeSeriesChart } from '../../../components/dashboard/charts/TimeSeriesChart';
import { CategoryPieChart } from '../../../components/dashboard/charts/CategoryPieChart';
import { CategoryBarChart } from '../../../components/dashboard/charts/CategoryBarChart';
import { Skeleton } from '@/components/ui/skeleton'; 
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Componente para o estado de carregamento (Skeleton)
const DashboardSkeleton = () => (
    <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-full sm:w-[480px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent><Skeleton className="h-8 w-48" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent><Skeleton className="h-8 w-48" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent><Skeleton className="h-8 w-24" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent><Skeleton className="h-8 w-40" /></CardContent></Card>
        </div>
        <div className="grid gap-4 lg:grid-cols-7">
            <Card className="lg:col-span-4"><CardHeader><Skeleton className="h-6 w-48 mb-2" /></CardHeader><CardContent><Skeleton className="h-[350px] w-full" /></CardContent></Card>
            <Card className="lg:col-span-3"><CardHeader><Skeleton className="h-6 w-48 mb-2" /></CardHeader><CardContent><Skeleton className="h-[350px] w-full" /></CardContent></Card>
        </div>
        <div className="grid gap-4 lg:grid-cols-7">
            <Card className="lg:col-span-4"><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent><Skeleton className="h-[350px] w-full" /></CardContent></Card>
            <Card className="lg:col-span-3"><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent><Skeleton className="h-[350px] w-full" /></CardContent></Card>
        </div>
    </div>
);

// Componente para exibir quando uma área não tem dados
const EmptyState = ({ message }) => (
    <div className="flex items-center justify-center h-full min-h-[350px] text-center text-muted-foreground">
        <p>{message}</p>
    </div>
);


export default function DashboardPage() {
  const [period, setPeriod] = useState('monthly');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pieChartType, setPieChartType] = useState('category');

  const fetchData = useCallback(async (currentPeriod) => {
    setLoading(true);
    setError(null);
    try {
        const [kpisRes, chartsRes, expensesRes] = await Promise.all([
            api.get(`/dashboard/kpis?period=${currentPeriod}`),
            api.get(`/dashboard/charts?period=${currentPeriod}`),
            api.get(`/dashboard/expenses?period=${currentPeriod}&limit=5`)
        ]);

        setData({
            kpis: kpisRes.data,
            charts: chartsRes.data,
            recentExpenses: expensesRes.data.data,
        });
    } catch (err) {
      setError("Não foi possível carregar os dados do dashboard. Verifique a conexão com a API.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <EmptyState message={error} />;
  }
  
  if (!data) {
    return <EmptyState message="Nenhum dado disponível." />;
  }
  
  const { kpis, charts, recentExpenses } = data;
  
  const pieChartData = pieChartType === 'category' ? charts.pieChart : charts.pieChartByType;
  const pieChartEmptyMessage = pieChartType === 'category' ? "Sem categorias para exibir." : "Sem tipos de custo para exibir.";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Tabs defaultValue={period} onValueChange={setPeriod} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="daily">Diário</TabsTrigger>
            <TabsTrigger value="weekly">Semanal</TabsTrigger>
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
            <TabsTrigger value="quarterly">Trimestral</TabsTrigger>
            <TabsTrigger value="yearly">Anual</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card de Receitas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {(kpis.totalRevenues || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <p className="text-xs text-muted-foreground">no período selecionado</p>
          </CardContent>
        </Card>
        {/* Card de Custos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Custos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", (kpis.totalExpenses || 0) > 0 ? "text-red-600 dark:text-red-400" : "text-foreground")}>
              -{(kpis.totalExpenses || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <p className="text-xs text-muted-foreground">no período selecionado</p>
          </CardContent>
        </Card>
        
        {/* <<< INÍCIO DA MODIFICAÇÃO: NOVO CARD DE SALDO >>> */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo (Lucro / Prejuízo)</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", 
                kpis.balance > 0 ? "text-green-600 dark:text-green-400" : 
                kpis.balance < 0 ? "text-red-600 dark:text-red-400" : "text-foreground"
            )}>
              {(kpis.balance || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <p className="text-xs text-muted-foreground">Receitas - Custos no período</p>
          </CardContent>
        </Card>
        {/* <<< FIM DA MODIFICAÇÃO >>> */}

        {/* Card de Lançamentos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nº de Lançamentos (Custos)</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.expenseCount || 0}</div>
            <p className="text-xs text-muted-foreground">registros no período</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 lg:grid-cols-7"> 
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Evolução dos Custos (Série Temporal)</CardTitle>
            <CardDescription>Análise dos gastos ao longo do período selecionado.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {charts.lineChart.data && charts.lineChart.data.length > 0 ? (
                <TimeSeriesChart data={charts.lineChart.labels.map((date, index) => ({ date: date, total: charts.lineChart.data[index] }))} />
            ) : (
                <EmptyState message="Sem dados de evolução para exibir." />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Distribuição de Custos (%)</CardTitle>
            <CardDescription>
                {pieChartType === 'category'
                    ? 'Distribuição percentual dos gastos por categoria.'
                    : 'Distribuição percentual dos gastos por tipo de custo.'}
            </CardDescription>
            <Tabs defaultValue="category" onValueChange={setPieChartType} className="w-full pt-2">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="category">Por Categoria</TabsTrigger>
                    <TabsTrigger value="type">Por Tipo</TabsTrigger>
                </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {pieChartData && pieChartData.length > 0 ? (
                <CategoryPieChart data={pieChartData} />
            ) : (
                <EmptyState message={pieChartEmptyMessage} />
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
            <CardHeader>
                <CardTitle>Top 5 Categorias (Acumulado)</CardTitle>
                <CardDescription>Categorias com o maior volume de gastos no período.</CardDescription>
            </CardHeader>
            <CardContent>
                {charts.pieChart && charts.pieChart.length > 0 ? (
                    <CategoryBarChart data={charts.pieChart} />
                ) : (
                    <EmptyState message="Sem dados para exibir." />
                )}
            </CardContent>
        </Card>

        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Custos Recentes</CardTitle>
                <CardDescription>Os últimos custos registrados no período.</CardDescription>
                <div className="ml-auto">
                    <Link href="/expenses" className="text-sm font-medium text-blue-600 hover:underline">
                        Ver Todos
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {recentExpenses && recentExpenses.length > 0 ? (
                    recentExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                        <TableCell className="font-medium">{new Date(expense.expense_date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{expense.description.substring(0, 30)}...</TableCell>
                        <TableCell className="text-right">
                            {parseFloat(expense.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                            Nenhum custo registrado neste período.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}