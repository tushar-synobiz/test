'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Receipt,
  User,
  Calendar,
  MessageSquare,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  approvalRequests,
  currentUser,
  formatCurrency,
  formatDate,
  formatDateTime,
  type ApprovalRequest,
  type ApprovalStatus,
} from '@/lib/crm-data'

const moduleConfig = {
  quotation: { icon: FileText, label: 'Quotation', href: '/quotations' },
  expense: { icon: Receipt, label: 'Expense', href: '/expenses' },
}

export function ApprovalsContent() {
  const [localApprovals, setLocalApprovals] = React.useState(approvalRequests)
  const [selectedApproval, setSelectedApproval] = React.useState<ApprovalRequest | null>(null)
  const [actionType, setActionType] = React.useState<'approve' | 'reject' | null>(null)
  const [comment, setComment] = React.useState('')
  const [moduleFilter, setModuleFilter] = React.useState<string>('all')

  const pendingApprovals = localApprovals.filter(
    (a) =>
      a.status === 'pending' &&
      a.approvals.some(
        (action) =>
          action.level === a.currentLevel &&
          action.status === 'pending' &&
          (action.approver.role === currentUser.role || currentUser.role === 'admin')
      )
  )

  const mySubmissions = localApprovals.filter((a) => a.requestedBy.id === currentUser.id)
  const allApprovals = localApprovals

  const handleAction = (approval: ApprovalRequest, type: 'approve' | 'reject') => {
    setSelectedApproval(approval)
    setActionType(type)
    setComment('')
  }

  const confirmAction = () => {
    if (!selectedApproval || !actionType) return

    setLocalApprovals((prev) =>
      prev.map((a) => {
        if (a.id !== selectedApproval.id) return a
        const updatedApprovals = a.approvals.map((action) => {
          if (action.level === a.currentLevel && action.status === 'pending') {
            return {
              ...action,
              status: actionType === 'approve' ? ('approved' as ApprovalStatus) : ('rejected' as ApprovalStatus),
              comment: comment || undefined,
              actionAt: new Date(),
            }
          }
          return action
        })
        const allApproved = updatedApprovals.every((action) => action.status === 'approved')
        const anyRejected = updatedApprovals.some((action) => action.status === 'rejected')
        return {
          ...a,
          approvals: updatedApprovals,
          currentLevel: actionType === 'approve' ? a.currentLevel + 1 : a.currentLevel,
          status: anyRejected ? ('rejected' as ApprovalStatus) : allApproved ? ('approved' as ApprovalStatus) : a.status,
          updatedAt: new Date(),
        }
      })
    )

    setSelectedApproval(null)
    setActionType(null)
    setComment('')
  }

  const filteredApprovals = (items: ApprovalRequest[]) =>
    moduleFilter === 'all' ? items : items.filter((a) => a.module === moduleFilter)

  const stats = {
    pending: pendingApprovals.length,
    approved: localApprovals.filter((a) => a.status === 'approved').length,
    rejected: localApprovals.filter((a) => a.status === 'rejected').length,
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Review and manage approval requests
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <Tabs defaultValue="pending" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="pending">
                Pending Review
                {pendingApprovals.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {pendingApprovals.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="my-submissions">My Submissions</TabsTrigger>
              <TabsTrigger value="all">All Approvals</TabsTrigger>
            </TabsList>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 size-4" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="quotation">Quotations</SelectItem>
                <SelectItem value="expense">Expenses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="pending" className="space-y-4">
            {filteredApprovals(pendingApprovals).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="size-12 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium">All caught up!</p>
                  <p className="text-sm text-muted-foreground">No pending approvals</p>
                </CardContent>
              </Card>
            ) : (
              filteredApprovals(pendingApprovals).map((approval) => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  onApprove={() => handleAction(approval, 'approve')}
                  onReject={() => handleAction(approval, 'reject')}
                  showActions
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="my-submissions" className="space-y-4">
            {filteredApprovals(mySubmissions).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="size-12 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium">No submissions yet</p>
                  <p className="text-sm text-muted-foreground">
                    Your approval requests will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredApprovals(mySubmissions).map((approval) => (
                <ApprovalCard key={approval.id} approval={approval} />
              ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {filteredApprovals(allApprovals).map((approval) => (
              <ApprovalCard key={approval.id} approval={approval} />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedApproval && !!actionType} onOpenChange={() => setSelectedApproval(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {selectedApproval?.recordTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Comment (optional)</label>
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApproval(null)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={confirmAction}
            >
              {actionType === 'approve' ? (
                <>
                  <CheckCircle className="mr-2 size-4" />
                  Approve
                </>
              ) : (
                <>
                  <XCircle className="mr-2 size-4" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ApprovalCardProps {
  approval: ApprovalRequest
  onApprove?: () => void
  onReject?: () => void
  showActions?: boolean
}

function ApprovalCard({ approval, onApprove, onReject, showActions }: ApprovalCardProps) {
  const config = moduleConfig[approval.module]
  const ModuleIcon = config.icon

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-12 items-center justify-center rounded-lg bg-secondary">
            <ModuleIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{approval.recordTitle}</h3>
                  <Badge variant="outline">{config.label}</Badge>
                  <Badge
                    variant={
                      approval.status === 'approved'
                        ? 'default'
                        : approval.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {approval.status}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="size-3" />
                    {approval.requestedBy.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {formatDate(approval.createdAt)}
                  </span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(approval.amount)}
                  </span>
                </div>
              </div>
              {showActions && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onReject}>
                    <XCircle className="mr-1 size-4" />
                    Reject
                  </Button>
                  <Button size="sm" onClick={onApprove}>
                    <CheckCircle className="mr-1 size-4" />
                    Approve
                  </Button>
                </div>
              )}
              {!showActions && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`${config.href}/${approval.recordId}`}>
                    View
                    <ChevronRight className="ml-1 size-4" />
                  </Link>
                </Button>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                Approval Progress: Level {approval.currentLevel} of {approval.totalLevels}
              </div>
              <div className="flex items-center gap-2">
                {approval.approvals.map((action, index) => (
                  <React.Fragment key={index}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex size-6 items-center justify-center rounded-full text-xs ${
                          action.status === 'approved'
                            ? 'bg-primary text-primary-foreground'
                            : action.status === 'rejected'
                            ? 'bg-destructive text-destructive-foreground'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {action.status === 'approved' ? (
                          <CheckCircle className="size-3" />
                        ) : action.status === 'rejected' ? (
                          <XCircle className="size-3" />
                        ) : (
                          action.level
                        )}
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">{action.approver.name}</span>
                        {action.comment && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MessageSquare className="size-3" />
                            {action.comment.length > 30
                              ? action.comment.substring(0, 30) + '...'
                              : action.comment}
                          </span>
                        )}
                      </div>
                    </div>
                    {index < approval.approvals.length - 1 && (
                      <div className="h-0.5 w-8 bg-border" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
