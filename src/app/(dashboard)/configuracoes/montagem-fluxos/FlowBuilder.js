"use client"

import React from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { DroppableArea } from './components/DroppableArea';
import { DraggableStep } from './components/DraggableStep';

// Recebe 'flowItems' e 'setFlowItems' como props
export function FlowBuilder({ allSteps, flowItems, setFlowItems }) {
  
  const flowItemIds = React.useMemo(() => flowItems.map(item => item.id), [flowItems]);
  const sensors = useSensors(useSensor(PointerSensor));

  const removeFromFlow = (itemIdToRemove) => {
    setFlowItems(prev => prev.filter(item => item.id !== itemIdToRemove));
  };

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Cenário 1: Reordenando dentro do "Fluxo Atual"
    if (flowItemIds.includes(activeId) && flowItemIds.includes(overId)) {
      if (activeId !== overId) {
        setFlowItems((items) => {
          const oldIndex = items.findIndex((item) => item.id === activeId);
          const newIndex = items.findIndex((item) => item.id === overId);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
      return;
    }
    
    // Cenário 2: Movendo de "Disponíveis" para "Fluxo Atual"
    if (!flowItemIds.includes(activeId) && (flowItemIds.includes(overId) || overId === 'flowArea')) {
        const itemToAdd = allSteps.find(item => item.id === activeId);
        if (!itemToAdd) return;
        
        setFlowItems(prev => {
            const overIndex = prev.findIndex(item => item.id === overId);
            const newItems = [...prev];
            // Se o 'over' for a área de drop, insere no final, senão, na posição do item
            const insertIndex = overIndex !== -1 ? overIndex : newItems.length;
            newItems.splice(insertIndex, 0, itemToAdd);
            return newItems;
        });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Etapas Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/40 rounded-lg min-h-[400px] space-y-2">
                {allSteps.map(step => (
                    <DraggableStep 
                        key={step.id} 
                        id={step.id} 
                        step={step} 
                        isUsed={flowItemIds.includes(step.id)} 
                    />
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fluxo Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <DroppableArea 
                id="flowArea" 
                items={flowItems} 
                onRemove={removeFromFlow} 
            />
          </CardContent>
        </Card>
      </div>
    </DndContext>
  );
}