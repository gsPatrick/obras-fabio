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
import { MoreHorizontal, Download, Loader2 } from "lucide-react"

import api from "../../../lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Button } from "../../../components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu"
import { ConfirmationDialog } from "../components/ConfirmationDialog"

// O DataTable agora também recebe a função de exportação
export function DataTable({ columns, filters, onExport }) {
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState([])
  
  // O filtro de texto (columnFilters) é gerenciado pela página principal
  const { columnFilters, setColumnFilters } = filters;

  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
  const [solicitationToCancel, setSolicitationToCancel] = React.useState(null);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.companyId) params.append('companyId', filters.companyId);
      if (filters.contractId) params.append('contractId', filters.contractId);
      if (filters.date?.from) params.append('startDate', filters.date.from.toISOString());
      if (filters.date?.to) params.append('endDate', filters.date.to.toISOString());
      
      // Adiciona o filtro de texto se existir
      const protocolFilter = columnFilters.find(f => f.id === 'protocol')?.value;
      if(protocolFilter) params.append('protocol', protocolFilter);


      const response = await api.get('/requests', { params });
      setData(response.data.requests || []);
    } catch (error) {
      toast.error("Falha ao carregar a lista de solicitações.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, columnFilters]); 

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
      await api.post(`/requests/${solicitationToCancel.id}/request-cancellation`, {
        reason: "Cancelamento solicitado pelo usuário via interface."
      });
      toast.success(`Solicitação de cancelamento para o protocolo ${solicitationToCancel.protocol} foi enviada.`);
      fetchData();
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
            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Abrir menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <Link href={`/solicitacoes/${row.original.id}`}><DropdownMenuItem>Ver Detalhes e Histórico</DropdownMenuItem></Link>
              {!['CANCELADO', 'ADMITIDO', 'REPROVADO_PELA_GESTAO', 'DESLIGAMENTO_CONCLUIDO'].includes(row.original.status) && (
                <DropdownMenuItem onClick={() => handleRequestCancel(row.original)}>Solicitar Cancelamento</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ], [columns, fetchData]);

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
    manualFiltering: true, // Indica que a filtragem é feita no servidor
  })

  return (
    <div>
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>{table.getHeaderGroups().map((headerGroup) => (<TableRow key={headerGroup.id}>{headerGroup.headers.map((header) => (<TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={tableColumns.length} className="h-24 text-center">Carregando...</TableCell></TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (<TableRow key={row.id}>{row.getVisibleCells().map((cell) => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))
            ) : (
              <TableRow><TableCell colSpan={tableColumns.length} className="h-24 text-center">Nenhuma solicitação encontrada para os filtros aplicados.</TableCell></TableRow>
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