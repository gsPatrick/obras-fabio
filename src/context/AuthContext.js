// context/AuthContext.js - VERSÃO REESTRUTURADA E DEFINITIVA

'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api, { setProfileId as setProfileIdInApi } from '@/lib/api'; 
import { Loader2 } from 'lucide-react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // <<< NOVO ESTADO CENTRALIZADO PARA O PERFIL ATIVO >>>
    const [activeProfile, setActiveProfile] = useState(null);

    const router = useRouter();

    const loadUserAndProfile = useCallback(async () => {
        if (typeof window === 'undefined') {
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const userResponse = await api.get('/users/me');
                setUser(userResponse.data);
                setIsAuthenticated(true);

                // Após autenticar, verifica se há um perfil ativo no localStorage
                const storedProfileId = localStorage.getItem('currentProfileId');
                if (storedProfileId) {
                    // Se houver, busca todos os perfis e define o ativo
                    const profilesResponse = await api.get('/profiles');
                    const profileToActivate = profilesResponse.data.find(p => p.id === parseInt(storedProfileId, 10));
                    if (profileToActivate) {
                        setActiveProfile(profileToActivate);
                    } else {
                        // Se o ID armazenado é inválido, limpa
                        localStorage.removeItem('currentProfileId');
                        setActiveProfile(null);
                    }
                }
            } catch (error) {
                console.error("Token inválido ou sessão expirada:", error);
                // --- INÍCIO DA CORREÇÃO ---
                // Em vez de chamar logout() que faz um hard refresh,
                // apenas limpamos o estado local. O layout cuidará do redirecionamento.
                localStorage.removeItem('authToken');
                setProfileIdInApi(null);
                setUser(null);
                setIsAuthenticated(false);
                setActiveProfile(null);
                // --- FIM DA CORREÇÃO ---
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadUserAndProfile();
    }, [loadUserAndProfile]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token } = response.data;
            localStorage.setItem('authToken', token);
            // Após o login, limpa qualquer perfil antigo para forçar a seleção
            setProfileIdInApi(null); 
            setActiveProfile(null);
            await loadUserAndProfile();
            router.push('/profiles/select');
        } catch (error) {
            throw error;
        }
    };
    
    const selectProfile = (profileId) => {
        // 1. Define o ID no localStorage para persistência e para o interceptor da API
        setProfileIdInApi(profileId);
        
        // 2. Redireciona. O useEffect acima cuidará de carregar o objeto do perfil.
        if (profileId) {
            // Força um recarregamento da página para garantir que todos os componentes
            // recebam o novo estado do perfil. Essencial para o dashboard.
            window.location.href = '/Painel';
        } else {
            setActiveProfile(null);
            router.push('/profiles/select');
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setProfileIdInApi(null); // Limpa o ID do localStorage
        setUser(null);
        setIsAuthenticated(false);
        setActiveProfile(null); // Limpa o estado do perfil ativo
        window.location.href = '/login'; // Força recarregamento para limpar estados
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        selectProfile,
        activeProfile, // <<< EXPORTA O PERFIL ATIVO PARA OS COMPONENTES
    };
    
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};