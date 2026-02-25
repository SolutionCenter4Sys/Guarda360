// ===== AUTH =====
export interface User {
  id: string
  fullName: string
  email: string
  cpf?: string
  avatarUrl?: string
  role: 'GUARDIAN_1' | 'GUARDIAN_2' | 'VIEWER'
  emailVerified: boolean
  twoFactorEnabled: boolean
  createdAt: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

// ===== CHILDREN =====
export interface Child {
  id: string
  fullName: string
  birthDate: string
  schoolName: string
  photoUrl?: string
  guardians: Guardian[]
}

export interface Guardian {
  userId: string
  fullName: string
  role: 'GUARDIAN_1' | 'GUARDIAN_2'
  avatarUrl?: string
}

// ===== CALENDAR =====
export type CalendarEventType = 'VISITA' | 'CONVIVENCIA' | 'FERIADO' | 'EVENTO'
export type AttendanceStatus = 'CONFIRMADO' | 'PENDENTE' | 'CANCELADO' | 'FALTA' | 'ATRASO'

export interface CalendarEvent {
  id: string
  childId: string
  type: CalendarEventType
  startAt: string
  endAt: string
  responsibleUserId: string
  guardianRole: 'GUARDIAN_1' | 'GUARDIAN_2' | 'SHARED'
  status: AttendanceStatus
  title: string
  isRecurring: boolean
}

export interface AttendanceRecord {
  id: string
  eventId: string
  status: AttendanceStatus
  actualTime: string
  observation?: string
  recordedBy: string
}

// ===== CHAT =====
export type MessageType = 'TEXT' | 'AUDIO' | 'FILE'

export interface Message {
  id: string
  childId: string
  senderId: string
  senderName: string
  senderRole: 'GUARDIAN_1' | 'GUARDIAN_2'
  type: MessageType
  content: string
  attachmentUrl?: string
  isLegallyRelevant: boolean
  offensiveDetected: boolean
  createdAt: string
  delivered: boolean
  read: boolean
}

// ===== FINANCIAL =====
export type PaymentStatus = 'PAGO' | 'PENDENTE' | 'ATRASADO' | 'PARCIAL'
export type ExpenseStatus = 'PENDENTE' | 'APROVADO' | 'CONTESTADO' | 'PAGO'
export type ExpenseCategory = 'MEDICO' | 'ESCOLAR' | 'ESPORTE' | 'LAZER' | 'OUTROS'

export interface AlimonyConfig {
  id: string
  childId: string
  payerId: string
  receiverId: string
  valueType: 'FIXED' | 'PERCENTAGE'
  amount: number
  percentage?: number
  dueDay: number
  currency: 'BRL'
}

export interface AlimonyPayment {
  id: string
  configId: string
  month: string
  amount: number
  amountPaid?: number
  status: PaymentStatus
  paymentDate?: string
  receiptUrl?: string
  dueDate: string
}

export interface Expense {
  id: string
  childId: string
  category: ExpenseCategory
  amount: number
  description: string
  payer1Share: number
  payer2Share: number
  status: ExpenseStatus
  createdBy: string
  receiptUrl?: string
  createdAt: string
  contestedReason?: string
}

// ===== INCIDENTS =====
export type IncidentType =
  | 'DESCUMPRIMENTO_VISITA'
  | 'COMUNICACAO_INADEQUADA'
  | 'ALIENACAO_PARENTAL'
  | 'SAUDE_NEGLIGENCIADA'
  | 'ESCOLAR'
  | 'FINANCEIRO'
  | 'OUTROS'

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Incident {
  id: string
  childId: string
  type: IncidentType
  severity: IncidentSeverity
  title: string
  narrative: string
  integrityHash: string
  evidences: IncidentEvidence[]
  reportedBy: string
  reportedAt: string
}

export interface IncidentEvidence {
  id: string
  incidentId: string
  fileUrl: string
  fileName: string
  fileType: string
  uploadedAt: string
  hash: string
}

// ===== REPORTS =====
export type ReportStatus = 'PENDING' | 'GENERATING' | 'READY' | 'ERROR'

export interface Report {
  id: string
  childId: string
  type: 'UNIFIED_TIMELINE' | 'FINANCIAL' | 'INCIDENTS' | 'CALENDAR' | 'FULL'
  title: string
  period: string
  status: ReportStatus
  pdfUrl?: string
  integrityHash?: string
  requestedBy: string
  requestedAt: string
  completedAt?: string
}

export interface TimelineEntry {
  id: string
  childId: string
  timestamp: string
  module: 'CALENDAR' | 'CHAT' | 'FINANCIAL' | 'INCIDENT' | 'AUTH'
  title: string
  description: string
  actor: string
  isLegallyRelevant: boolean
  hash?: string
}

// ===== AUTHORIZED PERSONS (F-01.04, F-01.08) =====
export type AuthorizedPersonRole = 'ADVOGADO' | 'PSICOLOGO' | 'ASSISTENTE_SOCIAL' | 'MEDIADOR' | 'OUTRO'
export type AuthorizedPersonStatus = 'ATIVO' | 'INATIVO' | 'PENDENTE'
export type AccessLevel = 'LEITURA' | 'LEITURA_CHAT' | 'LEITURA_FINANCEIRO' | 'RELATORIOS' | 'TOTAL'

export interface AuthorizedPerson {
  id: string
  name: string
  role: AuthorizedPersonRole
  email: string
  phone?: string
  oabNumber?: string
  linkedChildIds: string[]
  accessLevel: AccessLevel[]
  status: AuthorizedPersonStatus
  invitedAt: string
  acceptedAt?: string
  invitedBy: string
}

// ===== AUDIT LOG (F-01.07) =====
export type AuditAction =
  | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_CHANGED' | '2FA_ENABLED' | '2FA_DISABLED'
  | 'MESSAGE_SENT' | 'MESSAGE_MARKED_RELEVANT'
  | 'EXPENSE_CREATED' | 'EXPENSE_APPROVED' | 'EXPENSE_CONTESTED' | 'PAYMENT_REGISTERED'
  | 'INCIDENT_CREATED' | 'INCIDENT_UPDATED'
  | 'REPORT_GENERATED' | 'REPORT_DOWNLOADED'
  | 'CALENDAR_EVENT_CREATED' | 'CHECKIN' | 'CHECKOUT' | 'SWAP_REQUESTED' | 'SWAP_ACCEPTED' | 'SWAP_REJECTED'
  | 'DOCUMENT_UPLOADED' | 'AUTHORIZED_PERSON_INVITED'
  | 'JUDICIAL_MODE_ACTIVATED'

export interface AuditLog {
  id: string
  userId: string
  userName: string
  userRole: 'GUARDIAN_1' | 'GUARDIAN_2' | 'VIEWER'
  action: AuditAction
  module: 'AUTH' | 'CALENDAR' | 'CHAT' | 'FINANCIAL' | 'INCIDENT' | 'HEALTH' | 'REPORTS' | 'SETTINGS'
  description: string
  ip?: string
  device?: string
  timestamp: string
  childId?: string
  resourceId?: string
}

// ===== SPECIAL DATES (F-02.04) =====
export type SpecialDateType = 'FERIADO' | 'FERIAS' | 'DATA_ESPECIAL' | 'ANIVERSARIO'

export interface SpecialDate {
  id: string
  type: SpecialDateType
  title: string
  startDate: string
  endDate: string
  recurring: boolean
  affectsSchedule: boolean
  notes?: string
  childIds: string[]
}

// ===== RECURRENCE CONFIG (F-02.03) =====
export type RecurrencePattern = 'SEMANAL' | 'QUINZENAL' | 'MENSAL' | 'PERSONALIZADO'

export interface RecurrenceConfig {
  id: string
  childId: string
  pattern: RecurrencePattern
  guardian1Weeks: 'PAR' | 'IMPAR' | 'TODAS'
  guardian2Weeks: 'PAR' | 'IMPAR' | 'TODAS'
  startDate: string
  endDate?: string
  customDays?: number[]
  active: boolean
}

// ===== HEALTH & SCHOOL (EP-05) =====
export type AppointmentType = 'CONSULTA' | 'EXAME' | 'VACINA' | 'EMERGENCIA' | 'OUTRO'
export type AppointmentStatus = 'AGENDADO' | 'REALIZADO' | 'CANCELADO'
export type DocumentType = 'ATESTADO' | 'RECEITA' | 'EXAME' | 'BOLETIM' | 'COMUNICADO' | 'OUTRO'

export interface MedicalAppointment {
  id: string
  childId: string
  type: AppointmentType
  title: string
  doctor?: string
  location?: string
  scheduledAt: string
  status: AppointmentStatus
  notes?: string
  attachmentUrl?: string
  createdAt: string
}

export interface Vaccine {
  id: string
  childId: string
  name: string
  doseNumber: number
  totalDoses: number
  appliedAt?: string
  nextDoseAt?: string
  location?: string
  status: 'EM_DIA' | 'ATRASADA' | 'PENDENTE'
}

export interface HealthDocument {
  id: string
  childId: string
  type: DocumentType
  title: string
  fileUrl: string
  fileName: string
  uploadedBy: string
  uploadedAt: string
  description?: string
  hash: string
}

export interface EmergencyContact {
  id: string
  childId: string
  name: string
  role: string
  phone: string
  relationship: string
}

// ===== GUARD CONFIGURATION =====
export type GuardType = 'COMPARTILHADA_ALTERNADA' | 'COMPARTILHADA_EXCLUSIVA' | 'UNILATERAL'

export interface GuardConfig {
  id: string
  childId: string
  type: GuardType
  startDate: string
  guardian1Weekdays: number[]   // 0=Dom,1=Seg... 
  guardian2Weekdays: number[]
  courtDecisionUrl?: string
  notes?: string
}

// ===== SWAP REQUEST (F-02.07) =====
export type SwapStatus = 'PENDENTE' | 'ACEITO' | 'REJEITADO' | 'CANCELADO'

export interface SwapRequest {
  id: string
  childId: string
  requesterId: string
  requesterName: string
  originalDate: string
  proposedDate: string
  reason: string
  status: SwapStatus
  responseNote?: string
  createdAt: string
  respondedAt?: string
}

// ===== EP-05: BOLETINS & COMUNICADOS ESCOLARES =====
export type SchoolPeriod =
  | 'BIMESTRE_1' | 'BIMESTRE_2' | 'BIMESTRE_3' | 'BIMESTRE_4'
  | 'TRIMESTRE_1' | 'TRIMESTRE_2' | 'TRIMESTRE_3'
  | 'SEMESTRE_1' | 'SEMESTRE_2' | 'ANUAL'

export interface SchoolGrade {
  subject: string
  grade: number
  maxGrade: number
}

export interface SchoolReport {
  id: string
  childId: string
  school: string
  schoolGrade: string
  period: SchoolPeriod
  year: number
  uploadedAt: string
  fileUrl: string
  grades?: SchoolGrade[]
  uploadedBy: string
  notes?: string
}

export type CommunicationType = 'REUNIAO' | 'CIRCULAR' | 'AVISO' | 'EVENTO' | 'OUTRO'

export interface SchoolCommunication {
  id: string
  childId: string
  type: CommunicationType
  title: string
  content: string
  school: string
  eventDate?: string
  uploadedAt: string
  fileUrl?: string
  isRead: boolean
}

// ===== EP-05: HEALTH TIMELINE =====
export type HealthTimelineEventType = 'CONSULTA' | 'VACINA' | 'DOCUMENTO' | 'BOLETIM'

export interface HealthTimelineEvent {
  id: string
  type: HealthTimelineEventType
  title: string
  subtitle?: string
  date: string
  color: string
}

// ===== COMMON =====
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  nextCursor?: string
}

export type SeverityLabel = 'Baixa' | 'Média' | 'Alta' | 'Crítica'
export type StatusLabel = 'Confirmado' | 'Pendente' | 'Cancelado' | 'Falta' | 'Atraso'
