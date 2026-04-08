'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  Ticket,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  tickets,
  slaConfigs,
  getServiceStats,
  isSLABreached,
  getSLATimeRemaining,
  formatDate,
  formatDateTime,
  type TicketPriority,
} from '@/lib/crm-data'
import { cn } from '@/lib/utils'

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', className: 'bg-status-proposal/20 text-status-proposal' },
  high: { label: 'High', className: 'bg-status-escalated/20 text-status-escalated' },
  critical: { label: 'Critical', className: 'bg-status-sla-breach/20 text-status-sla-breach' },
}

export function SLAMonitoringContent() {
  const [configDialogOpen, setConfigDialogOpen] = React.useState(false)
  const [localSlaConfigs, setLocalSlaConfigs] = React.useState(slaConfigs)
  
  const stats = getServiceStats()
  
  // Get active tickets (not closed or resolved)
  const activeTickets = tickets.filter(t => !['resolved', 'closed'].includes(t.status))
  
  // Get breached tickets
  const breachedTickets = activeTickets.filter(t => isSLABreached(t))
  
  // Get at-risk tickets (within 2 hours of SLA)
  const atRiskTickets = activeTickets.filter(t => {
    if (isSLABreached(t)) return false
    const remaining = t.slaDueTime.getTime() - Date.now()
    return remaining > 0 && remaining < 2 * 60 * 60 * 1000 // 2 hours
  })
  
  // Get on-track tickets
  const onTrackTickets = activeTickets.filter(t => {
    if (isSLABreached(t)) return false
    const remaining = t.slaDueTime.getTime() - Date.now()
    return remaining >= 2 * 60 * 60 * 1000
  })

  // SLA compliance rate
  const totalClosed = tickets.filter(t => ['resolved', 'closed'].includes(t.status))
  const closedWithinSLA = totalClosed.filter(t => {
    const resolvedActivity = t.activities.find(a => a.type === 'status_change' && a.newValue === 'resolved')
    if (!resolvedActivity) return true
    return resolvedActivity.timestamp <= t.slaDueTime
  })
  const complianceRate = totalClosed.length > 0 
    ? Math.round((closedWithinSLA.length / totalClosed.length) * 100) 
    : 100

  const handleSaveConfig = () => {
    // In a real app, this would save to the database
    setConfigDialogOpen(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">SLA Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor service level agreements and response times
          </p>
        </div>
        <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="mr-2 size-4" />
              SLA Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>SLA Configuration</DialogTitle>
              <DialogDescription>
                Set response time targets for each priority level
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {localSlaConfigs.map((config, index) => (
                <div key={config.priority} className="flex items-center gap-4">
                  <div className="w-24">
                    <Badge className={cn('capitalize', priorityConfig[config.priority].className)}>
                      {config.priority}
                    </Badge>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      type="number"
                      value={config.responseTimeHours}
                      onChange={(e) => {
                        const newConfigs = [...localSlaConfigs]
                        newConfigs[index] = {
                          ...config,
                          responseTimeHours: parseInt(e.target.value) || 1,
                        }
                        setLocalSlaConfigs(newConfigs)
                      }}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">hours</span>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveConfig}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
            <TrendingUp className="size-4 text-status-resolved" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceRate}%</div>
            <Progress value={complianceRate} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {closedWithinSLA.length} of {totalClosed.length} tickets resolved within SLA
            </p>
          </CardContent>
        </Card>

        <Card className={cn(breachedTickets.length > 0 && 'border-status-sla-breach/50')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Breached</CardTitle>
            <AlertTriangle className={cn('size-4', breachedTickets.length > 0 ? 'text-status-sla-breach' : 'text-muted-foreground')} />
          </CardHeader>
          <CardContent>
            <div className={cn('text-2xl font-bold', breachedTickets.length > 0 && 'text-status-sla-breach')}>
              {breachedTickets.length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tickets exceeding SLA response time
            </p>
          </CardContent>
        </Card>

        <Card className={cn(atRiskTickets.length > 0 && 'border-status-escalated/50')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <Clock className={cn('size-4', atRiskTickets.length > 0 ? 'text-status-escalated' : 'text-muted-foreground')} />
          </CardHeader>
          <CardContent>
            <div className={cn('text-2xl font-bold', atRiskTickets.length > 0 && 'text-status-escalated')}>
              {atRiskTickets.length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tickets within 2 hours of SLA breach
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <CheckCircle className="size-4 text-status-resolved" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-resolved">{onTrackTickets.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Tickets with healthy SLA status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current SLA Targets */}
      <Card>
        <CardHeader>
          <CardTitle>SLA Response Targets</CardTitle>
          <CardDescription>Current response time targets by priority</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {slaConfigs.map((config) => (
              <div
                key={config.priority}
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-border"
              >
                <Badge className={cn('mb-2 capitalize', priorityConfig[config.priority].className)}>
                  {config.priority}
                </Badge>
                <span className="text-2xl font-bold">{config.responseTimeHours}h</span>
                <span className="text-xs text-muted-foreground">Response Time</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Breached Tickets Table */}
      {breachedTickets.length > 0 && (
        <Card className="border-status-sla-breach/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-status-sla-breach" />
              <CardTitle className="text-status-sla-breach">SLA Breached Tickets</CardTitle>
            </div>
            <CardDescription>
              These tickets have exceeded their SLA response time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Overdue By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {breachedTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="bg-status-sla-breach/5">
                    <TableCell>
                      <Link
                        href={`/service/tickets/${ticket.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {ticket.ticketNo}
                      </Link>
                    </TableCell>
                    <TableCell>{ticket.customer.name}</TableCell>
                    <TableCell>
                      <Badge className={cn('capitalize', priorityConfig[ticket.priority].className)}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ticket.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="text-xs">
                              {ticket.assignedTo.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{ticket.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-status-sla-breach font-medium">
                        {getSLATimeRemaining(ticket.slaDueTime)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/service/tickets/${ticket.id}`}>
                          View
                          <ArrowUpRight className="ml-1 size-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* At Risk Tickets Table */}
      {atRiskTickets.length > 0 && (
        <Card className="border-status-escalated/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="size-5 text-status-escalated" />
              <CardTitle className="text-status-escalated">At-Risk Tickets</CardTitle>
            </div>
            <CardDescription>
              These tickets are approaching their SLA deadline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Time Remaining</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atRiskTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="bg-status-escalated/5">
                    <TableCell>
                      <Link
                        href={`/service/tickets/${ticket.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {ticket.ticketNo}
                      </Link>
                    </TableCell>
                    <TableCell>{ticket.customer.name}</TableCell>
                    <TableCell>
                      <Badge className={cn('capitalize', priorityConfig[ticket.priority].className)}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ticket.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="text-xs">
                              {ticket.assignedTo.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{ticket.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-status-escalated font-medium">
                        {getSLATimeRemaining(ticket.slaDueTime)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/service/tickets/${ticket.id}`}>
                          View
                          <ArrowUpRight className="ml-1 size-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Active Tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Active Tickets</CardTitle>
              <CardDescription>
                Overview of all tickets with SLA status
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/service/tickets">
                View All
                <ArrowUpRight className="ml-1 size-3" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>SLA Status</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeTickets.map((ticket) => {
                const breached = isSLABreached(ticket)
                const remaining = ticket.slaDueTime.getTime() - Date.now()
                const atRisk = remaining > 0 && remaining < 2 * 60 * 60 * 1000
                
                return (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <Link
                        href={`/service/tickets/${ticket.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {ticket.ticketNo}
                      </Link>
                    </TableCell>
                    <TableCell>{ticket.customer.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('capitalize', priorityConfig[ticket.priority].className)}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {breached ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="size-3" />
                          Breached
                        </Badge>
                      ) : atRisk ? (
                        <Badge variant="outline" className="gap-1 bg-status-escalated/20 text-status-escalated border-status-escalated/30">
                          <Clock className="size-3" />
                          At Risk
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 bg-status-resolved/20 text-status-resolved border-status-resolved/30">
                          <CheckCircle className="size-3" />
                          On Track
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        'text-sm',
                        breached ? 'text-status-sla-breach' : atRisk ? 'text-status-escalated' : 'text-muted-foreground'
                      )}>
                        {formatDateTime(ticket.slaDueTime)}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
              {activeTickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <CheckCircle className="size-8 text-status-resolved mb-2" />
                      <p className="text-muted-foreground">No active tickets</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
