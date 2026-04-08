import { CRMLayout } from '@/components/crm/crm-layout'
import { QuotationFormContent } from '@/components/crm/quotation-form-content'

interface EditQuotationPageProps {
  params: Promise<{ id: string }>
}

export default async function EditQuotationPage({ params }: EditQuotationPageProps) {
  const { id } = await params
  return (
    <CRMLayout>
      <QuotationFormContent quotationId={id} />
    </CRMLayout>
  )
}
