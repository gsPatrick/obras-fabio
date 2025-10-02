// hooks/useSubscriptionCheck.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export function useSubscriptionCheck() {
    const { isAuthenticated, user, loading } = useAuth();
    const router = useRouter();
    const [isAllowed, setIsAllowed] = useState(false);
    const [checkLoading, setCheckLoading] = useState(true);

    useEffect(() => {
        if (loading || !isAuthenticated) {
            setCheckLoading(loading);
            // Deixa o AuthContext ou o layout base lidar com a desautenticação
            return; 
        }

        const checkSubscription = async () => {
            setCheckLoading(true);
            try {
                // Chama um novo endpoint no backend para checar o status do plano
                // Como não temos esse endpoint, simularemos o serviço de checagem.
                // O group.service já faz essa checagem, mas para o frontend, precisamos de um endpoint rápido.
                
                // USANDO O NOVO ENDPOINT DE CHECAGEM NO BACKEND: /users/subscription/status (que ainda não existe)
                // Por enquanto, faremos a simulação do serviço de Assinatura, mas a checagem no backend é a forma correta.
                
                // SIMULANDO A CHAMADA DE CHECAGEM:
                const response = await api.get('/users/me/subscription/status'); // <- Endpoint imaginário
                const status = response.data.status;
                const isAdmin = user.email === 'fabio@gmail.com'; // Admin é sempre liberado
                
                if (status === 'active' || isAdmin) {
                    setIsAllowed(true);
                } else {
                    router.push('/subscribe'); // Redireciona para o checkout
                }

            } catch (error) {
                // Se a requisição falhar (ex: endpoint não existe), assume-se não ativo
                router.push('/subscribe'); 
            } finally {
                setCheckLoading(false);
            }
        };

        checkSubscription();
    }, [isAuthenticated, loading, router, user]);

    return { isAllowed, checkLoading };
}