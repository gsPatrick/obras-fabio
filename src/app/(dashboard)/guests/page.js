// app/(dashboard)/guests/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Loader2, UserPlus, Trash2, Pencil } from "lucide-react";
import api from '@/lib/api'; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import { DeleteConfirmation } from '@/components/dashboard/DeleteConfirmation';
import { GuestFormModal } from '@/components/dashboard/guests/GuestFormModal'; 
import { cn } from '@/lib/utils'; // Importar cn

// Mapeamento para o Badge de Status
const statusMap = {
    'active': { text: 'Ativo', variant: 'default' },
    'pending': { text: 'Pendente', variant: 'secondary' },
    'revoked': { text: 'Revogado', variant: 'destructive' },
};

// Mapeamento de Permissões para Nomes Completos (usado na tabela)
const permissionNameMap = {
    can_access_dashboard: 'Dashboard',
    can_access_categories: 'Categorias',
    can_access_reports: 'Relatórios',
    can_access_expenses: 'Despesas',
};

// Componente para exibir as Permissões de forma Responsiva
const PermissionsDisplay = ({ permissions }) => {
    const modules = Object.entries(permissionNameMap).map(([field, label]) => ({
        field,
        label,
        allowed: permissions?.[field] || false
    }));

    return (
        <div className="flex flex-wrap gap-1">
            {modules.map(mod => (
                <Badge 
                    key={mod.field} 
                    variant={mod.allowed ? 'default' : 'secondary'}
                    className={cn(
                        "px-2 py-0.5 text-xs font-medium",
                        mod.allowed ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                    )}
                >
                    {mod.label}
                </Badge>
            ))}
        </div>
    );
};


// Componente para a tela de carregamento da tabela
const TableSkeleton = () => (
    Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index} className="flex flex-col md:table-row border-b md:border-0">
            <TableCell className="font-medium flex justify-between md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
            <TableCell className="flex justify-between md:table-cell"><Skeleton className="h-6 w-20" /></TableCell>
            <TableCell className="flex justify-between md:table-cell"><Skeleton className="h-5 w-full max-w-xs" /></TableCell>
            <TableCell className="text-right flex justify-end md:table-cell"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
        </TableRow>
    ))
);

export default function GuestsPage() {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estado para controlar os modais
    const [modalState, setModalState] = useState({ type: null, data: null }); // type: 'form' | 'delete'

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // A rota /guests usa o profileId do header
            const response = await api.get('/guests');
            setGuests(response.data);
        } catch (err) {
            setError(err.response?.data?.error || "Falha ao carregar a lista de convidados.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // ===================================================================
    // Handlers de CRUD
    // ===================================================================
    const handleSave = async (guestData) => {
        const isEditing = !!guestData.id;
        const method = isEditing ? 'put' : 'post';
        const url = isEditing ? `/guests/${guestData.id}` : '/guests';

        setLoading(true);
        try {
            // Se for edição, enviamos apenas status e permissões
            const dataToSend = isEditing 
                ? { status: guestData.status, permissions: guestData.permissions } 
                : guestData;
                
            await api[method](url, dataToSend);
            setModalState({ type: null, data: null }); // Fecha o modal
            await fetchData(); // Recarrega os dados
        } catch (err) {
            console.error("Falha ao salvar convidado", err);
            setError(err.response?.data?.error || "Falha ao salvar o convidado.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await api.delete(`/guests/${modalState.data.id}`);
            setModalState({ type: null, data: null }); // Fecha o modal
            await fetchData(); // Recarrega os dados
        } catch (err) {
            console.error("Falha ao deletar convidado", err);
            setError(err.response?.data?.error || "Falha ao remover o convidado.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Gerenciar Convidados</h1>
                    <p className="text-gray-500">Dê acesso ao seu perfil para membros da equipe com permissões granulares.</p>
                </div>
                <Button onClick={() => setModalState({ type: 'form', data: null })}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Convidar Usuário
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Acessos Permitidos ({guests.length})</CardTitle>
                    <CardDescription>
                        Apenas o dono deste perfil pode gerenciar os acessos.
                    </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto"> {/* Adiciona scroll horizontal para tables */}
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow className="hidden md:table-row"> {/* Esconde cabeçalho em mobile */}
                                <TableHead className="w-[200px]">Email Convidado</TableHead>
                                <TableHead className="w-[120px]">Status</TableHead>
                                <TableHead>Permissões de Módulos</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableSkeleton />
                            ) : guests.length > 0 ? (
                                guests.map((guest) => {
                                    const statusInfo = statusMap[guest.status] || { text: 'Desconhecido', variant: 'outline' };
                                    
                                    return (
                                        <TableRow key={guest.id} className="flex flex-col md:table-row border-b hover:bg-muted/50">
                                            {/* Email e Status (Visível em Mobile e Desktop) */}
                                            <TableCell className="font-medium flex justify-between md:table-cell border-b md:border-b-0">
                                                <span className="md:hidden font-semibold">Email:</span>
                                                <span className='font-normal'>{guest.email}</span>
                                            </TableCell>
                                            <TableCell className="flex justify-between md:table-cell border-b md:border-b-0">
                                                <span className="md:hidden font-semibold">Status:</span>
                                                <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
                                            </TableCell>
                                            
                                            {/* Permissões (Visível em Mobile e Desktop) */}
                                            <TableCell className="flex flex-col md:table-cell border-b md:border-b-0">
                                                <span className="md:hidden font-semibold">Permissões:</span>
                                                <PermissionsDisplay permissions={guest.permissions} />
                                            </TableCell>

                                            {/* Ações */}
                                            <TableCell className="text-right flex justify-end md:table-cell">
                                                <Button size="icon" variant="ghost" onClick={() => setModalState({ type: 'form', data: guest })}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => setModalState({ type: 'delete', data: guest })}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Nenhum usuário convidado neste perfil.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Modal de Formulário (Criação ou Edição) */}
            {modalState.type === 'form' && (
                <GuestFormModal
                    guest={modalState.data}
                    onClose={() => setModalState({ type: null, data: null })}
                    onSave={handleSave}
                />
            )}

            {/* Modal de Confirmação de Exclusão */}
            {modalState.type === 'delete' && (
                <DeleteConfirmation
                    open={true}
                    onClose={() => setModalState({ type: null, data: null })}
                    onConfirm={handleDelete}
                    title="Remover Convidado?"
                    description={`Você tem certeza que deseja remover o acesso de "${modalState.data.email}"? Esta ação revoga todas as permissões.`}
                />
            )}
        </>
    );
}