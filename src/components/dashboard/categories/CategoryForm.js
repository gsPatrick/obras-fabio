// components/dashboard/categories/CategoryForm.js
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export function CategoryForm({ category, onClose, onSave }) {
    const isEditing = !!category?.id;
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: category?.name || '',
        type: category?.type || '',
        category_flow: category?.category_flow || 'expense',
        goal: category?.goal?.value || '', // <<< NOVO: Campo para a meta
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (value) => {
        setFormData(prev => ({ ...prev, category_flow: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || "Ocorreu um erro desconhecido.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Reseta a meta se o fluxo mudar para 'receita'
    useEffect(() => {
        if (formData.category_flow === 'revenue') {
            setFormData(prev => ({ ...prev, goal: '' }));
        }
    }, [formData.category_flow]);

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Categoria' : 'Criar Nova Categoria'}</DialogTitle>
                </DialogHeader>
                <form id="category-form" onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome da Categoria</Label>
                        <Input id="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo</Label>
                        <Input id="type" value={formData.type} onChange={handleChange} placeholder="Ex: Material, Mão de Obra..." required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category_flow">Fluxo</Label>
                        <Select onValueChange={handleSelectChange} defaultValue={formData.category_flow} disabled={isEditing}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="expense">Despesa</SelectItem>
                                <SelectItem value="revenue">Receita</SelectItem>
                            </SelectContent>
                        </Select>
                        {isEditing && <p className="text-xs text-muted-foreground">O fluxo não pode ser alterado após a criação.</p>}
                    </div>
                    
                    {/* NOVO: Campo de Meta, visível apenas para despesas */}
                    {formData.category_flow === 'expense' && (
                        <div className="space-y-2">
                            <Label htmlFor="goal">Meta de Gasto Mensal (Opcional)</Label>
                            <Input 
                                id="goal" 
                                type="number"
                                value={formData.goal} 
                                onChange={handleChange}
                                placeholder="Ex: 1500" 
                            />
                        </div>
                    )}

                    {error && <p className="text-sm text-red-500">{error}</p>}
                </form>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
                    <Button type="submit" form="category-form" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Salvar Alterações' : 'Criar Categoria'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}