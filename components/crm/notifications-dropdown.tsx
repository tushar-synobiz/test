'use client'

import * as React from 'react'
import Link from 'next/link'
import { Bell, Check, TrendingUp, Users, Calendar, Trophy, XCircle, AlertTriangle, Clock, Ticket, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { notifications, serviceAlerts, getRelativeTime, type Notification, type ServiceAlert } from '@/lib/crm-data'
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

function getAlertIcon(category: ServiceAlert['category']) {
  switch (category) {
    case 'sla_breach':
      return AlertTriangle
    case 'ticket_assigned':
      return Ticket
    case 'escalation':
      return AlertTriangle
    case 'approval_pending':
      return FileText
    case 'ticket_updated':
      return Clock
    default:
      return Bell
  }
}

function getAlertColor(type: ServiceAlert['type']) {
  switch (type) {
    case 'critical':
      return 'text-status-sla-breach'
    case 'warning':
      return 'text-status-escalated'
    case 'info':
      return 'text-primary'
    default:
      return 'text-muted-foreground'
  }
}

export function NotificationsDropdown() {
  const [localNotifications, setLocalNotifications] = React.useState(notifications)
  const [localAlerts, setLocalAlerts] = React.useState(serviceAlerts)
  
  const unreadNotifications = localNotifications.filter(n => !n.read).length
  const unreadAlerts = localAlerts.filter(a => !a.read).length
  const totalUnread = unreadNotifications + unreadAlerts

  const markNotificationAsRead = (id: string) => {
    setLocalNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAlertAsRead = (id: string) => {
    setLocalAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, read: true } : a))
    )
  }

  const markAllAsRead = () => {
    setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setLocalAlerts(prev => prev.map(a => ({ ...a, read: true })))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          {totalUnread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 size-5 justify-center p-0 text-xs"
            >
              {totalUnread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b border-border p-3">
          <h4 className="font-semibold">Notifications</h4>
          {totalUnread > 0 && (
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
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b h-auto p-0 bg-transparent">
            <TabsTrigger 
              value="all" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              All
              {totalUnread > 0 && (
                <Badge variant="secondary" className="ml-2 size-5 justify-center p-0 text-xs">
                  {totalUnread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="service" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              Service
              {unreadAlerts > 0 && (
                <Badge variant="destructive" className="ml-2 size-5 justify-center p-0 text-xs">
                  {unreadAlerts}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="crm" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              CRM
              {unreadNotifications > 0 && (
                <Badge variant="secondary" className="ml-2 size-5 justify-center p-0 text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="m-0">
            <ScrollArea className="h-80">
              {localAlerts.length === 0 && localNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <Bell className="mb-2 size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {/* Service Alerts first */}
                  {localAlerts.map((alert) => {
                    const Icon = getAlertIcon(alert.category)
                    return (
                      <Link
                        key={alert.id}
                        href={alert.relatedTicketId ? `/service/tickets/${alert.relatedTicketId}` : '/service/tickets'}
                        onClick={() => markAlertAsRead(alert.id)}
                        className={cn(
                          'flex w-full gap-3 p-3 text-left transition-colors hover:bg-accent',
                          !alert.read && 'bg-accent/50'
                        )}
                      >
                        <div
                          className={cn(
                            'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
                            alert.type === 'critical' && 'bg-status-sla-breach/20',
                            alert.type === 'warning' && 'bg-status-escalated/20',
                            alert.type === 'info' && 'bg-primary/20',
                            getAlertColor(alert.type)
                          )}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium leading-tight">
                              {alert.title}
                            </p>
                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                              Service
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {alert.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getRelativeTime(alert.createdAt)}
                          </p>
                        </div>
                        {!alert.read && (
                          <div className={cn(
                            'mt-1 size-2 shrink-0 rounded-full',
                            alert.type === 'critical' ? 'bg-status-sla-breach' : 'bg-primary'
                          )} />
                        )}
                      </Link>
                    )
                  })}
                  
                  {/* CRM Notifications */}
                  {localNotifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type)
                    return (
                      <button
                        key={notification.id}
                        onClick={() => markNotificationAsRead(notification.id)}
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
          </TabsContent>
          
          <TabsContent value="service" className="m-0">
            <ScrollArea className="h-80">
              {localAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <Ticket className="mb-2 size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No service alerts</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {localAlerts.map((alert) => {
                    const Icon = getAlertIcon(alert.category)
                    return (
                      <Link
                        key={alert.id}
                        href={alert.relatedTicketId ? `/service/tickets/${alert.relatedTicketId}` : '/service/tickets'}
                        onClick={() => markAlertAsRead(alert.id)}
                        className={cn(
                          'flex w-full gap-3 p-3 text-left transition-colors hover:bg-accent',
                          !alert.read && 'bg-accent/50'
                        )}
                      >
                        <div
                          className={cn(
                            'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
                            alert.type === 'critical' && 'bg-status-sla-breach/20',
                            alert.type === 'warning' && 'bg-status-escalated/20',
                            alert.type === 'info' && 'bg-primary/20',
                            getAlertColor(alert.type)
                          )}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-tight">
                            {alert.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {alert.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getRelativeTime(alert.createdAt)}
                          </p>
                        </div>
                        {!alert.read && (
                          <div className={cn(
                            'mt-1 size-2 shrink-0 rounded-full',
                            alert.type === 'critical' ? 'bg-status-sla-breach' : 'bg-primary'
                          )} />
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="crm" className="m-0">
            <ScrollArea className="h-80">
              {localNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <Bell className="mb-2 size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No CRM notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {localNotifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type)
                    return (
                      <button
                        key={notification.id}
                        onClick={() => markNotificationAsRead(notification.id)}
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
          </TabsContent>
        </Tabs>
        
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
