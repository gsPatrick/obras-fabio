// app/(dashboard)/credit-cards/page.js
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CreditCard, Calendar, Loader2, Info, X, Wifi, PlusCircle, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/lib/api';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { CreditCardFormModal } from '@/components/dashboard/credit-cards/CreditCardFormModal';
import { DeleteConfirmation } from '@/components/dashboard/DeleteConfirmation';

// --- ATUALIZADO: Componente Estilizado de Cartão de Crédito com CRUD e novo hover ---
const CreditCardVisual = ({ card, onActionClick, isLoading, onEdit, onDelete }) => {
    return (
        <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl shadow-lg p-6 flex flex-col justify-between h-56 relative group overflow-hidden">
            {/* Top Section */}
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-xs font-light">Cartão de Crédito</span>
                    <span className="text-lg font-semibold tracking-wider">{card.name}</span>
                </div>
                {/* Menu de Ações (Editar/Deletar) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10">
                            <MoreVertical size={18} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500">Deletar</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Middle Section (Chip and Number) */}
            <div className="my-4">
                <div className="w-12 h-9 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-md mb-2"></div>
                <div className="text-xl font-mono tracking-widest">
                    <span>•••• •••• •••• {card.last_four_digits || '••••'}</span>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="flex justify-between items-end">
                <div className="flex flex-col">
                    <span className="text-xs font-light">Fechamento</span>
                    <span className="font-semibold">Dia {card.closing_day}</span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-xs font-light">Vencimento</span>
                    <span className="font-semibold">Dia {card.due_day}</span>
                </div>
            </div>

             {/* Action Button over the card com EFEITO DE BLUR */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button 
                    onClick={onActionClick}
                    disabled={isLoading}
                    variant="secondary"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Calendar className="h-4 w-4 mr-2" />}
                    Ver Fatura
                </Button>
            </div>
        </div>
    );
};


// Componente para estado de carregamento dos cards
const CardSkeleton = () => (
    <div className="w-full max-w-sm mx-auto bg-gray-200 dark:bg-gray-800 rounded-xl p-6 h-56 animate-pulse">
        <div className="flex justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-6" />
        </div>
        <div className="my-4">
            <Skeleton className="w-12 h-9 rounded-md mb-2" />
            <Skeleton className="h-7 w-48" />
        </div>
        <div className="flex justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
        </div>
    </div>
);


// Componente do Modal da Fatura
const InvoiceDetailsModal = ({ invoice, onClose }) => {
    if (!invoice || !invoice.creditCard) return null;
    
    const { creditCard, invoicePeriod, expenses, totalAmount } = invoice;

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Fatura de {creditCard.name}</DialogTitle>
                    <DialogDescription>
                        Referência: {format(new Date(invoicePeriod.referenceYear, invoicePeriod.referenceMonth - 1), 'MMMM/yyyy', { locale: ptBR })}.
                        Vencimento em {format(new Date(invoicePeriod.dueDate), 'dd/MM/yyyy')}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="flex justify-between items-center bg-muted p-4 rounded-lg mb-4">
                        <span className="font-semibold">Valor Total da Fatura:</span>
                        <span className="text-2xl font-bold text-red-500">
                            {totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.length > 0 ? expenses.map(exp => (
                                    <TableRow key={exp.id}>
                                        <TableCell>{format(new Date(exp.expense_date), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>{exp.description}</TableCell>
                                        <TableCell className="text-right">
                                            {parseFloat(exp.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">
                                            Nenhum lançamento nesta fatura.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};


export default function CreditCardsPage() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [invoiceDate, setInvoiceDate] = useState({ 
        month: new Date().getMonth() + 1, 
        year: new Date().getFullYear() 
    });
    
    const [invoiceDetails, setInvoiceDetails] = useState({ card: null, data: null, loading: false, error: null });
    
    // NOVO: Estado para controlar os modais de CRUD
    const [modalState, setModalState] = useState({ type: null, data: null }); // type: 'form' | 'delete'

    const fetchCards = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/credit-cards');
            setCards(response.data);
        } catch (err) {
            setError("Falha ao carregar os cartões de crédito.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    const handleViewInvoice = async (card) => {
        setInvoiceDetails({ card, data: null, loading: true, error: null });
        try {
            const params = {
                creditCardId: card.id,
                month: invoiceDate.month,
                year: invoiceDate.year,
            };
            const response = await api.get('/dashboard/credit-card-invoice', { params });
            setInvoiceDetails({ card, data: response.data, loading: false, error: null });
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Não foi possível carregar a fatura.";
            setInvoiceDetails({ card, data: null, loading: false, error: errorMessage });
            alert(errorMessage);
            setInvoiceDetails({ card: null, data: null, loading: false, error: null });
        }
    };
    
    // --- NOVOS Handlers para o CRUD ---
    const handleSaveCard = async (cardData) => {
        const isEditing = !!modalState.data?.id;
        const method = isEditing ? 'put' : 'post';
        const url = isEditing ? `/credit-cards/${modalState.data.id}` : '/credit-cards';

        try {
            await api[method](url, cardData);
            setModalState({ type: null, data: null });
            await fetchCards();
        } catch (err) {
            console.error("Falha ao salvar cartão:", err);
            throw new Error(err.response?.data?.error || "Não foi possível salvar o cartão.");
        }
    };

    const handleDeleteCard = async () => {
        try {
            await api.delete(`/credit-cards/${modalState.data.id}`);
            setModalState({ type: null, data: null });
            await fetchCards();
        } catch (err) {
            console.error("Falha ao deletar cartão:", err);
            alert(err.response?.data?.error || "Erro ao deletar.");
        }
    };
    
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 5 }, (_, i) => currentYear - i);
    }, []);

    return (
        <>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Meus Cartões de Crédito</h1>
                        <p className="text-gray-500">Consulte as faturas e os gastos de cada um dos seus cartões.</p>
                    </div>
                    {/* Botão para criar novo cartão */}
                    <Button onClick={() => setModalState({ type: 'form', data: null })}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Novo Cartão
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Consultar Fatura</CardTitle>
                        <CardDescription>Selecione o mês e o ano para visualizar as faturas correspondentes.</CardDescription>
                        <div className="flex gap-4 pt-4">
                            <Select 
                                value={String(invoiceDate.month)} 
                                onValueChange={(val) => setInvoiceDate(prev => ({ ...prev, month: Number(val) }))}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Mês" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <SelectItem key={i + 1} value={String(i + 1)}>
                                            {format(new Date(0, i), 'MMMM', { locale: ptBR })}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select 
                                value={String(invoiceDate.year)}
                                onValueChange={(val) => setInvoiceDate(prev => ({ ...prev, year: Number(val) }))}
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Ano" />
                                </SelectTrigger>
                                <SelectContent>
                                    {yearOptions.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                </Card>

                {error && <p className="text-red-500 text-center">{error}</p>}
                
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                    ) : cards.length > 0 ? (
                        cards.map(card => (
                            <CreditCardVisual 
                                key={card.id}
                                card={card}
                                onActionClick={() => handleViewInvoice(card)}
                                isLoading={invoiceDetails.loading && invoiceDetails.card?.id === card.id}
                                onEdit={() => setModalState({ type: 'form', data: card })}
                                onDelete={() => setModalState({ type: 'delete', data: card })}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <Info className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">Nenhum cartão de crédito cadastrado.</p>
                            <Button variant="link" onClick={() => setModalState({ type: 'form', data: null })}>
                                Criar o primeiro
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {invoiceDetails.data && (
                <InvoiceDetailsModal 
                    invoice={invoiceDetails.data} 
                    onClose={() => setInvoiceDetails({ card: null, data: null, loading: false, error: null })} 
                />
            )}
            
            {/* Modal de Formulário de Cartão */}
            {modalState.type === 'form' && (
                <CreditCardFormModal
                    card={modalState.data}
                    onClose={() => setModalState({ type: null, data: null })}
                    onSave={handleSaveCard}
                />
            )}

            {/* Modal de Confirmação de Exclusão */}
            {modalState.type === 'delete' && (
                <DeleteConfirmation
                    open={true}
                    onClose={() => setModalState({ type: null, data: null })}
                    onConfirm={handleDeleteCard}
                    title={`Deletar cartão "${modalState.data.name}"?`}
                    description="Esta ação é permanente e não pode ser desfeita. Despesas associadas a este cartão não serão excluídas, mas ficarão desvinculadas."
                />
            )}
        </>
    );
}