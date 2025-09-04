"use client" 

import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Skeleton } from '../../../components/ui/skeleton';

function PessoasContent() {
  const searchParams = useSearchParams();
  const filterBy = searchParams.get('filterBy');
  const value = searchParams.get('value');
  const decodedValue = value ? decodeURIComponent(value) : null;

  const pageTitle = decodedValue ? `Colaboradores de "${decodedValue}"` : "Gerenciamento de Pessoas";
  const pageDescription = decodedValue ? `Lista de colaboradores filtrada.` : `Visualize, adicione, edite e remova colaboradores.`;

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{pageTitle}</h1>
        <p className="text-muted-foreground mt-1">{pageDescription}</p>
      </div>
      <DataTable columns={columns} filterBy={filterBy} filterValue={decodedValue} />
    </div>
  );
}

export default function PessoasPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
      <PessoasContent />
    </Suspense>
  )
} 