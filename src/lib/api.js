// lib/api.js - NOVA VERSÃO

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://jackbear-obras-fabio-api.r954jc.easypanel.host/',
});

// Interceptor para adicionar o token a cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;