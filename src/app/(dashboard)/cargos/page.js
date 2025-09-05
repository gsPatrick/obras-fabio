import { columnsCargos } from "./columns-cargos"
import { DataTableCargos } from "./data-table-cargos"

export default function CargosPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Categorias</h1>
        <p className="text-muted-foreground mt-1">
          Visualize, crie e gerencie as categorias (cargos) disponíveis na organização.
        </p>
      </div>
      <DataTableCargos columns={columnsCargos} />
    </div>
  )
}