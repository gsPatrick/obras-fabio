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
import { cn } from '@/lib/utils';

// Componente para o estado de carregamento
const TableSkeleton = () => (
    Array.from({ length: 8 }).map((_, index) => (
        <TableRow key={index}>
            <TableCell><Skeleton className="h-5 w-full max-w-xs" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        </TableRow>
    ))
);

// Mapeamento de status para badges
const getStatusBadge = (user) => {
    if (user.subscription?.status === 'active') {
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Ativo</Badge>;
    }
    if (user.status === 'pending') {
        return <Badge variant="secondary" className="bg-orange-500 text-white hover:bg-orange-600">Pendente</Badge>;
    }
    return <Badge variant="outline">Inativo</Badge>;
};


export default function AdminUsersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Proteção de Rota no Cliente
    useEffect(() => {
        if (!authLoading && user?.email !== 'fabio@gmail.com') {
            router.push('/dashboard');
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
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.email === 'fabio@gmail.com') {
            fetchData();
        }
    }, [fetchData, user]);

    if (authLoading || (user && user.email !== 'fabio@gmail.com')) {
        return <div className="flex items-center justify-center h-full"><Skeleton className="h-64 w-full" /></div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Usuários do Sistema</h1>
                <p className="text-gray-500">Lista de todos os usuários cadastrados na plataforma.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Total de Usuários: {users.length}</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Data de Cadastro</TableHead>
                                <TableHead>Última Atividade</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? <TableSkeleton /> : (
                                users.map(u => (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium">{u.email}</TableCell>
                                        <TableCell>{getStatusBadge(u)}</TableCell>
                                        <TableCell>{format(new Date(u.createdAt), 'dd/MM/yyyy HH:mm')}</TableCell>
                                        <TableCell>{format(new Date(u.updatedAt), 'dd/MM/yyyy HH:mm')}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}