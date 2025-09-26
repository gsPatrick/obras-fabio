// context/AuthContext.js - NOVA VERSÃO COMPLETA
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Tenta carregar o usuário ao iniciar o app, usando o token do localStorage
    async function loadUserFromToken() {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const { data } = await api.get('/users/me'); // O interceptor adiciona o token
          if (data) setUser(data);
        } catch (error) {
          // Token inválido ou expirado
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    }
    loadUserFromToken();
  }, []);

  const login = async (email, password) => {
    try {
      // 1. Faz o login e recebe o token na resposta
      const { data: loginResponse } = await api.post('/auth/login', { email, password });
      
      if (loginResponse.token) {
        // 2. Salva o token no localStorage
        localStorage.setItem('authToken', loginResponse.token);

        // 3. Busca os dados do usuário
        const { data: userData } = await api.get('/users/me');
        setUser(userData);
        router.push('/Painel');
      } else {
         throw new Error('Token não recebido do servidor.');
      }

    } catch (error) {
      // Limpa qualquer token antigo se o login falhar
      localStorage.removeItem('authToken');
      throw new Error(error.response?.data?.error || 'Falha no login');
    }
  };

  const logout = async () => {
    try {
        await api.post('/auth/logout'); // Opcional, apenas para invalidar no backend se houver lógica para isso
    } catch (error) {
        console.error("Erro no endpoint de logout, mas prosseguindo com o logout no cliente.", error);
    } finally {
        // 4. Remove o token e reseta o estado do usuário
        localStorage.removeItem('authToken');
        setUser(null);
        router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);