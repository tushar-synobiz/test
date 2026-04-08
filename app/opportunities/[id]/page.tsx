import { CRMLayout } from '@/components/crm/crm-layout'
import { OpportunityDetailContent } from '@/components/crm/opportunity-detail-content'

interface OpportunityDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OpportunityDetailPage({ params }: OpportunityDetailPageProps) {
  const { id } = await params
  return (
    <CRMLayout>
      <OpportunityDetailContent opportunityId={id} />
    </CRMLayout>
  )
}
