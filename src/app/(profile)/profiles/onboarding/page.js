// app/(profile)/onboarding/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bot, ChevronRight, Settings, ClipboardList, Copy, PlusCircle, Trash2, Pencil, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import api, { setProfileId } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryForm } from '@/components/dashboard/categories/CategoryForm'; 
import { DeleteConfirmation } from '@/components/dashboard/DeleteConfirmation'; 
import Link from "next/link";

// URL DO BOT (Mock)
const WHATSAPP_BOT_NUMBER = '5521983311000'; // Número do admin/bot (sem formatação)

// Componente para Etapa 2 (Monitoramento de Grupo)
const GroupMonitorStep = ({ profileId, onComplete }) => {
    const { user } = useAuth(); // Usar o objeto user para verificar o número
    const [groups, setGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [loading, setLoading] = useState(true);
    const [monitorLoading, setMonitorLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Função para buscar grupos
    const fetchGroups = useCallback(async () => {
        setLoading(true);
        setError('');
        setProfileId(profileId); 

        try {
            const response = await api.get('/groups');
            setGroups(response.data || []);
        } catch (err) {
            const apiError = err.response?.data?.error || "Erro de conexão desconhecido.";
            setError(apiError);
            console.error("Erro na listagem de grupos:", apiError);
        } finally {
            setProfileId(null); 
            setLoading(false);
        }
    }, [profileId]);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);
    
    const handleMonitorGroup = async () => {
        if (!selectedGroupId) {
            setError("Por favor, selecione um grupo.");
            return;
        }
        setMonitorLoading(true);
        setError('');
        
        try {
            setProfileId(profileId); 
            await api.post('/groups', { groupId: selectedGroupId });
            onComplete(); 
        } catch (err) {
            setError(err.response?.data?.error || "Falha ao iniciar o monitoramento.");
        } finally {
            setProfileId(null);
            setMonitorLoading(false);
        }
    };
    
    const handleSkip = () => {
        onComplete();
    }

    if (loading) return <Skeleton className="h-40 w-full" />;

    const isWhatsappNumberMissing = error.includes('número de WhatsApp');

    return (
        <Card className="w-full max-w-xl mx-auto">
            <CardHeader>
                <CardTitle>Selecione o Grupo</CardTitle>
                <CardDescription>
                    Selecione o grupo que o Bot deve monitorar para o seu perfil.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-100 dark:bg-red-950 border border-red-300 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300 font-semibold">{error}</p>
                        {isWhatsappNumberMissing && (
                            <p className='text-xs mt-1'>
                                Por favor, vá em <Button variant="link" className="p-0 text-xs text-red-700 dark:text-red-300" asChild><Link href="/settings">Configurações</Link></Button> e configure seu número de WhatsApp no formato DDI+DDD+Número.
                            </p>
                        )}
                        {!isWhatsappNumberMissing && (
                            <p className='text-xs mt-1'>Verifique se o Bot está online e se o plano de assinatura está ativo.</p>
                        )}
                    </div>
                )}
                
                <div className="space-y-2">
                    <Label htmlFor="group">Grupo do WhatsApp</Label>
                    <Select 
                        onValueChange={setSelectedGroupId} 
                        defaultValue={selectedGroupId}
                        disabled={loading || monitorLoading || groups.length === 0}
                    >
                        <SelectTrigger id="group">
                            <SelectValue placeholder={groups.length === 0 ? "Nenhum grupo encontrado..." : "Selecione o grupo recém-criado"} />
                        </SelectTrigger>
                        <SelectContent>
                            {groups.length === 0 ? (
                                <SelectItem disabled value="empty">Nenhum grupo encontrado (Adicione o Bot).</SelectItem>
                            ) : (
                                groups.map(group => (
                                    <SelectItem key={group.phone} value={group.phone}>
                                        {group.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className='flex justify-between pt-4'>
                    <Button variant="ghost" onClick={handleSkip} disabled={monitorLoading}>
                        Pular Monitoramento
                    </Button>
                    <Button onClick={handleMonitorGroup} disabled={monitorLoading || !selectedGroupId || isWhatsappNumberMissing}>
                        {monitorLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Monitorar Grupo'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

// Componente para a Etapa 3 (Categorias e Metas)
const CategoriesGoalsStep = ({ profileId, onComplete }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalGoalValue, setTotalGoalValue] = useState('');
    const [modalState, setModalState] = useState({ type: null, data: null }); 
    
    const handleCategoryGoalChange = (id, value) => {
        setCategories(cats => cats.map(c => c.id === id ? { ...c, goal: value } : c));
    };

    const fetchCategoriesAndGoals = useCallback(async () => {
        setLoading(true);
        setError(null);
        setProfileId(profileId); 
        try {
            const [catRes, goalRes] = await Promise.all([
                api.get('/categories'), 
                api.get('/goals') 
            ]);
            
            const totalGoal = goalRes.data.find(g => g.is_total_goal);
            setTotalGoalValue(totalGoal?.value || '');
            
            setCategories(catRes.data.map(cat => ({
                ...cat,
                goal: goalRes.data.find(g => g.category_id === cat.id)?.value || '',
            })));

        } catch(err) {
            setError(err.response?.data?.error || "Não foi possível carregar as categorias/metas.");
        } finally {
            setProfileId(null);
            setLoading(false);
        }
    }, [profileId]);
    
    useEffect(() => {
        fetchCategoriesAndGoals();
    }, [fetchCategoriesAndGoals]);
    
    const handleSaveCategory = async (categoryData) => {
        const isEditing = !!modalState.data?.id;
        const method = isEditing ? 'put' : 'post';
        const url = isEditing ? `/categories/${modalState.data.id}` : '/categories';

        setLoading(true);
        setError(null);
        setProfileId(profileId); 
        try {
            await api[method](url, categoryData);
            setModalState({ type: null, data: null }); 
            await fetchCategoriesAndGoals(); 
        } catch (err) {
            setError(err.response?.data?.error || "Falha ao salvar categoria.");
        } finally {
            setProfileId(null);
            setLoading(false);
        }
    };

    const handleDeleteCategory = async () => {
        setLoading(true);
        setError(null);
        setProfileId(profileId); 
        try {
            await api.delete(`/categories/${modalState.data.id}`);
            setModalState({ type: null, data: null }); 
            await fetchCategoriesAndGoals(); 
        } catch (err) {
            setError(err.response?.data?.error || "Falha ao deletar categoria.");
        } finally {
            setProfileId(null);
            setLoading(false);
        }
    };

    const handleSaveGoals = async () => {
        setLoading(true);
        setError(null);
        setProfileId(profileId); 
        try {
            if (totalGoalValue) {
                await api.post('/goals', { value: totalGoalValue, isTotalGoal: true });
            }
            for (const cat of categories) {
                if (cat.goal) {
                    await api.post('/goals', { value: cat.goal, categoryId: cat.id, isTotalGoal: false });
                }
            }
            onComplete(); 
        } catch (err) {
            setError(err.response?.data?.error || "Falha ao salvar metas.");
        } finally {
            setProfileId(null);
            setLoading(false);
        }
    }

    return (
        <>
            <Card className="w-full max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle>Configure Metas e Categorias</CardTitle>
                    <CardDescription>
                        Crie novas categorias e defina sua meta de custo total.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    
                    <div className="space-y-2 border p-3 rounded-lg bg-secondary/50">
                        <Label htmlFor="total-goal">Meta de Custo Total (Mensal)</Label>
                        <Input 
                            id="total-goal" 
                            type="number" 
                            placeholder="R$ 5000.00" 
                            value={totalGoalValue}
                            onChange={(e) => setTotalGoalValue(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    
                    <div className="flex justify-between items-center pt-4">
                        <h3 className="font-semibold">Gerenciar Categorias ({categories.length})</h3>
                        <Button 
                            size="sm" 
                            onClick={() => setModalState({ type: 'form', data: null })}
                            disabled={loading}
                        >
                            <PlusCircle className="h-4 w-4 mr-1" /> Criar
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2 border p-3 rounded-lg">
                        {loading ? (
                            Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                        ) : categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between gap-2 border-b last:border-b-0 pb-1 pt-1">
                                <div className="flex-1 space-y-1">
                                    <Label htmlFor={`goal-${cat.id}`} className="text-sm font-semibold flex items-center gap-1">
                                        {cat.name} ({cat.type})
                                        <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setModalState({ type: 'edit', data: cat })}>
                                            <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-5 w-5 text-red-500" onClick={() => setModalState({ type: 'delete', data: cat })}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </Label>
                                    <Input
                                        id={`goal-${cat.id}`}
                                        type="number"
                                        placeholder="Meta R$ 0.00"
                                        value={cat.goal}
                                        onChange={(e) => handleCategoryGoalChange(cat.id, e.target.value)}
                                        disabled={loading}
                                        className="h-8 text-sm"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className='flex justify-between pt-4'>
                        <Button variant="ghost" onClick={onComplete} disabled={loading}>
                            Pular e Ir para o Dashboard
                        </Button>
                        <Button onClick={handleSaveGoals} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Salvar e Ir para o Dashboard'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {modalState.type === 'form' && (
                <CategoryForm
                    category={modalState.data}
                    onClose={() => setModalState({ type: null, data: null })}
                    onSave={handleSaveCategory}
                />
            )}
            {modalState.type === 'edit' && (
                <CategoryForm
                    category={modalState.data}
                    onClose={() => setModalState({ type: null, data: null })}
                    onSave={(data) => handleSaveCategory({ ...modalState.data, ...data })}
                />
            )}
            {modalState.type === 'delete' && (
                <DeleteConfirmation
                    open={true}
                    onClose={() => setModalState({ type: null, data: null })}
                    onConfirm={handleDeleteCategory}
                    title="Deletar Categoria?"
                    description={`Você tem certeza que deseja deletar a categoria &quot;${modalState.data.name}&quot;? As despesas existentes ficarão sem categoria. Esta ação não pode ser desfeita.`}
                />
            )}
        </>
    );
};

export default function OnboardingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, selectProfile } = useAuth();
    
    const profileId = searchParams.get('profileId');
    const profileName = searchParams.get('profileName') || 'Seu Novo Perfil';
    
    const [currentStep, setCurrentStep] = useState(1); 

    useEffect(() => {
        if (!isAuthenticated || !profileId) {
            router.push('/profiles/select');
        }
    }, [isAuthenticated, profileId, router]);
    
    useEffect(() => {
        if (profileId) {
            setProfileId(profileId);
        }
        return () => {
            setProfileId(null); 
        };
    }, [profileId]);

    const handleFinalRedirect = () => {
        selectProfile(profileId); 
    };

    if (!isAuthenticated || !profileId) return <div className="min-h-screen flex items-center justify-center bg-background"><Skeleton className="h-6 w-64" /></div>;
    
    const handleCopyBotNumber = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(WHATSAPP_BOT_NUMBER);
            alert(`Número copiado: ${WHATSAPP_BOT_NUMBER}`);
        } else {
            alert('Falha ao copiar. Por favor, copie manualmente: ' + WHATSAPP_BOT_NUMBER);
        }
    }

    const steps = [
        { id: 1, name: "Conectar WhatsApp", icon: Bot, content: null },
        { id: 2, name: "Monitoramento de Grupo", icon: Settings, content: <GroupMonitorStep profileId={profileId} onComplete={() => setCurrentStep(3)} /> },
        { id: 3, name: "Metas e Categorias", icon: ClipboardList, content: <CategoriesGoalsStep profileId={profileId} onComplete={handleFinalRedirect} /> },
    ];
    
    const step1Content = (
        <Card className="w-full max-w-xl mx-auto">
            <CardHeader>
                <CardTitle>Etapa 1: Conecte o WhatsApp</CardTitle>
                <CardDescription>
                    Para monitorar custos, você deve criar um grupo no WhatsApp e adicionar o Bot.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="font-semibold">Instruções:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Crie um novo grupo no seu WhatsApp (Ex: Custos - {profileName}).</li>
                    <li>Adicione o Bot, usando este número: 
                        <span className="font-bold text-primary ml-1 mr-1">
                            {WHATSAPP_BOT_NUMBER}
                        </span>
                        <Button size="sm" variant="outline" className="h-6" onClick={handleCopyBotNumber}>
                            <Copy className="h-3 w-3 mr-1" /> Copiar
                        </Button>
                    </li>
                    <li>Defina a próxima etapa para selecionar o grupo.</li>
                </ol>
                <div className='flex justify-end pt-4'>
                    <Button onClick={() => setCurrentStep(2)} className="w-full sm:w-auto">
                        Próxima Etapa (Selecionar Grupo) <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 w-full max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Bem-vindo, {profileName}!</h1>
            <p className="text-muted-foreground mb-8">Configure seu novo perfil em {steps.length} passos rápidos.</p>

            <div className="flex w-full justify-between mb-8 space-x-2">
                {steps.map(step => (
                    <Card 
                        key={step.id} 
                        className={cn(
                            "flex-1 p-4 text-center cursor-pointer transition-all hover:shadow-lg",
                            step.id <= currentStep ? "bg-primary text-primary-foreground border-primary" : "bg-gray-100 text-gray-500 border-border dark:bg-gray-800 dark:text-gray-400"
                        )}
                        onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                    >
                        <CardContent className="flex flex-col items-center gap-2 p-0">
                            <step.icon className="h-6 w-6" />
                            <span className="text-xs font-medium">{step.name}</span>
                            {step.id < currentStep && <CheckCircle className="h-4 w-4 text-green-400 mt-1" />}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {currentStep === 1 ? step1Content : steps.find(s => s.id === currentStep)?.content}
        </div>
    );
}
