// CRM Types
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified'
export type LeadSource = 'website' | 'referral' | 'linkedin' | 'cold-call' | 'trade-show' | 'other'
export type OpportunityStage = 'new' | 'qualified' | 'proposal' | 'won' | 'lost'
export type ActivityType = 'call' | 'meeting' | 'task' | 'email'
export type ActivityStatus = 'scheduled' | 'completed' | 'cancelled'
export type QuotationStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'sent' | 'accepted' | 'expired'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type ExpenseStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'reimbursed'
export type ExpenseCategory = 'travel' | 'meals' | 'office' | 'software' | 'equipment' | 'other'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'sales' | 'manager' | 'director'
}

export interface Session {
  id: string
  userId: string
  device: string
  browser: string
  ip: string
  location: string
  lastActive: Date
  createdAt: Date
  isCurrent: boolean
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: LeadStatus
  source: LeadSource
  notes: string
  assignedTo: User
  createdAt: Date
  updatedAt: Date
}

export interface Opportunity {
  id: string
  name: string
  linkedLead: Lead
  value: number
  stage: OpportunityStage
  owner: User
  probability: number
  expectedCloseDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  relatedTo: Lead | Opportunity
  relatedType: 'lead' | 'opportunity'
  assignedTo: User
  scheduledAt: Date
  status: ActivityStatus
  createdAt: Date
}

export interface QuotationItem {
  id: string
  name: string
  description?: string
  quantity: number
  unitPrice: number
  taxPercent: number
  discountPercent: number
  total: number
}

export interface Quotation {
  id: string
  quotationNo: string
  customer: string
  linkedOpportunity?: Opportunity
  status: QuotationStatus
  items: QuotationItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  grandTotal: number
  version: number
  parentQuotationId?: string
  notes?: string
  validUntil: Date
  createdBy: User
  createdAt: Date
  updatedAt: Date
  sapSyncStatus?: 'pending' | 'synced' | 'failed'
  sapSyncedAt?: Date
}

export interface ApprovalRule {
  id: string
  name: string
  module: 'quotation' | 'expense'
  condition: {
    field: 'amount'
    operator: 'greater_than' | 'less_than' | 'equals'
    value: number
  }
  levels: ApprovalLevel[]
  isActive: boolean
}

export interface ApprovalLevel {
  level: number
  approverRole: 'manager' | 'director' | 'admin'
  approver?: User
}

export interface ApprovalRequest {
  id: string
  module: 'quotation' | 'expense'
  recordId: string
  recordTitle: string
  amount: number
  requestedBy: User
  currentLevel: number
  totalLevels: number
  status: ApprovalStatus
  approvals: ApprovalAction[]
  createdAt: Date
  updatedAt: Date
}

export interface ApprovalAction {
  level: number
  approver: User
  status: ApprovalStatus
  comment?: string
  actionAt?: Date
}

export interface Drawing {
  id: string
  title: string
  description?: string
  fileName: string
  fileSize: number
  fileType: string
  version: number
  versions: DrawingVersion[]
  uploadedBy: User
  isSecured: boolean
  isWatermarked: boolean
  createdAt: Date
  updatedAt: Date
}

export interface DrawingVersion {
  version: number
  fileName: string
  fileSize: number
  uploadedBy: User
  uploadedAt: Date
  notes?: string
}

export interface ExpenseItem {
  id: string
  description: string
  amount: number
  receipt?: string
}

export interface Expense {
  id: string
  title: string
  category: ExpenseCategory
  status: ExpenseStatus
  items: ExpenseItem[]
  totalAmount: number
  notes?: string
  submittedBy: User
  submittedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface LocationLog {
  id: string
  user: User
  latitude: number
  longitude: number
  accuracy: number
  address?: string
  timestamp: Date
}

export interface Notification {
  id: string
  type: 'activity_assigned' | 'lead_qualified' | 'opportunity_created' | 'opportunity_won' | 'opportunity_lost' | 'approval_requested' | 'approval_approved' | 'approval_rejected' | 'quotation_created' | 'expense_submitted'
  title: string
  message: string
  read: boolean
  createdAt: Date
  relatedId?: string
  relatedType?: 'lead' | 'opportunity' | 'activity' | 'quotation' | 'expense' | 'approval'
  emailSent?: boolean
  emailSentAt?: Date
}

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  activityReminders: boolean
  approvalAlerts: boolean
  dealUpdates: boolean
}

// Dummy Users
export const users: User[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah.chen@company.com', avatar: '/avatars/sarah.jpg', role: 'manager' },
  { id: '2', name: 'Michael Roberts', email: 'michael.r@company.com', avatar: '/avatars/michael.jpg', role: 'sales' },
  { id: '3', name: 'Emily Davis', email: 'emily.d@company.com', avatar: '/avatars/emily.jpg', role: 'sales' },
  { id: '4', name: 'James Wilson', email: 'james.w@company.com', avatar: '/avatars/james.jpg', role: 'sales' },
  { id: '5', name: 'Admin User', email: 'admin@company.com', avatar: '/avatars/admin.jpg', role: 'admin' },
]

export const currentUser = users[0]

// Dummy Leads
export const leads: Lead[] = [
  {
    id: 'lead-1',
    name: 'Alex Thompson',
    email: 'alex.t@techcorp.io',
    phone: '+1 (555) 123-4567',
    company: 'TechCorp Inc.',
    status: 'qualified',
    source: 'website',
    notes: 'Interested in enterprise plan. Has budget approval for Q2.',
    assignedTo: users[0],
    createdAt: new Date('2026-03-15'),
    updatedAt: new Date('2026-04-01'),
  },
  {
    id: 'lead-2',
    name: 'Jennifer Martinez',
    email: 'j.martinez@innovate.co',
    phone: '+1 (555) 234-5678',
    company: 'Innovate Solutions',
    status: 'new',
    source: 'linkedin',
    notes: 'Connected via LinkedIn. Scheduling discovery call.',
    assignedTo: users[1],
    createdAt: new Date('2026-04-02'),
    updatedAt: new Date('2026-04-02'),
  },
  {
    id: 'lead-3',
    name: 'Robert Kim',
    email: 'robert.kim@globaltech.com',
    phone: '+1 (555) 345-6789',
    company: 'Global Tech Systems',
    status: 'contacted',
    source: 'referral',
    notes: 'Referred by existing customer. Looking for team collaboration tools.',
    assignedTo: users[2],
    createdAt: new Date('2026-03-28'),
    updatedAt: new Date('2026-04-03'),
  },
  {
    id: 'lead-4',
    name: 'Lisa Wang',
    email: 'lwang@startupx.io',
    phone: '+1 (555) 456-7890',
    company: 'StartupX',
    status: 'new',
    source: 'trade-show',
    notes: 'Met at SaaS Connect 2026. Early-stage startup, good growth potential.',
    assignedTo: users[3],
    createdAt: new Date('2026-04-05'),
    updatedAt: new Date('2026-04-05'),
  },
  {
    id: 'lead-5',
    name: 'David Brown',
    email: 'd.brown@enterprise.com',
    phone: '+1 (555) 567-8901',
    company: 'Enterprise Solutions Ltd',
    status: 'qualified',
    source: 'cold-call',
    notes: 'Large enterprise account. Multiple decision makers involved.',
    assignedTo: users[0],
    createdAt: new Date('2026-03-10'),
    updatedAt: new Date('2026-04-06'),
  },
  {
    id: 'lead-6',
    name: 'Amanda Foster',
    email: 'a.foster@mediaco.com',
    phone: '+1 (555) 678-9012',
    company: 'MediaCo',
    status: 'unqualified',
    source: 'website',
    notes: 'Budget constraints. Will revisit in 6 months.',
    assignedTo: users[1],
    createdAt: new Date('2026-02-20'),
    updatedAt: new Date('2026-03-15'),
  },
  {
    id: 'lead-7',
    name: 'Chris Anderson',
    email: 'c.anderson@retailplus.com',
    phone: '+1 (555) 789-0123',
    company: 'RetailPlus',
    status: 'contacted',
    source: 'referral',
    notes: 'Retail chain with 50+ locations. High value potential.',
    assignedTo: users[2],
    createdAt: new Date('2026-04-01'),
    updatedAt: new Date('2026-04-07'),
  },
  {
    id: 'lead-8',
    name: 'Nicole Taylor',
    email: 'n.taylor@healthsys.org',
    phone: '+1 (555) 890-1234',
    company: 'HealthSys',
    status: 'new',
    source: 'linkedin',
    notes: 'Healthcare sector. Compliance requirements to review.',
    assignedTo: users[3],
    createdAt: new Date('2026-04-07'),
    updatedAt: new Date('2026-04-07'),
  },
]

// Dummy Opportunities
export const opportunities: Opportunity[] = [
  {
    id: 'opp-1',
    name: 'TechCorp Enterprise Deal',
    linkedLead: leads[0],
    value: 125000,
    stage: 'proposal',
    owner: users[0],
    probability: 75,
    expectedCloseDate: new Date('2026-05-15'),
    createdAt: new Date('2026-04-01'),
    updatedAt: new Date('2026-04-06'),
  },
  {
    id: 'opp-2',
    name: 'Global Tech Systems - Team Plan',
    linkedLead: leads[2],
    value: 48000,
    stage: 'qualified',
    owner: users[2],
    probability: 50,
    expectedCloseDate: new Date('2026-06-01'),
    createdAt: new Date('2026-04-03'),
    updatedAt: new Date('2026-04-05'),
  },
  {
    id: 'opp-3',
    name: 'Enterprise Solutions - Full Suite',
    linkedLead: leads[4],
    value: 250000,
    stage: 'new',
    owner: users[0],
    probability: 25,
    expectedCloseDate: new Date('2026-07-30'),
    createdAt: new Date('2026-04-06'),
    updatedAt: new Date('2026-04-06'),
  },
  {
    id: 'opp-4',
    name: 'RetailPlus Multi-Location',
    linkedLead: leads[6],
    value: 85000,
    stage: 'qualified',
    owner: users[2],
    probability: 60,
    expectedCloseDate: new Date('2026-05-30'),
    createdAt: new Date('2026-04-07'),
    updatedAt: new Date('2026-04-07'),
  },
  {
    id: 'opp-5',
    name: 'StartupX Growth Package',
    linkedLead: leads[3],
    value: 15000,
    stage: 'won',
    owner: users[3],
    probability: 100,
    expectedCloseDate: new Date('2026-04-01'),
    createdAt: new Date('2026-03-20'),
    updatedAt: new Date('2026-04-01'),
  },
  {
    id: 'opp-6',
    name: 'MediaCo Basic Plan',
    linkedLead: leads[5],
    value: 12000,
    stage: 'lost',
    owner: users[1],
    probability: 0,
    expectedCloseDate: new Date('2026-03-15'),
    createdAt: new Date('2026-02-25'),
    updatedAt: new Date('2026-03-15'),
  },
]

// Dummy Activities
export const activities: Activity[] = [
  {
    id: 'act-1',
    type: 'meeting',
    title: 'Discovery Call - TechCorp',
    description: 'Initial discovery call to understand requirements and timeline.',
    relatedTo: leads[0],
    relatedType: 'lead',
    assignedTo: users[0],
    scheduledAt: new Date('2026-04-10T10:00:00'),
    status: 'scheduled',
    createdAt: new Date('2026-04-06'),
  },
  {
    id: 'act-2',
    type: 'call',
    title: 'Follow-up Call - Innovate Solutions',
    description: 'Follow up on initial contact and schedule demo.',
    relatedTo: leads[1],
    relatedType: 'lead',
    assignedTo: users[1],
    scheduledAt: new Date('2026-04-09T14:00:00'),
    status: 'scheduled',
    createdAt: new Date('2026-04-05'),
  },
  {
    id: 'act-3',
    type: 'task',
    title: 'Prepare Proposal - Enterprise Solutions',
    description: 'Create detailed proposal with custom pricing for enterprise account.',
    relatedTo: opportunities[2],
    relatedType: 'opportunity',
    assignedTo: users[0],
    scheduledAt: new Date('2026-04-08T09:00:00'),
    status: 'scheduled',
    createdAt: new Date('2026-04-06'),
  },
  {
    id: 'act-4',
    type: 'meeting',
    title: 'Demo Presentation - Global Tech',
    description: 'Product demonstration for the tech team.',
    relatedTo: opportunities[1],
    relatedType: 'opportunity',
    assignedTo: users[2],
    scheduledAt: new Date('2026-04-11T15:00:00'),
    status: 'scheduled',
    createdAt: new Date('2026-04-04'),
  },
  {
    id: 'act-5',
    type: 'email',
    title: 'Send Contract - TechCorp',
    description: 'Send final contract for review and signature.',
    relatedTo: opportunities[0],
    relatedType: 'opportunity',
    assignedTo: users[0],
    scheduledAt: new Date('2026-04-07T11:00:00'),
    status: 'completed',
    createdAt: new Date('2026-04-05'),
  },
  {
    id: 'act-6',
    type: 'call',
    title: 'Check-in Call - RetailPlus',
    description: 'Weekly check-in with the procurement team.',
    relatedTo: opportunities[3],
    relatedType: 'opportunity',
    assignedTo: users[2],
    scheduledAt: new Date('2026-04-12T10:30:00'),
    status: 'scheduled',
    createdAt: new Date('2026-04-07'),
  },
  {
    id: 'act-7',
    type: 'meeting',
    title: 'Onboarding Kickoff - StartupX',
    description: 'Initial onboarding meeting for new customer.',
    relatedTo: opportunities[4],
    relatedType: 'opportunity',
    assignedTo: users[3],
    scheduledAt: new Date('2026-04-08T13:00:00'),
    status: 'scheduled',
    createdAt: new Date('2026-04-02'),
  },
  {
    id: 'act-8',
    type: 'task',
    title: 'Research HealthSys Requirements',
    description: 'Review healthcare compliance requirements and prepare documentation.',
    relatedTo: leads[7],
    relatedType: 'lead',
    assignedTo: users[3],
    scheduledAt: new Date('2026-04-09T09:00:00'),
    status: 'scheduled',
    createdAt: new Date('2026-04-07'),
  },
]

// Dummy Notifications
export const notifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'opportunity_created',
    title: 'New Opportunity Created',
    message: 'Enterprise Solutions - Full Suite opportunity has been created.',
    read: false,
    createdAt: new Date('2026-04-06T16:30:00'),
    relatedId: 'opp-3',
    relatedType: 'opportunity',
  },
  {
    id: 'notif-2',
    type: 'activity_assigned',
    title: 'Activity Assigned',
    message: 'You have been assigned: Discovery Call - TechCorp',
    read: false,
    createdAt: new Date('2026-04-06T15:00:00'),
    relatedId: 'act-1',
    relatedType: 'activity',
  },
  {
    id: 'notif-3',
    type: 'lead_qualified',
    title: 'Lead Qualified',
    message: 'David Brown from Enterprise Solutions Ltd has been qualified.',
    read: false,
    createdAt: new Date('2026-04-06T14:00:00'),
    relatedId: 'lead-5',
    relatedType: 'lead',
  },
  {
    id: 'notif-4',
    type: 'opportunity_won',
    title: 'Deal Won!',
    message: 'StartupX Growth Package deal has been closed successfully.',
    read: true,
    createdAt: new Date('2026-04-01T10:00:00'),
    relatedId: 'opp-5',
    relatedType: 'opportunity',
  },
  {
    id: 'notif-5',
    type: 'opportunity_lost',
    title: 'Deal Lost',
    message: 'MediaCo Basic Plan opportunity has been marked as lost.',
    read: true,
    createdAt: new Date('2026-03-15T11:30:00'),
    relatedId: 'opp-6',
    relatedType: 'opportunity',
  },
]

// Helper functions
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`
  return formatDate(date)
}

// Dummy Quotations
export const quotations: Quotation[] = [
  {
    id: 'quot-1',
    quotationNo: 'QT-2026-001',
    customer: 'TechCorp Inc.',
    linkedOpportunity: opportunities[0],
    status: 'pending_approval',
    items: [
      { id: 'item-1', name: 'Enterprise License', quantity: 1, unitPrice: 75000, taxPercent: 18, discountPercent: 0, total: 88500 },
      { id: 'item-2', name: 'Implementation Services', quantity: 100, unitPrice: 200, taxPercent: 18, discountPercent: 10, total: 21240 },
      { id: 'item-3', name: 'Training Package', quantity: 5, unitPrice: 2000, taxPercent: 18, discountPercent: 0, total: 11800 },
    ],
    subtotal: 103000,
    taxAmount: 18540,
    discountAmount: 2000,
    grandTotal: 119540,
    version: 1,
    validUntil: new Date('2026-05-15'),
    createdBy: users[0],
    createdAt: new Date('2026-04-05'),
    updatedAt: new Date('2026-04-06'),
    sapSyncStatus: 'pending',
  },
  {
    id: 'quot-2',
    quotationNo: 'QT-2026-002',
    customer: 'Global Tech Systems',
    linkedOpportunity: opportunities[1],
    status: 'draft',
    items: [
      { id: 'item-4', name: 'Team License (50 users)', quantity: 1, unitPrice: 36000, taxPercent: 18, discountPercent: 5, total: 40356 },
      { id: 'item-5', name: 'Basic Support', quantity: 12, unitPrice: 500, taxPercent: 18, discountPercent: 0, total: 7080 },
    ],
    subtotal: 42000,
    taxAmount: 7560,
    discountAmount: 1800,
    grandTotal: 47760,
    version: 1,
    validUntil: new Date('2026-06-01'),
    createdBy: users[2],
    createdAt: new Date('2026-04-04'),
    updatedAt: new Date('2026-04-04'),
  },
  {
    id: 'quot-3',
    quotationNo: 'QT-2026-003',
    customer: 'Enterprise Solutions Ltd',
    linkedOpportunity: opportunities[2],
    status: 'approved',
    items: [
      { id: 'item-6', name: 'Full Suite License', quantity: 1, unitPrice: 180000, taxPercent: 18, discountPercent: 10, total: 191160 },
      { id: 'item-7', name: 'Custom Integration', quantity: 1, unitPrice: 50000, taxPercent: 18, discountPercent: 0, total: 59000 },
      { id: 'item-8', name: 'Premium Support (Annual)', quantity: 1, unitPrice: 24000, taxPercent: 18, discountPercent: 0, total: 28320 },
    ],
    subtotal: 254000,
    taxAmount: 45720,
    discountAmount: 18000,
    grandTotal: 281720,
    version: 2,
    parentQuotationId: 'quot-3-v1',
    validUntil: new Date('2026-07-30'),
    createdBy: users[0],
    createdAt: new Date('2026-04-06'),
    updatedAt: new Date('2026-04-07'),
    sapSyncStatus: 'synced',
    sapSyncedAt: new Date('2026-04-07T10:00:00'),
  },
]

// Dummy Approval Requests
export const approvalRequests: ApprovalRequest[] = [
  {
    id: 'apr-1',
    module: 'quotation',
    recordId: 'quot-1',
    recordTitle: 'QT-2026-001 - TechCorp Inc.',
    amount: 119540,
    requestedBy: users[0],
    currentLevel: 1,
    totalLevels: 2,
    status: 'pending',
    approvals: [
      { level: 1, approver: users[0], status: 'pending' },
      { level: 2, approver: users[4], status: 'pending' },
    ],
    createdAt: new Date('2026-04-06'),
    updatedAt: new Date('2026-04-06'),
  },
  {
    id: 'apr-2',
    module: 'quotation',
    recordId: 'quot-3',
    recordTitle: 'QT-2026-003 - Enterprise Solutions Ltd',
    amount: 281720,
    requestedBy: users[0],
    currentLevel: 2,
    totalLevels: 2,
    status: 'approved',
    approvals: [
      { level: 1, approver: users[0], status: 'approved', comment: 'Looks good, approved.', actionAt: new Date('2026-04-07T09:00:00') },
      { level: 2, approver: users[4], status: 'approved', comment: 'Approved for enterprise deal.', actionAt: new Date('2026-04-07T11:00:00') },
    ],
    createdAt: new Date('2026-04-06'),
    updatedAt: new Date('2026-04-07'),
  },
  {
    id: 'apr-3',
    module: 'expense',
    recordId: 'exp-2',
    recordTitle: 'Client Visit - RetailPlus',
    amount: 1850,
    requestedBy: users[2],
    currentLevel: 1,
    totalLevels: 1,
    status: 'pending',
    approvals: [
      { level: 1, approver: users[0], status: 'pending' },
    ],
    createdAt: new Date('2026-04-07'),
    updatedAt: new Date('2026-04-07'),
  },
]

// Dummy Approval Rules
export const approvalRules: ApprovalRule[] = [
  {
    id: 'rule-1',
    name: 'Quotation > $50,000',
    module: 'quotation',
    condition: { field: 'amount', operator: 'greater_than', value: 50000 },
    levels: [
      { level: 1, approverRole: 'manager' },
      { level: 2, approverRole: 'director' },
    ],
    isActive: true,
  },
  {
    id: 'rule-2',
    name: 'Quotation $10,000 - $50,000',
    module: 'quotation',
    condition: { field: 'amount', operator: 'greater_than', value: 10000 },
    levels: [
      { level: 1, approverRole: 'manager' },
    ],
    isActive: true,
  },
  {
    id: 'rule-3',
    name: 'Expense > $1,000',
    module: 'expense',
    condition: { field: 'amount', operator: 'greater_than', value: 1000 },
    levels: [
      { level: 1, approverRole: 'manager' },
    ],
    isActive: true,
  },
]

// Dummy Drawings
export const drawings: Drawing[] = [
  {
    id: 'draw-1',
    title: 'System Architecture v2.0',
    description: 'Updated system architecture diagram for TechCorp implementation',
    fileName: 'system-architecture-v2.pdf',
    fileSize: 2456000,
    fileType: 'application/pdf',
    version: 2,
    versions: [
      { version: 1, fileName: 'system-architecture-v1.pdf', fileSize: 2100000, uploadedBy: users[0], uploadedAt: new Date('2026-03-15'), notes: 'Initial version' },
      { version: 2, fileName: 'system-architecture-v2.pdf', fileSize: 2456000, uploadedBy: users[0], uploadedAt: new Date('2026-04-02'), notes: 'Added microservices diagram' },
    ],
    uploadedBy: users[0],
    isSecured: true,
    isWatermarked: true,
    createdAt: new Date('2026-03-15'),
    updatedAt: new Date('2026-04-02'),
  },
  {
    id: 'draw-2',
    title: 'Network Topology - Enterprise Solutions',
    description: 'Network diagram for enterprise deployment',
    fileName: 'network-topology.dwg',
    fileSize: 5120000,
    fileType: 'application/acad',
    version: 1,
    versions: [
      { version: 1, fileName: 'network-topology.dwg', fileSize: 5120000, uploadedBy: users[2], uploadedAt: new Date('2026-04-05') },
    ],
    uploadedBy: users[2],
    isSecured: true,
    isWatermarked: false,
    createdAt: new Date('2026-04-05'),
    updatedAt: new Date('2026-04-05'),
  },
  {
    id: 'draw-3',
    title: 'UI Mockups - Dashboard',
    description: 'Dashboard UI mockups for client review',
    fileName: 'dashboard-mockups.fig',
    fileSize: 8900000,
    fileType: 'application/figma',
    version: 3,
    versions: [
      { version: 1, fileName: 'dashboard-mockups-v1.fig', fileSize: 4500000, uploadedBy: users[3], uploadedAt: new Date('2026-03-20') },
      { version: 2, fileName: 'dashboard-mockups-v2.fig', fileSize: 6700000, uploadedBy: users[3], uploadedAt: new Date('2026-03-28'), notes: 'Added dark mode' },
      { version: 3, fileName: 'dashboard-mockups.fig', fileSize: 8900000, uploadedBy: users[3], uploadedAt: new Date('2026-04-03'), notes: 'Final client feedback incorporated' },
    ],
    uploadedBy: users[3],
    isSecured: false,
    isWatermarked: true,
    createdAt: new Date('2026-03-20'),
    updatedAt: new Date('2026-04-03'),
  },
]

// Dummy Expenses
export const expenses: Expense[] = [
  {
    id: 'exp-1',
    title: 'Sales Conference 2026',
    category: 'travel',
    status: 'approved',
    items: [
      { id: 'ei-1', description: 'Flight tickets', amount: 850 },
      { id: 'ei-2', description: 'Hotel (3 nights)', amount: 540 },
      { id: 'ei-3', description: 'Conference registration', amount: 299 },
    ],
    totalAmount: 1689,
    notes: 'Annual sales conference in San Francisco',
    submittedBy: users[1],
    submittedAt: new Date('2026-03-25'),
    createdAt: new Date('2026-03-20'),
    updatedAt: new Date('2026-03-28'),
  },
  {
    id: 'exp-2',
    title: 'Client Visit - RetailPlus',
    category: 'travel',
    status: 'pending_approval',
    items: [
      { id: 'ei-4', description: 'Car rental', amount: 280 },
      { id: 'ei-5', description: 'Fuel', amount: 65 },
      { id: 'ei-6', description: 'Client lunch', amount: 145 },
      { id: 'ei-7', description: 'Hotel (2 nights)', amount: 360 },
    ],
    totalAmount: 850,
    notes: 'On-site visit for implementation kickoff',
    submittedBy: users[2],
    submittedAt: new Date('2026-04-07'),
    createdAt: new Date('2026-04-06'),
    updatedAt: new Date('2026-04-07'),
  },
  {
    id: 'exp-3',
    title: 'Office Supplies Q2',
    category: 'office',
    status: 'reimbursed',
    items: [
      { id: 'ei-8', description: 'Printer cartridges', amount: 189 },
      { id: 'ei-9', description: 'Notebooks and pens', amount: 56 },
      { id: 'ei-10', description: 'Monitor stand', amount: 79 },
    ],
    totalAmount: 324,
    submittedBy: users[3],
    submittedAt: new Date('2026-04-01'),
    createdAt: new Date('2026-04-01'),
    updatedAt: new Date('2026-04-05'),
  },
  {
    id: 'exp-4',
    title: 'Software Subscriptions - April',
    category: 'software',
    status: 'draft',
    items: [
      { id: 'ei-11', description: 'Figma Pro', amount: 45 },
      { id: 'ei-12', description: 'Notion Team', amount: 32 },
      { id: 'ei-13', description: 'Slack Business+', amount: 125 },
    ],
    totalAmount: 202,
    submittedBy: users[0],
    createdAt: new Date('2026-04-07'),
    updatedAt: new Date('2026-04-07'),
  },
]

// Dummy Location Logs
export const locationLogs: LocationLog[] = [
  { id: 'loc-1', user: users[1], latitude: 37.7749, longitude: -122.4194, accuracy: 10, address: 'San Francisco, CA', timestamp: new Date('2026-04-08T09:15:00') },
  { id: 'loc-2', user: users[2], latitude: 40.7128, longitude: -74.0060, accuracy: 15, address: 'New York, NY', timestamp: new Date('2026-04-08T09:30:00') },
  { id: 'loc-3', user: users[3], latitude: 34.0522, longitude: -118.2437, accuracy: 8, address: 'Los Angeles, CA', timestamp: new Date('2026-04-08T09:45:00') },
  { id: 'loc-4', user: users[1], latitude: 37.7849, longitude: -122.4094, accuracy: 12, address: 'Financial District, SF', timestamp: new Date('2026-04-08T11:00:00') },
  { id: 'loc-5', user: users[2], latitude: 40.7580, longitude: -73.9855, accuracy: 20, address: 'Midtown Manhattan, NY', timestamp: new Date('2026-04-08T12:30:00') },
  { id: 'loc-6', user: users[3], latitude: 34.0195, longitude: -118.4912, accuracy: 5, address: 'Santa Monica, CA', timestamp: new Date('2026-04-08T14:00:00') },
]

// Dummy Sessions
export const sessions: Session[] = [
  { id: 'sess-1', userId: '1', device: 'MacBook Pro', browser: 'Chrome 123', ip: '192.168.1.100', location: 'San Francisco, CA', lastActive: new Date('2026-04-08T12:30:00'), createdAt: new Date('2026-04-08T08:00:00'), isCurrent: true },
  { id: 'sess-2', userId: '1', device: 'iPhone 15 Pro', browser: 'Safari Mobile', ip: '10.0.0.50', location: 'San Francisco, CA', lastActive: new Date('2026-04-07T18:45:00'), createdAt: new Date('2026-04-05T10:00:00'), isCurrent: false },
  { id: 'sess-3', userId: '1', device: 'Windows Desktop', browser: 'Firefox 124', ip: '172.16.0.25', location: 'Office Network', lastActive: new Date('2026-04-06T17:00:00'), createdAt: new Date('2026-04-01T09:00:00'), isCurrent: false },
]

// Default Notification Settings
export const defaultNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  activityReminders: true,
  approvalAlerts: true,
  dealUpdates: true,
}

// Dashboard Stats
export function getDashboardStats() {
  const totalLeads = leads.length
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length
  const totalOpportunities = opportunities.length
  const wonOpportunities = opportunities.filter(o => o.stage === 'won').length
  const totalPipelineValue = opportunities
    .filter(o => !['won', 'lost'].includes(o.stage))
    .reduce((sum, o) => sum + o.value, 0)
  const wonValue = opportunities
    .filter(o => o.stage === 'won')
    .reduce((sum, o) => sum + o.value, 0)
  const upcomingActivities = activities.filter(a => a.status === 'scheduled').length

  return {
    totalLeads,
    qualifiedLeads,
    totalOpportunities,
    wonOpportunities,
    totalPipelineValue,
    wonValue,
    upcomingActivities,
    conversionRate: totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0,
    winRate: totalOpportunities > 0 ? Math.round((wonOpportunities / totalOpportunities) * 100) : 0,
  }
}
