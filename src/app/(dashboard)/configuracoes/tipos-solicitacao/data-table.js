"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../components/ui/dropdown-menu"
import { FormDialog } from "./form-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../components/ui/tooltip"


// Dados estáticos que refletem o ENUM da API
const staticRequestTypes = [
  { id: "ADMISSAO", name: "Admissão", description: "Processo para contratar novos colaboradores.", status: "Ativo" },
  { id: "DESLIGAMENTO", name: "Desligamento", description: "Processo para desligar colaboradores.", status: "Ativo" },
  { id: "SUBSTITUICAO", name: "Substituição", description: "Solicitar substituição de um colaborador.", status: "Ativo" },
];

export function DataTable({ columns }) {
  const [data, setData] = React.useState(staticRequestTypes); // Usa os dados estáticos
  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingData, setEditingData] = React.useState(null);

  const handleEdit = (data) => {
    setEditingData(data);
    setIsDialogOpen(true);
  };

  const handleSave = (updatedData) => {
    setData(currentData => 
        currentData.map(item => item.id === updatedData.id ? updatedData : item)
    );
    return true; // Retorna sucesso para o modal
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
              {/* Ação de desativar/ativar controlará o status simulado */}
              <DropdownMenuItem onClick={() => handleSave({...row.original, status: row.original.status === 'Ativo' ? 'Inativo' : 'Ativo'})}>
                {row.original.status === 'Ativo' ? 'Desativar' : 'Ativar'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
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
    state: { sorting, columnFilters },
  })

  return (
    <div>
        <div className="flex items-center justify-between py-4">
            <Input
                placeholder="Filtrar por nome..."
                value={(table.getColumn("name")?.getFilterValue()) ?? ""}
                onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                className="max-w-sm"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Botão desabilitado pois a criação não é suportada pela API */}
                  <span tabIndex={0}>
                    <Button disabled> 
                      <PlusCircle className="mr-2 h-4 w-4"/>
                      Novo Tipo
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>A criação de tipos é feita diretamente no sistema.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
        </div>
        <div className="rounded-md border">
            <Table>
                <TableHeader>{table.getHeaderGroups().map((headerGroup) => (<TableRow key={headerGroup.id}>{headerGroup.headers.map((header) => (<TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
                <TableBody>
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (<TableRow key={row.id}>{row.getVisibleCells().map((cell) => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))
                ) : (
                    <TableRow><TableCell colSpan={tableColumns.length} className="h-24 text-center">Nenhum tipo de solicitação encontrado.</TableCell></TableRow>
                )}
                </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Próximo</Button>
        </div>
        
        <FormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} initialData={editingData} onSave={handleSave} />
    </div>
  )
}