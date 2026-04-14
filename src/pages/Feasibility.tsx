import { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { calculateFeasibility, calculatePersonalShare, formatKRW } from '../utils/calculations'
import type { FeasibilityInput, FeasibilityResult } from '../types'
import { TrendingUp, Info, RotateCcw, AlertCircle, CheckCircle, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppStore } from '../store'

// 구기2지구 적정안 기준값 (2025 국토교통부 단가)
const defaultInput: FeasibilityInput = {
  totalProjectCost: 763000000000,    // 7,630억 (11개 항목 표준)
  expectedSalePrice: 15151515,       // 5,000만원/평 ≈ 15,151,515원/m²
  totalSaleArea: 138072,             // 1,340세대 × 84m² × 1.226 (조+일 가중)
  totalBefore: 1200000000000,        // 12,000억 (종전자산 총가치)
  memberCount: 480,                  // 조합원수
  avgUnitArea: 84,                   // 전용 84m² (33평형)
  rentalIncome: 0,
  additionalCosts: 0,
}

export default function Feasibility() {
  const { owners } = useAppStore()
  const [input, setInput] = useState<FeasibilityInput>(defaultInput)
  const [result, setResult] = useState<FeasibilityResult | null>(null)
  const [personalBefore, setPersonalBefore] = useState(500000000)  // 5억
  const [personalSalePrice, setPersonalSalePrice] = useState(900000000) // 9억

  function handleCalc() {
    const r = calculateFeasibility(input)
    setResult(r)
    toast.success('사업성 분석이 완료되었습니다.')
  }

  const totalOwners = owners.length

  const waterfallOption = result ? {
    animation: false,
    tooltip: { trigger: 'axis', formatter: (params: { name: string; value: number[] }[]) => {
      const p = params[0]
      return `${p.name}: ${formatKRW(Math.abs(p.value[1] - p.value[0]))}`
    }},
    xAxis: {
      type: 'category',
      data: ['종전자산', '총사업비', '분양수입', '순이익'],
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v: number) => `${(v / 100000000).toFixed(0)}억`, fontSize: 10 },
    },
    series: [{
      type: 'bar',
      barMaxWidth: 60,
      itemStyle: { borderRadius: [4, 4, 0, 0] },
      data: [
        { value: [0, input.totalBefore / 100000000], itemStyle: { color: '#3b82f6' } },
        { value: [0, input.totalProjectCost / 100000000], itemStyle: { color: '#ef4444' } },
        { value: [0, result.totalSaleRevenue / 100000000], itemStyle: { color: '#22c55e' } },
        {
          value: [0, Math.abs(result.netProfit) / 100000000],
          itemStyle: { color: result.netProfit >= 0 ? '#16a34a' : '#dc2626' }
        },
      ],
      label: {
        show: true, position: 'top', fontSize: 10,
        formatter: (p: { value: number[] }) => `${((p.value[1]) / 100000000).toFixed(0)}억`,
      },
    }],
    grid: { left: 55, right: 20, top: 20, bottom: 30 },
  } : null

  const sensitivityData = result ? (() => {
    const rates = [80, 85, 90, 95, 100, 105, 110, 115, 120]
    return {
      animation: false,
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      xAxis: { type: 'category', data: rates.map(r => `${r}%`), name: '분양가 변동', axisLabel: { fontSize: 11 } },
      yAxis: [
        { type: 'value', name: '비례율(%)', axisLabel: { formatter: '{value}%', fontSize: 10 } },
        { type: 'value', name: '순이익', axisLabel: { formatter: (v: number) => `${(v/100000000).toFixed(0)}억`, fontSize: 10 } },
      ],
      series: [
        {
          name: '비례율',
          type: 'line',
          smooth: true,
          data: rates.map(r => {
            const adjusted = { ...input, expectedSalePrice: input.expectedSalePrice * r / 100 }
            return calculateFeasibility(adjusted).proportionalRate.toFixed(1)
          }),
          itemStyle: { color: '#3b82f6' },
          yAxisIndex: 0,
        },
        {
          name: '순이익',
          type: 'bar',
          barMaxWidth: 30,
          data: rates.map(r => {
            const adjusted = { ...input, expectedSalePrice: input.expectedSalePrice * r / 100 }
            const profit = calculateFeasibility(adjusted).netProfit
            return {
              value: profit / 100000000,
              itemStyle: { color: profit >= 0 ? '#22c55e' : '#ef4444' },
            }
          }),
          yAxisIndex: 1,
        },
      ],
      legend: { bottom: 0, textStyle: { fontSize: 11 } },
      grid: { left: 55, right: 55, top: 20, bottom: 35 },
    }
  })() : null

  const personalShare = result
    ? calculatePersonalShare(personalBefore, result.proportionalRate, personalSalePrice)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">사업성 분석 (비례율·분담금 시뮬레이터)</h2>
        <p className="section-subtitle">
          비례율 = (종후자산가치 – 총사업비) / 종전자산가치 × 100
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1 flex items-center gap-1.5"><Info size={15} /> 계산 공식</p>
        <ul className="space-y-0.5 text-xs text-amber-700 list-disc list-inside">
          <li>비례율 = (종후자산가치 - 총사업비) / 종전자산가치 × 100</li>
          <li>권리가액 = 종전자산가치 × 비례율 / 100</li>
          <li>개인 분담금 = 조합원 분양가 - 권리가액</li>
          <li>비례율이 100%를 초과하면 사업성이 양호하다고 판단</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 입력 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">사업비 정보</h3>
            <div className="space-y-3">
              <div>
                <label className="label flex justify-between">
                  총 사업비 (원)
                  <span className="text-xs text-gray-400">{formatKRW(input.totalProjectCost)}</span>
                </label>
                <input className="input" type="number" value={input.totalProjectCost}
                  onChange={(e) => setInput({ ...input, totalProjectCost: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="label flex justify-between">
                  추가비용 (원)
                  <span className="text-xs text-gray-400">{formatKRW(input.additionalCosts || 0)}</span>
                </label>
                <input className="input" type="number" value={input.additionalCosts || ''}
                  onChange={(e) => setInput({ ...input, additionalCosts: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="label flex justify-between">
                  종전자산 총가치 (원)
                  <span className="text-xs text-gray-400">{formatKRW(input.totalBefore)}</span>
                </label>
                <input className="input" type="number" value={input.totalBefore}
                  onChange={(e) => setInput({ ...input, totalBefore: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="label flex justify-between">
                  조합원수 (명)
                  <span className="text-xs text-gray-400">{input.memberCount.toLocaleString()}명</span>
                </label>
                <input className="input" type="number" value={input.memberCount}
                  onChange={(e) => setInput({ ...input, memberCount: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="label flex justify-between">
                  조합원 1인 평균 분양 전용면적 (m²)
                  <span className="text-xs text-gray-400">{input.avgUnitArea}m² (≈{(input.avgUnitArea / 3.3058).toFixed(0)}평)</span>
                </label>
                <input className="input" type="number" value={input.avgUnitArea}
                  onChange={(e) => setInput({ ...input, avgUnitArea: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">분양 계획</h3>
            <div className="space-y-3">
              <div>
                <label className="label flex justify-between">
                  예상 분양가 (원/m²)
                  <span className="text-xs text-gray-400">{formatKRW(input.expectedSalePrice)}/m²</span>
                </label>
                <input className="input" type="number" value={input.expectedSalePrice}
                  onChange={(e) => setInput({ ...input, expectedSalePrice: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="label flex justify-between">
                  총 분양면적 (m²)
                  <span className="text-xs text-gray-400">{input.totalSaleArea.toLocaleString()}m²</span>
                </label>
                <input className="input" type="number" value={input.totalSaleArea}
                  onChange={(e) => setInput({ ...input, totalSaleArea: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="label flex justify-between">
                  임대수입 (원, 선택)
                  <span className="text-xs text-gray-400">{formatKRW(input.rentalIncome || 0)}</span>
                </label>
                <input className="input" type="number" value={input.rentalIncome || ''}
                  onChange={(e) => setInput({ ...input, rentalIncome: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleCalc} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <TrendingUp size={16} /> 분석하기
            </button>
            <button onClick={() => { setInput(defaultInput); setResult(null) }} className="btn-secondary flex items-center gap-1.5">
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* 결과 */}
        <div className="lg:col-span-3 space-y-4">
          {result ? (
            <>
              {/* 핵심 지표 */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: '비례율',
                    value: `${result.proportionalRate.toFixed(2)}%`,
                    note: result.proportionalRate >= 100 ? '사업성 양호' : '사업성 검토 필요',
                    ok: result.proportionalRate >= 100,
                    highlight: true,
                  },
                  {
                    label: '수익률',
                    value: `${result.profitRate.toFixed(2)}%`,
                    note: result.profitRate >= 15 ? '양호' : '보통',
                    ok: result.profitRate >= 15,
                    highlight: false,
                  },
                  {
                    label: '총 분양수입',
                    value: formatKRW(result.totalSaleRevenue),
                    note: `${(result.totalSaleRevenue / 100000000).toFixed(0)}억원`,
                    ok: true, highlight: false,
                  },
                  {
                    label: '순이익',
                    value: formatKRW(Math.abs(result.netProfit)),
                    note: result.netProfit >= 0 ? '흑자' : '적자',
                    ok: result.netProfit >= 0,
                    highlight: false,
                  },
                ].map((item) => (
                  <div key={item.label} className={`card ${item.highlight ? 'ring-2 ring-primary-500 ring-offset-1' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-0.5">{item.value}</p>
                      </div>
                      {item.ok
                        ? <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                        : <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />
                      }
                    </div>
                    <p className={`text-xs mt-1 font-medium ${item.ok ? 'text-green-600' : 'text-amber-600'}`}>
                      {item.note}
                    </p>
                  </div>
                ))}
              </div>

              {/* 차트 */}
              {waterfallOption && (
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-2">사업 현금흐름</h3>
                  <ReactECharts option={waterfallOption} style={{ height: 220 }} />
                </div>
              )}

              {/* 민감도 분석 */}
              {sensitivityData && (
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-2">분양가 변동에 따른 민감도 분석</h3>
                  <ReactECharts option={sensitivityData} style={{ height: 220 }} />
                </div>
              )}

              {/* 개인 분담금 계산 */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">개인별 분담금 계산기</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="label flex justify-between">
                      나의 종전자산 (원)
                      <span className="text-xs text-gray-400">{formatKRW(personalBefore)}</span>
                    </label>
                    <input className="input" type="number" value={personalBefore}
                      onChange={(e) => setPersonalBefore(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="label flex justify-between">
                      조합원 분양가 (원)
                      <span className="text-xs text-gray-400">{formatKRW(personalSalePrice)}</span>
                    </label>
                    <input className="input" type="number" value={personalSalePrice}
                      onChange={(e) => setPersonalSalePrice(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">권리가액</span>
                    <span className="font-semibold">{formatKRW(personalBefore * result.proportionalRate / 100)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">조합원 분양가</span>
                    <span className="font-semibold">{formatKRW(personalSalePrice)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">예상 분담금</span>
                    <span className={`text-xl font-bold ${personalShare > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {personalShare > 0 ? '+' : ''}{formatKRW(personalShare)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {personalShare > 0
                      ? '분양가 > 권리가액: 추가 분담금 납부 필요'
                      : '권리가액 > 분양가: 환급 대상'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => toast.success('PDF 생성 기능은 실제 서비스에서 제공됩니다.')}
                className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
              >
                <Download size={14} /> 사업성 분석 보고서 저장
              </button>
            </>
          ) : (
            <div className="card min-h-[400px] flex flex-col items-center justify-center text-gray-400">
              <TrendingUp size={48} className="opacity-20 mb-4" />
              <p className="text-lg font-medium">좌측에 정보를 입력하고</p>
              <p className="text-lg font-medium">[분석하기] 버튼을 누르세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
