// components/auth/SignUpForm.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api, { setProfileId } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react'; // Novo ícone

const LogoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-8 w-8 text-blue-600"
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M9 12h6" />
    <path d="M9 16h3" />
  </svg>
);

// Função para aplicar máscara (simples)
const formatPhoneNumber = (value) => {
    // Remove tudo que não for dígito
    const numericValue = value.replace(/\D/g, '');
    
    // Aplica a máscara para 55(DDI) + DDD + Número (Mínimo de 10 dígitos)
    // Ex: 5511987654321
    if (numericValue.length <= 13) {
        return numericValue;
    }
    return numericValue.substring(0, 13);
};


export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter(); 
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;
    const whatsappPhone = e.target.whatsappPhone.value.replace(/\D/g, ''); // Limpa a máscara

    if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
        setIsLoading(false);
        return;
    }
    
    if (whatsappPhone.length < 10) {
        setError("O número de WhatsApp deve conter DDD e o número completo.");
        setIsLoading(false);
        return;
    }


    try {
        // 1. Chamar o endpoint de registro (POST /auth/register)
        const response = await api.post('/auth/register', { 
            email, 
            password, 
            whatsappPhone: whatsappPhone // Envia o número limpo
        });
        
        const { token, profileId } = response.data;

        if (token) {
            // 2. Salva o token e o primeiro profileId (opcional) no localstorage
            localStorage.setItem('authToken', token);
            if (profileId) {
                localStorage.setItem('currentProfileId', profileId);
                setProfileId(profileId); // Salva no cliente Axios
            }
            
            // 3. Redireciona para a tela de seleção
            router.push('/profiles/select');

        } else {
            throw new Error("Registro bem-sucedido, mas token de login não recebido.");
        }
        
    } catch (err) {
      setError(err.response?.data?.error || "Ocorreu um erro desconhecido.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <Card className="border-0 shadow-none sm:border sm:shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center"><LogoIcon /></div>
          <div className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Crie sua Conta</CardTitle>
            <CardDescription>
              Insira seus dados para começar a gerenciar sua obra.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" required />
            </div>

            {/* Campo de WhatsApp com Destaque */}
            <div className="space-y-2 border border-blue-200 dark:border-blue-700 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
                <div className='flex items-center space-x-2'>
                    <MessageCircle className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                    <Label htmlFor="whatsappPhone" className='text-blue-600 dark:text-blue-400 font-semibold'>Seu WhatsApp (DDI+DDD)</Label>
                </div>
                <Input 
                    id="whatsappPhone" 
                    type="tel" 
                    placeholder="5511987654321" 
                    required 
                    // Aplica a formatação simples no onChange
                    onInput={(e) => e.target.value = formatPhoneNumber(e.target.value)} 
                    maxLength={13}
                    className='text-lg font-bold'
                />
                <p className='text-xs text-blue-500 dark:text-blue-300'>
                    Este número será usado para criar e monitorar os grupos no seu Bot.
                </p>
            </div>
            {/* Fim do Campo de Destaque */}


            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input id="confirmPassword" type="password" required />
            </div>
            
            {error && (<div className="text-center text-sm font-medium text-red-500">{error}</div>)}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Criar Conta'}
            </Button>
            
            <div className="text-center text-sm">
                Já tem uma conta? <Link href="/login" className="text-blue-600 hover:underline">Faça Login</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}