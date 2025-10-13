// components/dashboard/revenues/RevenueFormModal.js
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export function RevenueFormModal({ revenue, onClose, onSave }) {
    const isEditing = !!revenue?.id;
    const [isLoading, setIsLoading] = useState(false);
    const [revenueCategories, setRevenueCategories] = useState([]);
    const [formData, setFormData] = useState({
        description: revenue?.description || '',
        value: revenue?.value || '',
        revenue_date: revenue?.revenue_date ? new Date(revenue.revenue_date) : new Date(),
        category_id: revenue?.category_id ? String(revenue.category_id) : '', // Garante que seja string para o Select
    });
    const [error, setError] = useState(null);

    // <<< CORREÇÃO APLICADA AQUI >>>
    // Busca apenas as categorias de receita usando o parâmetro 'flowType'
    useEffect(() => {
        const fetchRevenueCategories = async () => {
            try {
                // Adiciona o parâmetro de query para filtrar apenas categorias de receita
                const response = await api.get('/categories', { params: { flowType: 'revenue' } });
                setRevenueCategories(response.data);
            } catch (err) {
                console.error("Falha ao carregar categorias de receita:", err);
                setError("Não foi possível carregar as categorias.");
            }
        };
        fetchRevenueCategories();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await onSave({
                ...formData,
                revenue_date: formData.revenue_date.toISOString(),
                value: parseFloat(formData.value),
                category_id: parseInt(formData.category_id, 10),
            });
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || "Ocorreu um erro desconhecido.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Entrada' : 'Registrar Nova Entrada'}</DialogTitle>
                    <DialogDescription>
                        Preencha os detalhes da sua receita.
                    </DialogDescription>
                </DialogHeader>
                <form id="revenue-form" onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input id="description" value={formData.description} onChange={handleChange} placeholder="Ex: Adiantamento Cliente X" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="value">Valor</Label>
                            <Input id="value" type="number" step="0.01" value={formData.value} onChange={handleChange} placeholder="1500.00" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="revenue_date">Data</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.revenue_date && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.revenue_date ? format(formData.revenue_date, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={formData.revenue_date} onSelect={(date) => setFormData(prev => ({...prev, revenue_date: date}))} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="category_id">Categoria</Label>
                        <Select onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))} value={formData.category_id}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria de receita..." />
                            </SelectTrigger>
                            <SelectContent>
                                {revenueCategories.length > 0 ? revenueCategories.map(cat => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                )) : <div className="p-4 text-sm text-muted-foreground">Nenhuma categoria de receita encontrada. Crie uma na página de Categorias.</div>}
                            </SelectContent>
                        </Select>
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </form>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
                    <Button type="submit" form="revenue-form" disabled={isLoading || !formData.category_id}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Salvar Alterações' : 'Criar Entrada'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}