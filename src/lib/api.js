// lib/api.js - VERSÃO CORRIGIDA E CENTRALIZADA

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://jackbear-obras-fabio-api.r954jc.easypanel.host/',
});

/**
 * Função UNIFICADA para definir o Profile ID globalmente.
 * Esta é a ÚNICA função que deve escrever no localStorage para o profileId.
 * @param {string | null} profileId 
 */
export const setProfileId = (profileId) => {
  // Garante que estamos operando no lado do cliente
  if (typeof window !== 'undefined') {
    if (profileId) {
      // Usa a chave 'currentProfileId', que é a mesma lida pelo interceptor.
      localStorage.setItem('currentProfileId', profileId);
    } else {
      // Garante a limpeza completa ao fazer logout ou deselecionar
      localStorage.removeItem('currentProfileId');
    }
  }
};

/**
 * Interceptor para adicionar dinamicamente os cabeçalhos de autenticação
 * a cada requisição enviada pela aplicação.
 */
api.interceptors.request.use(
  (config) => {
    // Garante que estamos operando no lado do cliente
    if (typeof window !== 'undefined') {
      // 1. Adiciona o Token de Autenticação se ele existir
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      // 2. Adiciona o ID do Perfil se ele existir no localStorage (LENDO DA CHAVE CORRETA)
      const profileId = localStorage.getItem('currentProfileId');
      
      // 3. Define as rotas que NÃO precisam do header X-Profile-Id.
      const profileHeaderExceptions = [
          '/profiles', 
          '/users/me', 
          '/auth/login', 
          '/auth/logout'
      ];
      const requiresProfileHeader = !profileHeaderExceptions.some(path => config.url.startsWith(path));

      if (profileId && requiresProfileHeader) {
          config.headers['X-Profile-Id'] = profileId;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;