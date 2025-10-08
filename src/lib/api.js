// lib/api.js - VERSÃO CORRIGIDA E ROBUSTA

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://jackbear-obras-fabio-api.r954jc.easypanel.host/',
});

/**
 * Função para definir o Profile ID globalmente.
 * Ela atualiza o localStorage, que será a fonte da verdade para o interceptor.
 * @param {string | null} profileId 
 */
export const setProfileId = (profileId) => {
  if (profileId) {
    localStorage.setItem('currentProfileId', profileId);
  } else {
    // Garante a limpeza completa ao fazer logout ou deselecionar
    localStorage.removeItem('currentProfileId');
  }
};

/**
 * Interceptor para adicionar dinamicamente os cabeçalhos de autenticação
 * a cada requisição enviada pela aplicação.
 */
api.interceptors.request.use(
  (config) => {
    // 1. Adiciona o Token de Autenticação se ele existir
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 2. Adiciona o ID do Perfil se ele existir no localStorage
    const profileId = localStorage.getItem('currentProfileId');
    
    // 3. Define as rotas que NÃO precisam do header X-Profile-Id.
    // Todas as outras rotas precisarão dele (se um profileId estiver definido).
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
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;