import axios from 'axios';

// Define a URL base da sua API.
// Altere para o endereço do seu servidor de produção quando for o caso.
const API_URL = 'https://n8n-comunicacaoapi.r954jc.easypanel.host/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona um interceptor para incluir o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    // Pega o token do localStorage
    const token = localStorage.getItem('authToken');
    
    // Se o token existir, adiciona ao cabeçalho de autorização
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Faz alguma coisa com o erro da requisição
    return Promise.reject(error);
  }
);


export default api