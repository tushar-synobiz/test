'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type Activity,
  type ActivityType,
  type ActivityStatus,
  users,
  leads,
  opportunities,
} from '@/lib/crm-data'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'

interface ActivityFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity?: Activity | null
}

export function ActivityFormDrawer({
  open,
  onOpenChange,
  activity,
}: ActivityFormDrawerProps) {
  const isEditing = !!activity
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [formData, setFormData] = React.useState({
    title: '',
    type: 'call' as ActivityType,
    description: '',
    relatedType: 'lead' as 'lead' | 'opportunity',
    relatedId: '',
    scheduledDate: '',
    scheduledTime: '',
    status: 'scheduled' as ActivityStatus,
    assignedToId: users[0].id,
  })

  React.useEffect(() => {
    if (activity) {
      const date = activity.scheduledAt
      setFormData({
        title: activity.title,
        type: activity.type,
        description: activity.description,
        relatedType: activity.relatedType,
        relatedId: 'id' in activity.relatedTo ? activity.relatedTo.id : '',
        scheduledDate: date.toISOString().split('T')[0],
        scheduledTime: date.toTimeString().slice(0, 5),
        status: activity.status,
        assignedToId: activity.assignedTo.id,
      })
    } else {
      const now = new Date()
      now.setHours(now.getHours() + 1)
      now.setMinutes(0)
      setFormData({
        title: '',
        type: 'call',
        description: '',
        relatedType: 'lead',
        relatedId: '',
        scheduledDate: now.toISOString().split('T')[0],
        scheduledTime: now.toTimeString().slice(0, 5),
        status: 'scheduled',
        assignedToId: users[0].id,
      })
    }
  }, [activity, open])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const isValid = formData.title && formData.relatedId && formData.scheduledDate && formData.scheduledTime

  const relatedOptions = formData.relatedType === 'lead' ? leads : opportunities

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Activity' : 'Schedule Activity'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the activity details below.'
              : 'Fill in the details to schedule a new activity.'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="type">Activity Type</FieldLabel>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as ActivityType }))}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="title">Title *</FieldLabel>
              <Input
                id="title"
                placeholder="Discovery Call with John"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                placeholder="Add details about this activity..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="scheduledDate">Date *</FieldLabel>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="scheduledTime">Time *</FieldLabel>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, scheduledTime: e.target.value }))
                  }
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="relatedType">Related To</FieldLabel>
              <Select
                value={formData.relatedType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, relatedType: value as 'lead' | 'opportunity', relatedId: '' }))
                }
              >
                <SelectTrigger id="relatedType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="opportunity">Opportunity</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="relatedId">
                {formData.relatedType === 'lead' ? 'Lead' : 'Opportunity'} *
              </FieldLabel>
              <Select
                value={formData.relatedId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, relatedId: value }))}
              >
                <SelectTrigger id="relatedId">
                  <SelectValue placeholder={`Select ${formData.relatedType}`} />
                </SelectTrigger>
                <SelectContent>
                  {relatedOptions.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                      {'company' in item && ` (${item.company})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="assignedTo">Assigned To</FieldLabel>
              <Select
                value={formData.assignedToId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, assignedToId: value }))}
              >
                <SelectTrigger id="assignedTo">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {isEditing && (
              <Field>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value as ActivityStatus }))
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          </FieldGroup>
        </div>

        <SheetFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEditing ? 'Update' : 'Schedule'} Activity
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
