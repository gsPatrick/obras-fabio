"use client"

import * as React from "react"
import { toast } from "sonner";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle, Download, Loader2 } from "lucide-react"

import api from "../../../lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu"
import { FormDialogCargos } from "./form-dialog-cargos"
import { ConfirmationDialog } from "../components/ConfirmationDialog"

export function DataTableCargos({ columns }) {
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);
  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])

  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false)
  const [editingData, setEditingData] = React.useState(null)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [positionToDelete, setPositionToDelete] = React.useState(null);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Adiciona o parâmetro `all=true` para buscar todos os registros
      const response = await api.get('/positions?all=true');
      setData(response.data.positions || []);
    } catch (error) {
      toast.error("Falha ao carregar a lista de categorias.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = () => {
    setEditingData(null)
    setIsFormDialogOpen(true)
  }

  const handleEdit = (data) => {
    setEditingData(data)
    setIsFormDialogOpen(true)
  }

  const handleDeleteRequest = (position) => {
    setPositionToDelete(position);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!positionToDelete) return;
    try {
        await api.delete(`/positions/${positionToDelete.id}`);
        toast.success(`Categoria "${positionToDelete.name}" excluída com sucesso!`);
        fetchData();
    } catch (error) {
        toast.error(error.response?.data?.error || "Falha ao excluir a categoria.");
    } finally {
        setIsDeleteDialogOpen(false);
        setPositionToDelete(null);
    }
  };

  const handleSave = async (formData) => {
    try {
        if (editingData?.id) {
            await api.put(`/positions/${editingData.id}`, formData);
            toast.success("Categoria atualizada com sucesso!");
        } else {
            await api.post('/positions', formData);
            toast.success("Categoria criada com sucesso!");
        }
        fetchData();
        return true;
    } catch (error) {
        toast.error(error.response?.data?.error || "Erro ao salvar categoria.");
        return false;
    }
  };
  
  const handleExport = async () => {
    setIsExporting(true);
    toast.info("A exportação foi iniciada...");
    try {
        const response = await api.get('/positions/export', { // Assumindo que o endpoint de exportação existe
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `categorias-${new Date().toISOString().slice(0, 10)}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Download concluído!");
    } catch (error) {
        toast.error("Falha ao exportar os dados.");
    } finally {
        setIsExporting(false);
    }
  };

  const tableColumns = React.useMemo(() => [
    ...columns,
    {
      id: "actions",
      cell: ({ row }) => {
        const cargo = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(cargo)}>Editar</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteRequest(cargo)}>Excluir</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
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
      <div className="flex items-center justify-between py-4 gap-4">
        <Input
          placeholder="Filtrar por categoria..."
          value={(table.getColumn("name")?.getFilterValue()) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                Exportar
            </Button>
            <Button onClick={handleCreate}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
        </div>
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
              <TableRow><TableCell colSpan={tableColumns.length} className="h-24 text-center">Nenhuma categoria encontrada.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Próximo</Button>
      </div>

      <FormDialogCargos open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen} initialData={editingData} onSave={handleSave}/>
      <ConfirmationDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Confirmar Exclusão" description={`Tem certeza que deseja excluir a categoria "${positionToDelete?.name}"?`} onConfirm={handleConfirmDelete} confirmText="Sim, Excluir"/>
    </div>
  )
}