
import { columns } from "./columns"
import { DataTable } from "./data-table"

export default function SolicitacoesPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Solicitações</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe o andamento de todas as solicitações de admissão, desligamento e mais.
        </p>
      </div>
      <DataTable columns={columns} />
    </div>
  )
} 