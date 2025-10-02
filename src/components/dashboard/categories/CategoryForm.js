// components/dashboard/categories/CategoryForm.js (COMPLETAMENTE MODIFICADO)
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"; // Reutilizar Input
import { Label } from "@/components/ui/label";
// REMOVER: { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }

export function CategoryForm({ category, onClose, onSave }) {
    const isEditing = !!category;
    const [isLoading, setIsLoading] = useState(false);
    
    // Estado do formulário
    const [name, setName] = useState(category?.name || '');
    const [type, setType] = useState(category?.type || ''); // Agora é um string livre
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        const data = { name, type };
        
        // Chamamos o onSave (que é o handler do pai que faz a requisição)
        await onSave(data);
        
        setIsLoading(false);
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Categoria' : 'Adicionar Nova Categoria'}</DialogTitle>
                    <DialogDescription>
                        {isEditing 
                            ? "Faça as alterações na categoria abaixo." 
                            : "Preencha as informações para criar uma nova categoria."}
                    </DialogDescription>
                </DialogHeader>
                <form id="category-form" onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Nome</Label>
                            <Input
                                id="name"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                placeholder="Ex: Material Elétrico"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">Tipo</Label>
                            <Input // <<< MUDANÇA: AGORA É UM INPUT DE TEXTO
                                id="type"
                                name="type"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="col-span-3"
                                placeholder="Ex: Mão de Obra, Freelancer"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
                    <Button type="submit" form="category-form" disabled={isLoading}>
                        {isLoading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Categoria')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}