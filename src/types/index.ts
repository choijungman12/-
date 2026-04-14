// 사업 단계
export type ProjectStage =
  | 'planning'       // 정비계획 수립
  | 'committee'      // 추진위원회 승인
  | 'association'    // 조합 설립
  | 'implementation' // 사업시행계획 인가
  | 'management'     // 관리처분계획 인가
  | 'construction'   // 착공 및 준공
  | 'completion'     // 이전고시 및 청산

// 동의 상태
export type ConsentStatus = 'agreed' | 'opposed' | 'pending' | 'withdrawn'

// 소유자 유형
export type OwnerType = 'land' | 'building' | 'both'

// 위원 역할
export type CommitteeRole =
  | 'chairperson'    // 위원장
  | 'vice_chair'     // 부위원장
  | 'secretary'      // 간사
  | 'auditor'        // 감사
  | 'member'         // 위원

// 회의 유형
export type MeetingType = 'regular' | 'special' | 'general'

// 문서 유형
export type DocumentType =
  | 'consent_form'   // 동의서
  | 'legal'          // 법령
  | 'plan'           // 계획서
  | 'minutes'        // 회의록
  | 'appraisal'      // 감정평가서
  | 'other'          // 기타

// 용도지역
export type ZoningType =
  | 'exclusive_residential_1' // 제1종전용주거지역
  | 'exclusive_residential_2' // 제2종전용주거지역
  | 'general_residential_1'   // 제1종일반주거지역
  | 'general_residential_2'   // 제2종일반주거지역
  | 'general_residential_3'   // 제3종일반주거지역
  | 'semi_residential'        // 준주거지역
  | 'commercial_neighborhood' // 근린상업지역
  | 'commercial_general'      // 일반상업지역
  | 'green_natural'           // 자연녹지지역
  | 'green_production'        // 생산녹지지역

// 소유자 (토지등소유자)
export interface Owner {
  id: string
  name: string
  residentId: string // 주민등록번호 앞 6자리
  phone: string
  address: string
  ownerType: OwnerType
  landArea: number        // 토지 면적 (m²)
  buildingArea: number    // 건물 면적 (m²)
  consentStatus: ConsentStatus
  consentDate?: string
  consentDocId?: string
  publicLandPrice: number // 공시지가 (원/m²)
  buildingAge: number     // 건축년도
  notes?: string
  createdAt: string
  updatedAt: string
}

// 추진위원
export interface CommitteeMember {
  id: string
  ownerId: string
  name: string
  phone: string
  email?: string
  role: CommitteeRole
  appointedDate: string
  endDate?: string
  isActive: boolean
  notes?: string
}

// 회의
export interface Meeting {
  id: string
  title: string
  type: MeetingType
  date: string
  location: string
  attendees: string[] // CommitteeMember IDs
  agenda: string[]
  minutes?: string
  resolutions?: string[]
  attachments?: string[]
  createdAt: string
}

// 문서
export interface Document {
  id: string
  title: string
  type: DocumentType
  fileName: string
  fileSize: number
  uploadedBy: string
  uploadedAt: string
  description?: string
  tags?: string[]
  isPublic: boolean
}

// 공지사항
export interface Notice {
  id: string
  title: string
  content: string
  category: 'general' | 'urgent' | 'event'
  authorId: string
  authorName: string
  createdAt: string
  views: number
  isPinned: boolean
  attachments?: string[]
}

// Q&A
export interface QnA {
  id: string
  question: string
  answer?: string
  authorName: string
  authorPhone: string
  isAnonymous: boolean
  status: 'pending' | 'answered'
  createdAt: string
  answeredAt?: string
  answeredBy?: string
}

// 사업 일정
export interface Schedule {
  id: string
  title: string
  description?: string
  startDate: string
  endDate?: string
  stage: ProjectStage
  status: 'planned' | 'in_progress' | 'completed' | 'delayed'
  responsibleParty?: string
}

// 프로젝트 기본 정보
export interface ProjectInfo {
  id: string
  name: string
  address: string
  totalArea: number      // 구역 면적 (m²)
  lotCount: number       // 필지 수
  buildingCount: number  // 건축물 수
  ownerCount: number     // 토지등소유자 수
  currentStage: ProjectStage
  startDate: string
  targetEndDate?: string
  description?: string
  zoningTypes: ZoningType[]
  projectType: 'redevelopment' | 'reconstruction' | 'urban_development'
}

// 감정평가 입력
export interface AppraisalInput {
  landArea: number           // 토지면적 (m²)
  publicLandPrice: number    // 공시지가 (원/m²)
  locationFactor: number     // 지역요인 보정치 (예: 1.1)
  individualFactor: number   // 개별요인 보정치 (예: 1.05)
  zoning: ZoningType
  buildingArea: number       // 건축물 연면적 (m²)
  buildingYear: number       // 건축년도
  buildingType: 'wooden' | 'masonry' | 'steel' | 'rc' | 'src'
  hasBusinessLoss: boolean   // 영업손실 여부
  businessMonthlyRevenue?: number // 월 영업이익
  tenantCount: number        // 세입자 수
  isResident: boolean        // 거주자 여부
}

// 감정평가 결과
export interface AppraisalResult {
  landCompensation: number      // 토지 보상액
  buildingCompensation: number  // 건물 보상액
  businessLossCompensation: number // 영업손실 보상
  movingExpense: number         // 이주비
  tenantCompensation: number    // 세입자 보상
  totalCompensation: number     // 총 보상액
  breakdown: {
    label: string
    amount: number
    basis: string
  }[]
}

// 사업성 분석 입력
export interface FeasibilityInput {
  totalProjectCost: number        // 총 사업비 (원)
  expectedSalePrice: number       // 예상 분양가 (원/m²)
  totalSaleArea: number           // 총 분양면적 (m²)
  totalBefore: number             // 종전자산 총가치 (원)
  memberCount: number             // 조합원수 (명)
  avgUnitArea: number             // 조합원 평균 분양 전용면적 (m²)
  rentalIncome?: number           // 임대수입
  additionalCosts?: number        // 추가비용
}

// 사업성 분석 결과
export interface FeasibilityResult {
  proportionalRate: number        // 비례율 (%)
  postAssetValue: number          // 종후 자산가치
  totalSaleRevenue: number        // 총 분양수입
  netProfit: number               // 순이익
  profitRate: number              // 수익률 (%)
  averageAdditionalCost: number   // 세대당 평균 추가분담금
  breakEvenRate: number           // 손익분기 비례율
}

// 사용자
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'committee' | 'owner' | 'viewer'
  ownerId?: string
  committeeMemberId?: string
}
