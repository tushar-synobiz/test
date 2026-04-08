import { CRMLayout } from '@/components/crm/crm-layout'
import { TicketDetailContent } from '@/components/crm/ticket-detail-content'

interface TicketPageProps {
  params: Promise<{ id: string }>
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { id } = await params
  
  return (
    <CRMLayout>
      <TicketDetailContent ticketId={id} />
    </CRMLayout>
  )
}
