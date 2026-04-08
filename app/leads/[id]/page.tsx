import { CRMLayout } from '@/components/crm/crm-layout'
import { LeadDetailContent } from '@/components/crm/lead-detail-content'

interface LeadDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params
  return (
    <CRMLayout>
      <LeadDetailContent leadId={id} />
    </CRMLayout>
  )
}
