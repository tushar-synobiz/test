'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  opportunities,
  formatCurrency,
  formatDate,
  type Opportunity,
  type OpportunityStage,
} from '@/lib/crm-data'
import { cn } from '@/lib/utils'
import { PipelineKanban } from './pipeline-kanban'
import { OpportunityFormDrawer } from './opportunity-form-drawer'

const stageColors: Record<OpportunityStage, string> = {
  new: 'bg-status-new/20 text-status-new',
  qualified: 'bg-status-qualified/20 text-status-qualified',
  proposal: 'bg-status-proposal/20 text-status-proposal',
  won: 'bg-status-won/20 text-status-won',
  lost: 'bg-status-lost/20 text-status-lost',
}

type ViewMode = 'pipeline' | 'table'

export function OpportunitiesContent() {
  const [viewMode, setViewMode] = React.useState<ViewMode>('pipeline')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [stageFilter, setStageFilter] = React.useState<OpportunityStage | 'all'>('all')
  const [isLoading, setIsLoading] = React.useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [editingOpportunity, setEditingOpportunity] = React.useState<Opportunity | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredOpportunities = React.useMemo(() => {
    return opportunities.filter((opp) => {
      const matchesSearch =
        searchQuery === '' ||
        opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.linkedLead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.linkedLead.company.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStage = stageFilter === 'all' || opp.stage === stageFilter

      return matchesSearch && matchesStage
    })
  }, [searchQuery, stageFilter])

  const handleEdit = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity)
    setIsDrawerOpen(true)
  }

  const handleCreate = () => {
    setEditingOpportunity(null)
    setIsDrawerOpen(true)
  }

  // Calculate totals
  const pipelineTotal = filteredOpportunities
    .filter(o => !['won', 'lost'].includes(o.stage))
    .reduce((sum, o) => sum + o.value, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Opportunities</h1>
          <p className="text-muted-foreground">
            Track and manage your sales pipeline
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 size-4" />
          New Opportunity
        </Button>
      </div>

      {/* Pipeline value summary */}
      <div className="flex items-center gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Pipeline Value</p>
          <p className="text-2xl font-bold">{formatCurrency(pipelineTotal)}</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className="text-sm text-muted-foreground">Active Deals</p>
          <p className="text-2xl font-bold">
            {filteredOpportunities.filter(o => !['won', 'lost'].includes(o.stage)).length}
          </p>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {viewMode === 'table' && (
            <Select
              value={stageFilter}
              onValueChange={(value) => setStageFilter(value as OpportunityStage | 'all')}
            >
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 size-4" />
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="pipeline" className="gap-2">
              <LayoutGrid className="size-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-2">
              <List className="size-4" />
              Table
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {viewMode === 'pipeline' ? (
        <PipelineKanban
          opportunities={filteredOpportunities}
          isLoading={isLoading}
          onEdit={handleEdit}
        />
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[250px]">Opportunity</TableHead>
                <TableHead>Lead / Company</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Expected Close</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredOpportunities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-muted-foreground">No opportunities found</p>
                      <Button variant="link" onClick={handleCreate}>
                        Create your first opportunity
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOpportunities.map((opp) => (
                  <TableRow key={opp.id} className="cursor-pointer">
                    <TableCell>
                      <Link href={`/opportunities/${opp.id}`} className="font-medium hover:text-primary">
                        {opp.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{opp.linkedLead.name}</p>
                        <p className="text-sm text-muted-foreground">{opp.linkedLead.company}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(opp.value)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn('capitalize', stageColors[opp.stage])}>
                        {opp.stage}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {opp.owner.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{opp.owner.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(opp.expectedCloseDate)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/opportunities/${opp.id}`}>
                              <Eye className="mr-2 size-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(opp)}>
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <OpportunityFormDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        opportunity={editingOpportunity}
      />
    </div>
  )
}
