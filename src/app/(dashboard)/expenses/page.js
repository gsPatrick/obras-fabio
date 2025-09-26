// app/(dashboard)/expenses/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MoreHorizontal, Search } from "lucide-react";
import api from '@/lib/api';
import { useDebounce } from 'use-debounce'; // precisará instalar: npm install use-debounce

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DeleteConfirmation } from '../../../components/dashboard/DeleteConfirmation';
import { Skeleton } from '@/components/ui/skeleton';

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

const ITEMS_PER_PAGE = 7;

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500); // Adiciona um delay na busca

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
            const response = await api.get(`/dashboard/expenses?${params.toString()}`);
            setExpenses(response.data.data);
            setTotalPages(response.data.totalPages);
            setTotalItems(response.data.totalItems);
        } catch (err) {
            setError("Falha ao carregar as despesas.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearchTerm]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Reseta para a primeira página ao buscar
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm]);

    const handleDelete = async () => {
        try {
            await api.delete(`/dashboard/expenses/${deleteDialog.expenseId}`);
            setDeleteDialog({ open: false, expenseId: null });
            fetchData(); // Recarrega os dados
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
                    <div className="pt-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                type="search" 
                                placeholder="Buscar por descrição..." 
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
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
                            {loading ? (
                                <TableSkeleton />
                            ) : (
                                expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell className="hidden sm:table-cell">{new Date(expense.expense_date).toLocaleDateString('pt-BR')}</TableCell>
                                        <TableCell className="font-medium">{expense.description}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Badge variant="outline">{expense.category.name}</Badge>
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