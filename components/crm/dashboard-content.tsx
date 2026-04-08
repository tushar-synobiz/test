'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Trophy,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  getDashboardStats,
  formatCurrency,
  formatDate,
  leads,
  opportunities,
  activities,
  type OpportunityStage,
} from '@/lib/crm-data'
import { RecentActivityList } from './recent-activity-list'
import { PipelineChart } from './pipeline-chart'
import { cn } from '@/lib/utils'

const stageColors: Record<OpportunityStage, string> = {
  new: 'bg-status-new',
  qualified: 'bg-status-qualified',
  proposal: 'bg-status-proposal',
  won: 'bg-status-won',
  lost: 'bg-status-lost',
}

export function DashboardContent() {
  const stats = getDashboardStats()
  const recentLeads = leads.slice(0, 5)
  const topOpportunities = opportunities
    .filter(o => !['won', 'lost'].includes(o.stage))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
  const upcomingActivities = activities
    .filter(a => a.status === 'scheduled')
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your sales.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Export Report</Button>
          <Button>
            <TrendingUp className="mr-2 size-4" />
            New Opportunity
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                <Users className="size-5 text-primary" />
              </div>
              <Badge variant="secondary" className="gap-1 text-status-won">
                <ArrowUpRight className="size-3" />
                12%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">{stats.totalLeads}</p>
              <p className="text-sm text-muted-foreground">Total Leads</p>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {stats.qualifiedLeads} qualified ({stats.conversionRate}% rate)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                <Target className="size-5 text-primary" />
              </div>
              <Badge variant="secondary" className="gap-1 text-status-won">
                <ArrowUpRight className="size-3" />
                8%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">{stats.totalOpportunities}</p>
              <p className="text-sm text-muted-foreground">Opportunities</p>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {stats.wonOpportunities} won ({stats.winRate}% win rate)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                <DollarSign className="size-5 text-primary" />
              </div>
              <Badge variant="secondary" className="gap-1 text-status-won">
                <ArrowUpRight className="size-3" />
                24%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">{formatCurrency(stats.totalPipelineValue)}</p>
              <p className="text-sm text-muted-foreground">Pipeline Value</p>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {formatCurrency(stats.wonValue)} closed won
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                <Calendar className="size-5 text-primary" />
              </div>
              <Badge variant="secondary" className="gap-1 text-status-lost">
                <ArrowDownRight className="size-3" />
                3%
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">{stats.upcomingActivities}</p>
              <p className="text-sm text-muted-foreground">Upcoming Activities</p>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              This week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PipelineChart />
        
        <Card>
          <CardHeader>
            <CardTitle>Top Opportunities</CardTitle>
            <CardDescription>Highest value deals in your pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topOpportunities.map((opp) => (
                <Link
                  key={opp.id}
                  href={`/opportunities/${opp.id}`}
                  className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-accent"
                >
                  <div className={cn('size-2 rounded-full', stageColors[opp.stage])} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{opp.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {opp.linkedLead.company}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(opp.value)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{opp.stage}</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/opportunities">
              <Button variant="ghost" className="mt-4 w-full">
                View all opportunities
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>Latest leads added to your pipeline</CardDescription>
            </div>
            <Link href="/leads">
              <Button variant="outline" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-accent"
                >
                  <Avatar>
                    <AvatarFallback className="bg-secondary text-foreground">
                      {lead.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{lead.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {lead.company} · {lead.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'capitalize',
                        lead.status === 'qualified' && 'bg-status-qualified/20 text-status-qualified',
                        lead.status === 'new' && 'bg-status-new/20 text-status-new',
                        lead.status === 'contacted' && 'bg-status-proposal/20 text-status-proposal',
                        lead.status === 'unqualified' && 'bg-status-lost/20 text-status-lost'
                      )}
                    >
                      {lead.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(lead.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <RecentActivityList activities={upcomingActivities} />
      </div>
    </div>
  )
}
