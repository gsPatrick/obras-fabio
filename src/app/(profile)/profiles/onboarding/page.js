// app/(profile)/onboarding/page.js - VERSÃO COM REDIRECIONAMENTO CORRIGIDO
'use client';

import { useState, useEffect, useCallback } from 'react'; 
import { useRouter, useSearchParams } from 'next/navigation';
import { Bot, ChevronRight, ClipboardList, Copy, PlusCircle, Trash2, Pencil, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import api, { setProfileId } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryForm } from '@/components/dashboard/categories/CategoryForm'; 
import { DeleteConfirmation } from '@/components/dashboard/DeleteConfirmation'; 

const WHATSAPP_BOT_NUMBER = '554796843271'; 

// --- ETAPA 2: CATEGORIAS E METAS ---
const CategoriesGoalsStep = ({ profileId, onComplete }) => {
    // ... (O conteúdo deste componente permanece exatamente o mesmo)
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalGoalValue, setTotalGoalValue] = useState('');
    const [modalState, setModalState] = useState({ type: null, data: null }); 
    
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
                    <CardTitle>Configure Metas e Categorias Iniciais</CardTitle>
                    <CardDescription>
                        Crie as categorias principais do seu projeto e defina uma meta de custo total.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    
    
                    
                    <div className="flex justify-between items-center pt-4">
                        <h3 className="font-semibold">Gerenciar Categorias ({categories.length})</h3>
                        <Button 
                            size="sm" 
                            onClick={() => setModalState({ type: 'form', data: null })}
                            disabled={loading}
                        >
                            <PlusCircle className="h-4 w-4 mr-1" /> Criar Categoria
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2 border p-3 rounded-lg">
                        {loading ? (
                            Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                        ) : categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between gap-2 border-b last:border-b-0 pb-1 pt-1">
                                <span className="text-sm font-medium">{cat.name} ({cat.type})</span>
                                <div>
                                    <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setModalState({ type: 'form', data: cat })}>
                                        <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-5 w-5 text-red-500" onClick={() => setModalState({ type: 'delete', data: cat })}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className='flex justify-end pt-4'>
                        <Button onClick={handleSaveGoals} disabled={loading} className="w-full">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Salvar e Concluir Onboarding'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {['form', 'edit'].includes(modalState.type) && (
                <CategoryForm
                    category={modalState.data}
                    onClose={() => setModalState({ type: null, data: null })}
                    onSave={handleSaveCategory}
                />
            )}
            {modalState.type === 'delete' && (
                <DeleteConfirmation
                    open={true}
                    onClose={() => setModalState({ type: null, data: null })}
                    onConfirm={handleDeleteCategory}
                    title="Deletar Categoria?"
                    description={`Você tem certeza que deseja deletar a categoria "${modalState.data.name}"?`}
                />
            )}
        </>
    );
};


// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function OnboardingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // A função selectProfile não é mais necessária aqui
    const { isAuthenticated } = useAuth(); 
    
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

    // <<< MUDANÇA CRÍTICA AQUI >>>
    const handleFinalRedirect = () => {
        // Em vez de chamar selectProfile, redirecionamos diretamente
        // para a página de seleção de perfis.
        router.push('/profiles/select');
    };

    const handleCopyBotNumber = () => {
        navigator.clipboard.writeText(WHATSAPP_BOT_NUMBER).then(() => {
            alert(`Número copiado: ${WHATSAPP_BOT_NUMBER}`);
        }).catch(() => {
            alert('Falha ao copiar. Por favor, copie manualmente: ' + WHATSAPP_BOT_NUMBER);
        });
    }

    const steps = [
        { id: 1, name: "Conectar WhatsApp", icon: Bot, content: null },
        { id: 2, name: "Metas e Categorias", icon: ClipboardList, content: <CategoriesGoalsStep profileId={profileId} onComplete={handleFinalRedirect} /> },
    ];
    
    const step1Content = (
        <Card className="w-full max-w-xl mx-auto">
            <CardHeader>
                <CardTitle>Etapa 1: Conecte o WhatsApp</CardTitle>
                <CardDescription>
                    Para monitorar custos, você deve criar um grupo no WhatsApp e adicionar nosso Bot.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="font-semibold">Instruções:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>No seu celular, crie um novo grupo no WhatsApp (Ex: &quot;Custos - {profileName}&quot;).</li>
                    <li>Adicione o Bot como um participante, usando o número: 
                        <span className="font-bold text-primary ml-1 mr-1">
                            {WHATSAPP_BOT_NUMBER}
                        </span>
                        <Button size="sm" variant="outline" className="h-6" onClick={handleCopyBotNumber}>
                            <Copy className="h-3 w-3 mr-1" /> Copiar
                        </Button>
                    </li>
                    <li>Após adicionar o Bot, ele iniciará a configuração automaticamente no grupo.</li>
                    <li>Quando terminar a configuração lá, volte aqui e avance para a próxima etapa.</li>
                </ol>
                <div className='flex justify-end pt-4'>
                    <Button onClick={() => setCurrentStep(2)} className="w-full sm:w-auto">
                        Já adicionei o Bot, ir para Categorias <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    if (!isAuthenticated || !profileId) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 w-full max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Bem-vindo, {profileName}!</h1>
            <p className="text-muted-foreground mb-8">Configure seu novo perfil em 2 passos rápidos.</p>

            <div className="flex w-full justify-center mb-8 space-x-4">
                {steps.map(step => (
                    <Card 
                        key={step.id} 
                        className={cn(
                            "w-48 p-4 text-center transition-all",
                            step.id <= currentStep ? "bg-primary text-primary-foreground border-primary" : "bg-gray-100 text-gray-500 border-border dark:bg-gray-800 dark:text-gray-400"
                        )}
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