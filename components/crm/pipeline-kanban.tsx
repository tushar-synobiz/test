'use client'

import * as React from 'react'
import Link from 'next/link'
import { GripVertical, MoreHorizontal, Pencil, Eye, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  type Opportunity,
  type OpportunityStage,
  formatCurrency,
  formatDate,
} from '@/lib/crm-data'
import { cn } from '@/lib/utils'

const stages: { id: OpportunityStage; label: string; color: string }[] = [
  { id: 'new', label: 'New', color: 'bg-status-new' },
  { id: 'qualified', label: 'Qualified', color: 'bg-status-qualified' },
  { id: 'proposal', label: 'Proposal', color: 'bg-status-proposal' },
  { id: 'won', label: 'Won', color: 'bg-status-won' },
  { id: 'lost', label: 'Lost', color: 'bg-status-lost' },
]

interface PipelineKanbanProps {
  opportunities: Opportunity[]
  isLoading: boolean
  onEdit: (opportunity: Opportunity) => void
}

export function PipelineKanban({ opportunities, isLoading, onEdit }: PipelineKanbanProps) {
  const [localOpps, setLocalOpps] = React.useState(opportunities)
  const [draggedOpp, setDraggedOpp] = React.useState<Opportunity | null>(null)
  const [dragOverStage, setDragOverStage] = React.useState<OpportunityStage | null>(null)

  React.useEffect(() => {
    setLocalOpps(opportunities)
  }, [opportunities])

  const handleDragStart = (e: React.DragEvent, opp: Opportunity) => {
    setDraggedOpp(opp)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, stage: OpportunityStage) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stage)
  }

  const handleDragLeave = () => {
    setDragOverStage(null)
  }

  const handleDrop = (e: React.DragEvent, newStage: OpportunityStage) => {
    e.preventDefault()
    if (draggedOpp && draggedOpp.stage !== newStage) {
      setLocalOpps((prev) =>
        prev.map((opp) =>
          opp.id === draggedOpp.id ? { ...opp, stage: newStage } : opp
        )
      )
    }
    setDraggedOpp(null)
    setDragOverStage(null)
  }

  const handleDragEnd = () => {
    setDraggedOpp(null)
    setDragOverStage(null)
  }

  const getStageOpportunities = (stage: OpportunityStage) => {
    return localOpps.filter((opp) => opp.stage === stage)
  }

  const getStageValue = (stage: OpportunityStage) => {
    return getStageOpportunities(stage).reduce((sum, opp) => sum + opp.value, 0)
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage.id} className="w-72 shrink-0">
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const stageOpps = getStageOpportunities(stage.id)
        const stageValue = getStageValue(stage.id)
        const isDragOver = dragOverStage === stage.id

        return (
          <div
            key={stage.id}
            className="w-72 shrink-0"
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            {/* Stage Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn('size-2 rounded-full', stage.color)} />
                <span className="font-medium">{stage.label}</span>
                <Badge variant="secondary" className="ml-1 px-1.5 text-xs">
                  {stageOpps.length}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(stageValue)}
              </span>
            </div>

            {/* Stage Column */}
            <div
              className={cn(
                'min-h-[400px] space-y-3 rounded-lg border-2 border-dashed border-transparent p-2 transition-colors',
                isDragOver && 'border-primary/50 bg-primary/5'
              )}
            >
              {stageOpps.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
                  <p className="text-sm text-muted-foreground">No deals</p>
                </div>
              ) : (
                stageOpps.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onEdit={onEdit}
                    isDragging={draggedOpp?.id === opp.id}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface OpportunityCardProps {
  opportunity: Opportunity
  onDragStart: (e: React.DragEvent, opp: Opportunity) => void
  onDragEnd: () => void
  onEdit: (opp: Opportunity) => void
  isDragging: boolean
}

function OpportunityCard({
  opportunity,
  onDragStart,
  onDragEnd,
  onEdit,
  isDragging,
}: OpportunityCardProps) {
  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, opportunity)}
      onDragEnd={onDragEnd}
      className={cn(
        'cursor-grab transition-all hover:shadow-md active:cursor-grabbing',
        isDragging && 'opacity-50 ring-2 ring-primary'
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <GripVertical className="size-4 text-muted-foreground" />
            <Link
              href={`/opportunities/${opportunity.id}`}
              className="font-medium text-sm hover:text-primary line-clamp-1"
              onClick={(e) => e.stopPropagation()}
            >
              {opportunity.name}
            </Link>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="size-6 -mt-1 -mr-1">
                <MoreHorizontal className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/opportunities/${opportunity.id}`}>
                  <Eye className="mr-2 size-4" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(opportunity)}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-2 text-xs text-muted-foreground line-clamp-1">
          {opportunity.linkedLead.company}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-semibold text-sm">{formatCurrency(opportunity.value)}</span>
          <Badge variant="secondary" className="text-xs">
            {opportunity.probability}%
          </Badge>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Avatar className="size-5">
              <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                {opportunity.owner.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span>{opportunity.owner.name.split(' ')[0]}</span>
          </div>
          <span>{formatDate(opportunity.expectedCloseDate)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
