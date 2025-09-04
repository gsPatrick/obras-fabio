"use client"

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from "../../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Textarea } from '../../../../components/ui/textarea';

export function FormDialog({ open, onOpenChange, initialData, onSave }) {
  const isEditing = Boolean(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({ name: '', description: '', defaultProfile: '' });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          defaultProfile: initialData.defaultProfile || '',
        });
      } else {
        setFormData({ name: '', description: '', defaultProfile: '' });
      }
    }
  }, [initialData, open]);

  const handleChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const payload = { ...formData };
    if (!payload.description) delete payload.description;

    const success = await onSave(payload);
    setIsLoading(false);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar" : "Criar Nova"} Etapa</DialogTitle>
            <DialogDescription>
              Defina os detalhes da etapa que será usada nos fluxos de trabalho.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="defaultProfile" className="text-right">Perfil Padrão</Label>
              <Select value={formData.defaultProfile} onValueChange={(value) => handleChange('defaultProfile', value)} required>
                  <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="RH">RH</SelectItem>
                      <SelectItem value="GESTAO">Gestão</SelectItem>
                      <SelectItem value="SOLICITANTE">Solicitante</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Descrição</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Salvando..." : "Salvar Etapa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}