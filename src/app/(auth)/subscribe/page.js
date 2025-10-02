// app/(auth)/subscribe/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, ArrowLeft, Shield, Clock } from 'lucide-react'; // NOVOS ÍCONES
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import Link from 'next/link'; 

const pricingPlans = [
    { name: "Plano Único", price: "R$ 39,90", features: ["Monitoramento Ilimitado", "Múltiplos Perfis", "Suporte VIP"], isMostPopular: true, isRecurrent: true },
];

const InfoCard = ({ icon: Icon, title, description }) => (
    <div className="flex items-start p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm">
        <Icon className="h-6 w-6 text-primary mt-1 shrink-0 mr-3" />
        <div>
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{title}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
        </div>
    </div>
);

export default function SubscribePage() {
    const { isAuthenticated, user, loading } = useAuth();
    const router = useRouter();
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [error, setError] = useState(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null); 

    const fetchSubscriptionStatus = useCallback(async (userId) => {
        try {
            const response = await api.get('/users/me/subscription/status');
            setSubscriptionStatus(response.data.status);
            
            if (response.data.status === 'active' || response.data.status === 'admin') {
                router.push('/profiles/select');
            }

        } catch (err) {
            console.error("Falha ao checar status da assinatura:", err);
            setSubscriptionStatus('inactive');
        }
    }, [router]);


    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        } else if (isAuthenticated) {
            fetchSubscriptionStatus(user.id);
        }
    }, [loading, isAuthenticated, router, user, fetchSubscriptionStatus]);
    
    const handleCheckout = async () => {
        if (!isAuthenticated) return;

        setCheckoutLoading(true);
        setError(null);
        try {
            const response = await api.post('/payments/checkout/subscription');
            
            if (response.data.checkoutUrl) {
                window.location.href = response.data.checkoutUrl;
            } else {
                setError("O link de pagamento não foi gerado. Tente novamente.");
            }
        } catch (err) {
            setError(err.response?.data?.error || "Falha ao iniciar o pagamento. Tente novamente mais tarde.");
        } finally {
            setCheckoutLoading(false);
        }
    };

    if (loading || (isAuthenticated && !subscriptionStatus)) {
        return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    const isRenewal = subscriptionStatus === 'inactive';
    const buttonText = isRenewal ? 'Renovar Assinatura' : 'Pagar e Liberar';
    const plan = pricingPlans[0]; 

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 p-4">
            
            {/* Botão Voltar - Posicionado no canto superior esquerdo com estilo de botão */}
            <div className='absolute top-6 left-6 z-10'>
                <Button variant="outline" className="text-sm shadow-sm" asChild>
                    <Link href="/landing">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para a Landing Page
                    </Link>
                </Button>
            </div>
            
            <div className="text-center mb-6 max-w-lg mx-auto">
                <h1 className="text-3xl font-bold">Ative o Monitoramento da sua Obra</h1>
                <p className="text-gray-500 mt-2">Escolha o plano mensal para desbloquear a inteligência artificial do WhatsApp.</p>
                {user && <p className="text-sm text-muted-foreground mt-4">Logado como: {user.email}</p>}
                
                {subscriptionStatus === 'pending' && (
                    <p className="text-orange-500 font-semibold mt-4 p-2 bg-orange-50 dark:bg-orange-950 border border-orange-200 rounded-lg">
                        Seu pagamento está PENDENTE. O acesso será liberado assim que o Mercado Pago confirmar.
                    </p>
                )}
            </div>

            <div className='flex flex-col lg:flex-row gap-8 max-w-4xl w-full items-start justify-center'>
                
                {/* Card de Detalhes Adicionais */}
                <div className="lg:w-1/3 w-full space-y-4 pt-8 order-2 lg:order-1">
                    <InfoCard 
                        icon={Shield} 
                        title="Segurança Garantida" 
                        description="Assinatura mensal recorrente via Mercado Pago. Cancelamento a qualquer momento." 
                    />
                    <InfoCard 
                        icon={Clock} 
                        title="Acesso Imediato" 
                        description="Após a confirmação do pagamento, o monitoramento é liberado em segundos." 
                    />
                     <div className='p-4 text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 rounded-lg'>
                        <p className='font-bold mb-1'>Lembrete:</p>
                        <p>O monitoramento de grupo requer que você tenha um perfil criado e o Bot adicionado ao seu grupo do WhatsApp.</p>
                    </div>
                </div>

                {/* Card Principal do Plano */}
                <Card key={plan.name} className={`relative shadow-lg w-full max-w-sm lg:max-w-none lg:w-1/3 order-1 lg:order-2 ${plan.isMostPopular ? 'border-primary border-2' : 'border-border'}`}>
                    {plan.isMostPopular && (
                        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                            <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold tracking-wider text-white bg-blue-600">
                                RECOMENDADO
                            </span>
                        </div>
                    )}
                    <CardHeader className="pt-8 text-center">
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription>Plano de Assinatura Mensal</CardDescription>
                        <p className="text-5xl font-extrabold mt-4">{plan.price} <span className="text-lg font-medium text-gray-500">/mês</span></p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button 
                            className="w-full bg-black text-white hover:bg-gray-800 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300" 
                            onClick={handleCheckout} 
                            disabled={checkoutLoading || subscriptionStatus === 'pending'}
                        >
                            {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : buttonText}
                        </Button>
                        <ul className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            {plan.features.map(feature => (
                                <li key={feature} className="flex items-center">
                                    <Check className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}