'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  User,
  Globe,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
  TrendingUp,
  Clock,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  leads,
  activities,
  opportunities,
  formatDate,
  formatDateTime,
  type Lead,
  type LeadStatus,
  type LeadSource,
} from '@/lib/crm-data'
import { cn } from '@/lib/utils'
import { LeadFormDrawer } from './lead-form-drawer'

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-status-new/20 text-status-new border-status-new/30',
  contacted: 'bg-status-proposal/20 text-status-proposal border-status-proposal/30',
  qualified: 'bg-status-qualified/20 text-status-qualified border-status-qualified/30',
  unqualified: 'bg-status-lost/20 text-status-lost border-status-lost/30',
}

const sourceLabels: Record<LeadSource, string> = {
  website: 'Website',
  referral: 'Referral',
  linkedin: 'LinkedIn',
  'cold-call': 'Cold Call',
  'trade-show': 'Trade Show',
  other: 'Other',
}

interface LeadDetailContentProps {
  leadId: string
}

export function LeadDetailContent({ leadId }: LeadDetailContentProps) {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)

  const lead = leads.find((l) => l.id === leadId)

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <p className="text-lg text-muted-foreground">Lead not found</p>
        <Link href="/leads">
          <Button variant="link">Back to Leads</Button>
        </Link>
      </div>
    )
  }

  // Get related activities and opportunities
  const relatedActivities = activities.filter(
    (a) => a.relatedType === 'lead' && 'id' in a.relatedTo && a.relatedTo.id === leadId
  )
  const relatedOpportunities = opportunities.filter((o) => o.linkedLead.id === leadId)

  // Activity timeline (mock data for audit logs)
  const timeline = [
    { type: 'created', date: lead.createdAt, description: 'Lead was created' },
    { type: 'status', date: new Date('2026-03-20'), description: 'Status changed to Contacted' },
    { type: 'note', date: new Date('2026-03-25'), description: 'Added note: "Interested in enterprise plan"' },
    { type: 'activity', date: new Date('2026-04-01'), description: 'Discovery call scheduled' },
    { type: 'status', date: lead.updatedAt, description: `Status changed to ${lead.status}` },
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/leads">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="bg-secondary text-foreground text-xl">
                {lead.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
              <p className="text-muted-foreground">{lead.company}</p>
              <Badge
                variant="outline"
                className={cn('mt-2 capitalize', statusColors[lead.status])}
              >
                {lead.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lead.status !== 'qualified' && (
            <Button variant="outline">
              <CheckCircle className="mr-2 size-4" />
              Qualify Lead
            </Button>
          )}
          {lead.status === 'qualified' && (
            <Button>
              <TrendingUp className="mr-2 size-4" />
              Convert to Opportunity
            </Button>
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
                Edit Lead
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 size-4" />
                Delete Lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <Mail className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${lead.email}`} className="text-sm font-medium hover:text-primary">
                    {lead.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <Phone className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a href={`tel:${lead.phone}`} className="text-sm font-medium hover:text-primary">
                    {lead.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <Building2 className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="text-sm font-medium">{lead.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <Globe className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Source</p>
                  <p className="text-sm font-medium">{sourceLabels[lead.source]}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.notes ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No notes added yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Related Opportunities */}
          {relatedOpportunities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Opportunities</CardTitle>
                <CardDescription>Opportunities created from this lead</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relatedOpportunities.map((opp) => (
                    <Link
                      key={opp.id}
                      href={`/opportunities/${opp.id}`}
                      className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                    >
                      <div>
                        <p className="font-medium">{opp.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{opp.stage} stage</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${opp.value.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{opp.probability}% probability</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lead Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Assigned To</span>
                <div className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {lead.assignedTo.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{lead.assignedTo.name}</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">{formatDate(lead.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm">{formatDate(lead.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Recent changes and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="relative flex flex-col items-center">
                      <div className="flex size-8 items-center justify-center rounded-full bg-secondary">
                        {item.type === 'created' && <FileText className="size-3 text-muted-foreground" />}
                        {item.type === 'status' && <CheckCircle className="size-3 text-muted-foreground" />}
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

      <LeadFormDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        lead={lead}
      />
    </div>
  )
}
