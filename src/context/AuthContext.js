// context/AuthContext.js
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

// Função para definir o Profile ID no localStorage.
// Mantida aqui para garantir que o contexto seja autocontido com suas dependências diretas.
const setProfileIdInStorage = (profileId) => {
  if (typeof window !== 'undefined') {
    if (profileId) {
      localStorage.setItem('selectedProfileId', profileId);
    } else {
      localStorage.removeItem('selectedProfileId');
    }
  }
};

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
                // O interceptor do api.js já adiciona o token a partir do localStorage
                const response = await api.get('/users/me');
                setUser(response.data);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Token inválido ou sessão expirada:", error);
                // Chama a função de logout para limpar tudo de forma segura
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
            const { token, profileId } = response.data;

            // Salva o token diretamente no localStorage
            localStorage.setItem('authToken', token);

            await loadUserFromToken();

            if (profileId) {
                selectProfile(profileId);
            } else {
                router.push('/profiles/select');
            }
        } catch (error) {
            // Lança o erro para a página de login poder exibi-lo
            throw error;
        }
    };
    
    const selectProfile = (profileId) => {
        if (profileId) {
            // Salva o novo profileId no localStorage
            setProfileIdInStorage(profileId);
            
            // CORREÇÃO DEFINITIVA: Força um recarregamento completo da página.
            // Isso garante que todos os componentes (Header, Sidebar, etc.)
            // sejam renderizados do zero e que o interceptor do api.js leia o
            // novo profileId do localStorage para todas as futuras requisições.
            window.location.href = '/Painel';
        } else {
            router.push('/profiles/select');
        }
    };

    const logout = () => {
        // Limpa o localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('selectedProfileId');

        // Reseta o estado local
        setUser(null);
        setIsAuthenticated(false);

        // Redireciona para a página de login
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
    
    // Renderiza um loader global enquanto o estado inicial de autenticação é verificado
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