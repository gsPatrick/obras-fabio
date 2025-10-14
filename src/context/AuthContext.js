// context/AuthContext.js - VERSÃO COM FLUXO DE LOGIN CORRIGIDO

'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api, { setProfileId } from '@/lib/api'; 
import { Loader2 } from 'lucide-react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    const loadUserFromToken = useCallback(async () => {
        if (typeof window === 'undefined') {
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const response = await api.get('/users/me');
                setUser(response.data);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Token inválido ou sessão expirada:", error);
                logout(); 
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadUserFromToken();
    }, [loadUserFromToken]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            
            // <<< MUDANÇA CRÍTICA: A API não envia mais 'profileId' no login >>>
            const { token } = response.data;

            // 1. Salva o token no localStorage
            localStorage.setItem('authToken', token);

            // 2. Carrega os dados do usuário para o contexto
            await loadUserFromToken();

            // 3. Redireciona INCONDICIONALMENTE para a página de seleção de perfis
            router.push('/profiles/select');

        } catch (error) {
            // Lança o erro para a página de login poder exibi-lo
            throw error;
        }
    };
    
    const selectProfile = (profileId) => {
        // Esta função agora é usada pela página de seleção e pelo switcher de perfis
        setProfileId(profileId); 
        
        if (profileId) {
            // Força um recarregamento completo para garantir que todos os componentes
            // e dados sejam recarregados com o novo contexto de perfil.
            window.location.href = '/Painel';
        } else {
            // Se, por algum motivo, um perfil for "desselecionado", volta para a tela de seleção.
            router.push('/profiles/select');
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setProfileId(null); 
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = '/login';
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        selectProfile,
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