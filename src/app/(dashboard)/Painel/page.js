// app/(dashboard)/dashboard/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, Package, List, ArrowUpRight } from "lucide-react";
import api from '@/lib/api'; // Nosso cliente Axios

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeSeriesChart } from '../../../components/dashboard/charts/TimeSeriesChart';
import { CategoryPieChart } from '../../../components/dashboard/charts/CategoryPieChart';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; // Importamos o Skeleton
import Link from 'next/link';

// Componente para o estado de carregamento (Skeleton)
const DashboardSkeleton = () => (
    <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-full sm:w-[480px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent><Skeleton className="h-8 w-48" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent><Skeleton className="h-8 w-24" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent><Skeleton className="h-8 w-40" /></CardContent></Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4"><CardHeader><Skeleton className="h-6 w-48 mb-2" /></CardHeader><CardContent><Skeleton className="h-[350px] w-full" /></CardContent></Card>
            <Card className="lg:col-span-3"><CardHeader><Skeleton className="h-6 w-48 mb-2" /></CardHeader><CardContent><Skeleton className="h-[350px] w-full" /></CardContent></Card>
        </div>
        <Card>
            <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between"><Skeleton className="h-5 w-20" /><Skeleton className="h-5 w-40" /><Skeleton className="h-5 w-32" /><Skeleton className="h-5 w-24" /></div>
                    <div className="flex justify-between"><Skeleton className="h-5 w-20" /><Skeleton className="h-5 w-40" /><Skeleton className="h-5 w-32" /><Skeleton className="h-5 w-24" /></div>
                    <div className="flex justify-between"><Skeleton className="h-5 w-20" /><Skeleton className="h-5 w-40" /><Skeleton className="h-5 w-32" /><Skeleton className="h-5 w-24" /></div>
                </div>
            </CardContent>
        </Card>
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

  const fetchData = useCallback(async (currentPeriod) => {
    setLoading(true);
    setError(null);
    try {
        // Buscamos todos os dados em paralelo para mais performance
        const [kpisRes, chartsRes, expensesRes] = await Promise.all([
            api.get(`/dashboard/kpis?period=${currentPeriod}`),
            api.get(`/dashboard/charts?period=${currentPeriod}`),
            api.get(`/dashboard/expenses?period=${currentPeriod}&limit=5`) // Apenas 5 mais recentes
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard de Custos</h1>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Custos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(kpis.totalExpenses || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground">no período selecionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nº de Lançamentos</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.expenseCount || 0}</div>
            <p className="text-xs text-muted-foreground">registros no período</p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Principal Categoria</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-xl font-bold">{kpis.highestCategory.name || 'N/A'}</div>
                <p className="text-xs text-muted-foreground">
                    {(kpis.highestCategory.total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} gastos
                </p>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Evolução dos Custos</CardTitle>
            <CardDescription>Análise dos gastos ao longo do período.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {charts.lineChart.data && charts.lineChart.data.length > 0 ? (
                <TimeSeriesChart data={charts.lineChart.data.map(item => ({ name: item.date, total: item.total }))} />
            ) : (
                <EmptyState message="Sem dados de evolução para exibir." />
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Custos por Categoria</CardTitle>
            <CardDescription>Distribuição percentual dos gastos.</CardDescription>
          </CardHeader>
          <CardContent>
            {charts.pieChart && charts.pieChart.length > 0 ? (
                <CategoryPieChart data={charts.pieChart} />
            ) : (
                <EmptyState message="Sem categorias para exibir." />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
                <CardTitle>Custos Recentes</CardTitle>
                <CardDescription>Os últimos custos registrados no período selecionado.</CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/expenses">
                    Ver Todos
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentExpenses && recentExpenses.length > 0 ? (
                recentExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{new Date(expense.expense_date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.category.name}</TableCell>
                    <TableCell className="text-right">
                        {parseFloat(expense.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        Nenhum custo registrado neste período.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}