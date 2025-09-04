"use client"

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

export function FormDialog({ open, onOpenChange, initialData, onSave }) {
  const isEditing = Boolean(initialData);
  const [isLoading, setIsLoading] = useState(false);

  // Estados alinhados 100% com o model da API
  const [formData, setFormData] = useState({
    corporateName: '',
    tradeName: '',
    cnpj: '',
    address: '',
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        // Mapeando os campos do backend para o formulário
        setFormData({
            corporateName: initialData.corporateName || '',
            tradeName: initialData.tradeName || '',
            cnpj: initialData.cnpj || '',
            address: initialData.address || '',
        });
      } else {
        // Reset para o modo de criação
        setFormData({
            corporateName: '',
            tradeName: '',
            cnpj: '',
            address: '',
        });
      }
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    // Payload com as chaves exatas da API, removendo nulos ou vazios para campos opcionais
    const payload = {
      corporateName: formData.corporateName,
      cnpj: formData.cnpj,
      ...(formData.tradeName && { tradeName: formData.tradeName }),
      ...(formData.address && { address: formData.address }),
    };

    const success = await onSave(payload);

    setIsLoading(false);
    if (success) {
      onOpenChange(false); // Fecha o modal
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar" : "Novo"} Cliente</DialogTitle>
            <DialogDescription>
              Preencha os dados do cliente abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="corporateName">Razão Social</Label>
              <Input id="corporateName" value={formData.corporateName} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradeName">Nome Fantasia</Label>
              <Input id="tradeName" value={formData.tradeName} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" value={formData.address} onChange={handleChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Salvando..." : "Salvar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}