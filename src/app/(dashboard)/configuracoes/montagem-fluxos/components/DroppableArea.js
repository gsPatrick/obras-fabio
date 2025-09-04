"use client"

import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { DraggableStep } from './DraggableStep';

// Adicionamos a prop onRemove
export function DroppableArea({ id, items, onRemove }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <SortableContext
      id={id}
      items={items}
      strategy={verticalListSortingStrategy}
    >
      <div ref={setNodeRef} className="p-4 bg-muted/40 rounded-lg min-h-[400px]">
        {items.length > 0 ? (
          items.map(step => (
            <DraggableStep 
              key={step.id} 
              id={step.id} 
              step={step}
              // Informando ao card que ele está no fluxo e passando a função de remover
              isInFlow={true} 
              onRemove={onRemove}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Arraste as etapas aqui para montar o fluxo</p>
          </div>
        )}
      </div>
    </SortableContext>
  );
}