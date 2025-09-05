"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle, Download, Loader2 } from "lucide-react"

import api from "../../../lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu"
import { FormDialog } from "./form-dialog"
import { ConfirmationDialog } from "../components/ConfirmationDialog"

export function DataTable({ columns }) {
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);
  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false)
  const [editingData, setEditingData] = React.useState(null)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [clientToDelete, setClientToDelete] = React.useState(null);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/companies');
      setData(response.data.companies || []); 
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast.error("Falha ao carregar a lista de clientes.");
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

  const handleDeleteRequest = (client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    try {
      await api.delete(`/companies/${clientToDelete.id}`);
      toast.success(`Cliente "${clientToDelete.corporateName}" excluído com sucesso!`);
      fetchData();
    } catch (error) {
      toast.error("Falha ao excluir o cliente.");
    } finally {
      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingData?.id) {
        await api.put(`/companies/${editingData.id}`, formData);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await api.post('/companies', formData);
        toast.success("Cliente criado com sucesso!");
      }
      fetchData();
      return true;
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      const errorMessage = error.response?.data?.error || "Erro ao salvar cliente.";
      toast.error(errorMessage);
      return false;
    }
  };
  
  const handleExport = async () => {
    setIsExporting(true);
    toast.info("A exportação foi iniciada. Aguarde...");
    try {
        const tradeNameFilter = columnFilters.find(f => f.id === 'tradeName')?.value || '';
        const cnpjFilter = columnFilters.find(f => f.id === 'cnpj')?.value || '';
        const params = new URLSearchParams({ 
            tradeName: tradeNameFilter,
            cnpj: cnpjFilter 
        });
        
        const response = await api.get('/companies/export', {
            params,
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const filename = `clientes-${new Date().toISOString().slice(0, 10)}.xlsx`;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Download do arquivo de clientes concluído!");

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
        const client = row.original
        const encodedClientName = encodeURIComponent(client.corporateName)

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(client)}>
                  Editar
                </DropdownMenuItem>
                <Link href={`/contratos?cliente=${encodedClientName}`}>
                    <DropdownMenuItem>
                        Ver Contratos
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => handleDeleteRequest(client)}
                >
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    }
  ], [columns]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between py-4 gap-4">
        <Input
          placeholder="Filtrar por razão social..."
          value={(table.getColumn("corporateName")?.getFilterValue()) ?? ""}
          onChange={(event) =>
            table.getColumn("corporateName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                Exportar
            </Button>
            <Button onClick={handleCreate}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Cliente
            </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={tableColumns.length} className="h-24 text-center">Carregando...</TableCell></TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={tableColumns.length} className="h-24 text-center">Nenhum cliente encontrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Próximo</Button>
      </div>

      <FormDialog 
        open={isFormDialogOpen} 
        onOpenChange={setIsFormDialogOpen} 
        initialData={editingData} 
        onSave={handleSave}
      />
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o cliente "${clientToDelete?.corporateName}"?`}
        onConfirm={handleConfirmDelete}
        confirmText="Sim, Excluir"
      />
    </div>
  )
}