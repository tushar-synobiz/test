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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type Opportunity,
  type OpportunityStage,
  users,
  leads,
} from '@/lib/crm-data'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'

interface OpportunityFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunity?: Opportunity | null
}

export function OpportunityFormDrawer({
  open,
  onOpenChange,
  opportunity,
}: OpportunityFormDrawerProps) {
  const isEditing = !!opportunity
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [formData, setFormData] = React.useState({
    name: '',
    linkedLeadId: '',
    value: '',
    stage: 'new' as OpportunityStage,
    probability: '25',
    expectedCloseDate: '',
    ownerId: users[0].id,
  })

  React.useEffect(() => {
    if (opportunity) {
      setFormData({
        name: opportunity.name,
        linkedLeadId: opportunity.linkedLead.id,
        value: opportunity.value.toString(),
        stage: opportunity.stage,
        probability: opportunity.probability.toString(),
        expectedCloseDate: opportunity.expectedCloseDate.toISOString().split('T')[0],
        ownerId: opportunity.owner.id,
      })
    } else {
      const defaultDate = new Date()
      defaultDate.setMonth(defaultDate.getMonth() + 1)
      setFormData({
        name: '',
        linkedLeadId: '',
        value: '',
        stage: 'new',
        probability: '25',
        expectedCloseDate: defaultDate.toISOString().split('T')[0],
        ownerId: users[0].id,
      })
    }
  }, [opportunity, open])

  const handleStageChange = (stage: OpportunityStage) => {
    const probabilityMap: Record<OpportunityStage, string> = {
      new: '25',
      qualified: '50',
      proposal: '75',
      won: '100',
      lost: '0',
    }
    setFormData((prev) => ({
      ...prev,
      stage,
      probability: probabilityMap[stage],
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const isValid = formData.name && formData.linkedLeadId && formData.value

  // Filter qualified leads for selection
  const qualifiedLeads = leads.filter((l) => l.status === 'qualified')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Opportunity' : 'Create Opportunity'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the opportunity details below.'
              : 'Fill in the details to create a new opportunity.'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Opportunity Name *</FieldLabel>
              <Input
                id="name"
                placeholder="Enterprise Deal - Q2"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="linkedLead">Linked Lead *</FieldLabel>
              <Select
                value={formData.linkedLeadId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, linkedLeadId: value }))}
              >
                <SelectTrigger id="linkedLead">
                  <SelectValue placeholder="Select a lead" />
                </SelectTrigger>
                <SelectContent>
                  {qualifiedLeads.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No qualified leads available
                    </div>
                  ) : (
                    qualifiedLeads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name} ({lead.company})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Only qualified leads can be linked to opportunities
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="value">Deal Value *</FieldLabel>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="value"
                  type="number"
                  placeholder="50000"
                  value={formData.value}
                  onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                  className="pl-7"
                />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="stage">Stage</FieldLabel>
              <Select value={formData.stage} onValueChange={handleStageChange}>
                <SelectTrigger id="stage">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="probability">Win Probability (%)</FieldLabel>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, probability: e.target.value }))
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="expectedCloseDate">Expected Close Date</FieldLabel>
              <Input
                id="expectedCloseDate"
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, expectedCloseDate: e.target.value }))
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="owner">Owner</FieldLabel>
              <Select
                value={formData.ownerId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, ownerId: value }))}
              >
                <SelectTrigger id="owner">
                  <SelectValue placeholder="Select owner" />
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
            {isEditing ? 'Update' : 'Create'} Opportunity
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
