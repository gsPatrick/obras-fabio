"use client"

import * as React from "react"
import { toast } from "sonner";
import * as xlsx from "xlsx";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle, Download, Loader2 } from "lucide-react"

import api from "../../../lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu"
import { FormDialog } from "./form-dialog-cargos"
import { ConfirmationDialog } from "../components/ConfirmationDialog"

export function DataTable({ columns }) {
    const [data, setData] = React.useState([])
    const [isLoading, setIsLoading] = React.useState(true);
    const [isExporting, setIsExporting] = React.useState(false);
    const [sorting, setSorting] = React.useState([])
    const [columnFilters, setColumnFilters] = React.useState([])
    
    const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false)
    const [editingData, setEditingData] = React.useState(null)
    
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
    const [itemToDelete, setItemToDelete] = React.useState(null)

    const fetchData = React.useCallback(async () => {
      setIsLoading(true);
      try {
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

    const handleCreate = () => { setEditingData(null); setIsFormDialogOpen(true); }
    const handleEdit = (data) => { setEditingData(data); setIsFormDialogOpen(true); }
    
    const handleDeleteRequest = (item) => {
        setItemToDelete(item);
        setIsDeleteDialogOpen(true);
    }

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/positions/${itemToDelete.id}`);
            toast.success(`Categoria "${itemToDelete.name}" excluída com sucesso!`);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.error || "Falha ao excluir a categoria.");
        } finally {
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    }

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

    const handleExport = () => {
        setIsExporting(true);
        toast.info("Preparando a exportação...");
    
        const filteredData = table.getFilteredRowModel().rows.map(row => {
          const original = row.original;
          return {
            'Nome da Categoria/Cargo': original.name,
            'Descrição': original.description || '-',
          };
        });
    
        if (filteredData.length === 0) {
          toast.warning("Nenhum dado para exportar com os filtros atuais.");
          setIsExporting(false);
          return;
        }
    
        const worksheet = xlsx.utils.json_to_sheet(filteredData);
    
        const headers = Object.keys(filteredData[0]);
        const colWidths = headers.map(header => {
          let maxLength = header.length;
          filteredData.forEach(row => {
            const cellValue = row[header] ? String(row[header]) : '';
            if (cellValue.length > maxLength) {
              maxLength = cellValue.length;
            }
          });
          return { wch: maxLength + 2 };
        });
        worksheet['!cols'] = colWidths;
    
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Categorias');
        xlsx.writeFile(workbook, `categorias-${new Date().toISOString().slice(0, 10)}.xlsx`);
    
        toast.success("Download iniciado com sucesso!");
        setIsExporting(false);
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
            <div className="flex items-center justify-end py-4 gap-2">
                <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                    Exportar
                </Button>
                <Button onClick={handleCreate}><PlusCircle className="mr-2 h-4 w-4" />Nova Categoria</Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : (
                                            <div>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanFilter() ? (
                                                    <div className="mt-2">
                                                        <Input
                                                            className="h-8"
                                                            placeholder={`Filtrar...`}
                                                            value={(header.column.getFilterValue()) ?? ''}
                                                            onChange={(e) => header.column.setFilterValue(e.target.value)}
                                                        />
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
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

            <FormDialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen} initialData={editingData} onSave={handleSave} />
            <ConfirmationDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Confirmar Exclusão" description={`Tem certeza que deseja excluir a categoria "${itemToDelete?.name}"?`} onConfirm={handleConfirmDelete} confirmText="Sim, Excluir" />
        </div>
    )
}