// 구기2지구 (138-1 일원) 필지 데이터 시뮬레이션
//
// 데이터 출처: 국가공간정보포털(NSDI) · V-World · 한국부동산원 현황분석검토의견서를
// 모사한 시뮬레이션 데이터셋. 실제 운영 시에는 아래 인터페이스를 그대로 유지한 채
// `loadParcels()` 함수만 V-World API 응답으로 교체하면 됨. (자세한 절차는 CLAUDE.md
// "API 연동" 섹션 참조)

export interface Parcel {
  id: string
  jibun: string                    // 지번 (예: "138-1")
  roadAddr: string                 // 도로명주소
  areaM2: number                   // 토지면적 (m²)
  bldgAreaM2: number               // 연면적 (m²)
  bldgType: '단독주택' | '다가구주택' | '다세대빌라' | '연립주택' | '아파트' | '근린생활시설' | '나대지'
  structure: '철근콘크리트' | '벽돌조' | '시멘트블럭' | '목조' | '경량철골' | '없음'
  floors: number                   // 지상층 수 (나대지=0)
  buildYear: number                // 사용승인연도
  zoning: '제1종전용주거지역' | '제1종일반주거지역' | '제2종일반주거지역' | '준주거지역'
  shape: '정형' | '가장형' | '부정형' | '자루형'
  roadAccess: '광대로한면' | '중로한면' | '소로한면' | '세로(가)' | '세로(불)' | '맹지'
  pricePerM2: number               // 개별공시지가 (원/m²)
  // SVG polygon 좌표 (viewBox 0..100 기준)
  poly: Array<[number, number]>
  // 실거래가 마커 (있으면 표시)
  recentSale?: { price: number; year: number }  // 만원 단위
}

// 도로조건별 보정계수
export const ROAD_FACTOR: Record<Parcel['roadAccess'], number> = {
  '광대로한면': 1.20,
  '중로한면':   1.10,
  '소로한면':   1.00,
  '세로(가)':   0.92,
  '세로(불)':   0.85,
  '맹지':       0.65,
}

// 형상별 보정계수
export const SHAPE_FACTOR: Record<Parcel['shape'], number> = {
  '정형':   1.00,
  '가장형': 1.05,
  '부정형': 0.92,
  '자루형': 0.78,
}

// 용도지역별 가치 가중 (재개발 후 기대수익에 영향)
export const ZONING_FACTOR: Record<Parcel['zoning'], number> = {
  '제1종전용주거지역': 0.85,
  '제1종일반주거지역': 1.00,
  '제2종일반주거지역': 1.18,
  '준주거지역':        1.35,
}

// 구조별 신축 단가 (원/m², 2026년 기준)
export const STRUCTURE_NEW_COST: Record<Parcel['structure'], number> = {
  '철근콘크리트': 2_400_000,
  '벽돌조':       1_500_000,
  '시멘트블럭':   1_200_000,
  '목조':           900_000,
  '경량철골':     1_400_000,
  '없음':                 0,
}

// 구조별 내용연수 (年)
export const STRUCTURE_LIFETIME: Record<Parcel['structure'], number> = {
  '철근콘크리트': 50,
  '벽돌조':       40,
  '시멘트블럭':   30,
  '목조':         25,
  '경량철골':     30,
  '없음':          1,
}

// ────────────────────────────────────────────────────────────────────
// 구기2지구 시뮬레이션 필지 (총 30필지 — 실제 179필지의 대표 샘플)
// 좌표는 SVG viewBox 0..100 기준의 정규화 좌표
// ────────────────────────────────────────────────────────────────────
export const GUKI_PARCELS: Parcel[] = [
  // ── 1구역 (북측, 노후 단독주택 밀집) ──────────────────────────────
  { id: 'P001', jibun: '138-1',  roadAddr: '진흥로 121', areaM2: 198, bldgAreaM2: 142, bldgType: '단독주택',  structure: '벽돌조',     floors: 2, buildYear: 1981, zoning: '제1종일반주거지역', shape: '정형',   roadAccess: '소로한면', pricePerM2: 6_850_000, poly: [[12,8],[24,8],[24,18],[12,18]],  recentSale: { price: 84_000, year: 2024 } },
  { id: 'P002', jibun: '138-3',  roadAddr: '진흥로 123', areaM2: 165, bldgAreaM2: 118, bldgType: '단독주택',  structure: '벽돌조',     floors: 2, buildYear: 1978, zoning: '제1종일반주거지역', shape: '정형',   roadAccess: '소로한면', pricePerM2: 6_720_000, poly: [[24,8],[35,8],[35,18],[24,18]] },
  { id: 'P003', jibun: '138-5',  roadAddr: '진흥로 125', areaM2: 212, bldgAreaM2: 168, bldgType: '다가구주택',structure: '벽돌조',     floors: 3, buildYear: 1985, zoning: '제1종일반주거지역', shape: '정형',   roadAccess: '소로한면', pricePerM2: 6_900_000, poly: [[35,8],[48,8],[48,18],[35,18]],  recentSale: { price: 175_000, year: 2025 } },
  { id: 'P004', jibun: '138-7',  roadAddr: '진흥로 127', areaM2: 89,  bldgAreaM2: 245, bldgType: '다세대빌라',structure: '철근콘크리트', floors: 4, buildYear: 2003, zoning: '제1종일반주거지역', shape: '정형',   roadAccess: '소로한면', pricePerM2: 6_980_000, poly: [[48,8],[58,8],[58,18],[48,18]],  recentSale: { price: 56_000, year: 2025 } },
  { id: 'P005', jibun: '138-9',  roadAddr: '진흥로 129', areaM2: 145, bldgAreaM2: 118, bldgType: '근린생활시설',structure: '시멘트블럭',floors: 2, buildYear: 1972, zoning: '제1종일반주거지역', shape: '부정형', roadAccess: '세로(가)', pricePerM2: 6_350_000, poly: [[58,8],[68,8],[68,18],[58,18]] },
  { id: 'P006', jibun: '138-11', roadAddr: '진흥로 131', areaM2: 178, bldgAreaM2: 134, bldgType: '단독주택',  structure: '벽돌조',     floors: 1, buildYear: 1969, zoning: '제1종일반주거지역', shape: '자루형', roadAccess: '맹지',     pricePerM2: 5_420_000, poly: [[68,8],[80,8],[80,18],[68,18]] },

  // ── 2구역 (중앙, 다세대 혼재) ─────────────────────────────────────
  { id: 'P007', jibun: '140-1',  roadAddr: '진흥로 130', areaM2: 231, bldgAreaM2: 168, bldgType: '단독주택',  structure: '벽돌조',     floors: 2, buildYear: 1983, zoning: '제1종일반주거지역', shape: '정형',   roadAccess: '중로한면', pricePerM2: 7_120_000, poly: [[10,20],[22,20],[22,30],[10,30]], recentSale: { price: 198_000, year: 2024 } },
  { id: 'P008', jibun: '140-3',  roadAddr: '진흥로 132', areaM2: 76,  bldgAreaM2: 198, bldgType: '다세대빌라',structure: '철근콘크리트', floors: 4, buildYear: 1998, zoning: '제1종일반주거지역', shape: '정형',   roadAccess: '소로한면', pricePerM2: 7_080_000, poly: [[22,20],[33,20],[33,30],[22,30]], recentSale: { price: 47_000, year: 2025 } },
  { id: 'P009', jibun: '140-5',  roadAddr: '진흥로 134', areaM2: 145, bldgAreaM2: 112, bldgType: '단독주택',  structure: '시멘트블럭', floors: 2, buildYear: 1975, zoning: '제1종일반주거지역', shape: '부정형', roadAccess: '소로한면', pricePerM2: 6_580_000, poly: [[33,20],[44,20],[44,30],[33,30]] },
  { id: 'P010', jibun: '140-7',  roadAddr: '진흥로 136', areaM2: 258, bldgAreaM2: 312, bldgType: '다가구주택',structure: '철근콘크리트', floors: 4, buildYear: 1995, zoning: '제2종일반주거지역', shape: '정형',   roadAccess: '중로한면', pricePerM2: 7_650_000, poly: [[44,20],[58,20],[58,30],[44,30]], recentSale: { price: 318_000, year: 2024 } },
  { id: 'P011', jibun: '140-9',  roadAddr: '진흥로 138', areaM2: 132, bldgAreaM2: 102, bldgType: '단독주택',  structure: '벽돌조',     floors: 2, buildYear: 1980, zoning: '제2종일반주거지역', shape: '정형',   roadAccess: '소로한면', pricePerM2: 7_240_000, poly: [[58,20],[68,20],[68,30],[58,30]] },
  { id: 'P012', jibun: '140-11', roadAddr: '진흥로 140', areaM2: 89,  bldgAreaM2: 215, bldgType: '다세대빌라',structure: '철근콘크리트', floors: 4, buildYear: 2008, zoning: '제2종일반주거지역', shape: '정형',   roadAccess: '소로한면', pricePerM2: 7_320_000, poly: [[68,20],[78,20],[78,30],[68,30]], recentSale: { price: 64_000, year: 2026 } },

  // ── 3구역 (남측, 도로변 상가 + 노후 주택) ─────────────────────────
  { id: 'P013', jibun: '142-1',  roadAddr: '진흥로 141', areaM2: 312, bldgAreaM2: 480, bldgType: '근린생활시설',structure: '철근콘크리트',floors:5,buildYear: 1992, zoning: '준주거지역',         shape: '정형',   roadAccess: '광대로한면', pricePerM2: 9_120_000, poly: [[8,32],[24,32],[24,42],[8,42]],   recentSale: { price: 580_000, year: 2024 } },
  { id: 'P014', jibun: '142-3',  roadAddr: '진흥로 143', areaM2: 198, bldgAreaM2: 156, bldgType: '단독주택',  structure: '벽돌조',     floors: 2, buildYear: 1979, zoning: '제2종일반주거지역', shape: '정형',   roadAccess: '소로한면', pricePerM2: 7_180_000, poly: [[24,32],[36,32],[36,42],[24,42]] },
  { id: 'P015', jibun: '142-5',  roadAddr: '진흥로 145', areaM2: 165, bldgAreaM2: 132, bldgType: '단독주택',  structure: '벽돌조',     floors: 2, buildYear: 1974, zoning: '제2종일반주거지역', shape: '정형',   roadAccess: '세로(가)', pricePerM2: 6_890_000, poly: [[36,32],[48,32],[48,42],[36,42]] },
  { id: 'P016', jibun: '142-7',  roadAddr: '진흥로 147', areaM2: 145, bldgAreaM2: 320, bldgType: '다세대빌라',structure: '철근콘크리트', floors: 4, buildYear: 2001, zoning: '제2종일반주거지역', shape: '정형',   roadAccess: '소로한면', pricePerM2: 7_280_000, poly: [[48,32],[60,32],[60,42],[48,42]], recentSale: { price: 72_000, year: 2025 } },
  { id: 'P017', jibun: '142-9',  roadAddr: '진흥로 149', areaM2: 88,  bldgAreaM2: 0,   bldgType: '나대지',    structure: '없음',       floors: 0, buildYear: 0,    zoning: '제2종일반주거지역', shape: '부정형', roadAccess: '맹지',     pricePerM2: 5_980_000, poly: [[60,32],[70,32],[70,42],[60,42]] },
  { id: 'P018', jibun: '142-11', roadAddr: '진흥로 151', areaM2: 268, bldgAreaM2: 412, bldgType: '다가구주택',structure: '철근콘크리트', floors: 4, buildYear: 1989, zoning: '제2종일반주거지역', shape: '정형',   roadAccess: '중로한면', pricePerM2: 7_620_000, poly: [[70,32],[84,32],[84,42],[70,42]], recentSale: { price: 285_000, year: 2024 } },

  // ── 4구역 (서측, 신축 빌라 일부) ──────────────────────────────────
  { id: 'P019', jibun: '144-1',  roadAddr: '진흥로 152', areaM2: 178, bldgAreaM2: 134, bldgType: '단독주택',  structure: '벽돌조',     floors: 2, buildYear: 1976, zoning: '제1종일반주거지역', shape: '정형',   roadAccess: '소로한면', pricePerM2: 6_780_000, poly: [[10,44],[24,44],[24,54],[10,54]] },
  { id: 'P020', jibun: '144-3',  roadAddr: '진흥로 154', areaM2: 92,  bldgAreaM2: 234, bldgType: '다세대빌라',structure: '철근콘크리트', floors: 4, buildYear: 2015, zoning: '제1종일반주거지역', shape: '정형',   roadAccess: '소로한면', pricePerM2: 7_180_000, poly: [[24,44],[34,44],[34,54],[24,54]], recentSale: { price: 58_000, year: 2026 } },
  { id: 'P021', jibun: '144-5',  roadAddr: '진흥로 156', areaM2: 156, bldgAreaM2: 124, bldgType: '단독주택',  structure: '벽돌조',     floors: 2, buildYear: 1982, zoning: '제1종일반주거지역', shape: '부정형', roadAccess: '세로(가)', pricePerM2: 6_540_000, poly: [[34,44],[46,44],[46,54],[34,54]] },
  { id: 'P022', jibun: '144-7',  roadAddr: '진흥로 158', areaM2: 215, bldgAreaM2: 168, bldgType: '다가구주택',structure: '벽돌조',     floors: 3, buildYear: 1988, zoning: '제1종일반주거지역', shape: '정형',   roadAccess: '소로한면', pricePerM2: 6_920_000, poly: [[46,44],[60,44],[60,54],[46,54]], recentSale: { price: 198_000, year: 2025 } },
  { id: 'P023', jibun: '144-9',  roadAddr: '진흥로 160', areaM2: 132, bldgAreaM2: 105, bldgType: '단독주택',  structure: '시멘트블럭', floors: 1, buildYear: 1968, zoning: '제1종일반주거지역', shape: '자루형', roadAccess: '맹지',     pricePerM2: 5_480_000, poly: [[60,44],[72,44],[72,54],[60,54]] },
  { id: 'P024', jibun: '144-11', roadAddr: '진흥로 162', areaM2: 198, bldgAreaM2: 152, bldgType: '단독주택',  structure: '벽돌조',     floors: 2, buildYear: 1984, zoning: '제1종일반주거지역', shape: '정형',   roadAccess: '소로한면', pricePerM2: 6_810_000, poly: [[72,44],[84,44],[84,54],[72,54]] },

  // ── 5구역 (남단, 단독주택 위주) ───────────────────────────────────
  { id: 'P025', jibun: '148-1',  roadAddr: '진흥로 163', areaM2: 245, bldgAreaM2: 188, bldgType: '단독주택',  structure: '벽돌조',     floors: 2, buildYear: 1986, zoning: '제1종일반주거지역', shape: '정형',   roadAccess: '중로한면', pricePerM2: 7_080_000, poly: [[12,56],[26,56],[26,66],[12,66]],  recentSale: { price: 215_000, year: 2025 } },
  { id: 'P026', jibun: '148-3',  roadAddr: '진흥로 165', areaM2: 167, bldgAreaM2: 132, bldgType: '단독주택',  structure: '벽돌조',     floors: 2, buildYear: 1980, zoning: '제1종일반주거지역', shape: '정형',   roadAccess: '소로한면', pricePerM2: 6_790_000, poly: [[26,56],[38,56],[38,66],[26,66]] },
  { id: 'P027', jibun: '148-5',  roadAddr: '진흥로 167', areaM2: 145, bldgAreaM2: 285, bldgType: '연립주택',  structure: '철근콘크리트', floors: 4, buildYear: 1996, zoning: '제1종일반주거지역', shape: '정형',   roadAccess: '소로한면', pricePerM2: 6_980_000, poly: [[38,56],[50,56],[50,66],[38,66]], recentSale: { price: 89_000, year: 2024 } },
  { id: 'P028', jibun: '148-7',  roadAddr: '진흥로 169', areaM2: 178, bldgAreaM2: 138, bldgType: '단독주택',  structure: '벽돌조',     floors: 2, buildYear: 1977, zoning: '제1종일반주거지역', shape: '부정형', roadAccess: '세로(불)', pricePerM2: 6_280_000, poly: [[50,56],[62,56],[62,66],[50,66]] },
  { id: 'P029', jibun: '148-9',  roadAddr: '진흥로 171', areaM2: 102, bldgAreaM2: 78,  bldgType: '단독주택',  structure: '목조',       floors: 1, buildYear: 1965, zoning: '제1종일반주거지역', shape: '자루형', roadAccess: '맹지',     pricePerM2: 5_120_000, poly: [[62,56],[72,56],[72,66],[62,66]] },
  { id: 'P030', jibun: '148-11', roadAddr: '진흥로 173', areaM2: 232, bldgAreaM2: 178, bldgType: '단독주택',  structure: '벽돌조',     floors: 2, buildYear: 1988, zoning: '제1종일반주거지역', shape: '정형',   roadAccess: '중로한면', pricePerM2: 7_180_000, poly: [[72,56],[86,56],[86,66],[72,66]], recentSale: { price: 232_000, year: 2026 } },
]

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
  const cx = (p.poly[0][0] + p.poly[2][0]) / 2
  const cy = (p.poly[0][1] + p.poly[2][1]) / 2
  return svgToLatLng(cx, cy)
}

export const MAP_CENTER: [number, number] = [CENTER_LAT, CENTER_LNG]
export const MAP_DEFAULT_ZOOM = 17

// ────────────────────────────────────────────────────────────────────
// 데이터 로더 — 향후 V-World API 연결 시 이 함수만 교체
// ────────────────────────────────────────────────────────────────────
export async function loadParcels(): Promise<Parcel[]> {
  // TODO: 백엔드/CORS 프록시 추가 시 아래 fetch로 교체
  // const res = await fetch(`/api/vworld/parcels?bbox=${bbox}`)
  // return res.json()
  return GUKI_PARCELS
}
