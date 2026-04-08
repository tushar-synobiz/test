'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle,
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  Package,
  Shield,
  ShieldOff,
  ShieldQuestion,
  FileText,
  ArrowUp,
  Camera,
  Upload,
  Star,
  MessageSquare,
  Database,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  tickets,
  users,
  formatDate,
  formatDateTime,
  isSLABreached,
  getSLATimeRemaining,
  type Ticket,
  type TicketStatus,
  type TicketPriority,
  type WarrantyStatus,
} from '@/lib/crm-data'
import { cn } from '@/lib/utils'

interface TicketDetailContentProps {
  ticketId: string
}

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-status-open/20 text-status-open border-status-open/30' },
  assigned: { label: 'Assigned', className: 'bg-status-assigned/20 text-status-assigned border-status-assigned/30' },
  in_progress: { label: 'In Progress', className: 'bg-status-in-progress/20 text-status-in-progress border-status-in-progress/30' },
  waiting: { label: 'Waiting', className: 'bg-status-waiting/20 text-status-waiting border-status-waiting/30' },
  resolved: { label: 'Resolved', className: 'bg-status-resolved/20 text-status-resolved border-status-resolved/30' },
  closed: { label: 'Closed', className: 'bg-status-closed/20 text-status-closed border-status-closed/30' },
}

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', className: 'bg-status-proposal/20 text-status-proposal' },
  high: { label: 'High', className: 'bg-status-escalated/20 text-status-escalated' },
  critical: { label: 'Critical', className: 'bg-status-sla-breach/20 text-status-sla-breach' },
}

const warrantyConfig: Record<WarrantyStatus, { label: string; icon: React.ElementType; className: string }> = {
  valid: { label: 'Valid', icon: Shield, className: 'text-status-resolved' },
  expired: { label: 'Expired', icon: ShieldOff, className: 'text-status-sla-breach' },
  unknown: { label: 'Unknown', icon: ShieldQuestion, className: 'text-muted-foreground' },
}

const statusFlow: TicketStatus[] = ['open', 'assigned', 'in_progress', 'waiting', 'resolved', 'closed']

function getNextStatuses(currentStatus: TicketStatus): TicketStatus[] {
  const currentIndex = statusFlow.indexOf(currentStatus)
  if (currentStatus === 'waiting') {
    return ['in_progress', 'resolved']
  }
  if (currentStatus === 'resolved') {
    return ['closed', 'in_progress']
  }
  if (currentStatus === 'closed') {
    return []
  }
  return statusFlow.slice(currentIndex + 1, currentIndex + 3)
}

export function TicketDetailContent({ ticketId }: TicketDetailContentProps) {
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false)
  const [selectedAssignee, setSelectedAssignee] = React.useState<string>('')
  const [feedbackRating, setFeedbackRating] = React.useState(0)
  const [feedbackComment, setFeedbackComment] = React.useState('')

  const ticket = tickets.find((t) => t.id === ticketId)

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">Ticket not found</p>
        <Button asChild>
          <Link href="/service/tickets">Back to Tickets</Link>
        </Button>
      </div>
    )
  }

  const breached = isSLABreached(ticket)
  const slaText = getSLATimeRemaining(ticket.slaDueTime)
  const nextStatuses = getNextStatuses(ticket.status)
  const statusIndex = statusFlow.indexOf(ticket.status)
  const progressPercent = ((statusIndex + 1) / statusFlow.length) * 100

  const WarrantyIcon = warrantyConfig[ticket.product.warrantyStatus].icon

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/service/tickets">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{ticket.ticketNo}</h1>
              <Badge
                variant="outline"
                className={cn('capitalize', statusConfig[ticket.status].className)}
              >
                {statusConfig[ticket.status].label}
              </Badge>
              <Badge
                variant="secondary"
                className={cn('capitalize', priorityConfig[ticket.priority].className)}
              >
                {priorityConfig[ticket.priority].label}
              </Badge>
              {ticket.isEscalated && (
                <Badge variant="outline" className="bg-status-escalated/20 text-status-escalated border-status-escalated/30">
                  <AlertTriangle className="mr-1 size-3" />
                  Escalated
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{ticket.customer.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Pencil className="mr-2 size-4" />
                Edit Ticket
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 size-4" />
                Delete Ticket
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* SLA Timer Bar */}
      <Card className={cn(
        breached && !['resolved', 'closed'].includes(ticket.status) && 'border-status-sla-breach/50 bg-status-sla-breach/5'
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {breached && !['resolved', 'closed'].includes(ticket.status) ? (
                <AlertTriangle className="size-4 text-status-sla-breach" />
              ) : ['resolved', 'closed'].includes(ticket.status) ? (
                <CheckCircle className="size-4 text-status-resolved" />
              ) : (
                <Clock className="size-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">SLA Status</span>
            </div>
            <span className={cn(
              'text-sm font-medium',
              breached && !['resolved', 'closed'].includes(ticket.status) ? 'text-status-sla-breach' : 'text-muted-foreground'
            )}>
              {['resolved', 'closed'].includes(ticket.status) ? 'Completed' : slaText}
            </span>
          </div>
          <Progress 
            value={progressPercent} 
            className={cn(
              'h-2',
              breached && !['resolved', 'closed'].includes(ticket.status) && '[&>div]:bg-status-sla-breach'
            )}
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            {statusFlow.map((status, index) => (
              <span
                key={status}
                className={cn(
                  'capitalize',
                  index <= statusIndex && 'text-primary font-medium'
                )}
              >
                {status.replace('_', ' ')}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
              <TabsTrigger value="line-items">Line Items</TabsTrigger>
              <TabsTrigger value="gate-pass">Gate Pass</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                      <Building2 className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Customer</p>
                      <p className="font-medium">{ticket.customer.name}</p>
                      <p className="text-sm text-muted-foreground">{ticket.customer.pin}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                      <Mail className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a href={`mailto:${ticket.customer.email}`} className="text-sm font-medium hover:text-primary">
                        {ticket.customer.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                      <Phone className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a href={`tel:${ticket.customer.phone}`} className="text-sm font-medium hover:text-primary">
                        {ticket.customer.phone}
                      </a>
                    </div>
                  </div>
                  {ticket.customer.sapSyncStatus && (
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                        <Database className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">SAP Status</p>
                        <Badge
                          variant={
                            ticket.customer.sapSyncStatus === 'synced'
                              ? 'default'
                              : ticket.customer.sapSyncStatus === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {ticket.customer.sapSyncStatus}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product / Serial Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                      <Package className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Product</p>
                      <p className="font-medium">{ticket.product.name}</p>
                      <p className="text-sm text-muted-foreground">Model: {ticket.product.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                      <FileText className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Serial Number</p>
                      <p className="font-mono text-sm font-medium">{ticket.product.serialNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                      <WarrantyIcon className={cn('size-4', warrantyConfig[ticket.product.warrantyStatus].className)} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Warranty Status</p>
                      <Badge
                        variant="outline"
                        className={cn(
                          warrantyConfig[ticket.product.warrantyStatus].className,
                          'bg-transparent'
                        )}
                      >
                        <WarrantyIcon className="mr-1 size-3" />
                        {warrantyConfig[ticket.product.warrantyStatus].label}
                      </Badge>
                      {ticket.product.warrantyExpiry && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Expires: {formatDate(ticket.product.warrantyExpiry)}
                        </p>
                      )}
                    </div>
                  </div>
                  {ticket.product.contractInfo && (
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                        <FileText className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contract</p>
                        <p className="text-sm font-medium">{ticket.product.contractInfo}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Issue Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {ticket.issueDescription}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Timeline Tab */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>Complete history of ticket updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative space-y-6">
                    {ticket.activities
                      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                      .map((activity, index) => (
                        <div key={activity.id} className="relative flex gap-4">
                          <div className="relative flex flex-col items-center">
                            <div className={cn(
                              'flex size-8 items-center justify-center rounded-full',
                              activity.type === 'status_change' && 'bg-status-assigned/20',
                              activity.type === 'assignment' && 'bg-primary/20',
                              activity.type === 'note' && 'bg-secondary',
                              activity.type === 'escalation' && 'bg-status-escalated/20',
                              activity.type === 'quotation_created' && 'bg-status-proposal/20'
                            )}>
                              {activity.type === 'status_change' && <ChevronRight className="size-4 text-status-assigned" />}
                              {activity.type === 'assignment' && <UserIcon className="size-4 text-primary" />}
                              {activity.type === 'note' && <MessageSquare className="size-4 text-muted-foreground" />}
                              {activity.type === 'escalation' && <ArrowUp className="size-4 text-status-escalated" />}
                              {activity.type === 'quotation_created' && <FileText className="size-4 text-status-proposal" />}
                            </div>
                            {index < ticket.activities.length - 1 && (
                              <div className="absolute top-8 h-full w-px bg-border" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{activity.description}</p>
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(activity.timestamp)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Avatar className="size-5">
                                <AvatarFallback className="bg-secondary text-[10px]">
                                  {activity.performedBy.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {activity.performedBy.name}
                              </span>
                            </div>
                            {activity.previousValue && activity.newValue && (
                              <div className="flex items-center gap-2 mt-2 text-xs">
                                <Badge variant="outline" className="capitalize">
                                  {activity.previousValue.replace('_', ' ')}
                                </Badge>
                                <ChevronRight className="size-3 text-muted-foreground" />
                                <Badge variant="outline" className="capitalize">
                                  {activity.newValue.replace('_', ' ')}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Line Items Tab */}
            <TabsContent value="line-items" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Service Line Items</CardTitle>
                      <CardDescription>Services to be performed for this ticket</CardDescription>
                    </div>
                    {ticket.lineItems.some(item => item.chargeable) && !ticket.linkedQuotationId && (
                      <Button>
                        <FileText className="mr-2 size-4" />
                        Create Quotation
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ticket.lineItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-border p-4"
                      >
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.chargeable ? (
                            <Badge variant="outline" className="bg-status-escalated/10 text-status-escalated">
                              Chargeable
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Non-Chargeable</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {ticket.linkedQuotationId && (
                    <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Linked Quotation</p>
                          <p className="text-xs text-muted-foreground">Quotation has been created for chargeable items</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/quotations/${ticket.linkedQuotationId}`}>
                            View Quotation
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gate Pass Tab */}
            <TabsContent value="gate-pass" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="size-4" />
                      Gate-In Details
                    </CardTitle>
                    <CardDescription>Product entry information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {ticket.gatePass?.gateInTimestamp ? (
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Entry Timestamp</span>
                          <span className="font-medium">{formatDateTime(ticket.gatePass.gateInTimestamp)}</span>
                        </div>
                        {ticket.gatePass.gateInImages && ticket.gatePass.gateInImages.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Entry Photos</p>
                            <div className="grid grid-cols-2 gap-2">
                              {ticket.gatePass.gateInImages.map((img, idx) => (
                                <div
                                  key={idx}
                                  className="aspect-square rounded-lg bg-secondary flex items-center justify-center"
                                >
                                  <Camera className="size-8 text-muted-foreground" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Upload className="size-12 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No gate-in recorded yet</p>
                        <Button variant="outline" size="sm" className="mt-4">
                          <Camera className="mr-2 size-4" />
                          Record Gate-In
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="size-4" />
                      Gate-Out Details
                    </CardTitle>
                    <CardDescription>Product delivery information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {ticket.gatePass?.gateOutTimestamp ? (
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Exit Timestamp</span>
                          <span className="font-medium">{formatDateTime(ticket.gatePass.gateOutTimestamp)}</span>
                        </div>
                        {ticket.gatePass.gateOutImages && ticket.gatePass.gateOutImages.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Delivery Photos</p>
                            <div className="grid grid-cols-2 gap-2">
                              {ticket.gatePass.gateOutImages.map((img, idx) => (
                                <div
                                  key={idx}
                                  className="aspect-square rounded-lg bg-secondary flex items-center justify-center"
                                >
                                  <Camera className="size-8 text-muted-foreground" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {ticket.gatePass.customerSignature && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Customer Signature</p>
                            <div className="h-20 rounded-lg bg-secondary flex items-center justify-center">
                              <FileText className="size-8 text-muted-foreground" />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Upload className="size-12 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No gate-out recorded yet</p>
                        {ticket.gatePass?.gateInTimestamp && (
                          <Button variant="outline" size="sm" className="mt-4">
                            <Camera className="mr-2 size-4" />
                            Record Gate-Out
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Feedback Tab */}
            <TabsContent value="feedback" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Feedback</CardTitle>
                  <CardDescription>
                    {ticket.feedback
                      ? 'Feedback received from customer'
                      : 'Collect feedback after ticket resolution'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ticket.feedback ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Rating</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'size-6',
                                i < ticket.feedback!.rating
                                  ? 'fill-status-proposal text-status-proposal'
                                  : 'text-muted-foreground'
                              )}
                            />
                          ))}
                          <span className="ml-2 text-sm font-medium">
                            {ticket.feedback.rating} / 5
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Comments</p>
                        <p className="text-sm bg-secondary/50 rounded-lg p-4">
                          {ticket.feedback.comments}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Submitted on {formatDateTime(ticket.feedback.submittedAt)}
                      </div>
                    </div>
                  ) : ticket.status === 'resolved' || ticket.status === 'closed' ? (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm">Rating</Label>
                        <div className="flex items-center gap-1 mt-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setFeedbackRating(i + 1)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={cn(
                                  'size-8',
                                  i < feedbackRating
                                    ? 'fill-status-proposal text-status-proposal'
                                    : 'text-muted-foreground'
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="comments">Comments</Label>
                        <Textarea
                          id="comments"
                          placeholder="Enter customer feedback..."
                          rows={4}
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                        />
                      </div>
                      <Button>Submit Feedback</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <MessageSquare className="size-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Feedback can be collected after the ticket is resolved
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Assign Button */}
              <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <UserIcon className="mr-2 size-4" />
                    {ticket.assignedTo ? 'Reassign Ticket' : 'Assign Ticket'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Ticket</DialogTitle>
                    <DialogDescription>
                      Select a team member to assign this ticket to
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="size-6">
                                <AvatarFallback className="text-xs">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span>{user.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setAssignDialogOpen(false)}>
                      Assign
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Status Change Buttons */}
              {nextStatuses.map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  className="w-full capitalize"
                >
                  <ChevronRight className="mr-2 size-4" />
                  Change to {status.replace('_', ' ')}
                </Button>
              ))}

              {/* Escalate Button */}
              {!ticket.isEscalated && !['resolved', 'closed'].includes(ticket.status) && (
                <Button variant="outline" className="w-full text-status-escalated hover:text-status-escalated">
                  <ArrowUp className="mr-2 size-4" />
                  Escalate
                </Button>
              )}

              {/* Create Quotation */}
              {ticket.lineItems.some(item => item.chargeable) && !ticket.linkedQuotationId && (
                <Button className="w-full">
                  <FileText className="mr-2 size-4" />
                  Create Quotation
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Assigned To</span>
                {ticket.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {ticket.assignedTo.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{ticket.assignedTo.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Unassigned</span>
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">{formatDate(ticket.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm">{formatDate(ticket.updatedAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">SLA Due</span>
                <span className="text-sm">{formatDateTime(ticket.slaDueTime)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Linked Quotation Card */}
          {ticket.linkedQuotationId && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-sm">Linked Quotation</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/quotations/${ticket.linkedQuotationId}`}>
                    <FileText className="mr-2 size-4" />
                    View Quotation
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
