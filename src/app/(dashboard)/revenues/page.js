// app/(dashboard)/revenues/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import api from '@/lib/api';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Skeleton } from '@/components/ui/skeleton';
import { DeleteConfirmation } from '@/components/dashboard/DeleteConfirmation';
import { RevenueFormModal } from '@/components/dashboard/revenues/RevenueFormModal';

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

const ITEMS_PER_PAGE = 10;

export default function RevenuesPage() {
    const [revenues, setRevenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [modalState, setModalState] = useState({ type: null, data: null }); // type: 'form' | 'delete'

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ page: currentPage, limit: ITEMS_PER_PAGE });
            const response = await api.get(`/dashboard/revenues?${params.toString()}`);
            
            setRevenues(response.data.data);
            setTotalPages(response.data.totalPages);
            setTotalItems(response.data.totalItems);
        } catch (err) {
            setError("Falha ao carregar as entradas.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async (revenueData) => {
        const isEditing = !!modalState.data?.id;
        const method = isEditing ? 'put' : 'post';
        const url = isEditing ? `/dashboard/revenues/${modalState.data.id}` : '/dashboard/revenues';

        try {
            await api[method](url, revenueData);
            setModalState({ type: null, data: null });
            fetchData();
        } catch (err) {
            console.error("Falha ao salvar entrada", err);
            throw err;
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/dashboard/revenues/${modalState.data.id}`);
            setModalState({ type: null, data: null });
            fetchData();
        } catch (err) {
            console.error("Falha ao deletar entrada", err);
            alert(err.response?.data?.error || "Erro ao deletar.");
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Entradas / Receitas</h1>
                    <p className="text-gray-500">Gerencie todos os recursos que entraram no seu projeto.</p>
                </div>
                <Button onClick={() => setModalState({ type: 'form', data: null })}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Nova Entrada
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Entradas</CardTitle>
                    <CardDescription>Visualize e gerencie todas as receitas registradas.</CardDescription>
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
                            {loading ? ( <TableSkeleton /> ) : revenues.length > 0 ? (
                                revenues.map((revenue) => (
                                    <TableRow key={revenue.id}>
                                        <TableCell className="hidden sm:table-cell">{format(new Date(revenue.revenue_date), "dd/MM/yyyy")}</TableCell>
                                        <TableCell className="font-medium">{revenue.description}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Badge variant="outline">{revenue.category?.name || 'N/A'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold text-green-600">
                                            {parseFloat(revenue.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
                                                    <DropdownMenuItem onClick={() => setModalState({ type: 'form', data: revenue })}>Editar</DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        className="text-red-500 focus:text-white focus:bg-red-500"
                                                        onClick={() => setModalState({ type: 'delete', data: revenue })}
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
                                    <TableCell colSpan={5} className="h-24 text-center">Nenhuma entrada registrada.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Mostrando <strong>{revenues.length}</strong> de <strong>{totalItems}</strong> entradas
                    </div>
                    {totalPages > 1 && (
                        <Pagination className="ml-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
                            </PaginationItem>
                        </PaginationContent>
                        </Pagination>
                    )}
                </CardFooter>
            </Card>

            {modalState.type === 'form' && (
                <RevenueFormModal
                    revenue={modalState.data}
                    onClose={() => setModalState({ type: null, data: null })}
                    onSave={handleSave}
                />
            )}
            
            <DeleteConfirmation 
                open={modalState.type === 'delete'}
                onClose={() => setModalState({ type: null, data: null })}
                onConfirm={handleDelete}
                title="Deletar Entrada?"
                description="Isso excluirá o registro da entrada permanentemente."
            />
        </>
    );
}