import { columns } from "./columns"
import { DataTable } from "./data-table"

export default function TiposSolicitacaoPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Tipos de Solicitação</h1>
        <p className="text-muted-foreground mt-1">
          Configure as descrições dos diferentes fluxos que sua organização utiliza.
        </p>
      </div>
      {/* A DataTable agora gerencia seus próprios dados estáticos */}
      <DataTable columns={columns} />
    </div>
  )
}