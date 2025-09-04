import { columns } from "./columns"
import { DataTable } from "./data-table"

// Dados mockados
const mockData = [
  { id: "cli_01", name: "Tech Solutions Ltda", cnpj: "12.345.678/0001-99", status: "Ativo" },
  { id: "cli_02", name: "Inova Corp S.A.", cnpj: "98.765.432/0001-11", status: "Ativo" },
  { id: "cli_03", name: "Global Services", cnpj: "55.444.333/0001-22", status: "Inativo" },
]

export default function ClientesPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Clientes</h1>
        <p className="text-muted-foreground mt-1">
          Adicione, edite e gerencie os clientes da sua base.
        </p>
      </div>
      <DataTable columns={columns} data={mockData} />
    </div>
  )
}