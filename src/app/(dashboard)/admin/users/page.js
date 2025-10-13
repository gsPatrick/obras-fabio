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
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, MoreHorizontal, Edit, Trash2, ShieldCheck } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { UserFormModal } from '@/components/dashboard/admin/UserFormModal';
import { DeleteConfirmation } from '@/components/dashboard/DeleteConfirmation';
import { SubscriptionFormModal } from '@/components/dashboard/admin/SubscriptionFormModal';

const TableSkeleton = () => (
    Array.from({ length: 8 }).map((_, index) => (
        <TableRow key={index}>
            <TableCell><Skeleton className="h-5 w-full max-w-xs" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
    ))
);

const getStatusBadge = (user) => {
    if (!user.subscription) return <Badge variant="outline">Sem Assinatura</Badge>;
    const isExpired = new Date(user.subscription.expires_at) < new Date();

    if (user.subscription.status === 'active' && !isExpired) {
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Ativo</Badge>;
    }
    if (user.status === 'pending') {
        return <Badge variant="secondary" className="bg-orange-500 text-white hover:bg-orange-600">Pendente</Badge>;
    }
    return <Badge variant="destructive">Inativo/Expirado</Badge>;
};

export default function AdminUsersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [modalState, setModalState] = useState({ type: null, data: null });

    useEffect(() => {
        if (!authLoading && user?.email !== 'fabio@gmail.com') {
            router.push('/Painel');
        }
    }, [user, authLoading, router]);
    
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

    const handleSaveUser = async (userData) => {
        const isEditing = !!modalState.data?.id;
        const method = isEditing ? 'put' : 'post';
        const url = isEditing ? `/admin/users/${modalState.data.id}` : '/admin/users';
        try {
            await api[method](url, userData);
            setModalState({ type: null, data: null });
            fetchData();
        } catch (err) {
            throw new Error(err.response?.data?.error || "Falha ao salvar usuário.");
        }
    };

    const handleDeleteUser = async () => {
        try {
            await api.delete(`/admin/users/${modalState.data.id}`);
            setModalState({ type: null, data: null });
            fetchData();
        } catch (err) {
            alert(`Erro ao deletar: ${err.response?.data?.error || err.message}`);
        }
    };
    
    // <<< CHAMADA À API CORRIGIDA AQUI >>>
    const handleUpdateSubscription = async (subData) => {
        try {
            // A URL agora é /admin/users/:id/subscription
            await api.put(`/admin/users/${modalState.data.id}/subscription`, subData);
            setModalState({ type: null, data: null });
            fetchData();
        } catch (err) {
            throw new Error(err.response?.data?.error || "Falha ao atualizar assinatura.");
        }
    };

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
                    <Button onClick={() => setModalState({ type: 'user_form', data: null })}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Criar Usuário
                    </Button>
                </div>

                <Card>
                    <CardHeader><CardTitle>Total de Usuários: {users.length}</CardTitle></CardHeader>
                    <CardContent>
                        {error && <p className="text-red-500 text-center">{error}</p>}
                        <div className="relative w-full overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Limite de Perfis</TableHead>
                                        <TableHead>Plano Expira em</TableHead>
                                        <TableHead><span className="sr-only">Menu</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? <TableSkeleton /> : (
                                        users.map(u => (
                                            <TableRow key={u.id}>
                                                <TableCell className="font-medium">{u.email}</TableCell>
                                                <TableCell>{getStatusBadge(u)}</TableCell>
                                                <TableCell className="font-semibold text-center">{u.subscription?.profile_limit || 'N/A'}</TableCell>
                                                <TableCell>{u.subscription?.expires_at ? format(new Date(u.subscription.expires_at), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                                <TableCell className="text-right">
                                                    {u.email !== 'fabio@gmail.com' && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => setModalState({ type: 'subscription_form', data: u })}>
                                                                    <ShieldCheck className="mr-2 h-4 w-4" /> Gerenciar Assinatura
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => setModalState({ type: 'user_form', data: u })}>
                                                                    <Edit className="mr-2 h-4 w-4" /> Editar Usuário
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => setModalState({ type: 'delete_user', data: u })}>
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Deletar Usuário
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {modalState.type === 'user_form' && (
                <UserFormModal 
                    user={modalState.data}
                    onClose={() => setModalState({ type: null, data: null })}
                    onSave={handleSaveUser}
                />
            )}
            {modalState.type === 'subscription_form' && (
                <SubscriptionFormModal
                    user={modalState.data}
                    onClose={() => setModalState({ type: null, data: null })}
                    onSave={handleUpdateSubscription}
                />
            )}
            {modalState.type === 'delete_user' && (
                <DeleteConfirmation 
                    open={true}
                    onClose={() => setModalState({ type: null, data: null })}
                    onConfirm={handleDeleteUser}
                    title={`Deletar ${modalState.data.email}?`}
                    description="Esta ação é permanente e removerá o usuário e todos os seus dados associados. Não pode ser desfeita."
                />
            )}
        </>
    );
}