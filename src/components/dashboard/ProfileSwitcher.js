// components/dashboard/ProfileSwitcher.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

// Função auxiliar para obter as iniciais (reutilizada do Header)
const getInitials = (text) => {
    if (!text) return '..';
    const parts = text.split('@');
    return parts[0].substring(0, 2).toUpperCase();
};

export function ProfileSwitcher({ currentProfileId }) {
    const { user, selectProfile, logout } = useAuth();
    const router = useRouter();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Obter todos os perfis do usuário
    useEffect(() => {
        const fetchProfiles = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // Rota /profiles só exige JWT, não X-Profile-Id
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
    
    // Handler para trocar de perfil
    const handleProfileSwitch = (profileId) => {
        // A função selectProfile do AuthContext fará o setProfileId e o router.push('/dashboard')
        selectProfile(profileId); 
    };
    
    // Encontra o perfil atualmente selecionado para o Avatar
    const currentProfile = profiles.find(p => p.id === parseInt(currentProfileId, 10));
    
    // Encontra o email inicial do usuário para o fallback
    const userInitials = user ? getInitials(user.email) : '..';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                    <Avatar>
                        {/* Avatar do Perfil ou Iniciais do Usuário */}
                        <AvatarFallback className="bg-primary/20 text-primary">
                            {currentProfile ? getInitials(currentProfile.name) : userInitials}
                        </AvatarFallback>
                    </Avatar>
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

                <DropdownMenuLabel>Perfis ({profiles.length})</DropdownMenuLabel>
                {loading ? (
                    <DropdownMenuItem disabled>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Carregando Perfis...
                    </DropdownMenuItem>
                ) : (
                    profiles.map((profile) => (
                        <DropdownMenuItem 
                            key={profile.id} 
                            onClick={() => handleProfileSwitch(profile.id)}
                            className={cn(
                                "flex items-center justify-between",
                                profile.id === parseInt(currentProfileId, 10) && "bg-accent text-accent-foreground"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <Avatar className="size-6">
                                    <AvatarFallback className="text-xs bg-secondary">
                                        {getInitials(profile.name)}
                                    </AvatarFallback>
                                </Avatar>
                                {profile.name}
                            </div>
                            {profile.id === parseInt(currentProfileId, 10) && <Check className="h-4 w-4" />}
                        </DropdownMenuItem>
                    ))
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => router.push('/profiles/manage')}>
                    <Plus className="h-4 w-4 mr-2" /> Gerenciar Perfis
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                    Sair da Conta
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}