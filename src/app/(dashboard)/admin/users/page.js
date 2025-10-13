// app/(dashboard)/admin/users/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Importações dos novos componentes de modal
import { UserFormModal } from '../UserFormModal';
import { DeleteConfirmation } from '@/components/dashboard/DeleteConfirmation';

// Componente para o estado de carregamento da tabela
const TableSkeleton = () => (
    Array.from({ length: 8 }).map((_, index) => (
        <TableRow key={index}>
            <TableCell><Skeleton className="h-5 w-full max-w-xs" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-8 w-24" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
    ))
);

// Função para renderizar o badge de status do usuário
const getStatusBadge = (user) => {
    const isExpired = user.subscription?.expires_at && new Date(user.subscription.expires_at) < new Date();

    if (user.subscription?.status === 'active' && !isExpired) {
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Ativo</Badge>;
    }
    if (user.status === 'pending') {
        return <Badge variant="secondary" className="bg-orange-500 text-white hover:bg-orange-600">Pendente</Badge>;
    }
    if (user.subscription?.status === 'cancelled' || isExpired) {
        return <Badge variant="destructive">Cancelado</Badge>;
    }
    return <Badge variant="outline">Inativo</Badge>;
};

export default function AdminUsersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingUserId, setUpdatingUserId] = useState(null);

    // Estado unificado para controlar qual modal está aberto (form ou delete)
    const [modalState, setModalState] = useState({ type: null, data: null });

    // Proteção de Rota: garante que apenas o admin acesse esta página
    useEffect(() => {
        if (!authLoading && user?.email !== 'fabio@gmail.com') {
            router.push('/Painel');
        }
    }, [user, authLoading, router]);
    
    // Função para buscar a lista de usuários da API
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (err) {
            setError("Falha ao carregar a lista de usuários.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.email === 'fabio@gmail.com') {
            fetchData();
        }
    }, [fetchData, user]);

    // Handler para salvar (criar ou editar) um usuário
    const handleSaveUser = async (userData) => {
        const isEditing = !!modalState.data?.id;
        const method = isEditing ? 'put' : 'post';
        const url = isEditing ? `/admin/users/${modalState.data.id}` : '/admin/users';
        try {
            await api[method](url, userData);
            setModalState({ type: null, data: null }); // Fecha o modal
            fetchData(); // Recarrega a lista
        } catch (err) {
            throw new Error(err.response?.data?.error || "Falha ao salvar usuário.");
        }
    };

    // Handler para deletar um usuário
    const handleDeleteUser = async () => {
        try {
            await api.delete(`/admin/users/${modalState.data.id}`);
            setModalState({ type: null, data: null }); // Fecha o modal
            fetchData(); // Recarrega a lista
        } catch (err) {
            alert(`Erro ao deletar: ${err.response?.data?.error || err.message}`);
        }
    };
    
    // Handler para ativar/desativar o plano de um usuário
    const handleUpdateStatus = async (userId, newStatus) => {
        setUpdatingUserId(userId);
        try {
            await api.put(`/admin/users/${userId}/subscription/status`, { status: newStatus });
            fetchData(); // Recarrega a lista para refletir a mudança
        } catch (err) {
            alert(`Erro ao atualizar o status: ${err.response?.data?.error || err.message}`);
        } finally {
            setUpdatingUserId(null);
        }
    };

    // Renderização condicional durante o carregamento de autenticação
    if (authLoading || (user && user.email !== 'fabio@gmail.com')) {
        return <div className="flex items-center justify-center h-full"><Skeleton className="h-64 w-full" /></div>;
    }

    return (
        <>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Usuários do Sistema</h1>
                        <p className="text-gray-500">Gerencie todos os usuários cadastrados na plataforma.</p>
                    </div>
                    <Button onClick={() => setModalState({ type: 'form', data: null })}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Criar Usuário
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Total de Usuários: {users.length}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error && <p className="text-red-500 text-center">{error}</p>}
                        <div className="relative w-full overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Cadastro</TableHead>
                                        <TableHead>Plano Expira em</TableHead>
                                        <TableHead>Ações do Plano</TableHead>
                                        <TableHead><span className="sr-only">Menu</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? <TableSkeleton /> : (
                                        users.map(u => {
                                            const isSubActive = u.subscription?.status === 'active' && new Date(u.subscription.expires_at) > new Date();
                                            const isLoadingThisUser = updatingUserId === u.id;

                                            return (
                                                <TableRow key={u.id}>
                                                    <TableCell className="font-medium">{u.email}</TableCell>
                                                    <TableCell>{getStatusBadge(u)}</TableCell>
                                                    <TableCell>{format(new Date(u.createdAt), 'dd/MM/yyyy')}</TableCell>
                                                    <TableCell>{u.subscription?.expires_at ? format(new Date(u.subscription.expires_at), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                                    <TableCell>
                                                        {u.email !== 'fabio@gmail.com' && (
                                                            isSubActive ? (
                                                                <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(u.id, 'cancelled')} disabled={isLoadingThisUser}>
                                                                    {isLoadingThisUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Desativar
                                                                </Button>
                                                            ) : (
                                                                <Button variant="default" size="sm" onClick={() => handleUpdateStatus(u.id, 'active')} disabled={isLoadingThisUser}>
                                                                    {isLoadingThisUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Ativar
                                                                </Button>
                                                            )
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {u.email !== 'fabio@gmail.com' && (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Opções</DropdownMenuLabel>
                                                                    <DropdownMenuItem onClick={() => setModalState({ type: 'form', data: u })}>Editar Usuário</DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-500/10" onClick={() => setModalState({ type: 'delete', data: u })}>Deletar Usuário</DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Renderização Condicional dos Modais */}
            {modalState.type === 'form' && (
                <UserFormModal 
                    user={modalState.data}
                    onClose={() => setModalState({ type: null, data: null })}
                    onSave={handleSaveUser}
                />
            )}
            {modalState.type === 'delete' && (
                <DeleteConfirmation 
                    open={true}
                    onClose={() => setModalState({ type: null, data: null })}
                    onConfirm={handleDeleteUser}
                    title={`Deletar ${modalState.data.email}?`}
                    description="Esta ação é permanente e removerá o usuário e todos os seus dados associados, como perfis e despesas. Esta ação não pode ser desfeita."
                />
            )}
        </>
    );
}