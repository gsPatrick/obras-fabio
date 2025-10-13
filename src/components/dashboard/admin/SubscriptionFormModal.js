// components/dashboard/admin/SubscriptionFormModal.js
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SubscriptionFormModal({ user, onClose, onSave }) {
    const [isLoading, setIsLoading] = useState(false);
    // Inicializa o status baseado na assinatura existente
    const initialStatus = user?.subscription?.status === 'active' && new Date(user.subscription.expires_at) > new Date() ? 'active' : 'cancelled';
    const [status, setStatus] = useState(initialStatus);
    const [profileLimit, setProfileLimit] = useState(user?.subscription?.profile_limit || 1);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (isNaN(parseInt(profileLimit, 10)) || parseInt(profileLimit, 10) < 1) {
            setError("O limite de perfis deve ser um número maior ou igual a 1.");
            return;
        }

        setIsLoading(true);
        try {
            await onSave({ status, profileLimit: parseInt(profileLimit, 10) });
            onClose();
        } catch (err) {
            setError(err.message || "Ocorreu um erro desconhecido.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Gerenciar Assinatura</DialogTitle>
                    <DialogDescription>
                        Ajuste o status e o limite de perfis para o usuário {user.email}.
                    </DialogDescription>
                </DialogHeader>
                <form id="subscription-form" onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="status">Status da Assinatura</Label>
                        <Select onValueChange={setStatus} value={status}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Ativo (Expira em 30 dias)</SelectItem>
                                <SelectItem value="cancelled">Cancelado / Inativo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Presets de Plano</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button type="button" variant="outline" onClick={() => setProfileLimit(1)}>Plano Simples (1 Perfil)</Button>
                            <Button type="button" variant="outline" onClick={() => setProfileLimit(5)}>Plano Pro (5 Perfis)</Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="profileLimit">Limite de Perfis (Customizado)</Label>
                        <Input 
                            id="profileLimit" 
                            type="number" 
                            min="1"
                            value={profileLimit}
                            onChange={(e) => setProfileLimit(e.target.value)}
                            placeholder="Defina um número"
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </form>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
                    <Button type="submit" form="subscription-form" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}