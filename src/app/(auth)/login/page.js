"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { jwtDecode } from 'jwt-decode'; // <-- IMPORTAÇÃO NECESSÁRIA
import api from '../../../lib/api';

import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Skeleton } from '../../../components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';


function LoginSkeleton() {
  return (
    <Card className="w-full max-w-sm border-none shadow-lg bg-card">
      <CardHeader className="items-center text-center p-6">
        <Skeleton className="h-16 w-32 mb-4" />
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col w-full gap-4 p-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-40" />
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token } = response.data;
      localStorage.setItem('authToken', token);
      
      toast.success('Login realizado com sucesso!');
      
      // --- LÓGICA DE REDIRECIONAMENTO CONDICIONAL ---
      const decodedUser = jwtDecode(token);
      if (decodedUser.profile === 'SOLICITANTE') {
        router.push('/solicitacoes'); // <-- Redireciona SOLICITANTE para a página de solicitações
      } else {
        router.push('/principal'); // <-- Mantém o redirecionamento padrão para os outros perfis
      }
      // ---------------------------------------------

    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erro ao tentar fazer login. Verifique suas credenciais.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPageLoading) {
    return <LoginSkeleton />;
  }

  return (
    <Card className="w-full max-w-sm border-none shadow-lg bg-card">
      <CardHeader className="text-center p-6">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.png"
            alt="SAGEPE Logo"
            width={150}
            height={50}
            priority
          />
        </div>
        <CardDescription className="text-muted-foreground">
          Acesse sua conta para gerenciar.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="p-6">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seuemail@empresa.com" 
                required 
                className="bg-background"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="pr-10 bg-background"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col w-full gap-4 p-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Acessar o sistema com suas credenciais</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <p className="text-xs text-center text-muted-foreground">
            Esqueceu sua senha?{" "}
            <a href="#" className="underline underline-offset-4 hover:text-blue-600">
              Clique aqui
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}