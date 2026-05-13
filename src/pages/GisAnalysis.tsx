import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Layers, MapPin, Building2,
  Calculator, TrendingUp, AlertCircle, CheckCircle, Info,
  Home, X, FileText, Shield, ChevronRight, Combine, BarChart3,
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
import RealParcelMap, { type LayerMode } from '../components/common/RealParcelMap'

type DetailTab = 'land' | 'building' | 'usePlan' | 'appraisal'

const LAYER_META: Record<LayerMode, { label: string; desc: string; icon: string }> = {
  age:       { label: '노후도',       desc: '준공연도 기반 건물 노후 등급',       icon: '🏚️' },
  road:      { label: '접도율',       desc: '필지 도로 접면 등급',                icon: '🛣️' },
  redevelop: { label: '재개발 적격',  desc: '도정법 제8조 노후불량건축물 판정',   icon: '🏗️' },
  price:     { label: '실거래가',     desc: '국토부 실거래가 (최근 1~2년)',       icon: '💰' },
}

export default function GisAnalysis() {
  const [layer, setLayer] = useState<LayerMode>('age')
  const [selected, setSelected] = useState<Parcel[]>([])
  const [mergeMode, setMergeMode] = useState(false)
  const [detailTab, setDetailTab] = useState<DetailTab>('land')

  function toggleParcel(p: Parcel) {
    setSelected((prev) => {
      const exists = prev.find(x => x.id === p.id)
      if (exists) return prev.filter(x => x.id !== p.id)
      return mergeMode ? [...prev, p] : [p]
    })
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

  const mergedSummary = useMemo(() => {
    if (selected.length < 2) return null
    const zones = Array.from(new Set(selected.map(s => s.zoning)))
    const types = Array.from(new Set(selected.map(s => s.bldgType)))
    const owners = Array.from(new Set(selected.map(s => s.landRegistry.owner)))
    const built = selected.filter(s => s.buildYear > 0)
    const oldest = built.length ? Math.min(...built.map(s => s.buildYear)) : 0
    const newest = built.length ? Math.max(...built.map(s => s.buildYear)) : 0
    const redevelopableCount = selected.filter(s => isRedevelopable(s).yes).length
    const totalAppraisal = selected.reduce((s, p) => s + appraise(p).totalValue, 0)
    return { zones, types, owners, oldest, newest, redevelopableCount, totalAppraisal }
  }, [selected])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/" className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">
              구기2지구 지적도 분석 · 토지·건축물·이용계획 통합조회
            </h1>
            <p className="text-xs text-gray-500">필지 클릭 → 토지대장·건축물대장·토지이용계획 자동 조회 / 합필 모드로 여러 필지 묶음 분석</p>
          </div>
          <Link to="/" className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
            <Home size={14} /> 홈
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">

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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Combine size={16} className="text-purple-600" />
                  <span className="font-semibold text-sm">합필 모드</span>
                  <span className="text-[10px] text-gray-400">여러 필지를 묶어 면적·평가액 합산</span>
                </div>
                <button
                  onClick={() => {
                    setMergeMode(!mergeMode)
                    if (mergeMode) setSelected([])
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${mergeMode ? 'bg-purple-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mergeMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Layers size={14} className="text-blue-600" />
                  <span className="text-xs font-semibold text-gray-600">분석 레이어</span>
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
                      <p className="font-bold">{LAYER_META[k].icon} {LAYER_META[k].label}</p>
                      <p className="text-[10px] mt-0.5 opacity-80 truncate">{LAYER_META[k].desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <RealParcelMap
                parcels={GUKI_PARCELS}
                selected={selected}
                layer={layer}
                mergeMode={mergeMode}
                onToggleSelect={toggleParcel}
                height="620px"
              />

              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-xl p-3 shadow-lg border border-gray-200 text-xs max-w-[240px] z-[400]">
                <p className="font-bold text-gray-700 mb-2 flex items-center gap-1">
                  <Info size={11} /> {LAYER_META[layer].label} 범례
                </p>
                {layer === 'age' && Object.entries(AGE_GRADE_META).map(([k, m]) => (
                  <div key={k} className="flex items-center gap-2 py-0.5">
                    <span className="w-3 h-3 rounded flex-shrink-0" style={{ background: m.color }} />
                    <span className="text-[11px] text-gray-700">{m.label} — {m.description}</span>
                  </div>
                ))}
                {layer === 'road' && Object.entries(ROAD_GRADE_META).map(([k, m]) => (
                  <div key={k} className="flex items-center gap-2 py-0.5">
                    <span className="w-3 h-3 rounded flex-shrink-0" style={{ background: m.color }} />
                    <span className="text-[11px] text-gray-700">{m.label}</span>
                  </div>
                ))}
                {layer === 'redevelop' && (
                  <>
                    <div className="flex items-center gap-2 py-0.5"><span className="w-3 h-3 rounded bg-red-600 flex-shrink-0" /><span className="text-[11px]">재개발 적격 (도정법 제8조)</span></div>
                    <div className="flex items-center gap-2 py-0.5"><span className="w-3 h-3 rounded bg-slate-400 flex-shrink-0" /><span className="text-[11px]">기준 미달</span></div>
                  </>
                )}
                {layer === 'price' && (
                  <>
                    <div className="flex items-center gap-2 py-0.5"><span className="w-3 h-3 rounded bg-blue-700 flex-shrink-0" /><span className="text-[11px]">최근 거래 사례</span></div>
                    <div className="flex items-center gap-2 py-0.5"><span className="w-3 h-3 rounded bg-slate-500 flex-shrink-0" /><span className="text-[11px]">거래 없음</span></div>
                  </>
                )}
                {mergeMode && selected.length > 1 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 py-0.5">
                      <span className="w-3 h-1 bg-amber-400 rounded flex-shrink-0" />
                      <span className="text-[11px] text-amber-700 font-medium">합필 외곽 (선택된 필지 묶음)</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute top-3 left-3 bg-blue-600/95 backdrop-blur text-white rounded-xl px-3 py-2 shadow-lg text-xs font-medium z-[400] flex items-center gap-1.5 pointer-events-none">
                <MapPin size={12} /> {mergeMode ? '합필 모드 — 여러 필지를 차례로 클릭' : '필지 클릭 → 우측 상세조회'}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {mergeMode && selected.length > 1 && mergedSummary && (
              <div className="bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 text-white rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold flex items-center gap-2">
                    <Combine size={18} /> 합필 분석 결과
                  </h3>
                  <button onClick={() => setSelected([])} className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg flex items-center gap-1">
                    <X size={11} /> 초기화
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-white/15 rounded-xl p-2.5">
                    <p className="text-[10px] text-purple-100">합필 필지</p>
                    <p className="text-xl font-black mt-0.5">{selected.length}<span className="text-xs font-normal"> 개</span></p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-2.5">
                    <p className="text-[10px] text-purple-100">합산 면적</p>
                    <p className="text-xl font-black mt-0.5">{aggregated.totalAreaPyeong.toFixed(0)}<span className="text-xs font-normal"> 평</span></p>
                    <p className="text-[9px] text-purple-200">{aggregated.totalAreaM2.toLocaleString('ko-KR')}㎡</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-2.5">
                    <p className="text-[10px] text-purple-100">재개발 적격</p>
                    <p className="text-xl font-black mt-0.5">{mergedSummary.redevelopableCount}<span className="text-xs font-normal">/{selected.length}</span></p>
                  </div>
                </div>
                <div className="bg-white/15 rounded-xl p-3 mb-2 text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-purple-100">공시지가 합계</span><strong>{formatKRW(aggregated.totalNotice)}</strong></div>
                  <div className="flex justify-between"><span className="text-purple-100">감정평가 합계</span><strong>{formatKRW(mergedSummary.totalAppraisal)}</strong></div>
                </div>
                <div className="bg-white/15 rounded-xl p-3 text-xs space-y-1.5">
                  <div>
                    <p className="text-[10px] text-purple-100 mb-0.5">포함 용도지역</p>
                    <p className="font-semibold">{mergedSummary.zones.join(' · ')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-purple-100 mb-0.5">건물 유형</p>
                    <p className="font-semibold">{mergedSummary.types.join(' · ')}</p>
                  </div>
                  {mergedSummary.oldest > 0 && (
                    <div>
                      <p className="text-[10px] text-purple-100 mb-0.5">건축연도 범위</p>
                      <p className="font-semibold">{mergedSummary.oldest}년 ~ {mergedSummary.newest}년</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-purple-100 mb-0.5">소유자 ({mergedSummary.owners.length}명)</p>
                    <p className="font-semibold text-[11px]">{mergedSummary.owners.slice(0, 5).join(', ')}{mergedSummary.owners.length > 5 && ` 외 ${mergedSummary.owners.length - 5}명`}</p>
                  </div>
                </div>
              </div>
            )}

            {mergeMode && selected.length < 2 && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 text-sm text-purple-700">
                <p className="font-bold flex items-center gap-2 mb-1"><Combine size={16} /> 합필 모드 활성</p>
                <p className="text-xs">지도에서 2개 이상의 필지를 차례로 클릭하면 합필 분석이 시작됩니다. 현재 {selected.length}개 선택됨.</p>
              </div>
            )}

            {single && singleAppraisal && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4">
                  <p className="text-xs text-slate-400 uppercase tracking-widest">지적도 조회 결과</p>
                  <h3 className="font-bold text-xl mt-0.5">
                    {single.jibun} <span className="text-sm font-normal text-slate-400">· {single.bldgType}</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">{single.fullJibun}</p>
                  <p className="text-xs text-slate-400">{single.roadAddr}</p>
                </div>

                <div className="border-b border-gray-200 flex overflow-x-auto">
                  {([
                    { k: 'land',      label: '토지대장',      icon: FileText },
                    { k: 'building',  label: '건축물대장',    icon: Building2 },
                    { k: 'usePlan',   label: '토지이용계획',  icon: Shield },
                    { k: 'appraisal', label: '감정평가',      icon: Calculator },
                  ] as const).map(({ k, label, icon: Icon }) => (
                    <button
                      key={k}
                      onClick={() => setDetailTab(k)}
                      className={`flex-1 min-w-[80px] py-3 px-2 text-xs font-semibold transition-colors flex flex-col items-center gap-1 ${
                        detailTab === k
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={14} /> {label}
                    </button>
                  ))}
                </div>

                <div className="p-4">
                  {detailTab === 'land' && (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          ['소유자',      single.landRegistry.owner + ` (${single.landRegistry.ownerType})`],
                          ['소유구분',    single.landRegistry.shareType + (single.landRegistry.shareRatio ? ` (지분 ${single.landRegistry.shareRatio})` : '')],
                          ['지목',        single.landRegistry.jimok],
                          ['면적',        `${single.areaM2}㎡ (${formatPyeong(single.areaM2)})`],
                          ['취득일',      `${single.landRegistry.acquireDate} (${single.landRegistry.acquireReason})`],
                          ['등기번호',    single.landRegistry.registrationNumber],
                          ['형상',        single.shape],
                          ['도로조건',    single.roadAccess],
                        ] as const).map(([k, v]) => (
                          <div key={k} className="bg-gray-50 rounded-lg p-2.5">
                            <p className="text-[10px] text-gray-500">{k}</p>
                            <p className="font-semibold text-gray-800 mt-0.5 text-[11px] break-all">{v}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mb-2">공시지가 추이 (원/㎡)</p>
                        <div className="space-y-1">
                          {single.landRegistry.noticedPriceHistory.map((h, i, arr) => {
                            const prev = arr[i - 1]
                            const change = prev ? ((h.pricePerM2 - prev.pricePerM2) / prev.pricePerM2 * 100) : null
                            return (
                              <div key={h.year} className="flex justify-between items-center text-[11px]">
                                <span className="text-emerald-700">{h.year}년</span>
                                <span className="font-mono font-semibold text-emerald-900">
                                  {h.pricePerM2.toLocaleString('ko-KR')}원
                                  {change !== null && (
                                    <span className={`ml-2 text-[10px] ${change > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                      ({change > 0 ? '+' : ''}{change.toFixed(1)}%)
                                    </span>
                                  )}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {detailTab === 'building' && (
                    <div className="space-y-3 text-xs">
                      {single.buildingRegistry ? (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            {([
                              ['주용도',        single.buildingRegistry.mainUse],
                              ['세부용도',      single.buildingRegistry.detailUse],
                              ['구조',          single.structure],
                              ['층수',          `지상 ${single.buildingRegistry.totalFloors}층 · 지하 ${single.buildingRegistry.basement}층`],
                              ['연면적',        `${single.bldgAreaM2}㎡`],
                              ['건폐율',        `${single.buildingRegistry.bcr}%`],
                              ['용적률',        `${single.buildingRegistry.far}%`],
                              ['세대수',        `${single.buildingRegistry.households}세대 · ${single.buildingRegistry.rooms}호`],
                              ['주차',          `${single.buildingRegistry.parkingSpaces}대 / 법정 ${single.buildingRegistry.parkingRequired}대`],
                              ['승강기',        single.buildingRegistry.hasElevator ? '있음' : '없음'],
                              ['에너지등급',    single.buildingRegistry.energyGrade],
                              ['사용승인일',    single.buildingRegistry.approvalDate],
                            ] as const).map(([k, v]) => (
                              <div key={k} className="bg-gray-50 rounded-lg p-2.5">
                                <p className="text-[10px] text-gray-500">{k}</p>
                                <p className="font-semibold text-gray-800 mt-0.5 text-[11px]">{v}</p>
                              </div>
                            ))}
                          </div>
                          <div className={`rounded-lg p-3 border ${single.buildingRegistry.illegalExpansion ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                            <div className="flex items-center gap-2">
                              {single.buildingRegistry.illegalExpansion
                                ? <AlertCircle size={14} className="text-red-600" />
                                : <CheckCircle size={14} className="text-green-600" />}
                              <p className={`font-bold text-xs ${single.buildingRegistry.illegalExpansion ? 'text-red-700' : 'text-green-700'}`}>
                                {single.buildingRegistry.illegalExpansion ? '⚠️ 위반 건축물' : '위반사항 없음'}
                              </p>
                            </div>
                            {single.buildingRegistry.illegalNote && (
                              <p className="text-[11px] text-red-600 mt-1.5 pl-6">{single.buildingRegistry.illegalNote}</p>
                            )}
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">건물 노후도</p>
                              <span className="text-[10px] text-gray-400">경과 {singleAppraisal.buildingAge}년</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: AGE_GRADE_META[gradeAge(single)].color }} />
                              <span className="font-bold text-sm text-gray-800">{AGE_GRADE_META[gradeAge(single)].label}</span>
                              <span className="text-[11px] text-gray-500">— {AGE_GRADE_META[gradeAge(single)].description}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
                          <Building2 size={32} className="mx-auto mb-2 text-gray-300" />
                          <p className="text-sm font-semibold">건축물 없음 (나대지)</p>
                          <p className="text-[11px] mt-1">이 필지에는 등재된 건축물이 없습니다</p>
                        </div>
                      )}
                    </div>
                  )}

                  {detailTab === 'usePlan' && (
                    <div className="space-y-3 text-xs">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider mb-1">용도지역 (주요)</p>
                        <p className="font-black text-blue-900 text-base">{single.landUsePlan.primaryZone}</p>
                      </div>

                      {single.landUsePlan.secondaryZones.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">용도지구</p>
                          <div className="flex flex-wrap gap-1.5">
                            {single.landUsePlan.secondaryZones.map(z => (
                              <span key={z} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[11px] font-semibold rounded">
                                {z}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {single.landUsePlan.districts.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">용도구역</p>
                          <div className="flex flex-wrap gap-1.5">
                            {single.landUsePlan.districts.map(d => (
                              <span key={d} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[11px] font-semibold rounded">
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {single.landUsePlan.planningRestrictions.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-[10px] text-red-700 font-bold uppercase tracking-wider mb-1">⚠️ 도시계획 저촉 사항</p>
                          <ul className="space-y-1">
                            {single.landUsePlan.planningRestrictions.map((r, i) => (
                              <li key={i} className="text-[11px] text-red-800 flex gap-1"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" /><span>{r}</span></li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {single.landUsePlan.buildPermitRestrictions.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-[10px] text-yellow-700 font-bold uppercase tracking-wider mb-1">건축 허가 제한</p>
                          <ul className="space-y-1">
                            {single.landUsePlan.buildPermitRestrictions.map((r, i) => (
                              <li key={i} className="text-[11px] text-yellow-800 flex gap-1"><ChevronRight size={10} className="mt-0.5 flex-shrink-0" /><span>{r}</span></li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {single.landUsePlan.altitudeRestriction && (
                        <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                          <p className="text-[11px] text-gray-600">고도지구 (최고높이 제한)</p>
                          <p className="font-bold text-gray-800">{single.landUsePlan.altitudeRestriction}m 이하</p>
                        </div>
                      )}

                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mb-1">지정된 정비계획</p>
                        <p className="text-[11px] text-emerald-800 font-semibold">{single.landUsePlan.designatedPlan}</p>
                      </div>

                      {(() => {
                        const r = isRedevelopable(single)
                        return (
                          <div className={`p-3 rounded-lg border ${r.yes ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              {r.yes ? <CheckCircle size={14} className="text-red-600" /> : <AlertCircle size={14} className="text-gray-400" />}
                              <p className={`font-bold text-xs ${r.yes ? 'text-red-700' : 'text-gray-600'}`}>
                                {r.yes ? '재개발 적격 필지 (도정법 시행령 제8조)' : '재개발 기준 미달'}
                              </p>
                            </div>
                            <p className="text-[11px] text-gray-600 pl-6">{r.reason}</p>
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {detailTab === 'appraisal' && (
                    <div className="space-y-3 text-xs">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <div className="flex justify-between items-baseline mb-1">
                          <p className="text-xs text-emerald-700 font-bold">① 토지가액</p>
                          <p className="text-lg font-black text-emerald-700">{formatKRW(singleAppraisal.landValue)}</p>
                        </div>
                        <p className="text-[10px] text-emerald-600">
                          공시지가 {formatKRW(single.pricePerM2)}/㎡ × {single.areaM2}㎡ × {singleAppraisal.landAdjustments.final.toFixed(2)}
                        </p>
                        <p className="text-[9px] text-emerald-500 mt-0.5">
                          도로 {singleAppraisal.landAdjustments.road} × 형상 {singleAppraisal.landAdjustments.shape} × 용도 {singleAppraisal.landAdjustments.zoning}
                        </p>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex justify-between items-baseline mb-1">
                          <p className="text-xs text-amber-700 font-bold">② 건물가액 (원가법)</p>
                          <p className="text-lg font-black text-amber-700">{formatKRW(singleAppraisal.buildingValue)}</p>
                        </div>
                        <p className="text-[10px] text-amber-600">
                          {single.structure} 신축단가 × 연면적 × (1 - 감가 {(singleAppraisal.depreciation * 100).toFixed(1)}%)
                        </p>
                      </div>
                      <div className="bg-blue-600 text-white rounded-lg p-3">
                        <div className="flex justify-between items-baseline">
                          <p className="text-xs font-bold">종합 감정평가액</p>
                          <p className="text-2xl font-black">{formatKRW(singleAppraisal.totalValue)}</p>
                        </div>
                        <p className="text-[10px] text-blue-200 mt-1">① 토지 + ② 건물</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-3">
                        <h4 className="font-bold text-purple-900 text-xs mb-2 flex items-center gap-1">
                          <TrendingUp size={13} /> 분담금 시뮬레이션 (전용 84㎡)
                        </h4>
                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between"><span className="text-purple-700">새 아파트 분양가</span><strong>{formatKRW(singleAppraisal.shareSimulation.newApartmentPrice)}</strong></div>
                          <div className="flex justify-between"><span className="text-purple-700">- 본인 평가액</span><strong>{formatKRW(singleAppraisal.totalValue)}</strong></div>
                          <div className="border-t border-purple-300 pt-1 flex justify-between text-sm">
                            <span className="font-bold text-purple-900">예상 분담금</span>
                            <strong className={singleAppraisal.shareSimulation.yourShare > 0 ? 'text-pink-600' : 'text-emerald-600'}>
                              {singleAppraisal.shareSimulation.yourShare > 0
                                ? `+${formatKRW(singleAppraisal.shareSimulation.yourShare)} 추가`
                                : `${formatKRW(-singleAppraisal.shareSimulation.yourShare)} 환급`}
                            </strong>
                          </div>
                          <div className="bg-white/50 rounded p-2 mt-1.5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-purple-700 text-[10px]">무상지분율</span>
                              <strong className="text-purple-900 text-[11px]">{(singleAppraisal.shareSimulation.freeShareRatio * 100).toFixed(1)}%</strong>
                            </div>
                            <div className="h-1.5 bg-purple-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${Math.min(singleAppraisal.shareSimulation.freeShareRatio * 100, 100)}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!single && selected.length === 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <MapPin size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-bold text-gray-700">필지를 클릭하세요</p>
                <p className="text-xs text-gray-400 mt-1">지도에서 필지를 클릭하면 토지대장·건축물대장·토지이용계획을 한 번에 조회할 수 있습니다.</p>
              </div>
            )}

            {mergeMode && selected.length > 0 && (
              <div className="bg-white rounded-2xl p-3 shadow-sm">
                <h4 className="font-semibold text-gray-800 text-xs mb-2 flex items-center gap-1.5">
                  <BarChart3 size={12} /> 선택 필지 ({selected.length})
                </h4>
                <ul className="space-y-1 max-h-48 overflow-y-auto">
                  {selected.map(p => (
                    <li key={p.id} className="flex items-center justify-between p-1.5 rounded hover:bg-gray-50">
                      <div className="flex items-center gap-1.5 min-w-0 text-xs">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: AGE_GRADE_META[gradeAge(p)].color }} />
                        <span className="font-semibold text-gray-900">{p.jibun}</span>
                        <span className="text-[10px] text-gray-400">{p.bldgType}</span>
                      </div>
                      <button onClick={() => toggleParcel(p)} className="text-gray-400 hover:text-red-500 p-0.5">
                        <X size={11} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Info size={16} className="text-blue-600" /> 데이터 출처 및 실제 API 연동 가이드
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600 leading-relaxed">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-semibold text-gray-700 mb-1">📋 토지대장</p>
              <p className="text-[11px]">출처: <strong>국가공간정보포털 NSDI</strong></p>
              <p className="text-[10px] text-gray-500 mt-1">API: <code className="bg-white px-1">apis.data.go.kr/1611000/nsdi/LandRegService</code></p>
              <p className="text-[10px] text-gray-500">소유자·지목·면적·취득일·공시지가</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-semibold text-gray-700 mb-1">🏢 건축물대장</p>
              <p className="text-[11px]">출처: <strong>국토교통부 건축행정시스템</strong></p>
              <p className="text-[10px] text-gray-500 mt-1">API: <code className="bg-white px-1">apis.data.go.kr/1613000/BldRgstService_v2</code></p>
              <p className="text-[10px] text-gray-500">용도·구조·층수·세대·건폐율·용적률·위반 여부</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-semibold text-gray-700 mb-1">🗺️ 토지이용계획</p>
              <p className="text-[11px]">출처: <strong>국토교통부 토지이용규제정보시스템</strong></p>
              <p className="text-[10px] text-gray-500 mt-1">API: <code className="bg-white px-1">apis.data.go.kr/1611000/nsdi/LandUseService</code></p>
              <p className="text-[10px] text-gray-500">용도지역·지구·구역·도시계획 저촉·고도제한</p>
            </div>
          </div>
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <p className="font-semibold mb-1">⚠️ 실시간 API 연동 안내</p>
            <p>위 정부 API는 모두 <strong>API 키 인증</strong>이 필요하며, 브라우저 직접 호출 시 <strong>CORS 제한</strong>으로 차단됩니다.
            실서비스에서는 별도 백엔드 프록시(Node/Cloudflare Workers 등)에서 API 키로 호출 후 JSON으로 반환하는 구조가 필요합니다.
            현재는 정부 API 응답 스키마를 그대로 모사한 30필지 시뮬레이션이며, 프록시 추가 시
            <code className="bg-white px-1 mx-1">src/data/gukiParcels.ts</code>의 <code className="bg-white px-1">loadParcels()</code> 함수 한 곳만 교체하면 동작합니다.</p>
          </div>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            <p className="font-semibold mb-1">⚖️ 법적 근거</p>
            <p>「감정평가에 관한 규칙」 제14조 (공시지가기준법) · 제15조 (원가법) / 「도시 및 주거환경정비법」 제13조·제74조 / 「도정법 시행령」 제8조 (노후불량건축물 정의)</p>
          </div>
        </div>

      </main>

      <footer className="bg-gray-900 text-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm">
          <p>© 2026 종로구 구기재개발추진위원회 · 지적도 통합조회 시스템</p>
        </div>
      </footer>
    </div>
  )
}
