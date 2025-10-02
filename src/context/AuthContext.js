// context/AuthContext.js - VERSÃO COM MÍNIMO DE REDIRECIONAMENTO

"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api, { setProfileId } from '../lib/api'; 

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUserFromToken() {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const { data } = await api.get('/users/me'); 
          if (data) {
            setUser(data);
            
            // Apenas carrega o profileId da sessão se existir
            const savedProfileId = localStorage.getItem('currentProfileId');
            if(savedProfileId) {
                setProfileId(savedProfileId); 
            }
          }
        } catch (error) {
          // Token inválido ou expirado - Limpa a sessão
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentProfileId');
          setProfileId(null);
          setUser(null);
          // Não redireciona, deixa a página atual resolver.
        }
      }
      
      setLoading(false);
    }
    loadUserFromToken();
  }, []); 

  const login = async (email, password) => {
    try {
      const { data: loginResponse } = await api.post('/auth/login', { email, password });
      
      if (loginResponse.token) {
        localStorage.setItem('authToken', loginResponse.token);
        
        // <<< CRÍTICO: CAPTURAR E ARMAZENAR O PROFILE ID RETORNADO PELO LOGIN >>>
        if (loginResponse.profileId) {
            localStorage.setItem('currentProfileId', loginResponse.profileId);
            setProfileId(loginResponse.profileId);
        }
        // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        
        // Faz a requisição de dados do usuário (que agora contém o whatsapp_phone)
        const { data: userData } = await api.get('/users/me');
        setUser(userData);
        
        // Regra Especial: Após login, redireciona para a tela de seleção de perfil.
        router.push('/profiles/select');
        return;
      } else {
         throw new Error('Token não recebido do servidor.');
      }

    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentProfileId');
      setProfileId(null);
      throw new Error(error.response?.data?.error || 'Falha no login');
    }
  };
  
  // Função para seleção de perfil
  const selectProfile = (profileId) => {
      setProfileId(profileId); // Salva no cliente Axios e localStorage
      router.push('/Painel'); // Redireciona para o Dashboard
  };

  const logout = async () => {
    try {
        await api.post('/auth/logout'); 
    } catch (error) {
        console.error("Erro no endpoint de logout, mas prosseguindo com o logout no cliente.", error);
    } finally {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentProfileId');
        setProfileId(null); 
        setUser(null);
        // Regra Especial: Redireciona para a tela de login.
        router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, selectProfile, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);