import type {
  AppraisalInput, AppraisalResult,
  FeasibilityInput, FeasibilityResult,
  ZoningType
} from '../types'

// 용도지역별 건폐율/용적률
export const zoningRules: Record<ZoningType, { buildingCoverage: number; floorAreaRatio: number; label: string }> = {
  exclusive_residential_1: { buildingCoverage: 50, floorAreaRatio: 100, label: '제1종전용주거지역' },
  exclusive_residential_2: { buildingCoverage: 40, floorAreaRatio: 150, label: '제2종전용주거지역' },
  general_residential_1:   { buildingCoverage: 60, floorAreaRatio: 200, label: '제1종일반주거지역' },
  general_residential_2:   { buildingCoverage: 60, floorAreaRatio: 250, label: '제2종일반주거지역' },
  general_residential_3:   { buildingCoverage: 50, floorAreaRatio: 300, label: '제3종일반주거지역' },
  semi_residential:        { buildingCoverage: 70, floorAreaRatio: 500, label: '준주거지역' },
  commercial_neighborhood: { buildingCoverage: 70, floorAreaRatio: 900, label: '근린상업지역' },
  commercial_general:      { buildingCoverage: 80, floorAreaRatio: 1300, label: '일반상업지역' },
  green_natural:           { buildingCoverage: 20, floorAreaRatio: 80, label: '자연녹지지역' },
  green_production:        { buildingCoverage: 20, floorAreaRatio: 100, label: '생산녹지지역' },
}

// 구조별 재조달원가 (원/m²) - 2025년 기준 추정
const structureCost: Record<string, number> = {
  wooden:  500000,   // 목조
  masonry: 600000,   // 조적조
  steel:   850000,   // 철골조
  rc:      950000,   // 철근콘크리트조 (RC)
  src:     1150000,  // 철골철근콘크리트조 (SRC)
}

// 내용연수 (년) - 감가상각용
const usefulLife: Record<string, number> = {
  wooden: 30,
  masonry: 40,
  steel: 40,
  rc: 50,
  src: 60,
}

/**
 * 감정평가 계산
 * 기준: 「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제70조~제79조
 */
export function calculateAppraisal(input: AppraisalInput): AppraisalResult {
  const currentYear = new Date().getFullYear()

  // 1. 토지 보상가 계산
  // 토지보상가 = 공시지가 × 지역요인 × 개별요인 × 면적
  const landCompensation = Math.round(
    input.publicLandPrice * input.locationFactor * input.individualFactor * input.landArea
  )

  // 2. 건물 보상가 계산
  // 재조달원가 산정
  const rawCost = structureCost[input.buildingType] || structureCost.rc
  const life = usefulLife[input.buildingType] || usefulLife.rc
  const buildingAge = currentYear - input.buildingYear

  // 잔존가치율 = 1 - (경과년수 / 내용연수) × 0.9 (최저 10%)
  const remainingRatio = Math.max(0.1, 1 - (buildingAge / life) * 0.9)
  const buildingCompensation = Math.round(rawCost * remainingRatio * input.buildingArea)

  // 3. 영업손실 보상 (휴업보상)
  // 기준: 연간 영업이익의 4개월분 (최소 3개월, 최대 2년)
  let businessLossCompensation = 0
  if (input.hasBusinessLoss && input.businessMonthlyRevenue) {
    businessLossCompensation = Math.round(input.businessMonthlyRevenue * 4)
  }

  // 4. 이주비 산정 (토지보상법 시행규칙 제53조·제54조)
  // 이주정착금: 주거용 건축물 평가액의 30%, 최저 600만 / 최고 1,200만원
  // 주거이전비(소유자): 도시근로자 가계지출 2개월분 (2025년 4인 기준 약 528만원/월 → 2개월 1,056만)
  let movingExpense = 0
  if (input.isResident) {
    const settlementBase = Math.round(buildingCompensation * 0.3)
    const settlement = Math.min(Math.max(settlementBase, 6000000), 12000000)
    const householdMoving = 10560000  // 2개월분 가계지출비 (소유자)
    movingExpense = settlement + householdMoving
  }

  // 5. 세입자 보상 (토지보상법 시행규칙 제54조 제2항)
  // 주거용 세입자: 도시근로자 가계지출 4개월분 (약 528만 × 4 = 2,112만)
  const tenantCompensation = Math.round(input.tenantCount * 21120000)

  const totalCompensation = landCompensation + buildingCompensation +
    businessLossCompensation + movingExpense + tenantCompensation

  const breakdown = [
    {
      label: '토지 보상액',
      amount: landCompensation,
      basis: `공시지가(${input.publicLandPrice.toLocaleString()}원/m²) × 지역요인(${input.locationFactor}) × 개별요인(${input.individualFactor}) × ${input.landArea}m²`,
    },
    {
      label: '건물 보상액',
      amount: buildingCompensation,
      basis: `재조달원가(${rawCost.toLocaleString()}원/m²) × 잔존가치율(${(remainingRatio * 100).toFixed(1)}%) × ${input.buildingArea}m²`,
    },
    {
      label: '영업손실 보상',
      amount: businessLossCompensation,
      basis: input.hasBusinessLoss ? `월 영업이익(${input.businessMonthlyRevenue?.toLocaleString()}원) × 4개월` : '해당 없음',
    },
    {
      label: '이주비 (이주정착금 + 주거이전비)',
      amount: movingExpense,
      basis: input.isResident ? '건물보상액 × 30% + 주거이전비' : '해당 없음',
    },
    {
      label: '세입자 보상',
      amount: tenantCompensation,
      basis: `세입자 ${input.tenantCount}가구 × (이주정착금 + 주거이전비)`,
    },
  ]

  return {
    landCompensation,
    buildingCompensation,
    businessLossCompensation,
    movingExpense,
    tenantCompensation,
    totalCompensation,
    breakdown,
  }
}

/**
 * 사업성 분석 계산
 * 핵심 지표: 비례율, 분담금, 수익률
 *
 * 비례율 = (종후자산가치 - 총사업비) / 종전자산가치 × 100
 * 분담금 = (조합원 분양가) - (종전자산가치 × 비례율)
 */
export function calculateFeasibility(input: FeasibilityInput): FeasibilityResult {
  // 총 분양수입
  const totalSaleRevenue = Math.round(input.expectedSalePrice * input.totalSaleArea)
  const rentalIncome = input.rentalIncome || 0
  const additionalCosts = input.additionalCosts || 0

  // 종후자산가치 = 분양수입 + 임대수입
  const postAssetValue = totalSaleRevenue + rentalIncome

  // 실제 총사업비 (추가비용 포함)
  const totalCost = input.totalProjectCost + additionalCosts

  // 비례율 (%)
  const proportionalRate = ((postAssetValue - totalCost) / input.totalBefore) * 100

  // 순이익
  const netProfit = postAssetValue - totalCost

  // 수익률 (%)
  const profitRate = (netProfit / totalCost) * 100

  // 조합원 1인당 평균 분담금
  // 분담금 = 조합원 분양가 - 권리가액(평균 종전자산 × 비례율)
  const memberCount = input.memberCount > 0 ? input.memberCount : 1
  const avgBeforeAsset = input.totalBefore / memberCount
  const avgSalePrice = input.expectedSalePrice * input.avgUnitArea
  const avgAdditionalCost = avgSalePrice - (avgBeforeAsset * proportionalRate / 100)

  // 손익분기 분양가 비율: 비례율이 100%에 도달하기 위해 현재 분양가가 차지해야 할 비율
  // 100% 비례율 ⇔ 종후자산 = 총사업비 + 종전자산
  const requiredRevenue = totalCost + input.totalBefore - rentalIncome
  const breakEvenRate = totalSaleRevenue > 0
    ? (requiredRevenue / totalSaleRevenue) * 100
    : 0

  return {
    proportionalRate,
    postAssetValue,
    totalSaleRevenue,
    netProfit,
    profitRate,
    averageAdditionalCost: avgAdditionalCost,
    breakEvenRate,
  }
}

/**
 * 개인별 분담금 계산
 * 개인 분담금 = (개인 종전자산가치 × 비례율) - 조합원 분양가
 */
export function calculatePersonalShare(
  personalBeforeAsset: number,
  proportionalRate: number,
  memberSalePrice: number
): number {
  const adjustedAsset = personalBeforeAsset * (proportionalRate / 100)
  return memberSalePrice - adjustedAsset
}

/**
 * 동의율 계산
 */
export function calculateConsentRate(agreed: number, total: number): number {
  if (total === 0) return 0
  return (agreed / total) * 100
}

/**
 * 노후불량 건축물 비율 계산
 * 기준: 도정법 시행령 별표 1 (20년 이상 경과 또는 안전진단 D/E등급)
 */
export function calculateDecrepitRate(buildings: { buildingAge: number }[]): number {
  const currentYear = new Date().getFullYear()
  const decrepitCount = buildings.filter(b => currentYear - b.buildingAge >= 20).length
  return (decrepitCount / buildings.length) * 100
}

/**
 * 숫자 포맷 (한국식)
 */
export function formatKRW(amount: number): string {
  if (Math.abs(amount) >= 100000000) {
    const eo = amount / 100000000
    return `${eo.toFixed(1)}억원`
  }
  if (Math.abs(amount) >= 10000) {
    const man = amount / 10000
    return `${man.toFixed(0)}만원`
  }
  return `${amount.toLocaleString()}원`
}

export function formatNumber(n: number, unit = ''): string {
  return `${n.toLocaleString()}${unit}`
}

/**
 * 과소필지 기준: 서울시 조례 기준 90m² 미만
 */
export function isSmallLot(area: number): boolean {
  return area < 90
}
