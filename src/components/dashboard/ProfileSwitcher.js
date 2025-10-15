// components/dashboard/ProfileSwitcher.js - VERSÃO COMPLETA COM LIMITADOR
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// <<< CRÍTICO: Importar o ícone 'Pencil' >>>
import { Check, Plus, Loader2, ChevronsUpDown, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export function ProfileSwitcher() {
    const { user, selectProfile, logout, activeProfile, loading: authLoading } = useAuth();
    const router = useRouter();
    
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfiles = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const response = await api.get('/profiles');
                setProfiles(response.data || []);
            } catch (err) {
                console.error("Falha ao carregar perfis para o switcher:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, [user]);

    const handleProfileSwitch = (profileId) => {
        selectProfile(profileId); 
    };

    const getInitials = (name) => {
        return name ? name.substring(0, 2).toUpperCase() : '?';
    };
    
    // <<< NOVA LÓGICA DE VERIFICAÇÃO DE LIMITE >>>
    const profileLimit = user?.subscription?.profile_limit ?? 1;
    const canCreateProfile = profiles.length < profileLimit;
    const isLoading = loading || authLoading;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Avatar className="size-6">
                                {activeProfile?.image_url && <AvatarImage src={activeProfile.image_url} alt={activeProfile.name} />}
                                <AvatarFallback className="text-xs">
                                    {getInitials(activeProfile?.name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden md:inline">{activeProfile?.name || 'Selecionar Perfil'}</span>
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                    <div className="flex flex-col">
                        <span>Minha Conta</span>
                        <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuLabel>Trocar de Perfil</DropdownMenuLabel>
                {isLoading ? (
                    <DropdownMenuItem disabled>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Carregando...
                    </DropdownMenuItem>
                ) : (
                    profiles.map((profile) => (
                        <DropdownMenuItem 
                            key={profile.id} 
                            onClick={() => handleProfileSwitch(profile.id)}
                            className="flex items-center justify-between"
                        >
                            <span>{profile.name}</span>
                            {profile.id === activeProfile?.id && <Check className="h-4 w-4" />}
                        </DropdownMenuItem>
                    ))
                )}
                
                <DropdownMenuSeparator />
                
                {/* <<< CRÍTICO: Renderização condicional do item "Adicionar Perfil" >>> */}
                {canCreateProfile && (
                    <DropdownMenuItem onClick={() => router.push('/profiles/manage?action=create')}>
                        <Plus className="h-4 w-4 mr-2" /> Adicionar Perfil
                    </DropdownMenuItem>
                )}
                
                {/* Item "Gerenciar Perfis" agora está sempre visível e tem um ícone diferente */}
                <DropdownMenuItem onClick={() => router.push('/profiles/manage')}>
                    <Pencil className="h-4 w-4 mr-2" /> Gerenciar Perfis
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                    Sair da Conta
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}