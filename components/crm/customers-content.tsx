'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Search,
  Mail,
  Phone,
  MapPin,
  Database,
  Ticket,
  Eye,
  ChevronRight,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  serviceCustomers,
  tickets,
  formatDate,
  type ServiceCustomer,
  type SAPSyncStatus,
} from '@/lib/crm-data'
import { cn } from '@/lib/utils'

const sapStatusConfig: Record<SAPSyncStatus, { label: string; className: string }> = {
  synced: { label: 'Synced', className: 'bg-status-resolved/20 text-status-resolved' },
  pending: { label: 'Pending', className: 'bg-status-proposal/20 text-status-proposal' },
  failed: { label: 'Failed', className: 'bg-status-sla-breach/20 text-status-sla-breach' },
}

export function CustomersContent() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCustomer, setSelectedCustomer] = React.useState<ServiceCustomer | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  const filteredCustomers = React.useMemo(() => {
    if (!searchQuery) return serviceCustomers
    const search = searchQuery.toLowerCase()
    return serviceCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.pin.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.phone.includes(search)
    )
  }, [searchQuery])

  const getCustomerTickets = (customerId: string) => {
    return tickets.filter((t) => t.customer.id === customerId)
  }

  const handleViewCustomer = (customer: ServiceCustomer) => {
    setSelectedCustomer(customer)
    setDetailOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Service Customers</h1>
        <p className="text-muted-foreground">
          Lookup and view customer information for service tickets
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, PIN, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredCustomers.length} of {serviceCustomers.length} customers
      </div>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>SAP Status</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="size-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No customers found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => {
                  const customerTickets = getCustomerTickets(customer.id)
                  const activeTickets = customerTickets.filter(
                    (t) => !['resolved', 'closed'].includes(t.status)
                  )

                  return (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.pin}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="size-3 text-muted-foreground" />
                            <span>{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="size-3" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.sapSyncStatus ? (
                          <Badge
                            variant="secondary"
                            className={cn(sapStatusConfig[customer.sapSyncStatus].className)}
                          >
                            <Database className="mr-1 size-3" />
                            {sapStatusConfig[customer.sapSyncStatus].label}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            <Ticket className="mr-1 size-3" />
                            {customerTickets.length} total
                          </Badge>
                          {activeTickets.length > 0 && (
                            <Badge variant="secondary" className="bg-status-in-progress/20 text-status-in-progress">
                              {activeTickets.length} active
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(customer.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          <Eye className="mr-2 size-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle>{selectedCustomer.name}</DialogTitle>
                    <DialogDescription>{selectedCustomer.pin}</DialogDescription>
                  </div>
                  {selectedCustomer.sapSyncStatus && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'mt-1',
                        sapStatusConfig[selectedCustomer.sapSyncStatus].className
                      )}
                    >
                      <Database className="mr-1 size-3" />
                      {selectedCustomer.sapSyncStatus === 'synced'
                        ? 'Fetched from SAP'
                        : `SAP ${sapStatusConfig[selectedCustomer.sapSyncStatus].label}`}
                    </Badge>
                  )}
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Contact Information</h4>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                        <Mail className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <a
                          href={`mailto:${selectedCustomer.email}`}
                          className="text-sm font-medium hover:text-primary"
                        >
                          {selectedCustomer.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                        <Phone className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <a
                          href={`tel:${selectedCustomer.phone}`}
                          className="text-sm font-medium hover:text-primary"
                        >
                          {selectedCustomer.phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                        <MapPin className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="text-sm font-medium">{selectedCustomer.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* SAP Information */}
                {selectedCustomer.sapCustomerId && (
                  <>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">SAP Integration</h4>
                      <div className="rounded-lg border border-border p-3 bg-secondary/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">SAP Customer ID</p>
                            <p className="font-mono text-sm font-medium">
                              {selectedCustomer.sapCustomerId}
                            </p>
                          </div>
                          <Badge
                            variant={
                              selectedCustomer.sapSyncStatus === 'synced'
                                ? 'default'
                                : selectedCustomer.sapSyncStatus === 'pending'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {selectedCustomer.sapSyncStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Recent Tickets */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Recent Tickets</h4>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/service/tickets?customer=${selectedCustomer.id}`}>
                        View All
                        <ChevronRight className="ml-1 size-3" />
                      </Link>
                    </Button>
                  </div>
                  {(() => {
                    const customerTickets = getCustomerTickets(selectedCustomer.id)
                    if (customerTickets.length === 0) {
                      return (
                        <div className="text-center py-6">
                          <Ticket className="size-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No tickets yet</p>
                        </div>
                      )
                    }
                    return (
                      <div className="space-y-2">
                        {customerTickets.slice(0, 3).map((ticket) => (
                          <Link
                            key={ticket.id}
                            href={`/service/tickets/${ticket.id}`}
                            className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent transition-colors"
                          >
                            <div>
                              <p className="font-medium text-sm">{ticket.ticketNo}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {ticket.issueDescription}
                              </p>
                            </div>
                            <Badge variant="secondary" className="capitalize text-xs">
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDetailOpen(false)}>
                  Close
                </Button>
                <Button asChild>
                  <Link href={`/service/tickets/new?customer=${selectedCustomer.id}`}>
                    <Ticket className="mr-2 size-4" />
                    Create Ticket
                  </Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
