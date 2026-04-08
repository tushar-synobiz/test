'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, Phone, Users, CheckSquare, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  type Activity,
  type ActivityType,
  formatDateTime,
} from '@/lib/crm-data'
import { cn } from '@/lib/utils'

const activityIcons: Record<ActivityType, React.ElementType> = {
  call: Phone,
  meeting: Users,
  task: CheckSquare,
  email: Mail,
}

const activityColors: Record<ActivityType, string> = {
  call: 'bg-status-qualified/20 text-status-qualified border-l-status-qualified',
  meeting: 'bg-primary/20 text-primary border-l-primary',
  task: 'bg-status-proposal/20 text-status-proposal border-l-status-proposal',
  email: 'bg-status-new/20 text-status-new border-l-status-new',
}

interface ActivityCalendarViewProps {
  activities: Activity[]
  onEdit: (activity: Activity) => void
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function ActivityCalendarView({ activities, onEdit }: ActivityCalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [viewMode, setViewMode] = React.useState<'month' | 'week'>('week')

  const goToPrevious = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setDate(newDate.getDate() - 7)
      }
      return newDate
    })
  }

  const goToNext = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() + 1)
      } else {
        newDate.setDate(newDate.getDate() + 7)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get week dates
  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return date
    })
  }

  // Get month dates
  const getMonthDates = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const startDate = new Date(firstDay)
    startDate.setDate(firstDay.getDate() - firstDay.getDay())
    
    const dates: Date[] = []
    const current = new Date(startDate)
    
    while (current <= lastDay || dates.length % 7 !== 0) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }

  // Get activities for a specific date
  const getActivitiesForDate = (date: Date) => {
    return activities.filter(activity => {
      const actDate = activity.scheduledAt
      return (
        actDate.getDate() === date.getDate() &&
        actDate.getMonth() === date.getMonth() &&
        actDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const weekDates = getWeekDates()
  const monthDates = getMonthDates()

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={goToPrevious}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {DAYS.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          {viewMode === 'week' ? (
            <div className="grid grid-cols-7 min-h-[500px]">
              {weekDates.map((date, index) => {
                const dayActivities = getActivitiesForDate(date)
                return (
                  <div
                    key={index}
                    className={cn(
                      'border-r border-border p-2 last:border-r-0',
                      isToday(date) && 'bg-primary/5'
                    )}
                  >
                    <div
                      className={cn(
                        'mb-2 flex size-8 items-center justify-center rounded-full text-sm',
                        isToday(date) && 'bg-primary text-primary-foreground font-semibold'
                      )}
                    >
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayActivities.map((activity) => {
                        const Icon = activityIcons[activity.type]
                        return (
                          <button
                            key={activity.id}
                            onClick={() => onEdit(activity)}
                            className={cn(
                              'w-full rounded border-l-2 p-1.5 text-left text-xs transition-colors hover:opacity-80',
                              activityColors[activity.type]
                            )}
                          >
                            <div className="flex items-center gap-1">
                              <Icon className="size-3 shrink-0" />
                              <span className="truncate font-medium">{activity.title}</span>
                            </div>
                            <p className="text-[10px] opacity-75 mt-0.5">
                              {activity.scheduledAt.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {monthDates.map((date, index) => {
                const dayActivities = getActivitiesForDate(date)
                return (
                  <div
                    key={index}
                    className={cn(
                      'min-h-24 border-r border-b border-border p-1',
                      index % 7 === 6 && 'border-r-0',
                      !isCurrentMonth(date) && 'bg-muted/30',
                      isToday(date) && 'bg-primary/5'
                    )}
                  >
                    <div
                      className={cn(
                        'mb-1 flex size-6 items-center justify-center rounded-full text-xs',
                        isToday(date) && 'bg-primary text-primary-foreground font-semibold',
                        !isCurrentMonth(date) && 'text-muted-foreground'
                      )}
                    >
                      {date.getDate()}
                    </div>
                    <div className="space-y-0.5">
                      {dayActivities.slice(0, 2).map((activity) => {
                        const Icon = activityIcons[activity.type]
                        return (
                          <button
                            key={activity.id}
                            onClick={() => onEdit(activity)}
                            className={cn(
                              'w-full rounded border-l-2 px-1 py-0.5 text-left text-[10px] transition-colors hover:opacity-80',
                              activityColors[activity.type]
                            )}
                          >
                            <div className="flex items-center gap-0.5">
                              <Icon className="size-2.5 shrink-0" />
                              <span className="truncate">{activity.title}</span>
                            </div>
                          </button>
                        )
                      })}
                      {dayActivities.length > 2 && (
                        <p className="text-[10px] text-muted-foreground px-1">
                          +{dayActivities.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Activity Types:</span>
        {Object.entries(activityIcons).map(([type, Icon]) => (
          <div key={type} className="flex items-center gap-1">
            <div
              className={cn(
                'flex size-5 items-center justify-center rounded',
                activityColors[type as ActivityType]
              )}
            >
              <Icon className="size-3" />
            </div>
            <span className="text-xs capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
