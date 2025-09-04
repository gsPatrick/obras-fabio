"use client"
import * as React from "react"
import { toast } from "sonner";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle } from "lucide-react"
import api from "../../../../lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../components/ui/dropdown-menu"
import { FormDialog } from "./form-dialog"
import { ConfirmationDialog } from "../../components/ConfirmationDialog";

export function DataTable({ columns }) {
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [editingData, setEditingData] = React.useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState(null);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users');
      setData(response.data.users || []);
    } catch (error) { toast.error("Falha ao carregar a lista de usuários."); } 
    finally { setIsLoading(false); }
  }, []);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = () => { setEditingData(null); setIsFormDialogOpen(true); };
  const handleEdit = (data) => { setEditingData(data); setIsFormDialogOpen(true); };
  const handleDeleteRequest = (user) => { setUserToDelete(user); setIsDeleteDialogOpen(true); };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/users/${userToDelete.id}`);
      toast.success(`Usuário "${userToDelete.name}" desativado com sucesso!`);
      fetchData();
    } catch (error) { toast.error("Falha ao desativar o usuário."); } 
    finally { setIsDeleteDialogOpen(false); setUserToDelete(null); }
  };

  const handleSave = async (formData) => {
    try {
      let savedUser; // Variável para armazenar o resultado
      if (editingData?.id) {
        const response = await api.put(`/users/${editingData.id}`, formData);
        savedUser = response.data; // Captura o usuário atualizado
        toast.success("Usuário atualizado com sucesso!");
      } else {
        const response = await api.post('/users', formData);
        savedUser = response.data; // Captura o usuário criado
        toast.success("Usuário criado com sucesso!");
      }
      fetchData();
      return savedUser; // Retorna o objeto do usuário para o dialog
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao salvar usuário.");
      return null; // Retorna nulo em caso de falha
    }
  };

  const tableColumns = React.useMemo(() => [ ...columns, { id: "actions", cell: ({ row }) => (<div className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => handleEdit(row.original)}>Editar</DropdownMenuItem><DropdownMenuItem className="text-red-600" onClick={() => handleDeleteRequest(row.original)}>Desativar</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>) }], [columns]);

  const table = useReactTable({ data, columns: tableColumns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), onSortingChange: setSorting, getSortedRowModel: getSortedRowModel(), onColumnFiltersChange: setColumnFilters, getFilteredRowModel: getFilteredRowModel(), state: { sorting, columnFilters } });

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <Input placeholder="Filtrar por nome..." value={(table.getColumn("name")?.getFilterValue()) ?? ""} onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)} className="max-w-sm"/>
        <Button onClick={handleCreate}><PlusCircle className="mr-2 h-4 w-4" />Novo Usuário</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>{table.getHeaderGroups().map((headerGroup) => (<TableRow key={headerGroup.id}>{headerGroup.headers.map((header) => (<TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
          <TableBody>
            {isLoading ? (<TableRow><TableCell colSpan={tableColumns.length} className="h-24 text-center">Carregando...</TableCell></TableRow>) : table.getRowModel().rows?.length ? (table.getRowModel().rows.map((row) => (<TableRow key={row.id}>{row.getVisibleCells().map((cell) => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))) : (<TableRow><TableCell colSpan={tableColumns.length} className="h-24 text-center">Nenhum usuário encontrado.</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4"><Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button><Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Próximo</Button></div>
      <FormDialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen} initialData={editingData} onSave={handleSave} />
      <ConfirmationDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Confirmar Desativação" description={`Tem certeza que deseja desativar o usuário "${userToDelete?.name}"?`} onConfirm={handleConfirmDelete} confirmText="Sim, Desativar" />
    </div>
  )
}