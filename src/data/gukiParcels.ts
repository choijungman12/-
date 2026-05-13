// 구기2지구 (138-1 일원) 필지 데이터 시뮬레이션
//
// 데이터 출처: 국가공간정보포털(NSDI) · V-World · 한국부동산원 현황분석검토의견서를
// 모사한 시뮬레이션 데이터셋. 실제 운영 시에는 아래 인터페이스를 그대로 유지한 채
// `loadParcels()` 함수만 V-World/공공데이터포털 API 응답으로 교체.
//
// 각 Parcel은 실제 정부 데이터의 3대 출처를 모두 포함:
//   - 토지대장 (landRegistry)         → data.go.kr/iros (등기소 토지대장 조회 서비스)
//   - 건축물대장 (buildingRegistry)   → data.go.kr/molit (건축물대장 정보 서비스)
//   - 토지이용계획 (landUsePlan)      → data.go.kr/nsdi (토지이용계획 확인서비스)

export type BuildingType =
  | '단독주택' | '다가구주택' | '다세대빌라' | '연립주택' | '아파트'
  | '근린생활시설' | '나대지'

export type Structure =
  | '철근콘크리트' | '벽돌조' | '시멘트블럭' | '목조' | '경량철골' | '없음'

export type Zoning =
  | '제1종전용주거지역' | '제1종일반주거지역' | '제2종일반주거지역' | '준주거지역'

export type Shape = '정형' | '가장형' | '부정형' | '자루형'

export type RoadAccess =
  | '광대로한면' | '중로한면' | '소로한면' | '세로(가)' | '세로(불)' | '맹지'

// 지목 (토지대장)
export type Jimok = '대' | '전' | '답' | '임야' | '잡종지' | '도로'

// 소유구분 (토지대장)
export type ShareType = '단독소유' | '공유' | '합유'

// ────────────────────────────────────────────────────────────────────
// 토지대장 (Land Registry) — 등기부등본 + 토지대장 통합 모사
// ────────────────────────────────────────────────────────────────────
export interface LandRegistry {
  owner: string                    // 소유자명 (시뮬레이션: 김OO, 박OO 등)
  ownerType: '개인' | '법인' | '국가' | '공공'
  ownerAddr: string                // 소유자 주소 (개인정보 모자이크)
  acquireDate: string              // 취득일 (YYYY-MM-DD)
  acquireReason: '매매' | '상속' | '증여' | '경매' | '신축'
  jimok: Jimok                     // 지목
  shareType: ShareType             // 소유구분
  shareRatio?: string              // 지분 (공유 시, 예: "1/2")
  noticedPriceHistory: { year: number; pricePerM2: number }[]  // 공시지가 5년 추이
  registrationNumber: string       // 등기번호 (시뮬레이션)
}

// ────────────────────────────────────────────────────────────────────
// 건축물대장 (Building Registry) — 일반/집합/총괄 통합 모사
// ────────────────────────────────────────────────────────────────────
export interface BuildingRegistry {
  approvalDate: string             // 사용승인일 (YYYY-MM-DD)
  approvalNumber: string           // 사용승인번호
  mainUse: string                  // 주용도
  detailUse: string                // 세부용도
  bcr: number                      // 건폐율 (%)
  far: number                      // 용적률 (%)
  totalFloors: number              // 지상층수
  basement: number                 // 지하층수
  households: number               // 세대수
  rooms: number                    // 호수 (다중주택)
  parkingSpaces: number            // 주차대수
  parkingRequired: number          // 법정 주차대수
  energyGrade: '1+++' | '1++' | '1+' | '1' | '2' | '3' | '4' | '5' | '미평가'
  hasElevator: boolean
  hasFireSafety: boolean           // 소방 점검 적합
  illegalExpansion: boolean        // 위반 건축물 (불법 증축 등)
  illegalNote?: string             // 위반 내용
}

// ────────────────────────────────────────────────────────────────────
// 토지이용계획 (Land Use Plan) — 토지이용계획확인원 모사
// ────────────────────────────────────────────────────────────────────
export interface LandUsePlan {
  primaryZone: Zoning              // 용도지역 (Parcel.zoning과 동일)
  secondaryZones: string[]         // 용도지구 (방화지구, 미관지구 등)
  districts: string[]              // 용도구역 (개발제한, 도시자연공원 등)
  planningRestrictions: string[]   // 도시계획시설 저촉 사항
  buildPermitRestrictions: string[]// 건축 가능/제한 사항
  designatedPlan: string           // 지정된 정비계획 (있다면)
  altitudeRestriction?: number     // 고도지구 (m)
  notedItems: string[]             // 기타 사항
}

// ────────────────────────────────────────────────────────────────────
// 메인 Parcel 인터페이스
// ────────────────────────────────────────────────────────────────────
export interface Parcel {
  id: string
  jibun: string                    // 지번 (예: "138-1")
  fullJibun: string                // 전체 지번 (예: "종로구 구기동 138-1")
  roadAddr: string                 // 도로명주소
  areaM2: number                   // 토지면적 (m²)
  bldgAreaM2: number               // 연면적 (m²)
  bldgType: BuildingType
  structure: Structure
  floors: number                   // 지상층 수 (나대지=0)
  buildYear: number                // 사용승인연도
  zoning: Zoning
  shape: Shape
  roadAccess: RoadAccess
  pricePerM2: number               // 개별공시지가 (원/m²)
  poly: Array<[number, number]>    // 정규화 좌표 (SVG viewBox 0..100)
  recentSale?: { price: number; year: number; type?: string }  // 만원 단위

  // 3대 대장 통합
  landRegistry: LandRegistry
  buildingRegistry: BuildingRegistry | null    // 나대지면 null
  landUsePlan: LandUsePlan
}

// 도로조건별 보정계수
export const ROAD_FACTOR: Record<RoadAccess, number> = {
  '광대로한면': 1.20, '중로한면': 1.10, '소로한면': 1.00,
  '세로(가)': 0.92, '세로(불)': 0.85, '맹지': 0.65,
}

// 형상별 보정계수
export const SHAPE_FACTOR: Record<Shape, number> = {
  '정형': 1.00, '가장형': 1.05, '부정형': 0.92, '자루형': 0.78,
}

// 용도지역별 가치 가중
export const ZONING_FACTOR: Record<Zoning, number> = {
  '제1종전용주거지역': 0.85,
  '제1종일반주거지역': 1.00,
  '제2종일반주거지역': 1.18,
  '준주거지역':        1.35,
}

// 구조별 신축 단가 (원/m², 2026년 기준)
export const STRUCTURE_NEW_COST: Record<Structure, number> = {
  '철근콘크리트': 2_400_000, '벽돌조': 1_500_000, '시멘트블럭': 1_200_000,
  '목조': 900_000, '경량철골': 1_400_000, '없음': 0,
}

// 구조별 내용연수 (年)
export const STRUCTURE_LIFETIME: Record<Structure, number> = {
  '철근콘크리트': 50, '벽돌조': 40, '시멘트블럭': 30,
  '목조': 25, '경량철골': 30, '없음': 1,
}

// ────────────────────────────────────────────────────────────────────
// 헬퍼: 토지/건축물대장 시뮬레이션 생성기
// ────────────────────────────────────────────────────────────────────
const SAMPLE_OWNERS = ['김O수', '박O호', '이O자', '최O식', '정O희', '조O민', '강O철', '윤O경', '장O영', '임O수']
const SAMPLE_ADDRS = [
  '서울특별시 종로구 구기동 OOO-O',
  '서울특별시 종로구 평창동 OOO-O',
  '경기도 고양시 덕양구 OO동 OOO',
  '서울특별시 강남구 OO동 OOO-O',
]

function genLandRegistry(p: { id: string; pricePerM2: number; jibun: string; buildYear: number; areaM2: number }): LandRegistry {
  const seed = parseInt(p.id.slice(1)) || 1
  const owner = SAMPLE_OWNERS[seed % SAMPLE_OWNERS.length]
  const acquireYear = p.buildYear > 0 ? Math.max(p.buildYear - 2, 1980) : 2010
  const reasons: LandRegistry['acquireReason'][] = ['매매','상속','증여','매매','신축','경매']
  // 공시지가 5년 추이 (3~5%/년 상승)
  const history: { year: number; pricePerM2: number }[] = []
  for (let i = 4; i >= 0; i--) {
    const yr = 2022 + (4 - i)
    const growth = Math.pow(1.045, 4 - i)
    history.push({ year: yr, pricePerM2: Math.round(p.pricePerM2 / growth) })
  }
  history.push({ year: 2026, pricePerM2: p.pricePerM2 })
  return {
    owner,
    ownerType: '개인',
    ownerAddr: SAMPLE_ADDRS[seed % SAMPLE_ADDRS.length],
    acquireDate: `${acquireYear}-${String((seed%12)+1).padStart(2,'0')}-${String((seed%28)+1).padStart(2,'0')}`,
    acquireReason: reasons[seed % reasons.length],
    jimok: '대',
    shareType: seed % 7 === 0 ? '공유' : '단독소유',
    shareRatio: seed % 7 === 0 ? '1/2' : undefined,
    noticedPriceHistory: history,
    registrationNumber: `종로${String(2020 + seed % 6)}-제${String(10000 + seed * 137).padStart(5,'0')}호`,
  }
}

function genBuildingRegistry(p: { id: string; bldgType: BuildingType; structure: Structure; floors: number; buildYear: number; bldgAreaM2: number; areaM2: number }): BuildingRegistry | null {
  if (p.bldgType === '나대지') return null
  const seed = parseInt(p.id.slice(1)) || 1
  const isMultiUnit = p.bldgType === '다세대빌라' || p.bldgType === '연립주택' || p.bldgType === '아파트' || p.bldgType === '다가구주택'
  const households = isMultiUnit ? Math.max(2, Math.floor(p.bldgAreaM2 / 60)) : 1
  const bcr = Math.round((p.bldgAreaM2 / p.floors) / p.areaM2 * 100)
  const far = Math.round(p.bldgAreaM2 / p.areaM2 * 100)
  const isIllegal = seed % 11 === 0
  // 사용승인일이 30년+ 면 에너지등급 미평가, 신축이면 등급 부여
  const energyGrade: BuildingRegistry['energyGrade'] = p.buildYear >= 2010 ? (['1+', '1', '2', '3'] as const)[seed % 4] : '미평가'
  return {
    approvalDate: `${p.buildYear}-${String((seed%12)+1).padStart(2,'0')}-${String((seed%28)+1).padStart(2,'0')}`,
    approvalNumber: `종로건${p.buildYear}-${String(seed * 31).padStart(4,'0')}`,
    mainUse: p.bldgType,
    detailUse: p.bldgType === '근린생활시설' ? '소매점 + 사무소' : p.bldgType === '다가구주택' ? '다가구주택 (단독주택)' : p.bldgType,
    bcr: Math.min(bcr, 60),
    far: Math.min(far, 200),
    totalFloors: p.floors,
    basement: p.bldgType === '근린생활시설' || p.bldgType === '아파트' ? 1 : 0,
    households,
    rooms: households,
    parkingSpaces: Math.floor(households * 0.7),
    parkingRequired: households,
    energyGrade,
    hasElevator: p.floors >= 5,
    hasFireSafety: !isIllegal,
    illegalExpansion: isIllegal,
    illegalNote: isIllegal ? '옥상 무단증축 (조경 면적 일부)' : undefined,
  }
}

function genLandUsePlan(p: { zoning: Zoning; id: string; roadAccess: RoadAccess }): LandUsePlan {
  const seed = parseInt(p.id.slice(1)) || 1
  const secondary: string[] = []
  const districts: string[] = []
  const restrictions: string[] = []

  // 구기동 일대는 미관지구·고도지구 다수
  if (seed % 3 === 0) secondary.push('미관지구 (일반미관지구)')
  if (seed % 4 === 0) districts.push('고도지구 (5층 이하)')
  if (p.zoning === '준주거지역') secondary.push('상업지역 인접')
  if (seed % 5 === 0) secondary.push('방화지구')

  // 도시계획시설 저촉
  if (seed % 6 === 0) restrictions.push('도시계획도로 (소로3류) 저촉 — 폭 6m 후퇴선 적용')
  if (seed % 9 === 0) restrictions.push('공원녹지 계획 일부 저촉')

  const permitRestrictions: string[] = []
  if (p.zoning === '제1종전용주거지역') permitRestrictions.push('단독주택만 허가 (공동주택 불가)')
  if (p.zoning === '제1종일반주거지역') permitRestrictions.push('연립·다세대 4층 이하 허가')
  if (p.roadAccess === '맹지') permitRestrictions.push('맹지 — 건축허가 제한 (도로 확보 시 가능)')

  return {
    primaryZone: p.zoning,
    secondaryZones: secondary,
    districts,
    planningRestrictions: restrictions,
    buildPermitRestrictions: permitRestrictions,
    designatedPlan: '구기2지구 재개발정비사업 (정비계획 입안 단계, 2026)',
    altitudeRestriction: seed % 4 === 0 ? 25 : undefined,
    notedItems: seed % 8 === 0 ? ['문화재 보존영향 검토구역 인접'] : [],
  }
}

// ────────────────────────────────────────────────────────────────────
// 불규칙 폴리곤 생성: 직사각형을 5~6각형 부정형으로 변형
// 실제 한국 지적도의 필지는 직사각형이 거의 없고 사다리꼴·오각형이 흔함
// ────────────────────────────────────────────────────────────────────
function irregular(rect: [number,number][], seed: number): [number, number][] {
  // 직사각형 4점 → 5~6점 부정형으로 변형
  const [a, b, c, d] = rect
  const jitter = (i: number) => ((seed * 31 + i * 7) % 7 - 3) * 0.15  // ±0.45
  const result: [number, number][] = []

  // 1번 꼭지점
  result.push([a[0] + jitter(0), a[1] + jitter(1)])
  // 변 a→b 중간점 (5각형 만들기) — 50%는 추가, 50%는 스킵
  if (seed % 2 === 0) {
    result.push([(a[0]+b[0])/2 + jitter(2), Math.min(a[1], b[1]) + jitter(3) - 0.3])
  }
  // 2번 꼭지점
  result.push([b[0] + jitter(4), b[1] + jitter(5)])
  // 3번 꼭지점
  result.push([c[0] + jitter(6), c[1] + jitter(7)])
  // 변 c→d 중간점 (또 5각형) — 짝수면 추가
  if (seed % 3 === 0) {
    result.push([(c[0]+d[0])/2 + jitter(8), Math.max(c[1], d[1]) + jitter(9) + 0.3])
  }
  // 4번 꼭지점
  result.push([d[0] + jitter(10), d[1] + jitter(11)])

  return result
}

// ────────────────────────────────────────────────────────────────────
// 원본 직사각형 데이터 → 불규칙 형태로 변환 + 3대 대장 자동 생성
// ────────────────────────────────────────────────────────────────────
interface RawParcel {
  id: string; jibun: string; roadAddr: string; areaM2: number; bldgAreaM2: number
  bldgType: BuildingType; structure: Structure; floors: number; buildYear: number
  zoning: Zoning; shape: Shape; roadAccess: RoadAccess; pricePerM2: number
  rect: [number,number][]
  recentSale?: { price: number; year: number }
}

const RAW: RawParcel[] = [
  // ── 1구역 ─────────────────────────────────────────────────────────
  { id:'P001', jibun:'138-1',  roadAddr:'진흥로 121', areaM2:198, bldgAreaM2:142, bldgType:'단독주택',     structure:'벽돌조',     floors:2, buildYear:1981, zoning:'제1종일반주거지역', shape:'정형',   roadAccess:'소로한면',  pricePerM2:6_850_000, rect:[[12,8],[24,8],[24,18],[12,18]],  recentSale:{price:84_000,year:2024} },
  { id:'P002', jibun:'138-3',  roadAddr:'진흥로 123', areaM2:165, bldgAreaM2:118, bldgType:'단독주택',     structure:'벽돌조',     floors:2, buildYear:1978, zoning:'제1종일반주거지역', shape:'정형',   roadAccess:'소로한면',  pricePerM2:6_720_000, rect:[[24,8],[35,8],[35,18],[24,18]] },
  { id:'P003', jibun:'138-5',  roadAddr:'진흥로 125', areaM2:212, bldgAreaM2:168, bldgType:'다가구주택',   structure:'벽돌조',     floors:3, buildYear:1985, zoning:'제1종일반주거지역', shape:'정형',   roadAccess:'소로한면',  pricePerM2:6_900_000, rect:[[35,8],[48,8],[48,18],[35,18]], recentSale:{price:175_000,year:2025} },
  { id:'P004', jibun:'138-7',  roadAddr:'진흥로 127', areaM2:89,  bldgAreaM2:245, bldgType:'다세대빌라',   structure:'철근콘크리트', floors:4, buildYear:2003, zoning:'제1종일반주거지역', shape:'정형',   roadAccess:'소로한면',  pricePerM2:6_980_000, rect:[[48,8],[58,8],[58,18],[48,18]], recentSale:{price:56_000,year:2025} },
  { id:'P005', jibun:'138-9',  roadAddr:'진흥로 129', areaM2:145, bldgAreaM2:118, bldgType:'근린생활시설', structure:'시멘트블럭', floors:2, buildYear:1972, zoning:'제1종일반주거지역', shape:'부정형', roadAccess:'세로(가)',  pricePerM2:6_350_000, rect:[[58,8],[68,8],[68,18],[58,18]] },
  { id:'P006', jibun:'138-11', roadAddr:'진흥로 131', areaM2:178, bldgAreaM2:134, bldgType:'단독주택',     structure:'벽돌조',     floors:1, buildYear:1969, zoning:'제1종일반주거지역', shape:'자루형', roadAccess:'맹지',      pricePerM2:5_420_000, rect:[[68,8],[80,8],[80,18],[68,18]] },
  // ── 2구역 ─────────────────────────────────────────────────────────
  { id:'P007', jibun:'140-1',  roadAddr:'진흥로 130', areaM2:231, bldgAreaM2:168, bldgType:'단독주택',     structure:'벽돌조',     floors:2, buildYear:1983, zoning:'제1종일반주거지역', shape:'정형',   roadAccess:'중로한면',  pricePerM2:7_120_000, rect:[[10,20],[22,20],[22,30],[10,30]], recentSale:{price:198_000,year:2024} },
  { id:'P008', jibun:'140-3',  roadAddr:'진흥로 132', areaM2:76,  bldgAreaM2:198, bldgType:'다세대빌라',   structure:'철근콘크리트', floors:4, buildYear:1998, zoning:'제1종일반주거지역', shape:'정형',   roadAccess:'소로한면',  pricePerM2:7_080_000, rect:[[22,20],[33,20],[33,30],[22,30]], recentSale:{price:47_000,year:2025} },
  { id:'P009', jibun:'140-5',  roadAddr:'진흥로 134', areaM2:145, bldgAreaM2:112, bldgType:'단독주택',     structure:'시멘트블럭', floors:2, buildYear:1975, zoning:'제1종일반주거지역', shape:'부정형', roadAccess:'소로한면',  pricePerM2:6_580_000, rect:[[33,20],[44,20],[44,30],[33,30]] },
  { id:'P010', jibun:'140-7',  roadAddr:'진흥로 136', areaM2:258, bldgAreaM2:312, bldgType:'다가구주택',   structure:'철근콘크리트', floors:4, buildYear:1995, zoning:'제2종일반주거지역', shape:'정형',   roadAccess:'중로한면',  pricePerM2:7_650_000, rect:[[44,20],[58,20],[58,30],[44,30]], recentSale:{price:318_000,year:2024} },
  { id:'P011', jibun:'140-9',  roadAddr:'진흥로 138', areaM2:132, bldgAreaM2:102, bldgType:'단독주택',     structure:'벽돌조',     floors:2, buildYear:1980, zoning:'제2종일반주거지역', shape:'정형',   roadAccess:'소로한면',  pricePerM2:7_240_000, rect:[[58,20],[68,20],[68,30],[58,30]] },
  { id:'P012', jibun:'140-11', roadAddr:'진흥로 140', areaM2:89,  bldgAreaM2:215, bldgType:'다세대빌라',   structure:'철근콘크리트', floors:4, buildYear:2008, zoning:'제2종일반주거지역', shape:'정형',   roadAccess:'소로한면',  pricePerM2:7_320_000, rect:[[68,20],[78,20],[78,30],[68,30]], recentSale:{price:64_000,year:2026} },
  // ── 3구역 ─────────────────────────────────────────────────────────
  { id:'P013', jibun:'142-1',  roadAddr:'진흥로 141', areaM2:312, bldgAreaM2:480, bldgType:'근린생활시설', structure:'철근콘크리트', floors:5, buildYear:1992, zoning:'준주거지역',         shape:'정형',   roadAccess:'광대로한면',pricePerM2:9_120_000, rect:[[8,32],[24,32],[24,42],[8,42]], recentSale:{price:580_000,year:2024} },
  { id:'P014', jibun:'142-3',  roadAddr:'진흥로 143', areaM2:198, bldgAreaM2:156, bldgType:'단독주택',     structure:'벽돌조',     floors:2, buildYear:1979, zoning:'제2종일반주거지역', shape:'정형',   roadAccess:'소로한면',  pricePerM2:7_180_000, rect:[[24,32],[36,32],[36,42],[24,42]] },
  { id:'P015', jibun:'142-5',  roadAddr:'진흥로 145', areaM2:165, bldgAreaM2:132, bldgType:'단독주택',     structure:'벽돌조',     floors:2, buildYear:1974, zoning:'제2종일반주거지역', shape:'정형',   roadAccess:'세로(가)',  pricePerM2:6_890_000, rect:[[36,32],[48,32],[48,42],[36,42]] },
  { id:'P016', jibun:'142-7',  roadAddr:'진흥로 147', areaM2:145, bldgAreaM2:320, bldgType:'다세대빌라',   structure:'철근콘크리트', floors:4, buildYear:2001, zoning:'제2종일반주거지역', shape:'정형',   roadAccess:'소로한면',  pricePerM2:7_280_000, rect:[[48,32],[60,32],[60,42],[48,42]], recentSale:{price:72_000,year:2025} },
  { id:'P017', jibun:'142-9',  roadAddr:'진흥로 149', areaM2:88,  bldgAreaM2:0,   bldgType:'나대지',       structure:'없음',       floors:0, buildYear:0,    zoning:'제2종일반주거지역', shape:'부정형', roadAccess:'맹지',      pricePerM2:5_980_000, rect:[[60,32],[70,32],[70,42],[60,42]] },
  { id:'P018', jibun:'142-11', roadAddr:'진흥로 151', areaM2:268, bldgAreaM2:412, bldgType:'다가구주택',   structure:'철근콘크리트', floors:4, buildYear:1989, zoning:'제2종일반주거지역', shape:'정형',   roadAccess:'중로한면',  pricePerM2:7_620_000, rect:[[70,32],[84,32],[84,42],[70,42]], recentSale:{price:285_000,year:2024} },
  // ── 4구역 ─────────────────────────────────────────────────────────
  { id:'P019', jibun:'144-1',  roadAddr:'진흥로 152', areaM2:178, bldgAreaM2:134, bldgType:'단독주택',     structure:'벽돌조',     floors:2, buildYear:1976, zoning:'제1종일반주거지역', shape:'정형',   roadAccess:'소로한면',  pricePerM2:6_780_000, rect:[[10,44],[24,44],[24,54],[10,54]] },
  { id:'P020', jibun:'144-3',  roadAddr:'진흥로 154', areaM2:92,  bldgAreaM2:234, bldgType:'다세대빌라',   structure:'철근콘크리트', floors:4, buildYear:2015, zoning:'제1종일반주거지역', shape:'정형',   roadAccess:'소로한면',  pricePerM2:7_180_000, rect:[[24,44],[34,44],[34,54],[24,54]], recentSale:{price:58_000,year:2026} },
  { id:'P021', jibun:'144-5',  roadAddr:'진흥로 156', areaM2:156, bldgAreaM2:124, bldgType:'단독주택',     structure:'벽돌조',     floors:2, buildYear:1982, zoning:'제1종일반주거지역', shape:'부정형', roadAccess:'세로(가)',  pricePerM2:6_540_000, rect:[[34,44],[46,44],[46,54],[34,54]] },
  { id:'P022', jibun:'144-7',  roadAddr:'진흥로 158', areaM2:215, bldgAreaM2:168, bldgType:'다가구주택',   structure:'벽돌조',     floors:3, buildYear:1988, zoning:'제1종일반주거지역', shape:'정형',   roadAccess:'소로한면',  pricePerM2:6_920_000, rect:[[46,44],[60,44],[60,54],[46,54]], recentSale:{price:198_000,year:2025} },
  { id:'P023', jibun:'144-9',  roadAddr:'진흥로 160', areaM2:132, bldgAreaM2:105, bldgType:'단독주택',     structure:'시멘트블럭', floors:1, buildYear:1968, zoning:'제1종일반주거지역', shape:'자루형', roadAccess:'맹지',      pricePerM2:5_480_000, rect:[[60,44],[72,44],[72,54],[60,54]] },
  { id:'P024', jibun:'144-11', roadAddr:'진흥로 162', areaM2:198, bldgAreaM2:152, bldgType:'단독주택',     structure:'벽돌조',     floors:2, buildYear:1984, zoning:'제1종일반주거지역', shape:'정형',   roadAccess:'소로한면',  pricePerM2:6_810_000, rect:[[72,44],[84,44],[84,54],[72,54]] },
  // ── 5구역 ─────────────────────────────────────────────────────────
  { id:'P025', jibun:'148-1',  roadAddr:'진흥로 163', areaM2:245, bldgAreaM2:188, bldgType:'단독주택',     structure:'벽돌조',     floors:2, buildYear:1986, zoning:'제1종일반주거지역', shape:'정형',   roadAccess:'중로한면',  pricePerM2:7_080_000, rect:[[12,56],[26,56],[26,66],[12,66]], recentSale:{price:215_000,year:2025} },
  { id:'P026', jibun:'148-3',  roadAddr:'진흥로 165', areaM2:167, bldgAreaM2:132, bldgType:'단독주택',     structure:'벽돌조',     floors:2, buildYear:1980, zoning:'제1종일반주거지역', shape:'정형',   roadAccess:'소로한면',  pricePerM2:6_790_000, rect:[[26,56],[38,56],[38,66],[26,66]] },
  { id:'P027', jibun:'148-5',  roadAddr:'진흥로 167', areaM2:145, bldgAreaM2:285, bldgType:'연립주택',     structure:'철근콘크리트', floors:4, buildYear:1996, zoning:'제1종일반주거지역', shape:'정형',   roadAccess:'소로한면',  pricePerM2:6_980_000, rect:[[38,56],[50,56],[50,66],[38,66]], recentSale:{price:89_000,year:2024} },
  { id:'P028', jibun:'148-7',  roadAddr:'진흥로 169', areaM2:178, bldgAreaM2:138, bldgType:'단독주택',     structure:'벽돌조',     floors:2, buildYear:1977, zoning:'제1종일반주거지역', shape:'부정형', roadAccess:'세로(불)',  pricePerM2:6_280_000, rect:[[50,56],[62,56],[62,66],[50,66]] },
  { id:'P029', jibun:'148-9',  roadAddr:'진흥로 171', areaM2:102, bldgAreaM2:78,  bldgType:'단독주택',     structure:'목조',       floors:1, buildYear:1965, zoning:'제1종일반주거지역', shape:'자루형', roadAccess:'맹지',      pricePerM2:5_120_000, rect:[[62,56],[72,56],[72,66],[62,66]] },
  { id:'P030', jibun:'148-11', roadAddr:'진흥로 173', areaM2:232, bldgAreaM2:178, bldgType:'단독주택',     structure:'벽돌조',     floors:2, buildYear:1988, zoning:'제1종일반주거지역', shape:'정형',   roadAccess:'중로한면',  pricePerM2:7_180_000, rect:[[72,56],[86,56],[86,66],[72,66]], recentSale:{price:232_000,year:2026} },
]

// 최종 30필지 — 부정형 폴리곤 + 3대 대장 자동 생성
export const GUKI_PARCELS: Parcel[] = RAW.map((r) => {
  const seed = parseInt(r.id.slice(1))
  const irregularPoly = irregular(r.rect as [number,number][], seed)
  return {
    id: r.id, jibun: r.jibun,
    fullJibun: `서울특별시 종로구 구기동 ${r.jibun}`,
    roadAddr: `서울특별시 종로구 ${r.roadAddr}`,
    areaM2: r.areaM2, bldgAreaM2: r.bldgAreaM2,
    bldgType: r.bldgType, structure: r.structure,
    floors: r.floors, buildYear: r.buildYear,
    zoning: r.zoning, shape: r.shape, roadAccess: r.roadAccess,
    pricePerM2: r.pricePerM2,
    poly: irregularPoly,
    recentSale: r.recentSale,
    landRegistry: genLandRegistry(r),
    buildingRegistry: genBuildingRegistry(r),
    landUsePlan: genLandUsePlan(r),
  }
})

// ────────────────────────────────────────────────────────────────────
// SVG 정규화 좌표 → 실제 lat/lng 변환 (Leaflet 지도용)
// 사업구역 중심: 서울특별시 종로구 구기동 138-1 (37.6035, 126.9598)
// ────────────────────────────────────────────────────────────────────
const CENTER_LAT = 37.6035
const CENTER_LNG = 126.9598
const SPAN_LNG = 0.0042  // 약 370m
const SPAN_LAT = 0.0032  // 약 355m

export function svgToLatLng(x: number, y: number): [number, number] {
  const lng = CENTER_LNG + (x - 50) / 100 * SPAN_LNG
  const lat = CENTER_LAT - (y - 37.5) / 75 * SPAN_LAT
  return [lat, lng]
}

export function parcelLatLngPolygon(p: Parcel): Array<[number, number]> {
  return p.poly.map(([x, y]) => svgToLatLng(x, y))
}

export function parcelCenter(p: Parcel): [number, number] {
  // 폴리곤 무게중심 (centroid)
  let cx = 0, cy = 0
  for (const [x, y] of p.poly) { cx += x; cy += y }
  cx /= p.poly.length; cy /= p.poly.length
  return svgToLatLng(cx, cy)
}

export const MAP_CENTER: [number, number] = [CENTER_LAT, CENTER_LNG]
export const MAP_DEFAULT_ZOOM = 17

// ────────────────────────────────────────────────────────────────────
// 데이터 로더 — 향후 V-World/공공데이터포털 API 연결 시 이 함수만 교체
// ────────────────────────────────────────────────────────────────────
export async function loadParcels(): Promise<Parcel[]> {
  // TODO: 백엔드/CORS 프록시 추가 시 아래 fetch로 교체
  //   const res = await fetch(`/api/parcels?bbox=${bbox}`)
  //   return res.json()
  // 실제 API:
  //   - V-World 지적도: https://api.vworld.kr/req/wfs (cadastral WFS, key 필요)
  //   - 건축물대장: https://apis.data.go.kr/1613000/BldRgstService_v2
  //   - 토지대장: https://apis.data.go.kr/1611000/nsdi/LandRegService
  //   - 토지이용계획: https://apis.data.go.kr/1611000/nsdi/LandUseService
  return GUKI_PARCELS
}
