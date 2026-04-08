'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  User,
  Target,
  MoreHorizontal,
  Pencil,
  Trash2,
  TrendingUp,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
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
import {
  opportunities,
  activities,
  formatCurrency,
  formatDate,
  formatDateTime,
  type Opportunity,
  type OpportunityStage,
} from '@/lib/crm-data'
import { cn } from '@/lib/utils'
import { OpportunityFormDrawer } from './opportunity-form-drawer'

const stageColors: Record<OpportunityStage, string> = {
  new: 'bg-status-new/20 text-status-new border-status-new/30',
  qualified: 'bg-status-qualified/20 text-status-qualified border-status-qualified/30',
  proposal: 'bg-status-proposal/20 text-status-proposal border-status-proposal/30',
  won: 'bg-status-won/20 text-status-won border-status-won/30',
  lost: 'bg-status-lost/20 text-status-lost border-status-lost/30',
}

const stageProgress: Record<OpportunityStage, number> = {
  new: 20,
  qualified: 40,
  proposal: 60,
  won: 100,
  lost: 0,
}

interface OpportunityDetailContentProps {
  opportunityId: string
}

export function OpportunityDetailContent({ opportunityId }: OpportunityDetailContentProps) {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [currentStage, setCurrentStage] = React.useState<OpportunityStage | null>(null)

  const opportunity = opportunities.find((o) => o.id === opportunityId)

  React.useEffect(() => {
    if (opportunity) {
      setCurrentStage(opportunity.stage)
    }
  }, [opportunity])

  if (!opportunity) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <p className="text-lg text-muted-foreground">Opportunity not found</p>
        <Link href="/opportunities">
          <Button variant="link">Back to Opportunities</Button>
        </Link>
      </div>
    )
  }

  // Get related activities
  const relatedActivities = activities.filter(
    (a) => a.relatedType === 'opportunity' && 'id' in a.relatedTo && a.relatedTo.id === opportunityId
  )

  // Activity timeline
  const timeline = [
    { type: 'created', date: opportunity.createdAt, description: 'Opportunity was created' },
    { type: 'stage', date: new Date('2026-04-03'), description: 'Stage changed to Qualified' },
    { type: 'activity', date: new Date('2026-04-05'), description: 'Demo presentation scheduled' },
    { type: 'note', date: new Date('2026-04-06'), description: 'Proposal document prepared' },
    { type: 'stage', date: opportunity.updatedAt, description: `Stage changed to ${opportunity.stage}` },
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  const handleStageChange = (stage: OpportunityStage) => {
    setCurrentStage(stage)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/opportunities">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{opportunity.name}</h1>
            <p className="text-muted-foreground">
              {opportunity.linkedLead.company} · {opportunity.linkedLead.name}
            </p>
            <Badge
              variant="outline"
              className={cn('mt-2 capitalize', stageColors[currentStage || opportunity.stage])}
            >
              {currentStage || opportunity.stage}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentStage !== 'won' && currentStage !== 'lost' && (
            <>
              <Button variant="outline" onClick={() => handleStageChange('won')}>
                <CheckCircle className="mr-2 size-4 text-status-won" />
                Mark as Won
              </Button>
              <Button variant="outline" onClick={() => handleStageChange('lost')}>
                <XCircle className="mr-2 size-4 text-status-lost" />
                Mark as Lost
              </Button>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsDrawerOpen(true)}>
                <Pencil className="mr-2 size-4" />
                Edit Opportunity
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stage Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Deal Progress</span>
            <Select value={currentStage || opportunity.stage} onValueChange={handleStageChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Progress
            value={stageProgress[currentStage || opportunity.stage]}
            className="h-2"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>New</span>
            <span>Qualified</span>
            <span>Proposal</span>
            <span>Closed</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Deal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <DollarSign className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deal Value</p>
                  <p className="text-lg font-semibold">{formatCurrency(opportunity.value)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <Target className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Win Probability</p>
                  <p className="text-lg font-semibold">{opportunity.probability}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <Calendar className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Close</p>
                  <p className="text-sm font-medium">{formatDate(opportunity.expectedCloseDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <TrendingUp className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weighted Value</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(opportunity.value * (opportunity.probability / 100))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Linked Lead */}
          <Card>
            <CardHeader>
              <CardTitle>Linked Lead</CardTitle>
              <CardDescription>The lead associated with this opportunity</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={`/leads/${opportunity.linkedLead.id}`}
                className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
              >
                <Avatar className="size-12">
                  <AvatarFallback className="bg-secondary text-foreground">
                    {opportunity.linkedLead.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{opportunity.linkedLead.name}</p>
                  <p className="text-sm text-muted-foreground">{opportunity.linkedLead.company}</p>
                  <p className="text-sm text-muted-foreground">{opportunity.linkedLead.email}</p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {opportunity.linkedLead.status}
                </Badge>
              </Link>
            </CardContent>
          </Card>

          {/* Related Activities */}
          {relatedActivities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Activities</CardTitle>
                <CardDescription>Activities linked to this opportunity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relatedActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {activity.type} · {activity.status}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(activity.scheduledAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Owner</span>
                <div className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {opportunity.owner.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{opportunity.owner.name}</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">{formatDate(opportunity.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm">{formatDate(opportunity.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Recent updates and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="relative flex flex-col items-center">
                      <div className="flex size-8 items-center justify-center rounded-full bg-secondary">
                        {item.type === 'created' && <FileText className="size-3 text-muted-foreground" />}
                        {item.type === 'stage' && <TrendingUp className="size-3 text-muted-foreground" />}
                        {item.type === 'note' && <FileText className="size-3 text-muted-foreground" />}
                        {item.type === 'activity' && <Calendar className="size-3 text-muted-foreground" />}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="absolute top-8 h-full w-px bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(item.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <OpportunityFormDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        opportunity={opportunity}
      />
    </div>
  )
}
