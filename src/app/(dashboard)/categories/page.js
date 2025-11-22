// app/(dashboard)/categories/page.js
'use client';
import { useState, useEffect, useCallback, useMemo } from "react";
import { 
    PlusCircle, 
    MoreVertical, 
    TrendingDown, 
    TrendingUp, 
    Edit, 
    Trash2, 
    Wallet, 
    Target,
    AlertCircle 
} from "lucide-react";
import api from "@/lib/api"; 

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { CategoryForm } from "@/components/dashboard/categories/CategoryForm";
import { DeleteConfirmation } from "@/components/dashboard/DeleteConfirmation";

// Função utilitária para formatar moeda
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    }).format(value || 0);
};

// --- COMPONENTE: Card de Resumo (Topo) ---
const SummaryCard = ({ title, value, icon: Icon, subtext, progress, colorClass }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
            </CardTitle>
            <div className={`p-2 rounded-full bg-opacity-10 ${colorClass.bg}`}>
                <Icon className={`h-4 w-4 ${colorClass.text}`} />
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(value)}</div>
            {progress !== undefined ? (
                <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Comprometido</span>
                        <span>{Math.min(progress, 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className={`h-2 ${progress > 100 ? 'bg-red-100' : ''}`} indicatorClassName={progress > 100 ? 'bg-red-500' : colorClass.indicator} />
                </div>
            ) : (
                <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
            )}
        </CardContent>
    </Card>
);

// --- COMPONENTE: Card Individual de Categoria ---
const CategoryCard = ({ category, onEdit, onDelete }) => {
    const isExpense = category.category_flow === 'expense';
    const goal = category.goal?.value ? parseFloat(category.goal.value) : 0;
    const current = parseFloat(category.current_total || 0);
    const remaining = goal - current;
    const progress = goal > 0 ? (current / goal) * 100 : (current > 0 ? 100 : 0);
    const isOverBudget = current > goal && goal > 0;

    return (
        <Card className={`flex flex-col h-full transition-all hover:shadow-md ${isExpense && isOverBudget ? 'border-red-200 dark:border-red-900/50' : ''}`}>
            <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg leading-none tracking-tight truncate max-w-[150px]" title={category.name}>
                            {category.name}
                        </h3>
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        {category.type}
                    </p>
                </div>
                <div className="flex items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
            
            <CardContent className="flex-grow flex flex-col justify-end pt-2">
                <Separator className="mb-4" />
                
                {isExpense ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-muted-foreground">Gasto Atual</span>
                            <span className={`text-xl font-bold ${isOverBudget ? 'text-red-600' : ''}`}>
                                {formatCurrency(current)}
                            </span>
                        </div>
                        
                        {/* Área da Meta */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span className={isOverBudget ? "text-red-500" : "text-muted-foreground"}>
                                    {goal > 0 ? `${progress.toFixed(0)}% da Meta` : 'Sem meta definida'}
                                </span>
                                {goal > 0 && <span className="text-muted-foreground">{formatCurrency(goal)}</span>}
                            </div>
                            
                            {goal > 0 && (
                                <Progress 
                                    value={Math.min(progress, 100)} 
                                    className="h-2.5" 
                                    indicatorClassName={isOverBudget ? "bg-red-500" : "bg-slate-900 dark:bg-slate-400"}
                                />
                            )}
                        </div>

                        {/* Status Badge */}
                        {goal > 0 && (
                            <div className={`flex items-center gap-2 text-xs rounded-md p-2 ${isOverBudget ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'}`}>
                                {isOverBudget ? <AlertCircle className="h-3 w-3" /> : <Wallet className="h-3 w-3" />}
                                <span className="font-medium">
                                    {isOverBudget ? `Excedido em ${formatCurrency(Math.abs(remaining))}` : `Disponível: ${formatCurrency(remaining)}`}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground">Total Acumulado</span>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(current)}
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// --- SKELETONS ---
const SummarySkeleton = () => (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
        {[1, 2, 3].map(i => (
            <Card key={i}>
                <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
                <CardContent><Skeleton className="h-8 w-32 mb-2" /><Skeleton className="h-2 w-full" /></CardContent>
            </Card>
        ))}
    </div>
);

const CategoryGridSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
            <Card key={i} className="h-[200px]">
                <CardHeader><Skeleton className="h-6 w-32" /><Skeleton className="h-4 w-20" /></CardHeader>
                <CardContent className="mt-auto"><Skeleton className="h-10 w-full" /></CardContent>
            </Card>
        ))}
    </div>
);

// --- PÁGINA PRINCIPAL ---
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

    // --- CÁLCULO DE TOTAIS (CORRIGIDO) ---
    const totals = useMemo(() => {
        const expenses = categories.filter(c => c.category_flow === 'expense');
        const revenues = categories.filter(c => c.category_flow === 'revenue');

        const totalExpenseValue = expenses.reduce((acc, c) => acc + parseFloat(c.current_total || 0), 0);
        const totalRevenueValue = revenues.reduce((acc, c) => acc + parseFloat(c.current_total || 0), 0);
        
        const totalBudget = expenses.reduce((acc, c) => acc + (c.goal?.value ? parseFloat(c.goal.value) : 0), 0);
        const totalBudgetProgress = totalBudget > 0 ? (totalExpenseValue / totalBudget) * 100 : 0;

        return {
            expenses: totalExpenseValue,
            revenues: totalRevenueValue,
            budget: totalBudget,
            budgetProgress: totalBudgetProgress // <--- CORREÇÃO AQUI
        };
    }, [categories]);

    const handleSave = async (formData) => {
        const isEditing = !!modalState.data?.id;
        const { goal, ...categoryData } = formData;
        const method = isEditing ? 'put' : 'post';
        const categoryUrl = isEditing ? `/categories/${modalState.data.id}` : '/categories';

        try {
            const categoryResponse = await api[method](categoryUrl, categoryData);
            const categoryId = isEditing ? modalState.data.id : categoryResponse.data.id;

            if (categoryData.category_flow === 'expense' && (goal !== '' && goal !== null && goal !== undefined)) {
                await api.post('/goals', {
                    value: parseFloat(goal),
                    categoryId: categoryId,
                    isTotalGoal: false
                });
            }
            setModalState({ type: null, data: null });
            fetchData(); 
        } catch (err) {
            console.error("Falha ao salvar categoria", err);
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
        <div className="space-y-8">
            {/* Cabeçalho da Página */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
                    <p className="text-muted-foreground">Gerencie suas categorias de custos e receitas e defina metas.</p>
                </div>
                <Button onClick={() => setModalState({ type: 'form', data: null })} size="lg">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Nova Categoria
                </Button>
            </div>
            
            {error && <p className="text-red-500 text-center bg-red-50 p-2 rounded">{error}</p>}

            {/* Resumo Superior */}
            {loading ? <SummarySkeleton /> : (
                <div className="grid gap-4 md:grid-cols-3">
                    <SummaryCard 
                        title="Receita Total (Categorias)" 
                        value={totals.revenues} 
                        icon={TrendingUp}
                        subtext="Acumulado em todas as categorias de entrada"
                        colorClass={{ bg: 'bg-green-500', text: 'text-green-600' }}
                    />
                    <SummaryCard 
                        title="Despesa Total (Categorias)" 
                        value={totals.expenses} 
                        icon={TrendingDown}
                        subtext="Acumulado em todas as categorias de saída"
                        colorClass={{ bg: 'bg-red-500', text: 'text-red-600' }}
                    />
                    <SummaryCard 
                        title="Orçamento Comprometido" 
                        value={totals.budget} 
                        icon={Target}
                        progress={totals.budgetProgress}
                        colorClass={{ bg: 'bg-blue-500', text: 'text-blue-600', indicator: 'bg-blue-600' }}
                    />
                </div>
            )}
            
            <Separator className="my-6" />

            {/* Seção de Despesas */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-md">
                        <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Despesas</h2>
                    <Badge variant="outline" className="ml-2">{expenseCategories.length}</Badge>
                </div>
                
                {loading ? <CategoryGridSkeleton /> : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {expenseCategories.map(cat => (
                            <CategoryCard 
                                key={cat.id} 
                                category={cat} 
                                onEdit={setModalState} 
                                onDelete={setModalState} 
                            />
                        ))}
                    </div>
                )}
                {!loading && expenseCategories.length === 0 && (
                    <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                        <p className="text-muted-foreground">Nenhuma categoria de despesa criada.</p>
                        <Button variant="link" onClick={() => setModalState({ type: 'form', data: null })}>Criar uma agora</Button>
                    </div>
                )}
            </section>

            <div className="h-4"></div>

            {/* Seção de Receitas */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md">
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Receitas</h2>
                    <Badge variant="outline" className="ml-2">{revenueCategories.length}</Badge>
                </div>

                {loading ? <CategoryGridSkeleton /> : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {revenueCategories.map(cat => (
                            <CategoryCard 
                                key={cat.id} 
                                category={cat} 
                                onEdit={setModalState} 
                                onDelete={setModalState} 
                            />
                        ))}
                    </div>
                )}
                {!loading && revenueCategories.length === 0 && (
                    <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                        <p className="text-muted-foreground">Nenhuma categoria de receita criada.</p>
                    </div>
                )}
            </section>

            {/* Modais */}
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
                    description="Esta ação não pode ser desfeita. Certifique-se de que não há lançamentos associados a esta categoria antes de excluir."
                />
            )}
        </div>
    );
}