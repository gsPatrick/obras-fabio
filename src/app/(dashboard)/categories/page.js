// app/(dashboard)/categories/page.js
'use client';
import { useState, useEffect } from "react";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import api from "@/lib/api"; // << IMPORTANTE

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryForm } from "@/components/dashboard/categories/CategoryForm";
import { DeleteConfirmation } from "@/components/dashboard/DeleteConfirmation";

// Componente de Skeleton para a tabela
const TableSkeleton = () => (
    Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
    ))
);

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para controlar os modais
    const [modalState, setModalState] = useState({ type: null, data: null }); // type: 'form' | 'delete'

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (err) {
            setError("Falha ao carregar as categorias.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (categoryData) => {
        const isEditing = !!modalState.data?.id;
        const method = isEditing ? 'put' : 'post';
        const url = isEditing ? `/categories/${modalState.data.id}` : '/categories';

        try {
            await api[method](url, categoryData);
            setModalState({ type: null, data: null }); // Fecha o modal
            fetchData(); // Recarrega os dados
        } catch (err) {
            console.error("Falha ao salvar categoria", err);
            // Aqui você pode adicionar um estado de erro para o formulário
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/categories/${modalState.data.id}`);
            setModalState({ type: null, data: null }); // Fecha o modal
            fetchData(); // Recarrega os dados
        } catch (err) {
            console.error("Falha ao deletar categoria", err);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Gerenciar Categorias</h1>
                    <p className="text-gray-500">Adicione, edite ou remova as categorias de custos.</p>
                </div>
                <Button onClick={() => setModalState({ type: 'form', data: null })}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Nova Categoria
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Categorias Cadastradas</CardTitle>
                    <CardDescription>
                        A lista completa de categorias utilizadas para classificar os custos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome da Categoria</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead><span className="sr-only">Ações</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableSkeleton />
                            ) : (
                                categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell><Badge variant="secondary">{category.type}</Badge></TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Abrir menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => setModalState({ type: 'form', data: category })}>
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        className="text-red-500 focus:text-red-500"
                                                        onClick={() => setModalState({ type: 'delete', data: category })}>
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
            </Card>

            {modalState.type === 'form' && (
                <CategoryForm
                    category={modalState.data}
                    onClose={() => setModalState({ type: null, data: null })}
                    onSave={handleSave}
                />
            )}

            {modalState.type === 'delete' && (
                <DeleteConfirmation
                    open={true}
                    onClose={() => setModalState({ type: null, data: null })}
                    onConfirm={handleDelete}
                    title="Deletar Categoria?"
                    description={`Você tem certeza que deseja deletar a categoria "${modalState.data.name}"? Esta ação não pode ser desfeita.`}
                />
            )}
        </>
    );
}