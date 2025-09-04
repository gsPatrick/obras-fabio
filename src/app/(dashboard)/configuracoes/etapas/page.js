import { columns } from "./columns"
import { DataTable } from "./data-table"

export default function EtapasPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Etapas</h1>
        {/* --- CORREÇÃO APLICADA AQUI --- */}
      <p className="text-muted-foreground mt-1">
        {`Crie e configure o "cardápio" de etapas que podem ser usadas nos fluxos de trabalho.`}
      </p>

      </div>
      <DataTable columns={columns} />
    </div>
  )
}