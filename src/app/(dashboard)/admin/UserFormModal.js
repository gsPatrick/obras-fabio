// Crie um novo diretório e arquivo: components/dashboard/admin/UserFormModal.js

'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function UserFormModal({ user, onClose, onSave }) {
    const isEditing = !!user?.id;
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: user?.email || '',
        whatsapp_phone: user?.whatsapp_phone || '',
        password: '', // Senha sempre vazia por segurança
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Não envia a senha se o campo estiver vazio durante a edição
        const dataToSend = { ...formData };
        if (isEditing && !dataToSend.password) {
            delete dataToSend.password;
        } else if (!isEditing && !dataToSend.password) {
            setError("A senha é obrigatória para criar um novo usuário.");
            setIsLoading(false);
            return;
        }

        try {
            await onSave(dataToSend);
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
                    <DialogTitle>{isEditing ? 'Editar Usuário' : 'Criar Novo Usuário'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? `Alterando dados de ${user.email}.` : "Preencha os dados para o novo usuário."}
                    </DialogDescription>
                </DialogHeader>
                <form id="user-form" onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="whatsapp_phone">WhatsApp (com DDI e DDD)</Label>
                        <Input id="whatsapp_phone" type="tel" value={formData.whatsapp_phone} onChange={handleChange} placeholder="5511987654321" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input id="password" type="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? 'Deixe em branco para não alterar' : 'Senha forte'} required={!isEditing} />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </form>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
                    <Button type="submit" form="user-form" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}