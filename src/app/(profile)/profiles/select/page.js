// app/(profile)/select/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck'; // <<< IMPORTAR HOOK DE CHECAGEM DE PLANO

// Componente do item de perfil
const ProfileItem = ({ profile, onSelect }) => {
    return (
        <div className="flex flex-col items-center cursor-pointer group space-y-2" onClick={() => onSelect(profile.id)}>
            <div 
                className={cn(
                    "size-40 rounded-lg overflow-hidden border-4 transition-transform group-hover:scale-105",
                    "border-transparent group-hover:border-primary/50 group-hover:ring-4 group-hover:ring-primary/20"
                )}
            >
                {/* Mockup da imagem de perfil. Usamos div/cor se image_url for null */}
                {profile.image_url ? (
                    <Image 
                        src={profile.image_url} 
                        alt={profile.name} 
                        width={160} 
                        height={160} 
                        className="object-cover size-full"
                    />
                ) : (
                    <div className="size-full bg-secondary/50 flex items-center justify-center text-4xl font-bold text-secondary-foreground">
                        {profile.name.substring(0, 1).toUpperCase()}
                    </div>
                )}
            </div>
            <p className="text-xl text-foreground group-hover:text-primary">{profile.name}</p>
        </div>
    );
};

// Componente para criar novo perfil
const CreateProfileItem = ({ onCreate }) => {
    return (
        <div className="flex flex-col items-center cursor-pointer group space-y-2" onClick={() => onCreate()}>
            <div 
                className={cn(
                    "size-40 rounded-lg overflow-hidden border-4 transition-transform group-hover:scale-105",
                    "border-transparent group-hover:border-primary/50 group-hover:ring-4 group-hover:ring-primary/20",
                    "bg-secondary flex items-center justify-center" // Usando secondary para um fundo cinza claro/escuro
                )}
            >
                <Plus className="size-16 text-primary" />
            </div>
            <p className="text-xl text-foreground/70 group-hover:text-primary">Adicionar Perfil</p>
        </div>
    );
};

export default function SelectProfilePage() {
    const { isAuthenticated, selectProfile, logout, loading: authLoading } = useAuth();
    const router = useRouter();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // <<< CRÍTICO: Checagem de Assinatura >>>
    const { isAllowed, checkLoading } = useSubscriptionCheck();
    
    // Função para buscar perfis
    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        try {
            // A rota /profiles é a única que não exige o header X-Profile-Id
            const response = await api.get('/profiles');
            setProfiles(response.data);
        } catch (err) {
            setError("Não foi possível carregar os perfis. Tente fazer login novamente.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchProfiles();
        }
    }, [authLoading, isAuthenticated, fetchProfiles]);
    
    // 1. Redirecionamento de Desautenticação (Prioridade Máxima)
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    const handleSelectProfile = (profileId) => {
        selectProfile(profileId); // Salva o ID no AuthContext e redireciona para /dashboard
    };
    
    // Leva para o formulário de CRIAÇÃO
    const handleCreateProfile = () => {
        router.push('/profiles/manage?action=create'); 
    };
    
    // Leva para a tela de GERENCIAMENTO (CRUD completo)
    const handleManageProfiles = () => {
        router.push('/profiles/manage'); 
    };

    // =========================================================
    // ESTADO DE CARREGAMENTO / BLOQUEIO DE PLANO
    // =========================================================
    if (loading || authLoading || checkLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }
    
    // O useSubscriptionCheck deve redirecionar para /subscribe se isAllowed for false.
    // Se o código chegou aqui e !isAllowed, algo deu errado, mas o hook deve ter disparado o redirecionamento.
    if (!isAllowed) {
        return null; // A tela de subscribe está sendo carregada
    }
    
    // =========================================================
    // RENDERIZAÇÃO PRINCIPAL
    // =========================================================
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8"> 
            <h1 className="text-4xl font-bold mb-12">Quem está gerenciando?</h1>

            <div className="flex flex-wrap justify-center gap-12">
                {profiles.map(profile => (
                    <ProfileItem 
                        key={profile.id} 
                        profile={profile} 
                        onSelect={handleSelectProfile} 
                    />
                ))}
                {/* O clique agora vai direto para o formulário de criação */}
                <CreateProfileItem onCreate={handleCreateProfile} />
            </div>

            <div className="mt-16 space-x-4">
                {/* Ação de Gerenciamento (CRUD completo) */}
                <Button variant="outline" onClick={handleManageProfiles} className="border-border text-foreground hover:bg-accent/50">
                    GERENCIAR PERFIS
                </Button>
                <Button variant="ghost" onClick={logout} className="text-red-500 hover:bg-red-500/10">
                    Sair
                </Button>
            </div>
            
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
}