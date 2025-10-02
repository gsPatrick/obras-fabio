// app/(dashboard)/reports/page.js
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
// REMOVIDO: import Papa from "papaparse";
import * as XLSX from 'xlsx/xlsx.mjs'; // <<< IMPORTAR A BIBLIOTECA XLSX
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
    
    // <<< INÍCIO: Nova função de exportação XLSX >>>
    const handleExport = () => {
        if (expenses.length === 0) return;

        // 1. Prepara os dados da tabela
        const dataToExport = expenses.map(exp => ({
            Data: format(new Date(exp.expense_date), "dd/MM/yyyy"), // Formato DD/MM/YYYY
            Descrição: exp.description,
            Categoria: exp.category?.name || 'N/A',
            Valor: parseFloat(exp.value) // Manter como número para cálculo no Excel
        }));

        // 2. Calcula o total geral
        const totalGeral = expenses.reduce((sum, exp) => sum + parseFloat(exp.value), 0);

        // 3. Converte os dados da tabela para a planilha (Worksheet)
        const ws = XLSX.utils.json_to_sheet(dataToExport);

        // 4. Adiciona a linha de Total Geral (Ex: na próxima linha após os dados)
        // A próxima linha é a linha inicial dos dados (linha 2) + o número de despesas.
        const nextRow = expenses.length + 2; 

        // Define a célula do rótulo "Total Geral" (Coluna A, linha N)
        XLSX.utils.sheet_add_aoa(ws, [["TOTAL GERAL:"]], { origin: `A${nextRow}` });
        
        // Define a célula do valor total (Coluna D, linha N)
        XLSX.utils.sheet_add_aoa(ws, [[totalGeral]], { origin: `D${nextRow}` });

        // 5. Aplica formatação de moeda na coluna Valor (D) e na célula do Total Geral (D)
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let R = range.s.r + 1; R <= range.e.r; ++R) { // Percorre da 2ª linha até a última linha de dados
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: 3 }); // Coluna D (índice 3)
            if (ws[cellAddress]) {
                ws[cellAddress].z = 'R$#,##0.00'; // Formato de moeda brasileiro
            }
        }
        // Aplica o formato de moeda ao Total Geral
        const totalCellAddress = `D${nextRow}`;
        if (ws[totalCellAddress]) {
            ws[totalCellAddress].z = 'R$#,##0.00';
            // Opcional: Estilo em negrito para o Total Geral (XLSX.js não é forte em estilos simples)
        }

        // 6. Cria o Workbook e adiciona a Worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Despesas Detalhadas");

        // 7. Salva o arquivo como XLSX
        XLSX.writeFile(wb, `relatorio_despesas_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`);
    };
    // <<< FIM: Nova função de exportação XLSX >>>

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
                            Exportar para Excel (XLSX)
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
                                        <TableCell><Badge variant="outline">{expense.category?.name || 'N/A'}</Badge></TableCell>
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