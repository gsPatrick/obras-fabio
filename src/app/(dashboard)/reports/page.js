// app/(dashboard)/reports/page.js
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import Papa from "papaparse";
import api from '@/lib/api';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';

const TableSkeleton = () => (
    Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-full max-w-sm" /></TableCell>
            <TableCell><Skeleton className="h-6 w-28" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
        </TableRow>
    ))
);

export default function ReportsPage() {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtros
    const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
    const [selectedCategory, setSelectedCategory] = useState('all');

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ limit: 1000 }); // Pega um grande número para o relatório
            if (dateRange.from) params.append('startDate', format(dateRange.from, 'yyyy-MM-dd'));
            if (dateRange.to) params.append('endDate', format(dateRange.to, 'yyyy-MM-dd'));
            if (selectedCategory !== 'all') params.append('categoryId', selectedCategory);

            // Busca categorias e despesas
            const [categoriesRes, expensesRes] = await Promise.all([
                api.get('/categories'),
                api.get(`/dashboard/expenses?${params.toString()}`)
            ]);
            
            setCategories(categoriesRes.data);
            setExpenses(expensesRes.data.data);
        } catch (err) {
            setError("Falha ao carregar os dados do relatório.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [dateRange, selectedCategory]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);
    
    const handleExport = () => {
        const dataToExport = expenses.map(exp => ({
            Data: format(new Date(exp.expense_date), "yyyy-MM-dd"),
            Descrição: exp.description,
            Categoria: exp.category.name,
            Valor: parseFloat(exp.value).toFixed(2)
        }));

        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }); // Adiciona BOM para Excel
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `relatorio_custos_${format(new Date(), "yyyy-MM-dd")}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Central de Relatórios</h1>
                <p className="text-gray-500">Filtre os dados e exporte planilhas detalhadas dos custos.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <CardTitle>Filtros de Análise</CardTitle>
                        <Button onClick={handleExport} disabled={expenses.length === 0 || loading}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar para Excel (CSV)
                        </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        {/* Date Picker */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("w-full sm:w-[300px] justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? `${format(dateRange.from, "dd/MM/y")} - ${format(dateRange.to, "dd/MM/y")}` : format(dateRange.from, "dd/MM/y")
                                    ) : (<span>Selecione um período</span>)}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                            </PopoverContent>
                        </Popover>

                        {/* Select de Categoria */}
                        <Select onValueChange={setSelectedCategory} defaultValue="all">
                            <SelectTrigger className="w-full sm:w-[280px]">
                                <SelectValue placeholder="Filtrar por categoria..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as Categorias</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {error && <p className="text-red-500 text-center">{error}</p>}
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
                            {loading ? (
                                <TableSkeleton />
                            ) : expenses.length > 0 ? (
                                expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>{format(new Date(expense.expense_date), "dd/MM/yyyy")}</TableCell>
                                        <TableCell className="font-medium">{expense.description}</TableCell>
                                        <TableCell><Badge variant="outline">{expense.category.name}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            {parseFloat(expense.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Nenhum resultado encontrado para os filtros selecionados.
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