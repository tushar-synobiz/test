'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  Calendar as CalendarIcon,
  List,
  Filter,
  Phone,
  Users,
  CheckSquare,
  Mail,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  activities,
  formatDate,
  formatDateTime,
  type Activity,
  type ActivityType,
  type ActivityStatus,
} from '@/lib/crm-data'
import { cn } from '@/lib/utils'
import { ActivityFormDrawer } from './activity-form-drawer'
import { ActivityCalendarView } from './activity-calendar-view'

const activityIcons: Record<ActivityType, React.ElementType> = {
  call: Phone,
  meeting: Users,
  task: CheckSquare,
  email: Mail,
}

const activityColors: Record<ActivityType, string> = {
  call: 'bg-status-qualified/20 text-status-qualified',
  meeting: 'bg-primary/20 text-primary',
  task: 'bg-status-proposal/20 text-status-proposal',
  email: 'bg-status-new/20 text-status-new',
}

const statusColors: Record<ActivityStatus, string> = {
  scheduled: 'bg-status-qualified/20 text-status-qualified',
  completed: 'bg-status-won/20 text-status-won',
  cancelled: 'bg-status-lost/20 text-status-lost',
}

type ViewMode = 'list' | 'calendar'

export function ActivitiesContent() {
  const [viewMode, setViewMode] = React.useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState<ActivityType | 'all'>('all')
  const [statusFilter, setStatusFilter] = React.useState<ActivityStatus | 'all'>('all')
  const [isLoading, setIsLoading] = React.useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [editingActivity, setEditingActivity] = React.useState<Activity | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredActivities = React.useMemo(() => {
    return activities.filter((activity) => {
      const relatedName = 'name' in activity.relatedTo ? activity.relatedTo.name : ''
      const matchesSearch =
        searchQuery === '' ||
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        relatedName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = typeFilter === 'all' || activity.type === typeFilter
      const matchesStatus = statusFilter === 'all' || activity.status === statusFilter

      return matchesSearch && matchesType && matchesStatus
    }).sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
  }, [searchQuery, typeFilter, statusFilter])

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity)
    setIsDrawerOpen(true)
  }

  const handleCreate = () => {
    setEditingActivity(null)
    setIsDrawerOpen(true)
  }

  // Stats
  const scheduledCount = activities.filter(a => a.status === 'scheduled').length
  const completedCount = activities.filter(a => a.status === 'completed').length
  const todayCount = activities.filter(a => {
    const today = new Date()
    return a.scheduledAt.toDateString() === today.toDateString() && a.status === 'scheduled'
  }).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Activities</h1>
          <p className="text-muted-foreground">
            Track calls, meetings, tasks, and emails
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 size-4" />
          New Activity
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="text-2xl font-bold">{todayCount}</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className="text-sm text-muted-foreground">Scheduled</p>
          <p className="text-2xl font-bold">{scheduledCount}</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold">{completedCount}</p>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as ActivityType | 'all')}
          >
            <SelectTrigger className="w-[130px]">
              <Filter className="mr-2 size-4" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="call">Calls</SelectItem>
              <SelectItem value="meeting">Meetings</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
              <SelectItem value="email">Emails</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as ActivityStatus | 'all')}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <List className="size-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon className="size-4" />
              Calendar
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {viewMode === 'calendar' ? (
        <ActivityCalendarView activities={filteredActivities} onEdit={handleEdit} />
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px]">Type</TableHead>
                <TableHead className="w-[250px]">Activity</TableHead>
                <TableHead>Related To</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="size-8 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-muted-foreground">No activities found</p>
                      <Button variant="link" onClick={handleCreate}>
                        Schedule your first activity
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((activity) => {
                  const Icon = activityIcons[activity.type]
                  const relatedName = 'name' in activity.relatedTo ? activity.relatedTo.name : ''
                  const relatedCompany = 'company' in activity.relatedTo ? activity.relatedTo.company : ''
                  
                  return (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div
                          className={cn(
                            'flex size-8 items-center justify-center rounded-lg',
                            activityColors[activity.type]
                          )}
                        >
                          <Icon className="size-4" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/activities/${activity.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {activity.title}
                        </Link>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {activity.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{relatedName}</p>
                          {relatedCompany && (
                            <p className="text-xs text-muted-foreground">{relatedCompany}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {activity.assignedTo.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{activity.assignedTo.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatDateTime(activity.scheduledAt)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn('capitalize', statusColors[activity.status])}
                        >
                          {activity.status}
                        </Badge>
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
                              <Link href={`/activities/${activity.id}`}>
                                <Eye className="mr-2 size-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(activity)}>
                              <Pencil className="mr-2 size-4" />
                              Edit
                            </DropdownMenuItem>
                            {activity.status === 'scheduled' && (
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 size-4" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 size-4" />
                              Delete
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
      )}

      <ActivityFormDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        activity={editingActivity}
      />
    </div>
  )
}
