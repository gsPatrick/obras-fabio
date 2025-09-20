"use client"
import * as React from "react"
import { toast } from "sonner";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle, Download, Loader2 } from "lucide-react"
import api from "../../../../lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../../../../components/ui/dropdown-menu"
import { FormDialog } from "./form-dialog"
import { ConfirmationDialog } from "../../components/ConfirmationDialog";

export function DataTable({ columns }) {
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [editingData, setEditingData] = React.useState(null);
  
  // Estados para o diálogo de DESATIVAR
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = React.useState(false);
  const [userToDeactivate, setUserToDeactivate] = React.useState(null);

  // --- NOVOS ESTADOS PARA O DIÁLOGO DE EXCLUIR PERMANENTEMENTE ---
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState(null);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users');
      setData(response.data.users || []);
    } catch (error) { 
      toast.error("Falha ao carregar a lista de usuários."); 
    } finally { 
      setIsLoading(false); 
    }
  }, []);

  React.useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  const handleCreate = () => { 
    setEditingData(null); 
    setIsFormDialogOpen(true); 
  };
  
  const handleEdit = (data) => { 
    setEditingData(data); 
    setIsFormDialogOpen(true); 
  };

  // Funções para DESATIVAR
  const handleDeactivateRequest = (user) => { 
    setUserToDeactivate(user); 
    setIsDeactivateDialogOpen(true); 
  };

  const handleConfirmDeactivate = async () => {
    if (!userToDeactivate) return;
    try {
      await api.delete(`/users/${userToDeactivate.id}`);
      toast.success(`Usuário "${userToDeactivate.name}" desativado com sucesso!`);
      fetchData();
    } catch (error) { 
      toast.error("Falha ao desativar o usuário."); 
    } finally { 
      setIsDeactivateDialogOpen(false); 
      setUserToDeactivate(null); 
    }
  };

  // --- NOVAS FUNÇÕES PARA EXCLUIR PERMANENTEMENTE ---
  const handleDeleteRequest = (user) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      // Chama a nova rota de exclusão permanente
      await api.delete(`/users/${userToDelete.id}/permanent`);
      toast.success(`Usuário "${userToDelete.name}" EXCLUÍDO com sucesso!`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Falha ao excluir o usuário.");
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };


  const handleSave = async (basicData, permissionsData) => {
    try {
      let savedUser;
      if (editingData?.id) {
        const response = await api.put(`/users/${editingData.id}`, basicData);
        savedUser = response.data;
        toast.success("Usuário atualizado com sucesso!");
      } else {
        const response = await api.post('/users', basicData);
        savedUser = response.data;
        toast.success("Usuário criado com sucesso!");
      }

      if (savedUser && savedUser.id) {
        await api.put(`/associations/users/${savedUser.id}/permissions`, { permissions: permissionsData });
        toast.success("Permissões do usuário foram salvas.");
      }
      
      setIsFormDialogOpen(false);
      fetchData();

    } catch (error) {
      toast.error(error.response?.data?.error || "Ocorreu um erro ao salvar o usuário.");
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    toast.info("A exportação foi iniciada. Aguarde...");
    try {
        const nameFilter = columnFilters.find(f => f.id === 'name')?.value || '';
        const params = new URLSearchParams({ name: nameFilter });
        
        const response = await api.get('/users/export', {
            params,
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const filename = `usuarios-${new Date().toISOString().slice(0, 10)}.xlsx`;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Download do arquivo de usuários concluído!");

    } catch (error) {
        toast.error("Falha ao exportar os dados.");
    } finally {
        setIsExporting(false);
    }
  };

  const tableColumns = React.useMemo(() => [ ...columns, { 
      id: "actions", 
      cell: ({ row }) => (
          <div className="text-right">
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(row.original)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeactivateRequest(row.original)}>Desativar</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteRequest(row.original)}>
                        Excluir Permanentemente
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
          </div>
      )
  }], [columns]);

  const table = useReactTable({ data, columns: tableColumns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), onSortingChange: setSorting, getSortedRowModel: getSortedRowModel(), onColumnFiltersChange: setColumnFilters, getFilteredRowModel: getFilteredRowModel(), state: { sorting, columnFilters } });

  return (
    <div>
      <div className="flex items-center justify-between py-4 gap-4">
        <Input placeholder="Filtrar por nome..." value={(table.getColumn("name")?.getFilterValue()) ?? ""} onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)} className="max-w-sm"/>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                Exportar
            </Button>
            <Button onClick={handleCreate}><PlusCircle className="mr-2 h-4 w-4" />Novo Usuário</Button>
        </div>
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
      
      <ConfirmationDialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen} title="Confirmar Desativação" description={`Tem certeza que deseja desativar o usuário "${userToDeactivate?.name}"?`} onConfirm={handleConfirmDeactivate} confirmText="Sim, Desativar" />

      {/* --- NOVO DIÁLOGO DE CONFIRMAÇÃO PARA EXCLUSÃO --- */}
      <ConfirmationDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        title="Confirmar EXCLUSÃO PERMANENTE" 
        description={`Esta ação é irreversível e irá apagar completamente o usuário "${userToDelete?.name}" do sistema. Deseja continuar?`} 
        onConfirm={handleConfirmDelete} 
        confirmText="Sim, Excluir Permanentemente" 
      />
    </div>
  )
}