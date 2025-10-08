// app/(dashboard)/admin/profits/page.js
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { format } from 'date-fns';
import { DollarSign, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';

const TableSkeleton = () => (
    Array.from({ length: 8 }).map((_, index) => (
        <TableRow key={index}>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-5 w-full max-w-xs" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
        </TableRow>
    ))
);

export default function AdminProfitsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Proteção de Rota
    useEffect(() => {
        if (!authLoading && user?.email !== 'fabio@gmail.com') {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/profits');
            setPayments(response.data);
        } catch (err) {
            setError("Falha ao carregar os dados de lucros do Mercado Pago.");
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

    const kpis = useMemo(() => {
        if (payments.length === 0) {
            return { totalRevenue: 0, totalTransactions: 0 };
        }
        const totalRevenue = payments.reduce((sum, payment) => sum + payment.transaction_amount, 0);
        return {
            totalRevenue,
            totalTransactions: payments.length,
        };
    }, [payments]);

    if (authLoading || (user && user.email !== 'fabio@gmail.com')) {
        return <div className="flex items-center justify-center h-full"><Skeleton className="h-64 w-full" /></div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Relatório de Lucros</h1>
                <p className="text-gray-500">Receitas de assinaturas processadas pelo Mercado Pago.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {kpis.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis.totalTransactions}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Transações</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data de Aprovação</TableHead>
                                <TableHead>Email do Pagador</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? <TableSkeleton /> : (
                                payments.map(payment => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{format(new Date(payment.date_approved), 'dd/MM/yyyy HH:mm')}</TableCell>
                                        <TableCell className="font-medium">{payment.payer.email}</TableCell>
                                        <TableCell>{payment.description}</TableCell>
                                        <TableCell className="text-right">
                                            {payment.transaction_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </TableCell>
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