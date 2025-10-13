// components/dashboard/ProfileSwitcher.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Plus, Loader2, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export function ProfileSwitcher() {
    const { user, selectProfile, logout } = useAuth();
    const router = useRouter();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentProfile, setCurrentProfile] = useState(null);

    useEffect(() => {
        const fetchAndSetProfiles = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const response = await api.get('/profiles');
                const userProfiles = response.data || [];
                setProfiles(userProfiles);

                const storedProfileId = localStorage.getItem('selectedProfileId');
                if (storedProfileId) {
                    const activeProfile = userProfiles.find(p => p.id === parseInt(storedProfileId, 10));
                    setCurrentProfile(activeProfile);
                }
            } catch (err) {
                console.error("Falha ao carregar perfis para o switcher:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAndSetProfiles();
    }, [user]);

    const handleProfileSwitch = (profileId) => {
        // A função selectProfile do AuthContext fará a mágica do recarregamento.
        selectProfile(profileId); 
    };

    const getInitials = (name) => {
        return name ? name.substring(0, 2).toUpperCase() : '?';
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Avatar className="size-6">
                                {currentProfile?.image_url && <AvatarImage src={currentProfile.image_url} alt={currentProfile.name} />}
                                <AvatarFallback className="text-xs">
                                    {getInitials(currentProfile?.name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden md:inline">{currentProfile?.name || 'Selecionar Perfil'}</span>
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
                {loading ? (
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
                            {profile.id === currentProfile?.id && <Check className="h-4 w-4" />}
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