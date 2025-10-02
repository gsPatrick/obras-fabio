// components/dashboard/guests/GuestFormModal.js
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PermissionsChecklist } from "./PermissionsChecklist"; // Importar Checklist

export function GuestFormModal({ guest, onClose, onSave }) {
    const isEditing = !!guest?.id;
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState(guest?.email || '');
    // O status é sempre 'active' por padrão se não estiver editando (assumindo que o convite foi aceito)
    // Na criação, o backend o define como 'pending'. Aqui usamos 'active' para o dropdown de edição.
    const [status, setStatus] = useState(guest?.status || 'active'); 
    const [error, setError] = useState(null);
    
    // Estado para gerenciar as permissões (APENAS módulos + as duas extras para garantir o PUT)
    const [permissions, setPermissions] = useState(guest?.permissions ? {
        can_access_dashboard: guest.permissions.can_access_dashboard,
        can_access_categories: guest.permissions.can_access_categories,
        can_access_reports: guest.permissions.can_access_reports,
        can_access_expenses: guest.permissions.can_access_expenses,
        // Incluir as permissões de ação, mesmo que não sejam visíveis no checklist, para o PUT
        can_add_expense: guest.permissions.can_add_expense || true, 
        can_edit_or_delete_expense: guest.permissions.can_edit_or_delete_expense || false,
    } : {
        // Padrão de criação: tudo desligado, exceto o lançamento via WhatsApp
        can_access_dashboard: false,
        can_access_categories: false,
        can_access_reports: false,
        can_access_expenses: false,
        can_add_expense: true, 
        can_edit_or_delete_expense: false,
    });
    
    // Handler para atualizar uma única permissão
    const handlePermissionChange = (name, checked) => {
        setPermissions(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const data = {
            id: guest?.id, // ID para o PUT (se edição)
            email,
            status,
            permissions,
        };
        
        // Validação de segurança: o e-mail não pode ser alterado após o convite (simples)
        if (isEditing && email !== guest.email) {
            setError("O e-mail não pode ser alterado após o envio do convite.");
            setIsLoading(false);
            return;
        }

        try {
            await onSave(data); // Chama o handler do pai
            onClose(); // Fecha o modal
        } catch (err) {
            setError(err.message || "Erro ao salvar o convidado.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Permissões' : 'Convidar Novo Usuário'}</DialogTitle>
                    <DialogDescription>
                        {isEditing 
                            ? `Altere as permissões de ${guest.email}.` 
                            : "O usuário receberá um convite por e-mail para acessar seu perfil."}
                    </DialogDescription>
                </DialogHeader>
                <form id="guest-form" onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        
                        {/* Campo de Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email do Convidado</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ex: equipe@obra.com"
                                required
                                disabled={isLoading || isEditing} // Não permite edição de e-mail
                            />
                        </div>

                        {/* Campo de Status (apenas para edição) */}
                        {isEditing && (
                            <div className="space-y-2">
                                <Label htmlFor="status">Status do Convite</Label>
                                <Select name="status" value={status} onValueChange={setStatus} required disabled={isLoading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Ativo (Acesso Liberado)</SelectItem>
                                        <SelectItem value="pending">Pendente (Aguardando Cadastro)</SelectItem>
                                        <SelectItem value="revoked">Revogado (Acesso Bloqueado)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        
                        {/* Checklist de Permissões */}
                        <PermissionsChecklist 
                            permissions={permissions} 
                            onPermissionChange={handlePermissionChange}
                            isEditing={isEditing}
                        />

                        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                    </div>
                </form>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
                    <Button type="submit" form="guest-form" disabled={isLoading}>
                        {isLoading ? 'Salvando...' : (isEditing ? 'Salvar Permissões' : 'Convidar Usuário')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}