"use client"

import * as React from "react"
import Link from 'next/link'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import { FormDialogDeps } from "./form-dialog-deps"

export function DataTableDeps({ columns, data }) {
  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])

  // Estado para controlar o modal de criação/edição
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingData, setEditingData] = React.useState(null)

  const handleCreate = () => {
    setEditingData(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (data) => {
    setEditingData(data)
    setIsDialogOpen(true)
  }

  // Adicionando a coluna de ações dinamicamente para ter acesso às funções de controle do modal
  const tableColumns = React.useMemo(() => [
    ...columns,
    {
      id: "actions",
      cell: ({ row }) => {
        const department = row.original;
        const encodedDepartmentName = encodeURIComponent(department.name); // Garante que a URL seja válida

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(department)}>
                  Editar
                </DropdownMenuItem>
                <Link href={`/pessoas?filterBy=department&value=${encodedDepartmentName}`}>
                  <DropdownMenuItem>
                    Ver colaboradores
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="text-red-600" onClick={() => alert(`Excluir ${department.name}`)}>
                  Excluir
                </DropdownMenuItem>
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
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filtrar por departamento..."
          value={(table.getColumn("name")?.getFilterValue()) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Departamento
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  Nenhum departamento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próximo
        </Button>
      </div>

      {/* Renderizando o Modal de Formulário */}
      <FormDialogDeps
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={editingData}
      />
    </div>
  )
}