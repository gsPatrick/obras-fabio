// app/(dashboard)/Painel/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Calendar as CalendarIcon
} from "lucide-react";
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// Componentes UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Gráficos
import { CategoryBarChart } from '@/components/dashboard/charts/CategoryBarChart';
import { CategoryPieChart } from '@/components/dashboard/charts/CategoryPieChart';
import { TimeSeriesChart } from '@/components/dashboard/charts/TimeSeriesChart';

export default function DashboardPage() {
    const { activeProfile } = useAuth();
    
    // Estado para os filtros
    const [period, setPeriod] = useState('monthly');
    
    // Estados de dados
    const [kpis, setKpis] = useState(null);
    const [charts, setCharts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        if (!activeProfile) return;
        
        setLoading(true);
        setError(null);
        try {
            // Busca KPIs e Gráficos em paralelo passando o PERÍODO selecionado
            const [kpisRes, chartsRes] = await Promise.all([
                api.get(`/dashboard/kpis?period=${period}`),
                api.get(`/dashboard/charts?period=${period}`)
            ]);

            setKpis(kpisRes.data);
            setCharts(chartsRes.data);
        } catch (err) {
            console.error("Erro ao carregar dashboard:", err);
            setError("Não foi possível carregar os dados do painel.");
        } finally {
            setLoading(false);
        }
    }, [activeProfile, period]); // Recarrega quando o perfil ou o período muda

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Formatação de moeda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        }).format(value || 0);
    };

    // Texto dinâmico do período para o subtítulo
    const getPeriodLabel = () => {
        switch (period) {
            case 'daily': return 'hoje';
            case 'weekly': return 'nesta semana';
            case 'monthly': return 'neste mês';
            case 'quarterly': return 'neste trimestre';
            case 'yearly': return 'neste ano';
            default: return 'neste período';
        }
    };

    if (!activeProfile) {
        return <div className="p-8 text-center text-muted-foreground">Selecione um perfil para visualizar os dados.</div>;
    }

    if (loading) {
        return <DashboardSkeleton />;
    }

    // Cálculos para a barra de progresso da meta total (Orçamento)
    // Nota: As metas geralmente são mensais, então a comparação faz mais sentido no filtro 'monthly'.
    // Porém, exibimos o cálculo proporcional baseados nos dados retornados.
    const totalSpent = kpis?.totalExpenses || 0;
    const totalBudget = kpis?.totalGoals || 0; 
    const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const isOverBudget = totalSpent > totalBudget;

    return (
        <div className="space-y-8">
            {/* Cabeçalho com Filtro */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Painel Financeiro</h1>
                    <p className="text-muted-foreground">
                        Visão geral de <strong>{activeProfile.name}</strong> {getPeriodLabel()}.
                    </p>
                </div>
                
                {/* Seletor de Período */}
                <div className="flex items-center gap-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Hoje</SelectItem>
                            <SelectItem value="weekly">Esta Semana</SelectItem>
                            <SelectItem value="monthly">Este Mês</SelectItem>
                            <SelectItem value="quarterly">Este Trimestre</SelectItem>
                            <SelectItem value="yearly">Este Ano</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Alertas de Meta (Vindos do Backend) */}
            {kpis?.goalAlert && (
                <Alert variant={kpis.goalAlert.status === 'critical' ? "destructive" : "default"} className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/20">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Atenção à Meta Mensal</AlertTitle>
                    <AlertDescription>
                        {kpis.goalAlert.message}
                    </AlertDescription>
                </Alert>
            )}

            {/* Cards de KPI */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* 1. Receitas */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receitas Totais</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(kpis?.totalRevenues)}</div>
                        <p className="text-xs text-muted-foreground">Entradas confirmadas</p>
                    </CardContent>
                </Card>

                {/* 2. Despesas */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(kpis?.totalExpenses)}</div>
                        <p className="text-xs text-muted-foreground">
                            {kpis?.expenseCount} lançamentos
                        </p>
                    </CardContent>
                </Card>

                {/* 3. Saldo */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo em Caixa</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${kpis?.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(kpis?.balance)}
                        </div>
                        <p className="text-xs text-muted-foreground">Receitas - Despesas</p>
                    </CardContent>
                </Card>

                {/* 4. Meta Total (Orçamento) */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Orçamento (Metas)</CardTitle>
                        <Target className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
                        
                        {/* Só mostra a barra de progresso se houver uma meta definida e o período for mensal (ou se quiser mostrar sempre, remova a condição) */}
                        {totalBudget > 0 ? (
                            <>
                                <div className="mt-2">
                                    <Progress 
                                        value={Math.min(budgetProgress, 100)} 
                                        className={`h-2 ${isOverBudget ? 'bg-red-200' : ''}`} 
                                        indicatorClassName={isOverBudget ? 'bg-red-500' : 'bg-green-500'}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {isOverBudget 
                                        ? `Excedido em ${formatCurrency(totalSpent - totalBudget)}` 
                                        : `Restam ${formatCurrency(totalBudget - totalSpent)}`}
                                </p>
                            </>
                        ) : (
                            <p className="text-xs text-muted-foreground mt-2">Nenhuma meta definida.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Área Gráfica */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                
                {/* Evolução Diária (Linha) */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Fluxo de Caixa</CardTitle>
                        <CardDescription>Evolução das despesas ao longo do tempo.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <TimeSeriesChart data={charts?.lineChart?.data.map((val, i) => ({
                            date: charts.lineChart.labels[i],
                            total: val
                        })) || []} />
                    </CardContent>
                </Card>

                {/* Categorias (Pizza) */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Distribuição por Categoria</CardTitle>
                        <CardDescription>Para onde está indo o dinheiro?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CategoryPieChart data={charts?.pieChart || []} />
                    </CardContent>
                </Card>
            </div>

            {/* Categorias (Barra) - Top Gastos */}
            <Card>
                <CardHeader>
                    <CardTitle>Maiores Gastos por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                    <CategoryBarChart data={charts?.pieChart || []} />
                </CardContent>
            </Card>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-[180px]" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}><CardContent className="p-6"><Skeleton className="h-20" /></CardContent></Card>
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Card><CardContent className="p-6"><Skeleton className="h-[300px]" /></CardContent></Card>
                <Card><CardContent className="p-6"><Skeleton className="h-[300px]" /></CardContent></Card>
            </div>
        </div>
    );
}