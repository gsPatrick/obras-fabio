// app/(dashboard)/settings/page.js
'use client';
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
    const { user } = useAuth();

    // Estados para o formulário de credenciais
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // --- INÍCIO: Novos estados para o monitoramento de grupo ---
    const [groups, setGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [groupsLoading, setGroupsLoading] = useState(true);
    const [monitorLoading, setMonitorLoading] = useState(false);
    const [groupMessage, setGroupMessage] = useState('');
    const [groupError, setGroupError] = useState('');
    // --- FIM: Novos estados ---

    // Efeito para buscar os grupos do WhatsApp quando o componente carregar
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await api.get('/groups');
                setGroups(response.data || []);
            } catch (err) {
                setGroupError("Não foi possível carregar a lista de grupos.");
                console.error(err);
            } finally {
                setGroupsLoading(false);
            }
        };
        fetchGroups();
    }, []);


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

    // --- INÍCIO: Nova função para lidar com o monitoramento ---
    const handleMonitorGroup = async () => {
        if (!selectedGroupId) {
            setGroupError("Por favor, selecione um grupo.");
            return;
        }
        setMonitorLoading(true);
        setGroupError('');
        setGroupMessage('');
        try {
            const response = await api.post('/groups', { groupId: selectedGroupId });
            setGroupMessage(response.data.message || "Grupo agora está sendo monitorado!");
        } catch (err) {
            setGroupError(err.response?.data?.error || "Falha ao iniciar o monitoramento.");
        } finally {
            setMonitorLoading(false);
        }
    };
    // --- FIM: Nova função ---

    if (!user) return <div>Carregando...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Configurações da Conta</h1>
                <p className="text-gray-500">Altere suas credenciais e gerencie o monitoramento de grupos.</p>
            </div>
            
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Credenciais de Acesso</CardTitle>
                    <CardDescription>
                        Lembre-se de usar uma senha forte. Após salvar, você pode precisar fazer login novamente.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCredentialsSubmit} className="space-y-6">
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

            {/* --- INÍCIO: Novo Card para Monitoramento de Grupo --- */}
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Monitoramento de Grupo</CardTitle>
                    <CardDescription>
                        Selecione qual grupo do WhatsApp a Inteligência Artificial deve monitorar para registrar os custos.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="group">Grupo do WhatsApp</Label>
                        <Select 
                            onValueChange={setSelectedGroupId} 
                            defaultValue={selectedGroupId}
                            disabled={groupsLoading || monitorLoading}
                        >
                            <SelectTrigger id="group">
                                <SelectValue placeholder={groupsLoading ? "Carregando grupos..." : "Selecione um grupo"} />
                            </SelectTrigger>
                            <SelectContent>
                                {groups.map(group => (
                                    <SelectItem key={group.phone} value={group.phone}>
                                        {group.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {groupError && <p className="text-sm text-red-500">{groupError}</p>}
                    {groupMessage && <p className="text-sm text-green-500">{groupMessage}</p>}
                    <Button onClick={handleMonitorGroup} disabled={monitorLoading || !selectedGroupId}>
                        {monitorLoading ? 'Salvando...' : 'Iniciar Monitoramento'}
                    </Button>
                </CardContent>
            </Card>
            {/* --- FIM: Novo Card --- */}
        </div>
    );
}