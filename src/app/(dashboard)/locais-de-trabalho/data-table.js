"use client"

import * as React from "react"
import { toast } from "sonner";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle } from "lucide-react"

import api from "../../../lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu"
import { FormDialog } from "./form-dialog"
import { ConfirmationDialog } from "../components/ConfirmationDialog"

export function DataTable({ columns, filterValue }) {
    const [data, setData] = React.useState([])
    const [isLoading, setIsLoading] = React.useState(true);
    const [sorting, setSorting] = React.useState([])
    const [columnFilters, setColumnFilters] = React.useState([])
    const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false)
    const [editingData, setEditingData] = React.useState(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
    const [placeToDelete, setPlaceToDelete] = React.useState(null)

    const fetchData = React.useCallback(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        // Adiciona o parâmetro para buscar todos os registros, ignorando a paginação da API
        params.append('all', 'true');
        
        const response = await api.get('/work-locations', { params });
        let workLocations = response.data.workLocations || [];

        // O filtro por `filterValue` (número do contrato) é feito no frontend
        // pois a API não tem um filtro direto para isso, mas busca todos os dados primeiro.
        if (filterValue) {
          workLocations = workLocations.filter(loc => loc.contract?.contractNumber === filterValue);
        }
        setData(workLocations);
      } catch (error) {
        toast.error("Falha ao carregar os locais de trabalho.");
      } finally {
        setIsLoading(false);
      }
    }, [filterValue]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = () => { setEditingData(null); setIsFormDialogOpen(true) }
    const handleEdit = (data) => { setEditingData(data); setIsFormDialogOpen(true) }
    
    const handleDeleteRequest = (place) => {
        setPlaceToDelete(place);
        setIsDeleteDialogOpen(true);
    }
    const handleConfirmDelete = async () => {
        if (!placeToDelete) return;
        try {
            await api.delete(`/work-locations/${placeToDelete.id}`);
            toast.success(`Local "${placeToDelete.name}" excluído com sucesso!`);
            fetchData();
        } catch (error) {
            toast.error("Falha ao excluir o local de trabalho.");
        } finally {
            setIsDeleteDialogOpen(false);
            setPlaceToDelete(null);
        }
    }

    const handleSave = async (formData) => {
      try {
        if (editingData?.id) {
          await api.put(`/work-locations/${editingData.id}`, formData);
          toast.success("Local de trabalho atualizado com sucesso!");
        } else {
          await api.post('/work-locations', formData);
          toast.success("Local de trabalho criado com sucesso!");
        }
        fetchData();
        return true;
      } catch (error) {
        toast.error(error.response?.data?.error || "Erro ao salvar local de trabalho.");
        return false;
      }
    };

    const tableColumns = React.useMemo(() => [
        ...columns,
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(row.original)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteRequest(row.original)}>Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ], [columns])

    const table = useReactTable({
        data,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: { sorting, columnFilters },
    })

    return (
        <div>
            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Filtrar por nome do local..."
                    value={(table.getColumn("name")?.getFilterValue()) ?? ""}
                    onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                />
                <Button onClick={handleCreate}><PlusCircle className="mr-2 h-4 w-4" />Novo Local</Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>{table.getHeaderGroups().map((headerGroup) => (<TableRow key={headerGroup.id}>{headerGroup.headers.map((header) => (<TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
                    <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={tableColumns.length} className="h-24 text-center">Carregando...</TableCell></TableRow>
                    ) : table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (<TableRow key={row.id}>{row.getVisibleCells().map((cell) => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))
                    ) : (
                      <TableRow><TableCell colSpan={tableColumns.length} className="h-24 text-center">Nenhum local de trabalho encontrado.</TableCell></TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Próximo</Button>
            </div>

            <FormDialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen} initialData={editingData} onSave={handleSave} />
            <ConfirmationDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Confirmar Exclusão" description={`Tem certeza que deseja excluir o local "${placeToDelete?.name}"?`} onConfirm={handleConfirmDelete} confirmText="Sim, Excluir" />
        </div>
    )
}