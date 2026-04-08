'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Edit,
  Copy,
  FileDown,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  History,
  Building2,
  Calendar,
  User,
  TrendingUp,
  Database,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  quotations,
  approvalRequests,
  formatCurrency,
  formatDate,
  formatDateTime,
  type QuotationStatus,
} from '@/lib/crm-data'

interface QuotationDetailContentProps {
  quotationId: string
}

const statusConfig: Record<QuotationStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType; color: string }> = {
  draft: { label: 'Draft', variant: 'secondary', icon: Edit, color: 'text-muted-foreground' },
  pending_approval: { label: 'Pending Approval', variant: 'outline', icon: Clock, color: 'text-yellow-500' },
  approved: { label: 'Approved', variant: 'default', icon: CheckCircle, color: 'text-primary' },
  rejected: { label: 'Rejected', variant: 'destructive', icon: XCircle, color: 'text-destructive' },
  sent: { label: 'Sent', variant: 'outline', icon: Send, color: 'text-blue-500' },
  accepted: { label: 'Accepted', variant: 'default', icon: CheckCircle, color: 'text-primary' },
  expired: { label: 'Expired', variant: 'secondary', icon: AlertCircle, color: 'text-muted-foreground' },
}

export function QuotationDetailContent({ quotationId }: QuotationDetailContentProps) {
  const router = useRouter()
  const quotation = quotations.find((q) => q.id === quotationId)

  if (!quotation) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">Quotation not found</p>
        <Button asChild>
          <Link href="/quotations">Back to Quotations</Link>
        </Button>
      </div>
    )
  }

  const statusInfo = statusConfig[quotation.status]
  const StatusIcon = statusInfo.icon
  const approval = approvalRequests.find(
    (a) => a.module === 'quotation' && a.recordId === quotation.id
  )

  const isEditable = quotation.status === 'draft'
  const canCreateRevision = ['approved', 'sent', 'accepted', 'rejected'].includes(quotation.status)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/quotations">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {quotation.quotationNo}
            </h1>
            {quotation.version > 1 && (
              <Badge variant="outline">v{quotation.version}</Badge>
            )}
            <Badge variant={statusInfo.variant} className="gap-1">
              <StatusIcon className="size-3" />
              {statusInfo.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{quotation.customer}</p>
        </div>
        <div className="flex gap-2">
          {isEditable && (
            <Button variant="outline" asChild>
              <Link href={`/quotations/${quotation.id}/edit`}>
                <Edit className="mr-2 size-4" />
                Edit
              </Link>
            </Button>
          )}
          {canCreateRevision && (
            <Button variant="outline">
              <RefreshCw className="mr-2 size-4" />
              Create Revision
            </Button>
          )}
          <Button variant="outline">
            <Eye className="mr-2 size-4" />
            Preview
          </Button>
          <Button>
            <FileDown className="mr-2 size-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="approval">Approval Status</TabsTrigger>
          <TabsTrigger value="history">Version History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Tax %</TableHead>
                        <TableHead className="text-right">Discount %</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotation.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.name}</div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground">
                                {item.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right">{item.taxPercent}%</TableCell>
                          <TableCell className="text-right">{item.discountPercent}%</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.total)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {quotation.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {quotation.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(quotation.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-destructive">
                      -{formatCurrency(quotation.discountAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (GST)</span>
                    <span>{formatCurrency(quotation.taxAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Grand Total</span>
                    <span className="text-primary">{formatCurrency(quotation.grandTotal)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quotation Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                      <Building2 className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Customer</p>
                      <p className="text-sm font-medium">{quotation.customer}</p>
                    </div>
                  </div>
                  {quotation.linkedOpportunity && (
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                        <TrendingUp className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Linked Opportunity</p>
                        <Link
                          href={`/opportunities/${quotation.linkedOpportunity.id}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {quotation.linkedOpportunity.name}
                        </Link>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                      <User className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Created By</p>
                      <p className="text-sm font-medium">{quotation.createdBy.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                      <Calendar className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valid Until</p>
                      <p className="text-sm font-medium">{formatDate(quotation.validUntil)}</p>
                    </div>
                  </div>
                  {quotation.sapSyncStatus && (
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                        <Database className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">SAP Sync Status</p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              quotation.sapSyncStatus === 'synced'
                                ? 'default'
                                : quotation.sapSyncStatus === 'failed'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {quotation.sapSyncStatus}
                          </Badge>
                          {quotation.sapSyncedAt && (
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(quotation.sapSyncedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="approval" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Approval Progress</CardTitle>
              <CardDescription>
                Track the approval workflow for this quotation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approval ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Status: </span>
                      <Badge
                        variant={
                          approval.status === 'approved'
                            ? 'default'
                            : approval.status === 'rejected'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {approval.status}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Current Level: </span>
                      <span className="font-medium">
                        {approval.currentLevel} of {approval.totalLevels}
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-6 h-[calc(100%-48px)] w-0.5 bg-border" />
                    <div className="space-y-6">
                      {approval.approvals.map((action, index) => (
                        <div key={index} className="relative flex gap-4">
                          <div
                            className={`relative z-10 flex size-8 items-center justify-center rounded-full ${
                              action.status === 'approved'
                                ? 'bg-primary text-primary-foreground'
                                : action.status === 'rejected'
                                ? 'bg-destructive text-destructive-foreground'
                                : 'bg-secondary text-muted-foreground'
                            }`}
                          >
                            {action.status === 'approved' ? (
                              <CheckCircle className="size-4" />
                            ) : action.status === 'rejected' ? (
                              <XCircle className="size-4" />
                            ) : (
                              <Clock className="size-4" />
                            )}
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">Level {action.level}</p>
                                <p className="text-sm text-muted-foreground">
                                  {action.approver.name} ({action.approver.role})
                                </p>
                              </div>
                              {action.actionAt && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDateTime(action.actionAt)}
                                </span>
                              )}
                            </div>
                            {action.comment && (
                              <p className="mt-2 text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
                                {action.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="mx-auto size-12 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">
                    No approval request found for this quotation
                  </p>
                  {quotation.status === 'draft' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Submit the quotation to initiate the approval workflow
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="size-5" />
                Version History
              </CardTitle>
              <CardDescription>
                View previous versions of this quotation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-primary/20">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Version {quotation.version}</span>
                      <Badge variant="default">Current</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created on {formatDate(quotation.createdAt)} by {quotation.createdBy.name}
                    </p>
                  </div>
                  <span className="font-semibold">{formatCurrency(quotation.grandTotal)}</span>
                </div>

                {quotation.version > 1 && (
                  <>
                    {Array.from({ length: quotation.version - 1 }, (_, i) => i + 1)
                      .reverse()
                      .map((version) => (
                        <div
                          key={version}
                          className="flex items-center justify-between p-4 rounded-lg border"
                        >
                          <div>
                            <span className="font-medium">Version {version}</span>
                            <p className="text-sm text-muted-foreground">
                              Previous version
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
