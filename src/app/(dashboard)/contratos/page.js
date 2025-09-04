"use client"

import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Skeleton } from '../../../components/ui/skeleton';

function ContratosContent() {
  const searchParams = useSearchParams();
  const clientName = searchParams.get('cliente');
  const decodedValue = clientName ? decodeURIComponent(clientName) : null;

  const pageTitle = decodedValue ? `Contratos de "${decodedValue}"` : "Gerenciamento de Contratos";
  const pageDescription = decodedValue ? `Lista de contratos filtrada.` : `Adicione, edite e gerencie os contratos.`;

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{pageTitle}</h1>
        <p className="text-muted-foreground mt-1">{pageDescription}</p>
      </div>
      <DataTable columns={columns} filterValue={decodedValue} />
    </div>
  )
}

export default function ContratosPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
      <ContratosContent />
    </Suspense>
  )
}