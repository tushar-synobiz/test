import { CRMLayout } from '@/components/crm/crm-layout'
import { QuotationDetailContent } from '@/components/crm/quotation-detail-content'

interface QuotationDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function QuotationDetailPage({ params }: QuotationDetailPageProps) {
  const { id } = await params
  return (
    <CRMLayout>
      <QuotationDetailContent quotationId={id} />
    </CRMLayout>
  )
}
