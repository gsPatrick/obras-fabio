"use client"

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from "../../../../components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../../components/ui/dialog"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { Textarea } from "../../../../components/ui/textarea"
import { Switch } from "../../../../components/ui/switch"

export function FormDialog({ open, onOpenChange, initialData, onSave }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({ description: '', status: true });

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        description: initialData.description || '',
        status: initialData.status === 'Ativo',
      });
    }
  }, [initialData, open]);

  const handleSave = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    // Simula o salvamento, pois não há endpoint na API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Chama a função onSave para atualizar o estado no componente pai
    const success = onSave({ ...initialData, ...formData, status: formData.status ? 'Ativo' : 'Inativo' });

    setIsLoading(false);
    if (success) {
      toast.success("Tipo de solicitação atualizado com sucesso!");
      onOpenChange(false);
    } else {
      toast.error("Ocorreu um erro ao salvar.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>Editar Tipo de Solicitação</DialogTitle>
            <DialogDescription>
              Altere os dados abaixo. A criação de novos tipos é feita diretamente no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome</Label>
              {/* O nome não é editável pois vem do ENUM da API */}
              <Input id="name" defaultValue={initialData?.name} className="col-span-3" disabled />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Descrição</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <div className="col-span-3 flex items-center space-x-2">
                  <Switch 
                    id="status" 
                    checked={formData.status}
                    onCheckedChange={(checked) => setFormData(prev => ({...prev, status: checked}))}
                  />
                  <label htmlFor="status" className="text-sm text-muted-foreground">{formData.status ? "Ativo" : "Inativo"}</label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}