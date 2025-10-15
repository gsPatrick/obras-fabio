// app/(profile)/manage/page.js - VERSÃO COMPLETA E SEM OMISSÕES
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Trash2, Pencil, PlusCircle } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DeleteConfirmation } from '@/components/dashboard/DeleteConfirmation';
import { Skeleton } from '@/components/ui/skeleton';
import { ImportOrDashboardModal } from '@/components/profile/ImportOrDashboardModal'; 
import { useAuth } from '@/context/AuthContext';

// Placeholder para imagem de perfil padrão
const DEFAULT_PLACEHOLDER_URL = '/usuario.png'; 

// Componente de formulário de criação/edição
const ProfileForm = ({ profile, onSave, onCancel, isCreatingFirst }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState(profile?.name || '');
    const [imageUrl, setImageUrl] = useState(profile?.image_url || DEFAULT_PLACEHOLDER_URL);
    const [error, setError] = useState(null);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const finalImageUrl = imageUrl === DEFAULT_PLACEHOLDER_URL || !imageUrl ? null : imageUrl;
            const data = { name, image_url: finalImageUrl };
            await onSave(profile?.id, data);
        } catch (err) {
            setError(err.response?.data?.error || "Falha ao salvar o perfil.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle>{profile ? 'Editar Perfil' : 'Criar Novo Perfil'}</CardTitle>
                <CardDescription>{isCreatingFirst ? 'Você deve criar um perfil para continuar.' : 'Gerencie os detalhes do perfil.'}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-center mb-4">
                        <img 
                            src={imageUrl} 
                            alt="Avatar Preview" 
                            className="size-24 rounded-lg object-cover border border-border" 
                            onError={(e) => e.target.src = DEFAULT_PLACEHOLDER_URL}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do Perfil</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image_url">URL da Imagem (Opcional)</Label>
                        <Input 
                            id="image_url" 
                            value={imageUrl === DEFAULT_PLACEHOLDER_URL && !profile?.image_url ? '' : imageUrl} 
                            onChange={(e) => setImageUrl(e.target.value || DEFAULT_PLACEHOLDER_URL)} 
                            disabled={isLoading} 
                            placeholder="Ex: https://example.com/avatar.jpg"
                        />
                    </div>
                    
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    
                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading || isCreatingFirst}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading || !name}>
                            {isLoading ? 'Salvando...' : (profile ? 'Salvar Alterações' : 'Criar Perfil')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default function ManageProfilesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentAction, setCurrentAction] = useState({ type: null, data: null }); 
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/profiles'); 
            setProfiles(response.data);
        } catch (err) {
            console.error("Falha ao carregar os perfis:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    useEffect(() => {
        const action = searchParams.get('action');
        
        if (!loading && currentAction.type !== 'import_or_dashboard') {
            if (action === 'create') {
                setCurrentAction({ type: 'create', data: { isFirstCreation: profiles.length === 0 } });
            } else if (profiles.length === 0 && currentAction.type !== 'create') {
                 setCurrentAction({ type: 'create', data: { isFirstCreation: true } });
            }
        }
    }, [loading, profiles, currentAction.type, searchParams]);


    const handleSave = async (id, data) => {
        try {
            if (id) {
                await api.put(`/profiles/${id}`, data);
                fetchData();
                setCurrentAction({ type: null, data: null });
            } else {
                const response = await api.post('/profiles', data);
                fetchData(); 
                setCurrentAction({ type: 'import_or_dashboard', data: { profileId: response.data.id, profileName: response.data.name } });
            }
        } catch (err) {
            throw err;
        }
    };
    
    const handleDelete = async () => {
        try {
            await api.delete(`/profiles/${currentAction.data.id}`);
            const remainingProfiles = profiles.filter(p => p.id !== currentAction.data.id);
            setProfiles(remainingProfiles);
            setCurrentAction({ type: null, data: null });
            
            if (remainingProfiles.length === 0) { 
                router.push('/profiles/select');
            }
        } catch (err) {
            console.error("Falha ao deletar:", err);
        }
    };
    
    const handleChoiceModalClose = () => {
        setCurrentAction({ type: null, data: null });
        router.push('/profiles/select');
    };

    const handleCancelForm = () => {
        router.push('/profiles/select');
    };

    const profileLimit = user?.subscription?.profile_limit ?? 1;
    const canCreateProfile = profiles.length < profileLimit;

    if (loading) {
        return <div className="p-8 space-y-4 max-w-lg mx-auto"><Skeleton className="h-10 w-full" /><Skeleton className="h-40 w-full" /></div>;
    }
    
    if (currentAction.type === 'import_or_dashboard') {
        return (
            <ImportOrDashboardModal 
                open={true}
                profileId={currentAction.data.profileId}
                profileName={currentAction.data.profileName}
                onClose={handleChoiceModalClose}
            />
        );
    }
    
    if (currentAction.type === 'create' || currentAction.type === 'edit') {
        return (
            <div className="p-8 space-y-6 max-w-lg mx-auto">
                <Button variant="ghost" onClick={handleCancelForm} disabled={currentAction.data?.isFirstCreation}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {currentAction.data?.isFirstCreation ? 'Voltar (Crie um perfil primeiro)' : 'Voltar'}
                </Button>
                <ProfileForm 
                    profile={currentAction.data?.profile} 
                    onSave={handleSave} 
                    onCancel={handleCancelForm}
                    isCreatingFirst={currentAction.data?.isFirstCreation}
                />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Perfis</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/profiles/select')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar para Seleção
                    </Button>
                    
                    {canCreateProfile ? (
                        <Button onClick={() => setCurrentAction({ type: 'create', data: null })}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Novo Perfil
                        </Button>
                    ) : (
                        <Button disabled title="Você atingiu o limite de perfis do seu plano.">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Limite de perfis atingido
                        </Button>
                    )}
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Perfis Cadastrados ({profiles.length}/{profileLimit})</CardTitle>
                    <CardDescription>Atenção: A exclusão de um perfil é irreversível e deleta todas as despesas associadas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {profiles.map(profile => (
                            <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center gap-4">
                                    <img 
                                        src={profile.image_url || DEFAULT_PLACEHOLDER_URL} 
                                        alt={profile.name} 
                                        className="size-10 rounded-full object-cover border border-border" 
                                        onError={(e) => e.target.src = DEFAULT_PLACEHOLDER_URL}
                                    />
                                    <div>
                                        <p className="font-semibold">{profile.name}</p>
                                        <p className="text-sm text-muted-foreground">{profile.monitoredGroup?.name ? `Monitorando: ${profile.monitoredGroup.name}` : 'Sem Grupo Monitorado'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" onClick={() => setCurrentAction({ type: 'edit', data: { profile } })}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => setCurrentAction({ type: 'delete', data: profile })}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {currentAction.type === 'delete' && (
                <DeleteConfirmation 
                    open={true}
                    onClose={() => setCurrentAction({ type: null, data: null })}
                    onConfirm={handleDelete}
                    title={`Deletar Perfil "${currentAction.data.name}"?`}
                    description="Isso excluirá o perfil, todas as despesas e grupos monitorados associados a ele. Esta ação não pode ser desfeita."
                />
            )}
        </div>
    );
}