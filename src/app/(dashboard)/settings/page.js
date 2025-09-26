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
    const { user } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async (e) => {
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
            };
            if (password) {
                payload.password = password;
            }
            
            await api.put('/users/me', payload);
            setMessage("Credenciais atualizadas com sucesso!");
        } catch (err) {
            setError("Falha ao atualizar. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return <div>Carregando...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Configurações da Conta</h1>
                <p className="text-gray-500">Altere seu email e senha de acesso.</p>
            </div>
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Credenciais de Acesso</CardTitle>
                    <CardDescription>
                        Lembre-se de usar uma senha forte. Após salvar, você pode precisar fazer login novamente.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue={user.email} required />
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