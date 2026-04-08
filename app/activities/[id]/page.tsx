import { CRMLayout } from '@/components/crm/crm-layout'
import { ActivityDetailContent } from '@/components/crm/activity-detail-content'

interface ActivityDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ActivityDetailPage({ params }: ActivityDetailPageProps) {
  const { id } = await params
  return (
    <CRMLayout>
      <ActivityDetailContent activityId={id} />
    </CRMLayout>
  )
}
