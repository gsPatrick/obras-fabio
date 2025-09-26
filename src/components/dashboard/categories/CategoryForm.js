// components/dashboard/categories/CategoryForm.js
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CategoryForm({ category, onClose, onSave }) {
    const isEditing = !!category;
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
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
                                defaultValue={category?.name}
                                className="col-span-3"
                                placeholder="Ex: Material Elétrico"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">Tipo</Label>
                            <Select name="type" defaultValue={category?.type} required disabled={isLoading}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione um tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Mão de Obra">Mão de Obra</SelectItem>
                                    <SelectItem value="Material">Material</SelectItem>
                                    <SelectItem value="Serviços/Equipamentos">Serviços/Equipamentos</SelectItem>
                                    <SelectItem value="Outros">Outros</SelectItem>
                                </SelectContent>
                            </Select>
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