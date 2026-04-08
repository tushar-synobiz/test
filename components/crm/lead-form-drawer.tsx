'use client'

import * as React from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { type Lead, type LeadStatus, type LeadSource, users, leads } from '@/lib/crm-data'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'

interface LeadFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead?: Lead | null
}

export function LeadFormDrawer({ open, onOpenChange, lead }: LeadFormDrawerProps) {
  const isEditing = !!lead
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [duplicateWarning, setDuplicateWarning] = React.useState<string | null>(null)

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'website' as LeadSource,
    status: 'new' as LeadStatus,
    notes: '',
    assignedToId: users[0].id,
  })

  // Reset form when lead changes
  React.useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        source: lead.source,
        status: lead.status,
        notes: lead.notes,
        assignedToId: lead.assignedTo.id,
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: 'website',
        status: 'new',
        notes: '',
        assignedToId: users[0].id,
      })
    }
    setDuplicateWarning(null)
  }, [lead, open])

  // Check for duplicates
  const checkDuplicates = (email: string, phone: string) => {
    const existingByEmail = leads.find(
      (l) => l.email.toLowerCase() === email.toLowerCase() && l.id !== lead?.id
    )
    const existingByPhone = leads.find(
      (l) => l.phone === phone && l.id !== lead?.id
    )

    if (existingByEmail) {
      setDuplicateWarning(`A lead with email "${email}" already exists (${existingByEmail.name})`)
    } else if (existingByPhone && phone) {
      setDuplicateWarning(`A lead with phone "${phone}" already exists (${existingByPhone.name})`)
    } else {
      setDuplicateWarning(null)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    setFormData((prev) => ({ ...prev, email }))
    checkDuplicates(email, formData.phone)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value
    setFormData((prev) => ({ ...prev, phone }))
    checkDuplicates(formData.email, phone)
  }

  const handleSubmit = async (action: 'save' | 'qualify') => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const isValid = formData.name && formData.email && formData.company

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Lead' : 'Create New Lead'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the lead information below.'
              : 'Fill in the details to add a new lead to your pipeline.'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {duplicateWarning && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription>{duplicateWarning}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name *</FieldLabel>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email *</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                value={formData.email}
                onChange={handleEmailChange}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={handlePhoneChange}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="company">Company *</FieldLabel>
              <Input
                id="company"
                placeholder="Acme Inc."
                value={formData.company}
                onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="source">Lead Source</FieldLabel>
              <Select
                value={formData.source}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, source: value as LeadSource }))
                }
              >
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="cold-call">Cold Call</SelectItem>
                  <SelectItem value="trade-show">Trade Show</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value as LeadStatus }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="unqualified">Unqualified</SelectItem>
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

            <Field>
              <FieldLabel htmlFor="notes">Notes</FieldLabel>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this lead..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={4}
              />
            </Field>
          </FieldGroup>
        </div>

        <SheetFooter className="mt-6 flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => handleSubmit('save')}
              disabled={!isValid || isSubmitting}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save
            </Button>
            {!isEditing && (
              <Button
                onClick={() => handleSubmit('qualify')}
                disabled={!isValid || isSubmitting}
                className="flex-1 sm:flex-none"
              >
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save & Qualify
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
