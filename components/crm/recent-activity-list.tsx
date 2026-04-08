'use client'

import * as React from 'react'
import Link from 'next/link'
import { Phone, Calendar, CheckSquare, Mail } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { type Activity, formatDateTime } from '@/lib/crm-data'
import { cn } from '@/lib/utils'

const activityIcons = {
  call: Phone,
  meeting: Calendar,
  task: CheckSquare,
  email: Mail,
}

const activityColors = {
  call: 'bg-status-qualified/20 text-status-qualified',
  meeting: 'bg-primary/20 text-primary',
  task: 'bg-status-proposal/20 text-status-proposal',
  email: 'bg-status-new/20 text-status-new',
}

interface RecentActivityListProps {
  activities: Activity[]
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Upcoming Activities</CardTitle>
          <CardDescription>Your scheduled tasks and meetings</CardDescription>
        </div>
        <Link href="/activities">
          <Button variant="outline" size="sm">View all</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No upcoming activities
            </p>
          ) : (
            activities.map((activity) => {
              const Icon = activityIcons[activity.type]
              const relatedName = 'name' in activity.relatedTo ? activity.relatedTo.name : ''
              return (
                <Link
                  key={activity.id}
                  href={`/activities/${activity.id}`}
                  className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
                >
                  <div
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-lg',
                      activityColors[activity.type]
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {relatedName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(activity.scheduledAt)}
                    </p>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
