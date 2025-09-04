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
import { MoreHorizontal, PlusCircle } from "lucide-react"

import api from "../../../lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu"
import { ConfirmationDialog } from "../components/ConfirmationDialog"

export function DataTable({ columns }) {
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])

  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
  const [solicitationToCancel, setSolicitationToCancel] = React.useState(null);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/requests');
      setData(response.data.requests || []);
    } catch (error) {
      toast.error("Falha ao carregar a lista de solicitações.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRequestCancel = (solicitation) => {
    setSolicitationToCancel(solicitation);
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!solicitationToCancel) return;
    try {
      // A API espera um motivo (reason) no corpo da requisição
      await api.post(`/requests/${solicitationToCancel.id}/request-cancellation`, {
        reason: "Cancelamento solicitado pelo usuário via interface."
      });
      toast.success(`Solicitação de cancelamento para o protocolo ${solicitationToCancel.protocol} foi enviada.`);
      fetchData(); // Recarrega os dados para mostrar o novo status
    } catch (error) {
      toast.error(error.response?.data?.error || "Falha ao solicitar o cancelamento.");
    } finally {
      setIsCancelDialogOpen(false);
      setSolicitationToCancel(null);
    }
  };
  
  const tableColumns = React.useMemo(() => [
    ...columns,
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Abrir menu</span><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <Link href={`/solicitacoes/${row.original.id}`}>
                <DropdownMenuItem>Ver Detalhes e Histórico</DropdownMenuItem>
              </Link>
              {/* Lógica para mostrar o botão apenas se o status permitir */}
              {!['CANCELADO', 'ADMITIDO', 'REPROVADO_PELA_GESTAO'].includes(row.original.status) && (
                <DropdownMenuItem onClick={() => handleRequestCancel(row.original)}>
                  Solicitar Cancelamento
                </DropdownMenuItem>
              )}
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
          placeholder="Filtrar por candidato..."
          value={(table.getColumn("candidateName")?.getFilterValue()) ?? ""}
          onChange={(event) => table.getColumn("candidateName")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <Link href="/solicitacoes/nova">
          <Button><PlusCircle className="mr-2 h-4 w-4" />Nova Solicitação</Button>
        </Link>
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
              <TableRow><TableCell colSpan={tableColumns.length} className="h-24 text-center">Nenhuma solicitação encontrada.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Próximo</Button>
      </div>

      <ConfirmationDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        title={`Confirmar Cancelamento da Solicitação ${solicitationToCancel?.protocol || ''}`}
        description="Você tem certeza que deseja solicitar o cancelamento deste processo? Esta ação será enviada para aprovação e não poderá ser desfeita."
        onConfirm={handleConfirmCancel}
        confirmText="Sim, Solicitar Cancelamento"
      />
    </div>
  )
}