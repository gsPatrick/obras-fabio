// app/(dashboard)/categories/page.js
'use client';
import { useState, useEffect, useCallback } from "react";
import { PlusCircle, MoreVertical, TrendingDown, TrendingUp, Edit, Trash2 } from "lucide-react";
import api from "@/lib/api"; 

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CategoryForm } from "@/components/dashboard/categories/CategoryForm";
import { DeleteConfirmation } from "@/components/dashboard/DeleteConfirmation";

// NOVO: Componente Card de Categoria
const CategoryCard = ({ category, onEdit, onDelete }) => {
    const isExpense = category.category_flow === 'expense';
    const goal = category.goal?.value ? parseFloat(category.goal.value) : 0;
    const current = category.current_total || 0;
    const remaining = goal > 0 ? goal - current : 0;
    const progress = goal > 0 ? (current / goal) * 100 : 0;

    const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>{category.type}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={isExpense ? 'destructive' : 'default'}>
                        {isExpense ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                        {isExpense ? 'Despesa' : 'Receita'}
                    </Badge>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {/* <<< CORREÇÃO APLICADA AQUI >>> */}
                            <DropdownMenuItem onClick={() => onEdit({ type: 'form', data: category })}>
                                <Edit className="h-4 w-4 mr-2" />Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete({ type: 'delete', data: category })} className="text-red-500 focus:text-red-500">
                                <Trash2 className="h-4 w-4 mr-2" />Deletar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                {isExpense ? (
                    <div>
                        <div className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-muted-foreground">Gasto Atual</span>
                                <span className="font-bold">{formatCurrency(current)}</span>
                            </div>
                            {goal > 0 && (
                                <>
                                    <Progress value={progress} className={progress > 100 ? "bg-red-500" : ""} />
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                        <span>0%</span>
                                        <span>Meta: {formatCurrency(goal)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                        {goal > 0 && (
                            <div className={`p-2 rounded-md ${remaining >= 0 ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                                <div className="flex justify-between items-center text-sm font-semibold">
                                    <span>{remaining >= 0 ? 'Restante:' : 'Excedido:'}</span>
                                    <span className={remaining >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                                        {formatCurrency(Math.abs(remaining))}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-muted-foreground">Receita do Mês</span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(current)}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};


const CategorySkeleton = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </CardContent>
    </Card>
);


export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalState, setModalState] = useState({ type: null, data: null });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/categories/with-summary');
            setCategories(response.data);
        } catch (err) {
            setError("Falha ao carregar as categorias.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async (formData) => {
        const isEditing = !!modalState.data?.id;
        
        const { goal, ...categoryData } = formData;
        
        const method = isEditing ? 'put' : 'post';
        const categoryUrl = isEditing ? `/categories/${modalState.data.id}` : '/categories';

        try {
            const categoryResponse = await api[method](categoryUrl, categoryData);
            const categoryId = isEditing ? modalState.data.id : categoryResponse.data.id;

            if (categoryData.category_flow === 'expense' && (goal || goal === 0)) {
                await api.post('/goals', {
                    value: goal,
                    categoryId: categoryId,
                    isTotalGoal: false
                });
            }

            setModalState({ type: null, data: null });
            fetchData();
        } catch (err) {
            console.error("Falha ao salvar categoria/meta", err);
            throw err;
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/categories/${modalState.data.id}`);
            setModalState({ type: null, data: null });
            fetchData();
        } catch (err) {
            console.error("Falha ao deletar categoria", err);
            alert(err.response?.data?.error || "Erro ao deletar.");
        }
    };
    
    const expenseCategories = categories.filter(c => c.category_flow === 'expense');
    const revenueCategories = categories.filter(c => c.category_flow === 'revenue');

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Gerenciar Categorias</h1>
                    <p className="text-gray-500">Acompanhe seus gastos mensais e gerencie suas categorias.</p>
                </div>
                <Button onClick={() => setModalState({ type: 'form', data: null })}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Nova Categoria
                </Button>
            </div>
            
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            
            <div className="space-y-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Despesas</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => <CategorySkeleton key={i} />)
                        ) : (
                            expenseCategories.map(cat => (
                                <CategoryCard 
                                    key={cat.id} 
                                    category={cat} 
                                    onEdit={setModalState} // Passa a função diretamente
                                    onDelete={setModalState} // Passa a função diretamente
                                />
                            ))
                        )}
                    </div>
                     { !loading && expenseCategories.length === 0 && <p className="text-muted-foreground text-center py-8">Nenhuma categoria de despesa criada.</p> }
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">Receitas</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                         {loading ? (
                            Array.from({ length: 2 }).map((_, i) => <CategorySkeleton key={i} />)
                        ) : (
                            revenueCategories.map(cat => (
                                <CategoryCard 
                                    key={cat.id} 
                                    category={cat} 
                                    onEdit={setModalState} 
                                    onDelete={setModalState} 
                                />
                            ))
                        )}
                    </div>
                    { !loading && revenueCategories.length === 0 && <p className="text-muted-foreground text-center py-8">Nenhuma categoria de receita criada.</p> }
                </div>
            </div>

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
                    title={`Deletar Categoria "${modalState.data.name}"?`}
                    description="Esta ação não pode ser desfeita. Certifique-se de que não há lançamentos associados a esta categoria."
                />
            )}
        </>
    );
}