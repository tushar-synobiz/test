'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle,
  User as UserIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  tickets,
  users,
  formatDate,
  isSLABreached,
  getSLATimeRemaining,
  type Ticket,
  type TicketStatus,
  type TicketPriority,
} from '@/lib/crm-data'
import { cn } from '@/lib/utils'

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-status-open/20 text-status-open' },
  assigned: { label: 'Assigned', className: 'bg-status-assigned/20 text-status-assigned' },
  in_progress: { label: 'In Progress', className: 'bg-status-in-progress/20 text-status-in-progress' },
  waiting: { label: 'Waiting', className: 'bg-status-waiting/20 text-status-waiting' },
  resolved: { label: 'Resolved', className: 'bg-status-resolved/20 text-status-resolved' },
  closed: { label: 'Closed', className: 'bg-status-closed/20 text-status-closed' },
}

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', className: 'bg-status-proposal/20 text-status-proposal' },
  high: { label: 'High', className: 'bg-status-escalated/20 text-status-escalated' },
  critical: { label: 'Critical', className: 'bg-status-sla-breach/20 text-status-sla-breach' },
}

type SortField = 'ticketNo' | 'customer' | 'status' | 'priority' | 'slaDueTime' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export function TicketsContent() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<TicketStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = React.useState<TicketPriority | 'all'>('all')
  const [assignedFilter, setAssignedFilter] = React.useState<string>('all')
  const [sortField, setSortField] = React.useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc')
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredTickets = React.useMemo(() => {
    return tickets
      .filter((ticket) => {
        const matchesSearch =
          searchQuery === '' ||
          ticket.ticketNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.product.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
        const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
        const matchesAssigned = assignedFilter === 'all' || ticket.assignedTo?.id === assignedFilter

        return matchesSearch && matchesStatus && matchesPriority && matchesAssigned
      })
      .sort((a, b) => {
        let aValue: string | number | Date
        let bValue: string | number | Date

        switch (sortField) {
          case 'ticketNo':
            aValue = a.ticketNo
            bValue = b.ticketNo
            break
          case 'customer':
            aValue = a.customer.name
            bValue = b.customer.name
            break
          case 'status':
            aValue = a.status
            bValue = b.status
            break
          case 'priority':
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
            aValue = priorityOrder[a.priority]
            bValue = priorityOrder[b.priority]
            break
          case 'slaDueTime':
            aValue = a.slaDueTime
            bValue = b.slaDueTime
            break
          case 'createdAt':
          default:
            aValue = a.createdAt
            bValue = b.createdAt
        }

        if (aValue instanceof Date && bValue instanceof Date) {
          return sortDirection === 'asc'
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime()
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }

        return 0
      })
  }, [searchQuery, statusFilter, priorityFilter, assignedFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Service Tickets</h1>
          <p className="text-muted-foreground">
            Manage and track customer service requests
          </p>
        </div>
        <Button asChild>
          <Link href="/service/tickets/new">
            <Plus className="mr-2 size-4" />
            Create Ticket
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by ticket, customer, serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as TicketStatus | 'all')}
          >
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 size-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={priorityFilter}
            onValueChange={(value) => setPriorityFilter(value as TicketPriority | 'all')}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={assignedFilter}
            onValueChange={(value) => setAssignedFilter(value)}
          >
            <SelectTrigger className="w-[160px]">
              <UserIcon className="mr-2 size-4" />
              <SelectValue placeholder="Assigned To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredTickets.length} of {tickets.length} tickets
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('ticketNo')}
                >
                  Ticket No
                  <ArrowUpDown className="ml-2 size-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('customer')}
                >
                  Customer
                  <ArrowUpDown className="ml-2 size-4" />
                </Button>
              </TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('status')}
                >
                  Status
                  <ArrowUpDown className="ml-2 size-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('priority')}
                >
                  Priority
                  <ArrowUpDown className="ml-2 size-4" />
                </Button>
              </TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('slaDueTime')}
                >
                  SLA Due Time
                  <ArrowUpDown className="ml-2 size-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('createdAt')}
                >
                  Created
                  <ArrowUpDown className="ml-2 size-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[60px] rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-muted-foreground">No tickets found</p>
                    <Button variant="link" asChild>
                      <Link href="/service/tickets/new">Create your first ticket</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => {
                const breached = isSLABreached(ticket)
                const slaText = getSLATimeRemaining(ticket.slaDueTime)
                
                return (
                  <TableRow
                    key={ticket.id}
                    className={cn(
                      'cursor-pointer',
                      breached && !['resolved', 'closed'].includes(ticket.status) && 'bg-status-sla-breach/5'
                    )}
                  >
                    <TableCell>
                      <Link
                        href={`/service/tickets/${ticket.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {ticket.ticketNo}
                      </Link>
                      {ticket.isEscalated && (
                        <Badge variant="outline" className="ml-2 bg-status-escalated/20 text-status-escalated border-status-escalated/30">
                          <AlertTriangle className="mr-1 size-3" />
                          Escalated
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.customer.name}</p>
                        <p className="text-sm text-muted-foreground">{ticket.customer.pin}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">{ticket.product.serialNumber}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn('capitalize', statusConfig[ticket.status].className)}
                      >
                        {statusConfig[ticket.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn('capitalize', priorityConfig[ticket.priority].className)}
                      >
                        {priorityConfig[ticket.priority].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ticket.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {ticket.assignedTo.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{ticket.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className={cn(
                        'flex items-center gap-1 text-sm',
                        breached && !['resolved', 'closed'].includes(ticket.status) 
                          ? 'text-status-sla-breach font-medium' 
                          : 'text-muted-foreground'
                      )}>
                        {breached && !['resolved', 'closed'].includes(ticket.status) ? (
                          <AlertTriangle className="size-3" />
                        ) : ['resolved', 'closed'].includes(ticket.status) ? (
                          <CheckCircle className="size-3 text-status-resolved" />
                        ) : (
                          <Clock className="size-3" />
                        )}
                        {['resolved', 'closed'].includes(ticket.status) ? 'Completed' : slaText}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{formatDate(ticket.createdAt)}</span>
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
                            <Link href={`/service/tickets/${ticket.id}`}>
                              <Eye className="mr-2 size-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/service/tickets/${ticket.id}/edit`}>
                              <Pencil className="mr-2 size-4" />
                              Edit Ticket
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 size-4" />
                            Delete Ticket
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page 1 of 1
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
