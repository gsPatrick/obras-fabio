"use client"

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";

export function FormDialogDeps({ open, onOpenChange, initialData }) {
  const isEditing = Boolean(initialData);
  const [isLoading, setIsLoading] = useState(false);

  // Função para simular o salvamento de dados
  const handleSave = async (event) => {
    event.preventDefault(); // Impede o recarregamento da página pelo formulário
    setIsLoading(true);

    // Simula uma chamada de API com um pequeno atraso
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoading(false);
    onOpenChange(false); // Fecha o modal após "salvar"

    // Dispara a notificação de sucesso
    toast.success(`Departamento ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {/* O formulário agora envolve todo o conteúdo para usar onSubmit */}
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar" : "Novo"} Departamento</DialogTitle>
            <DialogDescription>
              Preencha os dados do departamento abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Departamento</Label>
              <Input id="name" defaultValue={initialData?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager">Gestor Responsável</Label>
              <Select defaultValue={initialData?.manager}>
                  <SelectTrigger id="manager">
                      <SelectValue placeholder="Selecione um gestor" />
                  </SelectTrigger>
                  <SelectContent>
                      {/* Estes dados viriam da lista de colaboradores */}
                      <SelectItem value="Ana Silva">Ana Silva</SelectItem>
                      <SelectItem value="Marcos Oliveira">Marcos Oliveira</SelectItem>
                      <SelectItem value="Carlos Pereira">Carlos Pereira</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Salvando..." : "Salvar Departamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}