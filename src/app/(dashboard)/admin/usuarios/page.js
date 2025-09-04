import { columns } from "./columns"
import { DataTable } from "./data-table"

export default function UsuariosPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
        <p className="text-muted-foreground mt-1">
          Adicione, edite e gerencie os usuários do sistema.
        </p>
      </div>
      <DataTable columns={columns} />
    </div>
  )
}