"use client"

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import api from '../../../lib/api';
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";

export function FormDialog({ open, onOpenChange, initialData, onSave }) {
  const isEditing = Boolean(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [isListsLoading, setIsListsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    contractId: '',
    name: '',
    address: '',
  });

  useEffect(() => {
    const fetchContracts = async () => {
      if (open) {
        setIsListsLoading(true);
        try {
          const response = await api.get('/contracts');
          setContracts(response.data.contracts || []);
        } catch (error) {
          toast.error("Falha ao carregar a lista de contratos.");
        } finally {
          setIsListsLoading(false);
        }
      }
    };
    fetchContracts();
  }, [open]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          contractId: initialData.contractId || '',
          name: initialData.name || '',
          address: initialData.address || '',
        });
      } else {
        setFormData({ contractId: '', name: '', address: '' });
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
    if (!payload.address) delete payload.address; // Remove endereço se for vazio

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
            <DialogTitle>{isEditing ? "Editar" : "Novo"} Local de Trabalho</DialogTitle>
            <DialogDescription>
              Preencha os dados do local e vincule-o a um contrato.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contractId">Contrato</Label>
              <Select value={formData.contractId} onValueChange={(value) => handleChange('contractId', value)} disabled={isListsLoading} required>
                  <SelectTrigger>
                      <SelectValue placeholder={isListsLoading ? "Carregando..." : "Selecione o contrato"} />
                  </SelectTrigger>
                  <SelectContent>
                      {contracts.map(contract => (
                        <SelectItem key={contract.id} value={contract.id}>
                          {contract.name} ({contract.contractNumber || 'Sem número'})
                        </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Local de Trabalho</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Ex: Sede Administrativa" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço (Opcional)</Label>
              <Input id="address" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Salvando..." : "Salvar Local"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}