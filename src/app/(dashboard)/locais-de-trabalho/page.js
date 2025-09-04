"use client"

import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Skeleton } from '../../../components/ui/skeleton';

function LocaisDeTrabalhoContent() {
  const searchParams = useSearchParams();
  const contractNumber = searchParams.get('contrato');
  const decodedValue = contractNumber ? decodeURIComponent(contractNumber) : null;

  const pageTitle = decodedValue ? `Locais do Contrato "${decodedValue}"` : "Gerenciamento de Locais de Trabalho";
  const pageDescription = decodedValue ? `Lista de locais de trabalho filtrada.` : `Adicione, edite e gerencie os locais.`;

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

export default function LocaisDeTrabalhoPage() {
    return (
        <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
            <LocaisDeTrabalhoContent />
        </Suspense>
    )
}