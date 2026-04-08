'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Check,
  Database,
  Shield,
  ShieldOff,
  ShieldQuestion,
  Save,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  serviceCustomers,
  products,
  type ServiceCustomer,
  type Product,
  type TicketPriority,
  type WarrantyStatus,
} from '@/lib/crm-data'
import { cn } from '@/lib/utils'

interface LineItem {
  id: string
  description: string
  quantity: number
  chargeable: boolean
}

const warrantyConfig: Record<WarrantyStatus, { label: string; icon: React.ElementType; className: string }> = {
  valid: { label: 'Valid', icon: Shield, className: 'text-status-resolved bg-status-resolved/20' },
  expired: { label: 'Expired', icon: ShieldOff, className: 'text-status-sla-breach bg-status-sla-breach/20' },
  unknown: { label: 'Unknown', icon: ShieldQuestion, className: 'text-muted-foreground bg-muted' },
}

export function CreateTicketContent() {
  const router = useRouter()
  const [customerOpen, setCustomerOpen] = React.useState(false)
  const [customerSearch, setCustomerSearch] = React.useState('')
  const [selectedCustomer, setSelectedCustomer] = React.useState<ServiceCustomer | null>(null)
  const [showNewCustomerForm, setShowNewCustomerForm] = React.useState(false)
  
  const [serialNumber, setSerialNumber] = React.useState('')
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
  const [productSearching, setProductSearching] = React.useState(false)
  
  const [issueDescription, setIssueDescription] = React.useState('')
  const [priority, setPriority] = React.useState<TicketPriority>('medium')
  
  const [lineItems, setLineItems] = React.useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, chargeable: false },
  ])

  // New customer form state
  const [newCustomer, setNewCustomer] = React.useState({
    name: '',
    pin: '',
    email: '',
    phone: '',
    address: '',
  })

  // Filter customers based on search
  const filteredCustomers = React.useMemo(() => {
    if (!customerSearch) return serviceCustomers
    const search = customerSearch.toLowerCase()
    return serviceCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.pin.toLowerCase().includes(search)
    )
  }, [customerSearch])

  // Search for product by serial number
  const handleSerialSearch = () => {
    setProductSearching(true)
    setTimeout(() => {
      const product = products.find(
        (p) => p.serialNumber.toLowerCase() === serialNumber.toLowerCase()
      )
      setSelectedProduct(product || null)
      setProductSearching(false)
    }, 500)
  }

  // Handle line item changes
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: String(Date.now()), description: '', quantity: 1, chargeable: false },
    ])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id))
    }
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number | boolean) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const handleSaveDraft = () => {
    // In a real app, this would save to the database
    router.push('/service/tickets')
  }

  const handleSubmit = () => {
    // In a real app, this would create the ticket
    router.push('/service/tickets')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/service/tickets">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create Service Ticket</h1>
          <p className="text-muted-foreground">
            Create a new service request for a customer
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Section */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Search for existing customer or create a new one</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showNewCustomerForm ? (
                <>
                  <div className="flex gap-2">
                    <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={customerOpen}
                          className="flex-1 justify-start"
                        >
                          <Search className="mr-2 size-4 text-muted-foreground" />
                          {selectedCustomer ? (
                            <span>{selectedCustomer.name} ({selectedCustomer.pin})</span>
                          ) : (
                            <span className="text-muted-foreground">Search customer by name or PIN...</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search customer..."
                            value={customerSearch}
                            onValueChange={setCustomerSearch}
                          />
                          <CommandList>
                            <CommandEmpty>
                              <div className="py-4 text-center">
                                <p className="text-sm text-muted-foreground">No customer found</p>
                                <Button
                                  variant="link"
                                  size="sm"
                                  onClick={() => {
                                    setCustomerOpen(false)
                                    setShowNewCustomerForm(true)
                                  }}
                                >
                                  <Plus className="mr-1 size-3" />
                                  Create new customer
                                </Button>
                              </div>
                            </CommandEmpty>
                            <CommandGroup>
                              {filteredCustomers.map((customer) => (
                                <CommandItem
                                  key={customer.id}
                                  value={`${customer.name} ${customer.pin}`}
                                  onSelect={() => {
                                    setSelectedCustomer(customer)
                                    setCustomerOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 size-4',
                                      selectedCustomer?.id === customer.id
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium">{customer.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {customer.pin} • {customer.phone}
                                    </p>
                                  </div>
                                  {customer.sapSyncStatus && (
                                    <Badge
                                      variant={
                                        customer.sapSyncStatus === 'synced'
                                          ? 'default'
                                          : customer.sapSyncStatus === 'pending'
                                          ? 'secondary'
                                          : 'destructive'
                                      }
                                      className="ml-2"
                                    >
                                      <Database className="mr-1 size-3" />
                                      SAP {customer.sapSyncStatus}
                                    </Badge>
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Button
                      variant="outline"
                      onClick={() => setShowNewCustomerForm(true)}
                    >
                      <Plus className="mr-2 size-4" />
                      New
                    </Button>
                  </div>

                  {selectedCustomer && (
                    <div className="rounded-lg border border-border p-4 bg-secondary/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{selectedCustomer.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedCustomer.pin}</p>
                        </div>
                        {selectedCustomer.sapSyncStatus === 'synced' && (
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            <Database className="mr-1 size-3" />
                            Fetched from SAP
                          </Badge>
                        )}
                      </div>
                      <Separator className="my-3" />
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email</span>
                          <span>{selectedCustomer.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone</span>
                          <span>{selectedCustomer.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Address</span>
                          <span className="text-right max-w-[250px]">{selectedCustomer.address}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">New Customer</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewCustomerForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Customer Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter customer name"
                        value={newCustomer.name}
                        onChange={(e) =>
                          setNewCustomer({ ...newCustomer, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pin">Customer PIN</Label>
                      <Input
                        id="pin"
                        placeholder="e.g., XX-001"
                        value={newCustomer.pin}
                        onChange={(e) =>
                          setNewCustomer({ ...newCustomer, pin: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="customer@example.com"
                        value={newCustomer.email}
                        onChange={(e) =>
                          setNewCustomer({ ...newCustomer, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="+1 (555) 000-0000"
                        value={newCustomer.phone}
                        onChange={(e) =>
                          setNewCustomer({ ...newCustomer, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="Full address"
                        value={newCustomer.address}
                        onChange={(e) =>
                          setNewCustomer({ ...newCustomer, address: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product / Serial Section */}
          <Card>
            <CardHeader>
              <CardTitle>Product / Serial Information</CardTitle>
              <CardDescription>Enter the serial number to fetch product details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="serial">Serial Number</Label>
                  <Input
                    id="serial"
                    placeholder="e.g., SN-2024-001234"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSerialSearch()}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    onClick={handleSerialSearch}
                    disabled={!serialNumber || productSearching}
                  >
                    <Search className="mr-2 size-4" />
                    Lookup
                  </Button>
                </div>
              </div>

              {selectedProduct && (
                <div className="rounded-lg border border-border p-4 bg-secondary/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{selectedProduct.name}</p>
                      <p className="text-sm text-muted-foreground">Model: {selectedProduct.model}</p>
                    </div>
                    {(() => {
                      const config = warrantyConfig[selectedProduct.warrantyStatus]
                      const Icon = config.icon
                      return (
                        <Badge variant="outline" className={config.className}>
                          <Icon className="mr-1 size-3" />
                          Warranty: {config.label}
                        </Badge>
                      )
                    })()}
                  </div>
                  <Separator className="my-3" />
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Serial Number</span>
                      <span className="font-mono">{selectedProduct.serialNumber}</span>
                    </div>
                    {selectedProduct.warrantyExpiry && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Warranty Expiry</span>
                        <span>{selectedProduct.warrantyExpiry.toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedProduct.contractInfo && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contract</span>
                        <span>{selectedProduct.contractInfo}</span>
                      </div>
                    )}
                    {selectedProduct.sapSyncStatus && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SAP Status</span>
                        <Badge
                          variant={
                            selectedProduct.sapSyncStatus === 'synced'
                              ? 'default'
                              : selectedProduct.sapSyncStatus === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {selectedProduct.sapSyncStatus}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
              <CardDescription>Describe the issue and set priority</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="issue">Issue Description</Label>
                <Textarea
                  id="issue"
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (48h SLA)</SelectItem>
                    <SelectItem value="medium">Medium (24h SLA)</SelectItem>
                    <SelectItem value="high">High (8h SLA)</SelectItem>
                    <SelectItem value="critical">Critical (4h SLA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Service Line Items</CardTitle>
                  <CardDescription>Add services to be performed</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="mr-2 size-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 rounded-lg border border-border p-4"
                  >
                    <div className="flex-1 space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                          <Label>Description</Label>
                          <Input
                            placeholder="Service description"
                            value={item.description}
                            onChange={(e) =>
                              updateLineItem(item.id, 'description', e.target.value)
                            }
                          />
                        </div>
                        <div className="w-24 space-y-2">
                          <Label>Qty</Label>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)
                            }
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`chargeable-${item.id}`}
                          checked={item.chargeable}
                          onCheckedChange={(checked) =>
                            updateLineItem(item.id, 'chargeable', checked)
                          }
                        />
                        <Label htmlFor={`chargeable-${item.id}`} className="text-sm">
                          Chargeable
                        </Label>
                        {item.chargeable && (
                          <Badge variant="outline" className="ml-2">
                            Will require quotation
                          </Badge>
                        )}
                      </div>
                    </div>
                    {lineItems.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeLineItem(item.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={handleSubmit}>
                <Send className="mr-2 size-4" />
                Submit Ticket
              </Button>
              <Button variant="outline" className="w-full" onClick={handleSaveDraft}>
                <Save className="mr-2 size-4" />
                Save Draft
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/service/tickets">Cancel</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SLA Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority</span>
                  <span className="font-medium capitalize">{priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response Time</span>
                  <span className="font-medium">
                    {priority === 'low' && '48 hours'}
                    {priority === 'medium' && '24 hours'}
                    {priority === 'high' && '8 hours'}
                    {priority === 'critical' && '4 hours'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {lineItems.some((item) => item.chargeable) && (
            <Card className="border-status-escalated/30 bg-status-escalated/5">
              <CardHeader>
                <CardTitle className="text-status-escalated">Chargeable Items</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This ticket contains {lineItems.filter((i) => i.chargeable).length} chargeable
                  item(s). A quotation will need to be created and approved before proceeding.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
