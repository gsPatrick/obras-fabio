// components/dashboard/credit-cards/CreditCardFormModal.js
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function CreditCardFormModal({ card, onClose, onSave }) {
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

        // Validação simples
        const closingDay = parseInt(formData.closing_day, 10);
        const dueDay = parseInt(formData.due_day, 10);

        if (isNaN(closingDay) || closingDay < 1 || closingDay > 31) {
            setError("O dia de fechamento deve ser um número entre 1 e 31.");
            return;
        }
        if (isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
            setError("O dia de vencimento deve ser um número entre 1 e 31.");
            return;
        }

        setIsLoading(true);
        try {
            await onSave({ ...formData, closing_day: closingDay, due_day: dueDay });
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
                    <DialogTitle>{isEditing ? 'Editar Cartão de Crédito' : 'Criar Novo Cartão'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? `Alterando dados do cartão ${card.name}.` : "Preencha os dados para o novo cartão."}
                    </DialogDescription>
                </DialogHeader>
                <form id="card-form" onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do Cartão</Label>
                        <Input id="name" value={formData.name} onChange={handleChange} placeholder="Ex: Nubank, Inter" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="last_four_digits">Últimos 4 dígitos (Opcional)</Label>
                        <Input id="last_four_digits" type="text" maxLength="4" value={formData.last_four_digits} onChange={handleChange} placeholder="1234" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="closing_day">Dia do Fechamento</Label>
                            <Input id="closing_day" type="number" min="1" max="31" value={formData.closing_day} onChange={handleChange} placeholder="Ex: 10" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="due_day">Dia do Vencimento</Label>
                            <Input id="due_day" type="number" min="1" max="31" value={formData.due_day} onChange={handleChange} placeholder="Ex: 20" required />
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