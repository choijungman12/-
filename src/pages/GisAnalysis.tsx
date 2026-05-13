import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Layers, MapPin, Building2, Calendar, Ruler,
  Calculator, TrendingUp, AlertCircle, CheckCircle, Info,
  Home, X,
} from 'lucide-react'
import {
  GUKI_PARCELS, type Parcel,
} from '../data/gukiParcels'
import {
  appraise, gradeAge, AGE_GRADE_META,
  gradeRoad, ROAD_GRADE_META,
  isRedevelopable,
  aggregateParcels, formatKRW, formatPyeong,
} from '../utils/appraisal'

type LayerMode = 'age' | 'road' | 'redevelop' | 'price'

const LAYER_META: Record<LayerMode, { label: string; desc: string }> = {
  age:       { label: '노후도',       desc: '준공연도 기반 건물 노후 등급' },
  road:      { label: '접도율',       desc: '필지 도로 접면 등급' },
  redevelop: { label: '재개발 적격',  desc: '도정법 제8조 기준 노후불량건축물' },
  price:     { label: '실거래가',     desc: '최근 1~2년 거래 사례' },
}

function getParcelColor(p: Parcel, mode: LayerMode): string {
  if (mode === 'age') return AGE_GRADE_META[gradeAge(p)].color
  if (mode === 'road') return ROAD_GRADE_META[gradeRoad(p)].color
  if (mode === 'redevelop') return isRedevelopable(p).yes ? '#dc2626' : '#cbd5e1'
  if (mode === 'price') return p.recentSale ? '#3b82f6' : '#e5e7eb'
  return '#cbd5e1'
}

export default function GisAnalysis() {
  const [layer, setLayer] = useState<LayerMode>('age')
  const [selected, setSelected] = useState<Parcel[]>([])
  const [hovered, setHovered] = useState<string | null>(null)

  function toggleParcel(p: Parcel) {
    setSelected((prev) => prev.find(x => x.id === p.id) ? prev.filter(x => x.id !== p.id) : [...prev, p])
  }

  const aggregated = useMemo(() => aggregateParcels(selected), [selected])
  const stats = useMemo(() => {
    const total = GUKI_PARCELS.length
    const aged = GUKI_PARCELS.filter(p => gradeAge(p) === 'severely-aged').length
    const redevelopable = GUKI_PARCELS.filter(p => isRedevelopable(p).yes).length
    const blocked = GUKI_PARCELS.filter(p => gradeRoad(p) === 'blocked').length
    return {
      total, aged, redevelopable, blocked,
      agedPct: (aged / total * 100).toFixed(1),
      redevelopablePct: (redevelopable / total * 100).toFixed(1),
    }
  }, [])

  const single = selected.length === 1 ? selected[0] : null
  const singleAppraisal = single ? appraise(single) : null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/" className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">
              구기2지구 GIS 분석 · 감정평가 시뮬레이터
            </h1>
            <p className="text-xs text-gray-500">필지를 클릭해 노후도·접도율·재개발 적격성·평가액을 확인하세요</p>
          </div>
          <Link to="/" className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
            <Home size={14} /> 홈
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* 핵심 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '대상 필지', value: `${stats.total}개`,            sub: '대표 샘플',                                  bg: 'bg-blue-500' },
            { label: '심한노후 (30년+)', value: `${stats.aged}개`,       sub: `전체의 ${stats.agedPct}%`,                  bg: 'bg-red-500' },
            { label: '재개발 적격',  value: `${stats.redevelopable}개`,  sub: `전체의 ${stats.redevelopablePct}% (도정법 제8조)`, bg: 'bg-amber-500' },
            { label: '맹지 필지',    value: `${stats.blocked}개`,        sub: '도로 미접면',                                bg: 'bg-slate-500' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className={`${c.bg} w-1 h-6 rounded-full mb-2`} />
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{c.value}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* 지도 + 사이드 패널 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* 지도 영역 */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* 레이어 토글 */}
            <div className="border-b border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Layers size={16} className="text-blue-600" />
                <h3 className="font-semibold text-sm">분석 레이어</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(Object.keys(LAYER_META) as LayerMode[]).map(k => (
                  <button
                    key={k}
                    onClick={() => setLayer(k)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      layer === k
                        ? 'bg-blue-600 border-blue-700 text-white shadow'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <p className="font-bold">{LAYER_META[k].label}</p>
                    <p className="text-[10px] mt-0.5 opacity-80 truncate">{LAYER_META[k].desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* SVG 지도 */}
            <div className="relative bg-gradient-to-br from-emerald-50 via-slate-50 to-amber-50">
              <svg viewBox="0 0 100 75" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                {/* 배경: 도로망 시뮬레이션 */}
                <rect width="100" height="75" fill="#f8fafc" />
                {/* 산 음영 (북서쪽 북한산 자락) */}
                <ellipse cx="-5" cy="-5" rx="35" ry="25" fill="#86efac" opacity="0.25" />
                <ellipse cx="105" cy="80" rx="40" ry="20" fill="#fde68a" opacity="0.2" />

                {/* 도로 (광대로 - 진흥로) */}
                <rect x="0" y="68" width="100" height="3.5" fill="#94a3b8" opacity="0.6" />
                <text x="50" y="71" fontSize="1.4" fill="#475569" textAnchor="middle" fontWeight="bold">진흥로 (광대로)</text>
                {/* 중로 */}
                <rect x="6"  y="0" width="1.5" height="68" fill="#94a3b8" opacity="0.5" />
                <rect x="86" y="0" width="1.5" height="68" fill="#94a3b8" opacity="0.5" />
                {/* 소로 */}
                {[19, 32, 45, 58, 71].map(x => (
                  <rect key={x} x={x} y="0" width="0.8" height="68" fill="#cbd5e1" opacity="0.5" />
                ))}
                {[19, 31, 43, 55].map(y => (
                  <rect key={y} x="0" y={y} width="100" height="0.8" fill="#cbd5e1" opacity="0.5" />
                ))}

                {/* 필지들 */}
                {GUKI_PARCELS.map(p => {
                  const isSelected = selected.find(s => s.id === p.id)
                  const isHovered = hovered === p.id
                  const fill = getParcelColor(p, layer)
                  const points = p.poly.map(([x, y]) => `${x},${y}`).join(' ')
                  return (
                    <g key={p.id} className="cursor-pointer" onClick={() => toggleParcel(p)}
                       onMouseEnter={() => setHovered(p.id)} onMouseLeave={() => setHovered(null)}>
                      <polygon
                        points={points}
                        fill={fill}
                        fillOpacity={isSelected ? 0.95 : isHovered ? 0.85 : 0.72}
                        stroke={isSelected ? '#1d4ed8' : '#475569'}
                        strokeWidth={isSelected ? 0.45 : 0.18}
                      />
                      {/* 선택된 필지 표시 */}
                      {isSelected && (
                        <circle
                          cx={(p.poly[0][0] + p.poly[2][0]) / 2}
                          cy={(p.poly[0][1] + p.poly[2][1]) / 2}
                          r="1.6" fill="#1d4ed8" stroke="#fff" strokeWidth="0.3"
                        />
                      )}
                      {/* 실거래가 모드일 때 가격 마커 */}
                      {layer === 'price' && p.recentSale && (
                        <g>
                          <rect
                            x={(p.poly[0][0] + p.poly[2][0]) / 2 - 3.5}
                            y={(p.poly[0][1] + p.poly[2][1]) / 2 - 1.6}
                            width="7" height="3.2" rx="0.5"
                            fill="#1d4ed8" stroke="#fff" strokeWidth="0.15"
                          />
                          <text
                            x={(p.poly[0][0] + p.poly[2][0]) / 2}
                            y={(p.poly[0][1] + p.poly[2][1]) / 2 + 0.3}
                            fontSize="1.4" fill="#fff" textAnchor="middle" fontWeight="bold"
                          >
                            {(p.recentSale.price / 10000).toFixed(1)}억
                          </text>
                        </g>
                      )}
                      {/* 지번 라벨 (호버/선택 시) */}
                      {(isHovered || isSelected) && layer !== 'price' && (
                        <text
                          x={(p.poly[0][0] + p.poly[2][0]) / 2}
                          y={(p.poly[0][1] + p.poly[2][1]) / 2 + 0.5}
                          fontSize="1.3" fill="#0f172a" textAnchor="middle" fontWeight="bold"
                          style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 0.4, strokeLinejoin: 'round' }}
                        >
                          {p.jibun}
                        </text>
                      )}
                    </g>
                  )
                })}

                {/* 사업구역 경계 */}
                <rect x="6" y="6" width="82" height="62" fill="none"
                  stroke="#dc2626" strokeWidth="0.5" strokeDasharray="1.5,0.8" opacity="0.8" />
                <text x="48" y="5" fontSize="1.6" fill="#dc2626" textAnchor="middle" fontWeight="bold">
                  구기2지구 정비구역 (시뮬레이션)
                </text>
              </svg>

              {/* 범례 (지도 우측 하단) */}
              <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur rounded-xl p-3 shadow-lg border border-gray-200 text-xs max-w-[200px]">
                <p className="font-bold text-gray-700 mb-2 flex items-center gap-1">
                  <Info size={11} /> 범례
                </p>
                {layer === 'age' && Object.entries(AGE_GRADE_META).map(([k, m]) => (
                  <div key={k} className="flex items-center gap-2 py-0.5">
                    <span className="w-3 h-3 rounded" style={{ background: m.color }} />
                    <span className="text-[11px] text-gray-700">{m.label}</span>
                  </div>
                ))}
                {layer === 'road' && Object.entries(ROAD_GRADE_META).map(([k, m]) => (
                  <div key={k} className="flex items-center gap-2 py-0.5">
                    <span className="w-3 h-3 rounded" style={{ background: m.color }} />
                    <span className="text-[11px] text-gray-700">{m.label}</span>
                  </div>
                ))}
                {layer === 'redevelop' && (
                  <>
                    <div className="flex items-center gap-2 py-0.5"><span className="w-3 h-3 rounded bg-red-600" /><span className="text-[11px]">재개발 적격</span></div>
                    <div className="flex items-center gap-2 py-0.5"><span className="w-3 h-3 rounded bg-slate-300" /><span className="text-[11px]">기준 미달</span></div>
                  </>
                )}
                {layer === 'price' && (
                  <>
                    <div className="flex items-center gap-2 py-0.5"><span className="w-3 h-3 rounded bg-blue-600" /><span className="text-[11px]">최근 거래 있음</span></div>
                    <div className="flex items-center gap-2 py-0.5"><span className="w-3 h-3 rounded bg-gray-200" /><span className="text-[11px]">거래 없음</span></div>
                  </>
                )}
              </div>

              {/* 호버 툴팁 */}
              {hovered && (
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-xl p-3 shadow-lg border border-gray-200 text-xs">
                  {(() => {
                    const p = GUKI_PARCELS.find(x => x.id === hovered)!
                    const age = gradeAge(p)
                    return (
                      <>
                        <p className="font-bold text-gray-900">{p.jibun} <span className="text-[10px] font-normal text-gray-500">{p.bldgType}</span></p>
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          {p.areaM2}㎡ ({formatPyeong(p.areaM2)}) · {p.zoning}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-[11px]">
                          <span className="w-2 h-2 rounded-full" style={{ background: AGE_GRADE_META[age].color }} />
                          <span className="text-gray-700">{AGE_GRADE_META[age].label} ({p.buildYear || '-'}년 준공)</span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* 사이드 패널 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 다중 선택 합계 */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold flex items-center gap-2"><Calculator size={18} /> 선택 필지 합계</h3>
                {selected.length > 0 && (
                  <button onClick={() => setSelected([])} className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg flex items-center gap-1">
                    <X size={11} /> 초기화
                  </button>
                )}
              </div>
              {selected.length === 0 ? (
                <p className="text-sm text-blue-100">지도에서 필지를 클릭해 선택하세요. 다중 선택 시 합산됩니다.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white/15 rounded-xl p-3">
                      <p className="text-[11px] text-blue-100">선택 필지수</p>
                      <p className="text-2xl font-black mt-0.5">{selected.length}<span className="text-sm font-normal"> 개</span></p>
                    </div>
                    <div className="bg-white/15 rounded-xl p-3">
                      <p className="text-[11px] text-blue-100">면적 합계</p>
                      <p className="text-2xl font-black mt-0.5">{aggregated.totalAreaPyeong.toFixed(1)}<span className="text-sm font-normal"> 평</span></p>
                      <p className="text-[10px] text-blue-200">{aggregated.totalAreaM2.toLocaleString('ko-KR')}㎡</p>
                    </div>
                  </div>
                  <div className="bg-white/15 rounded-xl p-3 mb-2">
                    <p className="text-[11px] text-blue-100">공시지가 합계</p>
                    <p className="text-xl font-black mt-0.5">{formatKRW(aggregated.totalNotice)}</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-3">
                    <p className="text-[11px] text-blue-100">감정평가액 합계 (추정)</p>
                    <p className="text-xl font-black mt-0.5">{formatKRW(aggregated.totalValue)}</p>
                    <p className="text-[10px] text-blue-200 mt-1">* 토지(공시지가기준법) + 건물(원가법)</p>
                  </div>
                </>
              )}
            </div>

            {/* 단일 필지 상세 — 선택 1개일 때 */}
            {single && singleAppraisal && (
              <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">선택 필지 상세</p>
                  <h3 className="font-bold text-lg text-gray-900 mt-0.5 flex items-center gap-2">
                    <MapPin size={18} className="text-blue-600" /> {single.jibun}
                  </h3>
                  <p className="text-xs text-gray-500">{single.roadAddr}</p>
                </div>

                {/* 기본 정보 */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {([
                    { k: '면적',     v: `${single.areaM2}㎡ (${formatPyeong(single.areaM2)})`, Icon: Ruler },
                    { k: '건물',     v: `${single.bldgType} ${single.floors > 0 ? `${single.floors}층` : ''}`, Icon: Building2 },
                    { k: '준공',     v: single.buildYear ? `${single.buildYear}년 (${singleAppraisal.buildingAge}년 경과)` : '나대지', Icon: Calendar },
                    { k: '용도지역', v: single.zoning,    Icon: Layers },
                    { k: '도로조건', v: single.roadAccess, Icon: Layers },
                    { k: '형상',     v: single.shape,     Icon: Layers },
                  ] as const).map(({ k, v, Icon }) => (
                    <div key={k} className="bg-gray-50 rounded-lg p-2.5">
                      <div className="flex items-center gap-1 text-[10px] text-gray-500"><Icon size={10}/>{k}</div>
                      <p className="font-semibold text-gray-800 mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>

                {/* 노후도 + 재개발 적격 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: AGE_GRADE_META[gradeAge(single)].color }} />
                      <p className="text-sm font-semibold text-gray-800">노후도: {AGE_GRADE_META[gradeAge(single)].label}</p>
                    </div>
                    <p className="text-xs text-gray-500">{AGE_GRADE_META[gradeAge(single)].description}</p>
                  </div>
                  {(() => {
                    const r = isRedevelopable(single)
                    return (
                      <div className={`p-3 rounded-xl border ${r.yes ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {r.yes ? <CheckCircle size={14} className="text-red-600" /> : <AlertCircle size={14} className="text-gray-400" />}
                          <p className={`text-sm font-bold ${r.yes ? 'text-red-700' : 'text-gray-600'}`}>
                            {r.yes ? '재개발 적격 필지' : '재개발 기준 미달'}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 pl-6">{r.reason}</p>
                      </div>
                    )
                  })()}
                </div>

                {/* 감정평가 결과 */}
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                    <Calculator size={15} className="text-blue-600" /> 감정평가 산출
                  </h4>
                  <div className="space-y-2">
                    {/* 토지 */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <div className="flex justify-between items-baseline mb-1">
                        <p className="text-xs text-emerald-700 font-semibold">① 토지가액</p>
                        <p className="text-base font-black text-emerald-700">{formatKRW(singleAppraisal.landValue)}</p>
                      </div>
                      <p className="text-[10px] text-emerald-600">
                        공시지가 {formatKRW(single.pricePerM2)}/㎡ × {single.areaM2}㎡
                        × {singleAppraisal.landAdjustments.final.toFixed(2)}
                        <span className="text-emerald-400"> (도로 {singleAppraisal.landAdjustments.road} × 형상 {singleAppraisal.landAdjustments.shape} × 용도 {singleAppraisal.landAdjustments.zoning})</span>
                      </p>
                    </div>
                    {/* 건물 */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex justify-between items-baseline mb-1">
                        <p className="text-xs text-amber-700 font-semibold">② 건물가액 (원가법)</p>
                        <p className="text-base font-black text-amber-700">{formatKRW(singleAppraisal.buildingValue)}</p>
                      </div>
                      <p className="text-[10px] text-amber-600">
                        {single.structure} 신축단가 × 연면적 × (1 - 감가 {(singleAppraisal.depreciation * 100).toFixed(1)}%)
                      </p>
                    </div>
                    {/* 종합 */}
                    <div className="bg-blue-600 text-white rounded-lg p-3">
                      <div className="flex justify-between items-baseline">
                        <p className="text-xs font-semibold">종합 감정평가액</p>
                        <p className="text-2xl font-black">{formatKRW(singleAppraisal.totalValue)}</p>
                      </div>
                      <p className="text-[10px] text-blue-200 mt-1">① 토지 + ② 건물</p>
                    </div>
                  </div>
                </div>

                {/* 분담금 시뮬레이션 */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
                  <h4 className="font-bold text-purple-900 text-sm mb-3 flex items-center gap-2">
                    <TrendingUp size={15} /> 분담금 시뮬레이션 (전용 84㎡ 신축 분양)
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-purple-700">새 아파트 분양가</span><strong>{formatKRW(singleAppraisal.shareSimulation.newApartmentPrice)}</strong></div>
                    <div className="flex justify-between"><span className="text-purple-700">- 본인 평가액</span><strong>{formatKRW(singleAppraisal.totalValue)}</strong></div>
                    <div className="border-t border-purple-300 pt-2 flex justify-between text-base">
                      <span className="font-bold text-purple-900">예상 분담금</span>
                      <strong className={singleAppraisal.shareSimulation.yourShare > 0 ? 'text-pink-600' : 'text-emerald-600'}>
                        {singleAppraisal.shareSimulation.yourShare > 0
                          ? `+${formatKRW(singleAppraisal.shareSimulation.yourShare)} 추가 부담`
                          : `${formatKRW(-singleAppraisal.shareSimulation.yourShare)} 환급`}
                      </strong>
                    </div>
                    <div className="bg-white/50 rounded-lg p-2.5 mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-purple-700 text-[11px]">무상지분율</span>
                        <strong className="text-purple-900">{(singleAppraisal.shareSimulation.freeShareRatio * 100).toFixed(1)}%</strong>
                      </div>
                      <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${Math.min(singleAppraisal.shareSimulation.freeShareRatio * 100, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 다중 선택 시 필지 목록 */}
            {selected.length > 1 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 text-sm mb-3">선택 필지 목록 ({selected.length})</h4>
                <ul className="space-y-1.5 max-h-64 overflow-y-auto">
                  {selected.map(p => (
                    <li key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full" style={{ background: AGE_GRADE_META[gradeAge(p)].color }} />
                        <span className="text-sm font-medium text-gray-900 truncate">{p.jibun}</span>
                        <span className="text-[11px] text-gray-400 flex-shrink-0">{p.bldgType}</span>
                      </div>
                      <button onClick={() => toggleParcel(p)} className="text-gray-400 hover:text-red-500 p-1">
                        <X size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 산출 근거 안내 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Info size={16} className="text-blue-600" /> 산출 근거 및 데이터 출처
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 leading-relaxed">
            <div>
              <p className="font-semibold text-gray-700 mb-1">⚖️ 법적 근거</p>
              <ul className="space-y-1 pl-4 list-disc">
                <li>「감정평가에 관한 규칙」 제14조 — 토지 공시지가기준법</li>
                <li>「감정평가에 관한 규칙」 제15조 — 건물 원가법 (재조달원가 × 잔존가치율)</li>
                <li>「도시 및 주거환경정비법」 제13조 — 정비계획 입안</li>
                <li>「도정법 시행령」 제8조 — 노후불량건축물 정의 (준공 30년 이상 등)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-1">📊 데이터 소스</p>
              <ul className="space-y-1 pl-4 list-disc">
                <li>한국부동산원 「구기2지구 현황분석 검토의견서」 (2026.01) 모사</li>
                <li>국가공간정보포털(NSDI) 필지 스키마 준수</li>
                <li>국토교통부 실거래가 공개 시스템 (rt.molit.go.kr) 가격대 모사</li>
                <li><strong>실시간 API 연결은 별도 백엔드 프록시 필요</strong> (정부 API CORS 제한)</li>
              </ul>
            </div>
          </div>
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            <p>⚠️ 본 시스템의 평가액은 추정치이며, 실제 사업 단계에서는 「감정평가 및 감정평가사에 관한 법률」에 따라
            지정된 감정평가법인이 산출한 평가액이 효력을 갖습니다.</p>
          </div>
        </div>

      </main>

      <footer className="bg-gray-900 text-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm">
          <p>© 2026 종로구 구기재개발추진위원회 · GIS 분석 시뮬레이터</p>
        </div>
      </footer>
    </div>
  )
}
