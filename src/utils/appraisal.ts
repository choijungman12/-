// 재개발 감정평가 엔진
// 근거: 「감정평가에 관한 규칙」, 「도시 및 주거환경정비법」 제13조·제74조
//
// 감정평가 3방식 중 본 프로젝트는 **공시지가기준법(토지) + 원가법(건물)** 조합 사용
// (실거래가 보정은 인근 거래사례 평균을 비교 가중치로 적용)

import {
  type Parcel,
  ROAD_FACTOR, SHAPE_FACTOR, ZONING_FACTOR,
  STRUCTURE_NEW_COST, STRUCTURE_LIFETIME,
} from '../data/gukiParcels'

const CURRENT_YEAR = 2026
const SALVAGE_RATE = 0.10            // 잔가율 (10%)
const REDEVELOP_AGE_THRESHOLD = 30   // 도정법 시행령 제8조: 준공 30년+ = 노후불량건축물 후보
const REDEVELOP_AGE_AGED = 20         // 노후 시작 기준

export interface AppraisalResult {
  // 토지 평가
  landValue: number               // 토지가액 (원)
  landAdjustments: {              // 적용 보정계수
    road: number
    shape: number
    zoning: number
    final: number                 // 최종 보정계수 (곱)
  }
  // 건물 평가
  buildingValue: number           // 건물가액 (원)
  buildingAge: number             // 경과연수 (年)
  depreciation: number            // 감가상각률 (0~1)
  // 종합
  totalValue: number              // 종합 감정평가액 (원)
  // 분담금 시뮬레이션 (전용 84㎡ 새 아파트 분양가 가정 13.5억 기준)
  shareSimulation: {
    newApartmentPrice: number     // 새 아파트 분양가 (전용 84㎡)
    yourShare: number             // 본인 분담금 = 분양가 - 평가액 (음수면 환급)
    freeShareRatio: number        // 무상지분율 = 평가액/분양가
  }
}

/** 한 필지의 감정평가액 산출 */
export function appraise(parcel: Parcel): AppraisalResult {
  // ── 1. 토지가액 ─────────────────────────────────────────────────
  const roadF = ROAD_FACTOR[parcel.roadAccess]
  const shapeF = SHAPE_FACTOR[parcel.shape]
  const zoningF = ZONING_FACTOR[parcel.zoning]
  const finalLandF = roadF * shapeF * zoningF
  const landValue = Math.round(parcel.pricePerM2 * parcel.areaM2 * finalLandF)

  // ── 2. 건물가액 (원가법) ────────────────────────────────────────
  const newCost = STRUCTURE_NEW_COST[parcel.structure]
  const lifetime = STRUCTURE_LIFETIME[parcel.structure]
  const age = parcel.buildYear > 0 ? CURRENT_YEAR - parcel.buildYear : 0
  // 정액법 감가상각: 1 - (경과연수/내용연수) × (1 - 잔가율)
  const depreciation = age > 0
    ? Math.min(1 - SALVAGE_RATE, (age / lifetime) * (1 - SALVAGE_RATE))
    : 0
  const buildingValue = Math.round(newCost * parcel.bldgAreaM2 * (1 - depreciation))

  // ── 3. 종합 평가액 ──────────────────────────────────────────────
  const totalValue = landValue + buildingValue

  // ── 4. 분담금 시뮬레이션 ────────────────────────────────────────
  // 인근 신축 아파트 시세 ≒ 평당 4,800만원 (2026 종로구 평균) × 25.71평 (84㎡) = 약 12.3억
  // 추가 사업이익 가산 → 13.5억
  const newApartmentPrice = 1_350_000_000
  const yourShare = newApartmentPrice - totalValue
  const freeShareRatio = totalValue / newApartmentPrice

  return {
    landValue,
    landAdjustments: { road: roadF, shape: shapeF, zoning: zoningF, final: finalLandF },
    buildingValue,
    buildingAge: age,
    depreciation,
    totalValue,
    shareSimulation: { newApartmentPrice, yourShare, freeShareRatio },
  }
}

// ────────────────────────────────────────────────────────────────────
// 노후도 등급 — UI 색상 매핑용
// ────────────────────────────────────────────────────────────────────
export type AgeGrade = 'new' | 'mid' | 'aged' | 'severely-aged' | 'vacant'

export function gradeAge(parcel: Parcel): AgeGrade {
  if (parcel.buildYear === 0) return 'vacant'
  const age = CURRENT_YEAR - parcel.buildYear
  if (age < 10) return 'new'
  if (age < REDEVELOP_AGE_AGED) return 'mid'
  if (age < REDEVELOP_AGE_THRESHOLD) return 'aged'
  return 'severely-aged'
}

export const AGE_GRADE_META: Record<AgeGrade, { color: string; label: string; description: string }> = {
  'new':            { color: '#22c55e', label: '신축',     description: '준공 10년 미만 (양호)' },
  'mid':            { color: '#84cc16', label: '준신축',   description: '준공 10~20년' },
  'aged':           { color: '#eab308', label: '노후',     description: '준공 20~30년 (노후 진행)' },
  'severely-aged':  { color: '#dc2626', label: '심한노후', description: '준공 30년 이상 (재개발 적격)' },
  'vacant':         { color: '#94a3b8', label: '나대지',   description: '건축물 없음' },
}

// ────────────────────────────────────────────────────────────────────
// 재개발 적격 판정 — 도정법 시행령 제8조
// ────────────────────────────────────────────────────────────────────
export function isRedevelopable(parcel: Parcel): { yes: boolean; reason: string } {
  if (parcel.buildYear === 0) return { yes: true, reason: '나대지 — 정비구역 편입 가능' }
  const age = CURRENT_YEAR - parcel.buildYear
  if (age >= REDEVELOP_AGE_THRESHOLD) {
    return { yes: true, reason: `준공 ${age}년 — 노후불량건축물 (도정법 시행령 제8조)` }
  }
  if (parcel.structure === '시멘트블럭' || parcel.structure === '목조') {
    return { yes: true, reason: '구조 등급 — 노후불량건축물 (시멘트블럭·목조)' }
  }
  if (parcel.roadAccess === '맹지') {
    return { yes: true, reason: '맹지 — 도시기능 회복 필요 필지' }
  }
  return { yes: false, reason: `준공 ${age}년 — 아직 노후 기준 미달` }
}

// ────────────────────────────────────────────────────────────────────
// 접도율 색상 매핑
// ────────────────────────────────────────────────────────────────────
export type RoadGrade = 'good' | 'fair' | 'poor' | 'blocked'

export function gradeRoad(parcel: Parcel): RoadGrade {
  switch (parcel.roadAccess) {
    case '광대로한면':
    case '중로한면':
      return 'good'
    case '소로한면':
      return 'fair'
    case '세로(가)':
    case '세로(불)':
      return 'poor'
    case '맹지':
      return 'blocked'
  }
}

export const ROAD_GRADE_META: Record<RoadGrade, { color: string; label: string }> = {
  'good':    { color: '#22c55e', label: '광대·중로 양호' },
  'fair':    { color: '#84cc16', label: '소로 보통' },
  'poor':    { color: '#eab308', label: '세로 협소' },
  'blocked': { color: '#dc2626', label: '맹지 (도로 없음)' },
}

// ────────────────────────────────────────────────────────────────────
// 다중 필지 합산
// ────────────────────────────────────────────────────────────────────
export function aggregateParcels(parcels: Parcel[]) {
  const totalAreaM2 = parcels.reduce((s, p) => s + p.areaM2, 0)
  const totalBldgM2 = parcels.reduce((s, p) => s + p.bldgAreaM2, 0)
  const totalValue = parcels.reduce((s, p) => s + appraise(p).totalValue, 0)
  const totalNotice = parcels.reduce((s, p) => s + p.pricePerM2 * p.areaM2, 0)
  return { totalAreaM2, totalAreaPyeong: totalAreaM2 / 3.3058, totalBldgM2, totalValue, totalNotice }
}

// ────────────────────────────────────────────────────────────────────
// 포맷터
// ────────────────────────────────────────────────────────────────────
export function formatKRW(amount: number): string {
  if (amount >= 1_0000_0000) {
    const eok = amount / 1_0000_0000
    return `${eok.toFixed(2)}억`
  }
  if (amount >= 1_0000) {
    return `${(amount / 1_0000).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}만`
  }
  return `${amount.toLocaleString('ko-KR')}원`
}

export function formatPyeong(m2: number): string {
  return `${(m2 / 3.3058).toFixed(2)}평`
}
