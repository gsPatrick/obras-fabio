import { columns } from "./columns-cargos"
import { DataTable } from "./data-table-cargos"

export default function CargosPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Categorias (Cargos)</h1>
        <p className="text-muted-foreground mt-1">
          Adicione, edite e gerencie as categorias e cargos utilizados no sistema.
        </p>
      </div>
      <DataTable columns={columns} />
    </div>
  )
}