"use client"

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Lock, X } from 'lucide-react';
import { Card } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { cn } from '../../../../../lib/utils';

export function DraggableStep({ id, step, isUsed = false, isInFlow = false, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isUsed });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card 
        className={cn(
            "p-3 flex items-center justify-between",
            isUsed && !isInFlow && "bg-muted/50 border-dashed",
        )}
      >
          <div className="flex items-center gap-2">
              <div {...(isUsed ? {} : listeners)} className={cn("touch-none p-1", isUsed ? "cursor-not-allowed" : "cursor-grab")}>
                  {isUsed && !isInFlow ? (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                  ) : (
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                  )}
              </div>
              <div className={cn("flex flex-col", isUsed && !isInFlow && "text-muted-foreground")}>
                  <p className="font-medium">{step.name}</p>
                  {/* --- LINHA ADICIONADA PARA EXIBIR A DESCRIÇÃO --- */}
                  {step.description && <p className="text-xs text-muted-foreground">{step.description}</p>}
              </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{step.defaultProfile}</Badge>
            {isInFlow && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemove(id)}>
                    <X className="h-4 w-4" />
                </Button>
            )}
          </div>
      </Card>
    </div>
  );
}