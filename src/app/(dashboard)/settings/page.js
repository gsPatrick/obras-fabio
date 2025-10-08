// app/(dashboard)/settings/page.js
'use client';

import { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
    const { user, loading: authLoading } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [whatsappPhone, setWhatsappPhone] = useState(''); // Novo estado para o telefone
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Carrega o número de telefone do usuário quando disponível
    useState(() => {
        if (user?.whatsapp_phone) {
            setWhatsappPhone(user.whatsapp_phone);
        }
    }, [user]);

    const handleCredentialsSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password && password !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }
        
        setIsLoading(true);
        try {
            const payload = {
                email: e.target.email.value,
                whatsappPhone: whatsappPhone.replace(/\D/g, ''), // Envia número limpo
            };
            if (password) {
                payload.password = password;
            }
            
            await api.put('/users/me', payload);
            setMessage("Dados atualizados com sucesso!");
        } catch (err) {
            setError(err.response?.data?.error || "Falha ao atualizar. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || !user) return <div>Carregando...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Configurações da Conta</h1>
                <p className="text-gray-500">Altere suas credenciais e dados de contato.</p>
            </div>
            
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Credenciais e Contato</CardTitle>
                    <CardDescription>
                        Mantenha seus dados atualizados. O número de WhatsApp é usado para identificar você ao criar grupos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCredentialsSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue={user.email} required />
                        </div>
                        
                        {/* Campo de WhatsApp */}
                        <div className="space-y-2">
                            <Label htmlFor="whatsappPhone">Número de WhatsApp (DDI+DDD)</Label>
                            <Input 
                                id="whatsappPhone" 
                                type="tel" 
                                placeholder="5511987654321" 
                                value={whatsappPhone}
                                onChange={e => setWhatsappPhone(e.target.value)}
                                required 
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Nova Senha</Label>
                            <Input id="password" type="password" placeholder="Deixe em branco para não alterar" value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                            <Input id="confirmPassword" type="password" placeholder="Repita a nova senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        {message && <p className="text-sm text-green-500">{message}</p>}
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}