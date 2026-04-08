'use client'

import * as React from 'react'
import Link from 'next/link'
import { Bell, Check, TrendingUp, Users, Calendar, Trophy, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { notifications, getRelativeTime, type Notification } from '@/lib/crm-data'
import { cn } from '@/lib/utils'

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'activity_assigned':
      return Calendar
    case 'lead_qualified':
      return Users
    case 'opportunity_created':
      return TrendingUp
    case 'opportunity_won':
      return Trophy
    case 'opportunity_lost':
      return XCircle
    default:
      return Bell
  }
}

function getNotificationColor(type: Notification['type']) {
  switch (type) {
    case 'opportunity_won':
      return 'text-status-won'
    case 'opportunity_lost':
      return 'text-status-lost'
    case 'lead_qualified':
      return 'text-status-qualified'
    case 'opportunity_created':
      return 'text-primary'
    default:
      return 'text-muted-foreground'
  }
}

export function NotificationsDropdown() {
  const [localNotifications, setLocalNotifications] = React.useState(notifications)
  const unreadCount = localNotifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setLocalNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 size-5 justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border p-3">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs text-primary hover:text-primary"
            >
              <Check className="mr-1 size-3" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {localNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Bell className="mb-2 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {localNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type)
                return (
                  <button
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={cn(
                      'flex w-full gap-3 p-3 text-left transition-colors hover:bg-accent',
                      !notification.read && 'bg-accent/50'
                    )}
                  >
                    <div
                      className={cn(
                        'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary',
                        getNotificationColor(notification.type)
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-tight">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
        <div className="border-t border-border p-2">
          <Link href="/notifications">
            <Button variant="ghost" className="w-full text-sm">
              View all notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
