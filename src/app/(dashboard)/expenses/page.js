// app/(dashboard)/expenses/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MoreHorizontal, Search, Calendar as CalendarIcon } from "lucide-react"; // Adicionado CalendarIcon
import { format } from "date-fns"; // Adicionado format
import api from '@/lib/api';
import { useDebounce } from 'use-debounce';

import { cn } from "@/lib/utils"; // Adicionado cn
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DeleteConfirmation } from '../../../components/dashboard/DeleteConfirmation';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Adicionado Popover
import { Calendar } from "@/components/ui/calendar"; // Adicionado Calendar
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Adicionado Select

const TableSkeleton = () => (
    Array.from({ length: 7 }).map((_, index) => (
        <TableRow key={index}>
            <TableCell><Skeleton className="h-5 w-24 hidden sm:block" /></TableCell>
            <TableCell><Skeleton className="h-5 w-full max-w-xs" /></TableCell>
            <TableCell><Skeleton className="h-6 w-28 hidden md:block" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
    ))
);

const ITEMS_PER_PAGE = 10; // Aumentado para 10 para melhor visualização

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- INÍCIO: NOVOS ESTADOS PARA FILTROS ---
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
    const [selectedCategory, setSelectedCategory] = useState('all');
    // --- FIM: NOVOS ESTADOS PARA FILTROS ---

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [deleteDialog, setDeleteDialog] = useState({ open: false, expenseId: null });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                description: debouncedSearchTerm,
            });
            // Adicionando os novos filtros aos parâmetros da busca
            if (dateRange.from) params.append('startDate', format(dateRange.from, 'yyyy-MM-dd'));
            if (dateRange.to) params.append('endDate', format(dateRange.to, 'yyyy-MM-dd'));
            if (selectedCategory !== 'all') params.append('categoryId', selectedCategory);

            const [categoriesRes, expensesRes] = await Promise.all([
                api.get('/categories'),
                api.get(`/dashboard/expenses?${params.toString()}`)
            ]);
            
            setCategories(categoriesRes.data);
            setExpenses(expensesRes.data.data);
            setTotalPages(expensesRes.data.totalPages);
            setTotalItems(expensesRes.data.totalItems);
        } catch (err) {
            setError("Falha ao carregar as despesas.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearchTerm, dateRange, selectedCategory]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, dateRange, selectedCategory]);

    const handleDelete = async () => {
        try {
            await api.delete(`/dashboard/expenses/${deleteDialog.expenseId}`);
            setDeleteDialog({ open: false, expenseId: null });
            fetchData();
        } catch (err) {
            console.error("Falha ao deletar despesa", err);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Relatório de Custos</CardTitle>
                    <CardDescription>Visualize, filtre e gerencie todos os custos registrados.</CardDescription>
                    {/* --- INÍCIO: ÁREA DE FILTROS --- */}
                    <div className="pt-4 flex flex-col md:flex-row gap-4">
                        <div className="relative w-full md:max-w-xs">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                type="search" 
                                placeholder="Buscar por descrição..." 
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("w-full md:w-[300px] justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}
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
                        <Select onValueChange={setSelectedCategory} defaultValue="all">
                            <SelectTrigger className="w-full md:w-[280px]">
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
                    {/* --- FIM: ÁREA DE FILTROS --- */}
                </CardHeader>
                <CardContent>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden sm:table-cell">Data</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                <TableHead><span className="sr-only">Ações</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? ( <TableSkeleton /> ) : expenses.length > 0 ? (
                                expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell className="hidden sm:table-cell">{new Date(expense.expense_date).toLocaleDateString('pt-BR')}</TableCell>
                                        <TableCell className="font-medium">{expense.description}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Badge variant="outline">{expense.category?.name || 'N/A'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {parseFloat(expense.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuItem>Editar</DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        className="text-red-500 focus:text-white focus:bg-red-500"
                                                        onClick={() => setDeleteDialog({ open: true, expenseId: expense.id })}
                                                    >
                                                        Deletar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">Nenhuma despesa encontrada para os filtros selecionados.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Mostrando <strong>{expenses.length}</strong> de <strong>{totalItems}</strong> despesas
                    </div>
                    {totalPages > 1 && (
                        <Pagination className="ml-auto">
                        <PaginationContent>
                            <PaginationItem>
                            <PaginationPrevious 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                                disabled={currentPage === 1}
                            />
                            </PaginationItem>
                            <PaginationItem>
                            <PaginationNext 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                                disabled={currentPage === totalPages}
                            />
                            </PaginationItem>
                        </PaginationContent>
                        </Pagination>
                    )}
                </CardFooter>
            </Card>
            <DeleteConfirmation 
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, expenseId: null })}
                onConfirm={handleDelete}
                title="Deletar Despesa?"
                description="Isso excluirá o registro da despesa permanentemente."
            />
        </>
    );
}