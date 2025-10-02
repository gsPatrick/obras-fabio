// lib/api.js - NOVA VERSÃO com setProfileId

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://jackbear-obras-fabio-api.r954jc.easypanel.host/',
});

let currentProfileId = null;

// Função para ser chamada pelo AuthContext quando um perfil for selecionado
export const setProfileId = (profileId) => {
  currentProfileId = profileId;
  // Opcional: Salvar no localStorage para persistência de sessão
  if (profileId) {
    localStorage.setItem('currentProfileId', profileId);
  } else {
    localStorage.removeItem('currentProfileId');
  }
};

// Interceptor para adicionar o token E o ProfileId a cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Adiciona o X-Profile-Id se existir (após a seleção)
    const profileIdInSession = currentProfileId || localStorage.getItem('currentProfileId');

    // Verifica se a rota NÃO é a de listar/criar perfis (que não exige o header)
    const isProfileRoute = config.url.includes('/profiles');
    if (profileIdInSession && !isProfileRoute) {
        config.headers['X-Profile-Id'] = profileIdInSession;
    }
    // Exceção: As rotas de listar/criar perfis (/profiles) são as únicas que não precisam de X-Profile-Id
    // e o middleware de backend foi ajustado para permitir.

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;