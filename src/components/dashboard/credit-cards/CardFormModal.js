// components/dashboard/credit-cards/CardFormModal.js
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function CardFormModal({ card, onClose, onSave }) {
    const isEditing = !!card?.id;
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: card?.name || '',
        last_four_digits: card?.last_four_digits || '',
        closing_day: card?.closing_day || '',
        due_day: card?.due_day || '',
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

        // Validação básica
        if (!formData.name || !formData.closing_day || !formData.due_day) {
            setError("Nome, dia de fechamento e vencimento são obrigatórios.");
            setIsLoading(false);
            return;
        }
        
        const closingDay = parseInt(formData.closing_day, 10);
        const dueDay = parseInt(formData.due_day, 10);
        
        if (closingDay < 1 || closingDay > 31 || dueDay < 1 || dueDay > 31) {
            setError("Os dias de fechamento e vencimento devem ser entre 1 e 31.");
            setIsLoading(false);
            return;
        }

        try {
            await onSave(card?.id, {
                ...formData,
                closing_day: closingDay,
                due_day: dueDay,
            });
            onClose();
        } catch (err) {
            setError(err.message || err.response?.data?.error || "Ocorreu um erro desconhecido.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Cartão' : 'Criar Novo Cartão'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? `Alterando dados do cartão ${card.name}.` : "Preencha os dados do novo cartão de crédito."}
                    </DialogDescription>
                </DialogHeader>
                <form id="card-form" onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do Cartão</Label>
                        <Input id="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="last_four_digits">Últimos 4 Dígitos (Opcional)</Label>
                        <Input id="last_four_digits" type="text" maxLength={4} value={formData.last_four_digits} onChange={handleChange} placeholder="Ex: 1234" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="closing_day">Dia de Fechamento</Label>
                            <Input id="closing_day" type="number" min="1" max="31" value={formData.closing_day} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="due_day">Dia de Vencimento</Label>
                            <Input id="due_day" type="number" min="1" max="31" value={formData.due_day} onChange={handleChange} required />
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </form>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
                    <Button type="submit" form="card-form" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Salvar Alterações' : 'Criar Cartão'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}