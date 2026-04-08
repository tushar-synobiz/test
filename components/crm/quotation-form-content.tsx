'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Eye,
  Calculator,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import {
  quotations,
  opportunities,
  currentUser,
  formatCurrency,
  type QuotationItem,
  type Quotation,
} from '@/lib/crm-data'

interface QuotationFormContentProps {
  quotationId?: string
}

function generateId() {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function calculateItemTotal(item: QuotationItem): number {
  const subtotal = item.quantity * item.unitPrice
  const discount = subtotal * (item.discountPercent / 100)
  const afterDiscount = subtotal - discount
  const tax = afterDiscount * (item.taxPercent / 100)
  return afterDiscount + tax
}

export function QuotationFormContent({ quotationId }: QuotationFormContentProps) {
  const router = useRouter()
  const existingQuotation = quotationId
    ? quotations.find((q) => q.id === quotationId)
    : null
  
  const isReadOnly = existingQuotation && existingQuotation.status !== 'draft'

  const [formData, setFormData] = React.useState({
    customer: existingQuotation?.customer || '',
    linkedOpportunityId: existingQuotation?.linkedOpportunity?.id || '',
    notes: existingQuotation?.notes || '',
    validUntil: existingQuotation?.validUntil
      ? existingQuotation.validUntil.toISOString().split('T')[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })

  const [items, setItems] = React.useState<QuotationItem[]>(
    existingQuotation?.items || [
      {
        id: generateId(),
        name: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxPercent: 18,
        discountPercent: 0,
        total: 0,
      },
    ]
  )

  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }
        updated.total = calculateItemTotal(updated)
        return updated
      })
    )
  }

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: generateId(),
        name: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxPercent: 18,
        discountPercent: 0,
        total: 0,
      },
    ])
  }

  const removeItem = (id: string) => {
    if (items.length === 1) return
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const totalDiscount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice * (item.discountPercent / 100),
    0
  )
  const totalTax = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unitPrice
    const afterDiscount = itemSubtotal - itemSubtotal * (item.discountPercent / 100)
    return sum + afterDiscount * (item.taxPercent / 100)
  }, 0)
  const grandTotal = subtotal - totalDiscount + totalTax

  const handleSaveDraft = () => {
    // In a real app, this would save to the database
    router.push('/quotations')
  }

  const handleSubmitForApproval = () => {
    // In a real app, this would save and submit for approval
    router.push('/quotations')
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/quotations">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {existingQuotation ? `Edit ${existingQuotation.quotationNo}` : 'New Quotation'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isReadOnly
              ? 'This quotation is read-only because it has been submitted'
              : 'Create a new quotation with line items'}
          </p>
        </div>
        <div className="flex gap-2">
          {!isReadOnly && (
            <>
              <Button variant="outline" onClick={handleSaveDraft}>
                <Save className="mr-2 size-4" />
                Save Draft
              </Button>
              <Button onClick={handleSubmitForApproval}>
                <Send className="mr-2 size-4" />
                Submit for Approval
              </Button>
            </>
          )}
          {isReadOnly && (
            <Button variant="outline">
              <Eye className="mr-2 size-4" />
              Preview PDF
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quotation Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <Input
                  id="customer"
                  value={formData.customer}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, customer: e.target.value }))
                  }
                  placeholder="Enter customer name"
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opportunity">Linked Opportunity</Label>
                <Select
                  value={formData.linkedOpportunityId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, linkedOpportunityId: value }))
                  }
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select opportunity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No linked opportunity</SelectItem>
                    {opportunities.map((opp) => (
                      <SelectItem key={opp.id} value={opp.id}>
                        {opp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, validUntil: e.target.value }))
                  }
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Additional notes for the quotation"
                  disabled={isReadOnly}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              {!isReadOnly && (
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-2 size-4" />
                  Add Item
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Item Name</TableHead>
                      <TableHead className="w-[80px]">Qty</TableHead>
                      <TableHead className="w-[120px]">Unit Price</TableHead>
                      <TableHead className="w-[80px]">Tax %</TableHead>
                      <TableHead className="w-[80px]">Disc %</TableHead>
                      <TableHead className="w-[120px] text-right">Total</TableHead>
                      {!isReadOnly && <TableHead className="w-[50px]"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            value={item.name}
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            placeholder="Enter item name"
                            disabled={isReadOnly}
                            className="min-w-[180px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)
                            }
                            disabled={isReadOnly}
                            className="w-[70px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                            }
                            disabled={isReadOnly}
                            className="w-[100px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={item.taxPercent}
                            onChange={(e) =>
                              updateItem(item.id, 'taxPercent', parseFloat(e.target.value) || 0)
                            }
                            disabled={isReadOnly}
                            className="w-[70px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={item.discountPercent}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                'discountPercent',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            disabled={isReadOnly}
                            className="w-[70px]"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.total)}
                        </TableCell>
                        {!isReadOnly && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              disabled={items.length === 1}
                              className="size-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="size-5" />
                Pricing Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-destructive">-{formatCurrency(totalDiscount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (GST)</span>
                <span>{formatCurrency(totalTax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Grand Total</span>
                <span className="text-primary">{formatCurrency(grandTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {existingQuotation && (
            <Card>
              <CardHeader>
                <CardTitle>Quotation Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quotation No</span>
                  <span className="font-medium">{existingQuotation.quotationNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">v{existingQuotation.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created By</span>
                  <span className="font-medium">{existingQuotation.createdBy.name}</span>
                </div>
                {existingQuotation.sapSyncStatus && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SAP Status</span>
                    <span className="font-medium capitalize">{existingQuotation.sapSyncStatus}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
