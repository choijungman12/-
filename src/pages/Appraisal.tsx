import { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { calculateAppraisal, zoningRules, formatKRW } from '../utils/calculations'
import type { AppraisalInput, AppraisalResult, ZoningType } from '../types'
import { Calculator, Info, Download, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

const buildingTypes = [
  { value: 'wooden', label: '목조' },
  { value: 'masonry', label: '조적조 (벽돌)' },
  { value: 'steel', label: '철골조' },
  { value: 'rc', label: '철근콘크리트조 (RC)' },
  { value: 'src', label: '철골철근콘크리트조 (SRC)' },
]

const defaultInput: AppraisalInput = {
  landArea: 165.3,
  publicLandPrice: 2850000,
  locationFactor: 1.05,
  individualFactor: 1.02,
  zoning: 'general_residential_1',
  buildingArea: 89.2,
  buildingYear: 1990,
  buildingType: 'rc',
  hasBusinessLoss: false,
  businessMonthlyRevenue: 0,
  tenantCount: 0,
  isResident: true,
}

export default function Appraisal() {
  const [input, setInput] = useState<AppraisalInput>(defaultInput)
  const [result, setResult] = useState<AppraisalResult | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  function handleCalc() {
    if (!input.landArea && !input.buildingArea) {
      toast.error('토지 또는 건물 면적을 입력해주세요.')
      return
    }
    const r = calculateAppraisal(input)
    setResult(r)
    setShowDetail(true)
    toast.success('감정평가 계산이 완료되었습니다.')
  }

  function handleReset() {
    setInput(defaultInput)
    setResult(null)
    setShowDetail(false)
  }

  const chartOption = result ? {
    animation: false,
    tooltip: { trigger: 'item', formatter: (p: { name: string; value: number }) => `${p.name}: ${formatKRW(p.value)}` },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      itemStyle: { borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
      label: { formatter: '{b}\n{d}%', fontSize: 11 },
      data: result.breakdown
        .filter((b) => b.amount > 0)
        .map((b, i) => ({
          value: b.amount,
          name: b.label,
          itemStyle: { color: ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'][i] },
        })),
    }],
  } : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">감정평가 계산기</h2>
        <p className="section-subtitle">
          「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제70조~79조 기준
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1 flex items-center gap-1.5"><Info size={15} /> 계산 기준 안내</p>
        <ul className="space-y-0.5 text-xs list-disc list-inside text-blue-700">
          <li>토지 보상: 공시지가 × 지역요인 × 개별요인 × 면적</li>
          <li>건물 보상: 재조달원가 × 잔존가치율 × 면적 (최저 10% 보장)</li>
          <li>이주정착금: 건물보상액의 30% (최저 600만 / 최고 1,200만원, 시행규칙 제53조)</li>
          <li>주거이전비: 가계지출비 2개월분(소유자)·4개월분(세입자), 시행규칙 제54조</li>
          <li>본 계산기는 참고용이며 실제 보상가는 전문 감정평가사가 결정합니다.</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 입력 패널 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">토지 정보</h3>
            <div className="space-y-3">
              <div>
                <label className="label">토지 면적 (m²)</label>
                <input className="input" type="number" value={input.landArea || ''}
                  onChange={(e) => setInput({ ...input, landArea: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="label">공시지가 (원/m²)</label>
                <input className="input" type="number" value={input.publicLandPrice || ''}
                  onChange={(e) => setInput({ ...input, publicLandPrice: parseFloat(e.target.value) || 0 })} />
                <p className="text-xs text-gray-400 mt-0.5">
                  예) 서울 구기동 기준 약 280만~300만원/m²
                </p>
              </div>
              <div>
                <label className="label">용도지역</label>
                <select className="input" value={input.zoning}
                  onChange={(e) => setInput({ ...input, zoning: e.target.value as ZoningType })}>
                  {Object.entries(zoningRules).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label flex justify-between">
                  지역요인 보정치
                  <span className="text-xs text-gray-400 font-normal">표준지 대비 지역 특성</span>
                </label>
                <input className="input" type="number" step="0.01" value={input.locationFactor}
                  onChange={(e) => setInput({ ...input, locationFactor: parseFloat(e.target.value) || 1 })} />
              </div>
              <div>
                <label className="label flex justify-between">
                  개별요인 보정치
                  <span className="text-xs text-gray-400 font-normal">접도·형상·방위 등</span>
                </label>
                <input className="input" type="number" step="0.01" value={input.individualFactor}
                  onChange={(e) => setInput({ ...input, individualFactor: parseFloat(e.target.value) || 1 })} />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">건물 정보</h3>
            <div className="space-y-3">
              <div>
                <label className="label">건물 연면적 (m²)</label>
                <input className="input" type="number" value={input.buildingArea || ''}
                  onChange={(e) => setInput({ ...input, buildingArea: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="label">건축년도</label>
                <input className="input" type="number" value={input.buildingYear || ''}
                  onChange={(e) => setInput({ ...input, buildingYear: parseInt(e.target.value) || 0 })} placeholder="예: 1990" />
              </div>
              <div>
                <label className="label">구조</label>
                <select className="input" value={input.buildingType}
                  onChange={(e) => setInput({ ...input, buildingType: e.target.value as AppraisalInput['buildingType'] })}>
                  {buildingTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">기타 보상</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={input.isResident}
                  onChange={(e) => setInput({ ...input, isResident: e.target.checked })}
                  className="rounded" />
                <span className="text-sm">거주자 (이주비 해당)</span>
              </label>
              <div>
                <label className="label">세입자 수</label>
                <input className="input" type="number" min="0" value={input.tenantCount}
                  onChange={(e) => setInput({ ...input, tenantCount: parseInt(e.target.value) || 0 })} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={input.hasBusinessLoss}
                  onChange={(e) => setInput({ ...input, hasBusinessLoss: e.target.checked })}
                  className="rounded" />
                <span className="text-sm">영업손실 보상 해당</span>
              </label>
              {input.hasBusinessLoss && (
                <div>
                  <label className="label">월 영업이익 (원)</label>
                  <input className="input" type="number" value={input.businessMonthlyRevenue || ''}
                    onChange={(e) => setInput({ ...input, businessMonthlyRevenue: parseFloat(e.target.value) || 0 })} placeholder="예: 3000000" />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleCalc} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Calculator size={16} /> 계산하기
            </button>
            <button onClick={handleReset} className="btn-secondary flex items-center gap-1.5">
              <RotateCcw size={15} /> 초기화
            </button>
          </div>
        </div>

        {/* 결과 패널 */}
        <div className="lg:col-span-3 space-y-4">
          {result ? (
            <>
              {/* 총 보상액 */}
              <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white">
                <p className="text-sm opacity-80">예상 총 보상액</p>
                <p className="text-4xl font-bold mt-1">{formatKRW(result.totalCompensation)}</p>
                <p className="text-sm opacity-70 mt-1">{result.totalCompensation.toLocaleString()} 원</p>
              </div>

              {/* 항목별 보상액 */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">항목별 보상액</h3>
                <div className="space-y-3">
                  {result.breakdown.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        <span className="text-sm font-bold text-gray-900">{formatKRW(item.amount)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${result.totalCompensation ? (item.amount / result.totalCompensation * 100) : 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{item.basis}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 차트 */}
              {chartOption && (
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-2">보상액 구성</h3>
                  <ReactECharts option={chartOption} style={{ height: 260 }} />
                </div>
              )}

              {/* 법적 근거 */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3">계산 법적 근거</h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <p>• <strong>토지 보상</strong>: 「공익사업을 위한 토지 등의 취득 및 보상에 관한 법률」 제70조</p>
                  <p>• <strong>건물 보상</strong>: 「토지보상법 시행규칙」 제33조 (건축물 보상평가 기준)</p>
                  <p>• <strong>이주정착금</strong>: 「토지보상법 시행규칙」 제54조 (주거이전에 따른 이주정착금)</p>
                  <p>• <strong>주거이전비</strong>: 「토지보상법 시행규칙」 제54조 제2항</p>
                  <p>• <strong>영업손실 보상</strong>: 「토지보상법 시행규칙」 제47조 (영업손실 보상)</p>
                  <p>• <strong>세입자 보상</strong>: 「토지보상법 시행규칙」 제54조, 제57조</p>
                </div>
                <button
                  onClick={() => toast.success('PDF 생성 기능은 실제 서비스에서 제공됩니다.')}
                  className="btn-secondary mt-4 w-full flex items-center justify-center gap-2 text-sm"
                >
                  <Download size={14} /> 감정평가 결과 PDF 저장
                </button>
              </div>
            </>
          ) : (
            <div className="card h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400">
              <Calculator size={48} className="opacity-20 mb-4" />
              <p className="text-lg font-medium">좌측에 정보를 입력하고</p>
              <p className="text-lg font-medium">[계산하기] 버튼을 누르세요.</p>
              <p className="text-sm mt-2 text-gray-300">구기동 기본값이 미리 입력되어 있습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
