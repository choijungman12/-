import type {
  Owner, CommitteeMember, Meeting, Document, Notice, QnA,
  Schedule, ProjectInfo
} from '../types'

export const projectInfo: ProjectInfo = {
  id: 'guki-001',
  name: '구기동 재개발정비사업',
  address: '서울특별시 종로구 구기동 138-1 일원',
  totalArea: 88165.5,
  lotCount: 179,
  buildingCount: 90,
  ownerCount: 480,
  currentStage: 'planning',
  startDate: '2026-01-01',
  targetEndDate: '2032-12-31',
  description: '서울특별시 종로구 구기동 138-1 일원 주택정비형 재개발사업',
  zoningTypes: ['exclusive_residential_1', 'general_residential_1', 'general_residential_2', 'green_natural'],
  projectType: 'redevelopment',
}

export const mockOwners: Owner[] = [
  {
    id: 'o001', name: '김철수', residentId: '650101', phone: '010-1234-5678',
    address: '구기동 138-1', ownerType: 'both', landArea: 165.3, buildingArea: 89.2,
    consentStatus: 'agreed', consentDate: '2026-01-15',
    publicLandPrice: 2850000, buildingAge: 1988, createdAt: '2026-01-01', updatedAt: '2026-01-15',
  },
  {
    id: 'o002', name: '이영희', residentId: '720315', phone: '010-2345-6789',
    address: '구기동 139-2', ownerType: 'both', landArea: 122.8, buildingArea: 66.1,
    consentStatus: 'agreed', consentDate: '2026-01-18',
    publicLandPrice: 2780000, buildingAge: 1992, createdAt: '2026-01-01', updatedAt: '2026-01-18',
  },
  {
    id: 'o003', name: '박민준', residentId: '810822', phone: '010-3456-7890',
    address: '구기동 140-3', ownerType: 'land', landArea: 89.5, buildingArea: 0,
    consentStatus: 'pending',
    publicLandPrice: 2920000, buildingAge: 0, createdAt: '2026-01-01', updatedAt: '2026-01-01',
  },
  {
    id: 'o004', name: '최수진', residentId: '760504', phone: '010-4567-8901',
    address: '구기동 141-4', ownerType: 'both', landArea: 198.7, buildingArea: 132.5,
    consentStatus: 'opposed',
    publicLandPrice: 2750000, buildingAge: 1985, createdAt: '2026-01-01', updatedAt: '2026-02-10',
  },
  {
    id: 'o005', name: '정대호', residentId: '690711', phone: '010-5678-9012',
    address: '구기동 142-5', ownerType: 'both', landArea: 145.2, buildingArea: 78.9,
    consentStatus: 'agreed', consentDate: '2026-01-12',
    publicLandPrice: 2800000, buildingAge: 1991, createdAt: '2026-01-01', updatedAt: '2026-01-12',
  },
  {
    id: 'o006', name: '한지원', residentId: '880902', phone: '010-6789-0123',
    address: '구기동 143-6', ownerType: 'building', landArea: 0, buildingArea: 55.4,
    consentStatus: 'agreed', consentDate: '2026-01-20',
    publicLandPrice: 0, buildingAge: 2001, createdAt: '2026-01-01', updatedAt: '2026-01-20',
  },
  {
    id: 'o007', name: '윤상철', residentId: '550213', phone: '010-7890-1234',
    address: '구기동 144-7', ownerType: 'both', landArea: 321.6, buildingArea: 188.4,
    consentStatus: 'pending',
    publicLandPrice: 2650000, buildingAge: 1979, createdAt: '2026-01-01', updatedAt: '2026-01-01',
  },
  {
    id: 'o008', name: '오미래', residentId: '910628', phone: '010-8901-2345',
    address: '구기동 145-8', ownerType: 'both', landArea: 112.3, buildingArea: 67.8,
    consentStatus: 'agreed', consentDate: '2026-01-16',
    publicLandPrice: 2830000, buildingAge: 1998, createdAt: '2026-01-01', updatedAt: '2026-01-16',
  },
  {
    id: 'o009', name: '강현우', residentId: '730419', phone: '010-9012-3456',
    address: '구기동 146-9', ownerType: 'both', landArea: 178.9, buildingArea: 98.6,
    consentStatus: 'withdrawn',
    publicLandPrice: 2770000, buildingAge: 1987, createdAt: '2026-01-01', updatedAt: '2026-02-25',
  },
  {
    id: 'o010', name: '임서연', residentId: '840117', phone: '010-0123-4567',
    address: '구기동 147-10', ownerType: 'both', landArea: 134.6, buildingArea: 82.3,
    consentStatus: 'agreed', consentDate: '2026-01-19',
    publicLandPrice: 2900000, buildingAge: 1994, createdAt: '2026-01-01', updatedAt: '2026-01-19',
  },
]

export const mockCommitteeMembers: CommitteeMember[] = [
  {
    id: 'cm001', ownerId: 'o001', name: '김철수', phone: '010-1234-5678',
    email: 'kim@guki.org', role: 'chairperson', appointedDate: '2026-02-01', isActive: true,
    notes: '추진위원장, 전 종로구청 도시계획과 근무 (20년 경력)',
  },
  {
    id: 'cm002', ownerId: 'o002', name: '이영희', phone: '010-2345-6789',
    email: 'lee@guki.org', role: 'vice_chair', appointedDate: '2026-02-01', isActive: true,
    notes: '부동산 관련 업무 15년 경력',
  },
  {
    id: 'cm003', ownerId: 'o005', name: '정대호', phone: '010-5678-9012',
    role: 'secretary', appointedDate: '2026-02-01', isActive: true,
    notes: '총무 담당, 서류 관리 및 일정 조율',
  },
  {
    id: 'cm004', ownerId: 'o008', name: '오미래', phone: '010-8901-2345',
    role: 'auditor', appointedDate: '2026-02-01', isActive: true,
    notes: '회계사 자격 보유, 재무 감사 담당',
  },
  {
    id: 'cm005', ownerId: 'o010', name: '임서연', phone: '010-0123-4567',
    role: 'member', appointedDate: '2026-02-01', isActive: true,
    notes: '주민 소통 및 홍보 담당',
  },
]

export const mockMeetings: Meeting[] = [
  {
    id: 'mt001',
    title: '제1회 추진위원회 발족 총회',
    type: 'general',
    date: '2026-02-15',
    location: '구기동 주민센터 2층 회의실',
    attendees: ['cm001', 'cm002', 'cm003', 'cm004', 'cm005'],
    agenda: [
      '추진위원회 발족 선언',
      '임원 선출 및 역할 분담',
      '운영규정 제정',
      '2026년 상반기 추진 일정 논의',
    ],
    minutes: '제1회 추진위원회 총회가 2026년 2월 15일 구기동 주민센터 2층 회의실에서 개최되었습니다. 전원 출석하여 추진위원장에 김철수 위원을 선출하였으며, 운영규정을 의결하였습니다.',
    resolutions: [
      '김철수 위원을 추진위원장으로 선출함',
      '이영희 위원을 부위원장으로 선출함',
      '추진위원회 운영규정 제정 의결',
      '정비계획 입안 업무 대행 용역 입찰 준비 착수',
    ],
    createdAt: '2026-02-15',
  },
  {
    id: 'mt002',
    title: '제2회 추진위원회 정기회의',
    type: 'regular',
    date: '2026-03-10',
    location: '구기빌딩 2층 추진위원회 사무실',
    attendees: ['cm001', 'cm002', 'cm003', 'cm005'],
    agenda: [
      '동의서 제출 현황 보고 (누적 38.5%)',
      '정비계획 입안 제안서 준비 현황',
      '법률 자문 계약 체결 건',
      '4월 주민 설명회 개최 계획',
    ],
    minutes: '동의서 제출 현황을 검토하고 법률 자문 용역 계약 체결 및 4월 주민설명회 개최를 의결하였습니다.',
    resolutions: [
      '법률 자문 용역 계약 체결 승인',
      '동의서 보완 제출 마감일: 2026년 6월 30일',
      '4월 주민설명회 개최 장소: 구기동 주민센터 대강당',
    ],
    createdAt: '2026-03-10',
  },
  {
    id: 'mt003',
    title: '제3회 추진위원회 정기회의',
    type: 'regular',
    date: '2026-04-07',
    location: '구기빌딩 2층 추진위원회 사무실',
    attendees: ['cm001', 'cm002', 'cm003', 'cm004', 'cm005'],
    agenda: [
      '동의서 제출 현황 보고 (4월 기준)',
      '주민설명회 결과 보고',
      '정비계획 입안 제안서 초안 검토',
    ],
    minutes: '4월 주민설명회 결과를 공유하고 정비계획 입안 제안서 초안을 검토하였습니다.',
    resolutions: [
      '정비계획 입안 제안서 수정 보완 후 재상정',
      '동의율 50% 달성 시 구청 제출 추진',
    ],
    createdAt: '2026-04-07',
  },
]

export const mockDocuments: Document[] = [
  {
    id: 'doc001', title: '정비계획 입안 동의서', type: 'consent_form',
    fileName: '정비계획_입안_동의서_양식.pdf', fileSize: 245760,
    uploadedBy: 'admin', uploadedAt: '2026-01-05', isPublic: true,
    description: '정비계획 입안을 위한 공식 동의서 양식 (서울특별시 종로구 제공)',
    tags: ['동의서', '필수서류'],
  },
  {
    id: 'doc002', title: '정비계획 입안 반대 동의서', type: 'consent_form',
    fileName: '정비계획_입안_반대_동의서_양식.pdf', fileSize: 198400,
    uploadedBy: 'admin', uploadedAt: '2026-01-05', isPublic: true,
    description: '정비계획 입안에 반대 의사 표시를 위한 공식 양식',
    tags: ['동의서'],
  },
  {
    id: 'doc003', title: '개인정보 수집 및 이용 동의서', type: 'consent_form',
    fileName: '개인정보_수집_이용_동의서.pdf', fileSize: 156800,
    uploadedBy: 'admin', uploadedAt: '2026-01-05', isPublic: true,
    description: '개인정보보호법에 따른 개인정보 수집·이용 동의서',
    tags: ['동의서', '필수서류'],
  },
  {
    id: 'doc004', title: '한국부동산원 현황분석 검토의견서', type: 'appraisal',
    fileName: '한국부동산원_현황분석_검토의견서.pdf', fileSize: 2048000,
    uploadedBy: 'admin', uploadedAt: '2026-01-10', isPublic: true,
    description: '2026년 1월 한국부동산원이 작성한 구기동 정비계획 입안 요건 충족 여부 검토 결과',
    tags: ['검토의견서', '부동산원', '공식문서'],
  },
  {
    id: 'doc005', title: '제1회 추진위원회 총회 회의록', type: 'minutes',
    fileName: '제1회_총회_회의록.pdf', fileSize: 512000,
    uploadedBy: 'cm001', uploadedAt: '2026-02-16', isPublic: false,
    description: '2026년 2월 15일 개최된 제1회 추진위원회 발족 총회 공식 회의록',
    tags: ['회의록', '내부문서'],
  },
  {
    id: 'doc006', title: '주민설명회 자료 (2026.04.10)', type: 'plan',
    fileName: '주민설명회_자료_20260410.pdf', fileSize: 5120000,
    uploadedBy: 'admin', uploadedAt: '2026-04-10', isPublic: true,
    description: '2026년 4월 10일 구기동 주민센터 대강당에서 개최된 주민설명회 발표 자료',
    tags: ['설명회', '안내자료', '공개자료'],
  },
  {
    id: 'doc007', title: '대표소유자 선임 동의서', type: 'consent_form',
    fileName: '대표소유자_선임_동의서.pdf', fileSize: 187300,
    uploadedBy: 'admin', uploadedAt: '2026-01-05', isPublic: true,
    description: '공유 토지·건축물의 대표소유자 선임을 위한 동의서 양식',
    tags: ['동의서'],
  },
]

export const mockNotices: Notice[] = [
  {
    id: 'n001', title: '[긴급] 정비계획 입안 동의서 제출 마감 안내 (6월 30일)',
    content: '구기동 재개발정비사업 추진을 위한 정비계획 입안 동의서 제출 마감일이 2026년 6월 30일로 확정되었습니다. 아직 동의서를 제출하지 않으신 토지등소유자 여러분의 적극적인 참여를 부탁드립니다.',
    category: 'urgent', authorId: 'admin', authorName: '추진위원회',
    createdAt: '2026-04-01', views: 412, isPinned: true,
  },
  {
    id: 'n002', title: '4월 주민설명회 개최 결과 보고',
    content: '2026년 4월 10일(금) 구기동 주민센터 대강당에서 주민설명회가 성공적으로 개최되었습니다. 참석 주민 약 120명과 함께 재개발 사업의 필요성, 추진 절차 및 보상 기준에 대해 상세히 설명하였습니다.',
    category: 'event', authorId: 'admin', authorName: '추진위원회',
    createdAt: '2026-04-11', views: 285, isPinned: true,
  },
  {
    id: 'n003', title: '한국부동산원 현황분석 검토의견서 결과 안내',
    content: '한국부동산원의 현황분석 결과, 구기동 재개발 사업구역이 주택정비형 재개발사업 요건을 충족하는 것으로 확인되었습니다. 노후·불량 건축물 비율 74.4%(기준 60% 이상)로 요건을 충족합니다.',
    category: 'general', authorId: 'admin', authorName: '추진위원회',
    createdAt: '2026-01-12', views: 634, isPinned: false,
  },
  {
    id: 'n004', title: '추진위원회 구성 및 임원 선출 공고',
    content: '2026년 2월 15일 제1회 추진위원회 총회에서 임원이 선출되었습니다. 위원장: 김철수, 부위원장: 이영희, 총무: 정대호, 감사: 오미래, 위원: 임서연',
    category: 'general', authorId: 'admin', authorName: '추진위원회',
    createdAt: '2026-02-16', views: 521, isPinned: false,
  },
  {
    id: 'n005', title: '2026년 상반기 사업 추진 경과 보고',
    content: '2026년 상반기 구기동 재개발정비사업 추진 경과를 보고드립니다. 현재 동의서 징구 작업이 진행 중이며 동의율은 지속적으로 상승하고 있습니다.',
    category: 'general', authorId: 'admin', authorName: '추진위원회',
    createdAt: '2026-04-01', views: 398, isPinned: false,
  },
]

export const mockQnA: QnA[] = [
  {
    id: 'q001', question: '재개발 사업에 동의하지 않으면 어떻게 되나요?',
    answer: '동의하지 않으셔도 사업 추진은 가능합니다. 조합 설립 인가 이후 매도청구 절차가 진행될 수 있으며, 이 경우 감정평가액으로 보상이 이루어집니다. 사업에 참여하시면 조합원으로서 새 아파트 입주권을 받으실 수 있습니다.',
    authorName: '구기동주민', authorPhone: '010-0000-0001', isAnonymous: false,
    status: 'answered', createdAt: '2026-01-20', answeredAt: '2026-01-21', answeredBy: '추진위원회',
  },
  {
    id: 'q002', question: '감정평가는 어떤 기준으로 이루어지나요?',
    answer: '감정평가는 「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제70조에 따라 공시지가를 기준으로 하되, 지역요인·개별요인·기타 요인을 종합적으로 반영하여 결정됩니다. 공시지가 외에 실거래가 동향, 지목, 이용 상황 등도 고려됩니다.',
    authorName: '익명', authorPhone: '010-0000-0002', isAnonymous: true,
    status: 'answered', createdAt: '2026-02-05', answeredAt: '2026-02-06', answeredBy: '추진위원회',
  },
  {
    id: 'q003', question: '세입자도 보상을 받을 수 있나요?',
    answer: '네, 세입자도 보상 대상입니다. 사업 시행으로 이주하게 되는 세입자(주거용 건축물 거주자)는 주거이전비 및 이사비를 보상받을 수 있습니다. 영업 중인 세입자는 영업 손실 보상도 받을 수 있습니다. 구체적인 보상 기준은 사업시행계획 인가 이후 확정될 예정입니다.',
    authorName: '세입자A', authorPhone: '010-0000-0003', isAnonymous: false,
    status: 'answered', createdAt: '2026-03-15', answeredAt: '2026-03-16', answeredBy: '추진위원회',
  },
  {
    id: 'q004', question: '동의서 제출 후 철회할 수 있나요?',
    answer: '',
    authorName: '구기동 주민', authorPhone: '010-0000-0004', isAnonymous: false,
    status: 'pending', createdAt: '2026-04-08',
  },
]

export const mockSchedules: Schedule[] = [
  {
    id: 's001', title: '한국부동산원 현황분석 검토의견서 수령',
    description: '정비계획 입안 요건 충족 확인 — 노후불량 건축물 비율 74.4% 등 확인',
    startDate: '2026-01-05', endDate: '2026-01-10',
    stage: 'planning', status: 'completed',
    responsibleParty: '추진위원회',
  },
  {
    id: 's002', title: '추진위원회 발족 총회',
    description: '임원 선출, 운영규정 제정, 2026년 추진 일정 확정',
    startDate: '2026-02-15', endDate: '2026-02-15',
    stage: 'planning', status: 'completed',
    responsibleParty: '추진위원회',
  },
  {
    id: 's003', title: '주민설명회 개최',
    description: '재개발 사업 추진 계획 주민 설명 — 구기동 주민센터 대강당',
    startDate: '2026-04-10', endDate: '2026-04-10',
    stage: 'planning', status: 'completed',
    responsibleParty: '추진위원회',
  },
  {
    id: 's004', title: '정비계획 입안 동의서 징구',
    description: '토지등소유자 과반수(50% + 1명) 이상 동의 목표',
    startDate: '2026-01-15', endDate: '2026-06-30',
    stage: 'planning', status: 'in_progress',
    responsibleParty: '추진위원회',
  },
  {
    id: 's005', title: '정비계획 입안 제안서 제출',
    description: '종로구청 도시계획과 제출 — 동의율 50% 이상 달성 후 즉시 추진',
    startDate: '2026-07-01', endDate: '2026-09-30',
    stage: 'planning', status: 'planned',
    responsibleParty: '추진위원회',
  },
  {
    id: 's006', title: '추진위원회 구성 승인',
    description: '종로구청 추진위원회 공식 승인 — 행정 절차 진행',
    startDate: '2026-10-01', endDate: '2027-03-31',
    stage: 'committee', status: 'planned',
    responsibleParty: '종로구청',
  },
  {
    id: 's007', title: '조합 설립 인가',
    description: '토지등소유자 3/4 이상, 토지면적 1/2 이상 동의 후 조합 설립',
    startDate: '2027-04-01', endDate: '2028-12-31',
    stage: 'association', status: 'planned',
    responsibleParty: '조합',
  },
  {
    id: 's008', title: '사업시행계획 인가',
    description: '건축설계 및 사업시행계획 수립 후 인가 신청',
    startDate: '2029-01-01', endDate: '2030-06-30',
    stage: 'implementation', status: 'planned',
    responsibleParty: '조합',
  },
  {
    id: 's009', title: '착공 및 준공',
    description: '기존 건물 철거, 신축 공사 시작 및 완공',
    startDate: '2030-07-01', endDate: '2032-12-31',
    stage: 'construction', status: 'planned',
    responsibleParty: '시공사',
  },
]

export const legalDatabase = [
  {
    id: 'l001',
    category: '법률',
    title: '도시 및 주거환경정비법 (도정법)',
    article: '제2조 (정의)',
    content: '이 법에서 사용하는 용어의 뜻은 다음과 같다.\n1. "정비구역"이란 정비계획을 수립하거나 정비사업을 시행하기 위하여 지정·고시된 구역을 말한다.\n2. "정비사업"이란 이 법에서 정한 절차에 따라 도시기능을 회복하기 위하여 정비구역에서 정비기반시설을 정비하거나 주택 등 건축물을 개량하거나 건설하는 다음 각 목의 사업을 말한다.\n   가. 주거환경개선사업\n   나. 재개발사업\n   다. 재건축사업',
    url: 'https://www.law.go.kr/lsInfoP.do?lsiSeq=245699',
    relatedArticles: ['제3조', '제4조', '제8조'],
  },
  {
    id: 'l002',
    category: '법률',
    title: '도시 및 주거환경정비법',
    article: '제35조 (추진위원회의 구성)',
    content: '① 조합을 설립하려는 경우에는 정비구역 지정·고시 후 위원장을 포함한 5명 이상의 추진위원회 위원 과반수의 동의를 받아 추진위원회를 구성하여 시장·군수등의 승인을 받아야 한다.\n② 추진위원회 위원은 토지등소유자 중에서 선정한다.\n③ 추진위원회는 다음 각 호의 사항에 대하여 그 구성에 동의한 토지등소유자(이하 "동의자"라 한다)의 과반수의 동의를 받아 설립인가를 신청하여야 한다.',
    url: 'https://www.law.go.kr/lsInfoP.do?lsiSeq=245699',
    relatedArticles: ['제38조', '제41조'],
  },
  {
    id: 'l003',
    category: '법률',
    title: '도시 및 주거환경정비법',
    article: '제38조 (조합의 설립인가)',
    content: '① 제35조에 따른 추진위원회(추진위원회를 구성하지 아니하는 경우에는 토지등소유자를 말한다)가 조합을 설립하려면 다음 각 호의 사항에 대하여 토지등소유자의 4분의 3 이상 및 토지면적의 2분의 1 이상의 토지소유자의 동의를 받아야 한다.',
    url: 'https://www.law.go.kr/lsInfoP.do?lsiSeq=245699',
    relatedArticles: ['제35조', '제44조'],
  },
  {
    id: 'l004',
    category: '조례',
    title: '서울특별시 도시 및 주거환경정비 조례',
    article: '제6조 (정비계획의 입안)',
    content: '① 법 제8조제1항에서 "대통령령으로 정하는 사항"이란 다음 각 호의 사항을 말한다.\n② 주택정비형 재개발사업의 경우 다음 각 호의 요건을 모두 충족하여야 한다.\n1. 노후·불량 건축물의 수가 전체 건축물 수의 60퍼센트 이상인 지역\n2. 과소필지(90㎡ 미만의 대지)가 전체 필지의 40퍼센트 이상인 지역 (단, 2개 이상 충족 시 입안 가능)\n3. 접도율(너비 4미터 이상의 도로에 접한 건축물의 비율)이 40퍼센트 이하인 지역',
    url: 'https://www.law.go.kr/ordinInfoP.do?ordinSeq=1562888',
    relatedArticles: ['도정법 제8조'],
  },
  {
    id: 'l005',
    category: '판례',
    title: '대법원 2019. 3. 14. 선고 2018두60980 판결',
    article: '재개발구역 내 토지 보상금 산정 기준',
    content: '공익사업을 위한 토지 등의 취득 및 보상에 관한 법률 제70조 제1항에서 규정하는 공시지가를 기준으로 한 보상은 해당 공익사업으로 인하여 토지가격이 변동되기 이전의 가격으로 보상하여야 한다는 취지이므로, 해당 공익사업의 사업인정 고시 이후 지가변동분은 보상가격에서 제외되어야 한다.',
    url: 'https://www.law.go.kr/precInfoP.do?precSeq=193027',
    caseSummary: '재개발사업 시 보상가격 산정에서 사업으로 인한 개발이익은 포함되지 않음을 확인한 판례',
  },
  {
    id: 'l006',
    category: '판례',
    title: '대법원 2022. 7. 28. 선고 2019두62244 판결',
    article: '재건축 초과이익 환수 관련',
    content: '재건축 초과이익 환수에 관한 법률의 입법 목적은 재건축사업으로 인한 개발이익의 사회 환원을 통해 국민경제의 건전한 발전에 기여하는 것이므로, 초과이익 환수 부과처분은 엄격한 법률유보원칙에 따라야 한다.',
    url: 'https://www.law.go.kr/',
    caseSummary: '재건축 초과이익 환수 제도의 합헌성 및 적용 범위에 관한 판례',
  },
  {
    id: 'l007',
    category: '법률',
    title: '공익사업을 위한 토지 등의 취득 및 보상에 관한 법률 (토지보상법)',
    article: '제70조 (취득하는 토지의 보상)',
    content: '① 협의나 재결에 의하여 취득하는 토지에 대하여는 「부동산 가격공시에 관한 법률」에 따른 공시지가를 기준으로 하여 보상하되, 그 공시기준일부터 가격시점까지의 관계 법령에 따른 그 토지의 이용계획, 해당 공익사업으로 인한 지가의 영향을 받지 아니하는 지역의 지가변동률, 생산자물가상승률과 그 밖에 해당 토지의 위치·형상·환경·이용 상황 등을 고려하여 평가한 적정가격으로 보상하여야 한다.',
    url: 'https://www.law.go.kr/lsInfoP.do?lsiSeq=246524',
    relatedArticles: ['제61조', '제77조', '제78조'],
  },
  {
    id: 'l008',
    category: '지침',
    title: '재개발·재건축 사업 표준 업무처리 절차',
    article: '추진위원회 구성 절차',
    content: '1. 정비구역 지정 고시\n2. 추진위원회 구성에 관한 동의서 징구 (토지등소유자 과반수 이상)\n3. 추진위원회 구성 승인 신청 (시장·군수등)\n4. 추진위원회 구성 승인\n5. 추진위원회 운영 및 조합 설립 준비\n6. 조합 설립 동의서 징구 (3/4 이상)',
    url: '',
    relatedArticles: ['도정법 제35조', '도정법 제38조'],
  },
]
