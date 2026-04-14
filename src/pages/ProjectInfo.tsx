import { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, CheckCircle, ChevronRight, XCircle, AlertCircle, ExternalLink, FileText,
} from 'lucide-react'

type TabId = 'requirements' | 'location' | 'finance' | 'qualification' | 'appraisal' | 'benefit'

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: 'requirements',  label: '요건 충족',    emoji: '✅' },
  { id: 'location',      label: '입지 분석',    emoji: '📍' },
  { id: 'finance',       label: '수지 분석',    emoji: '📊' },
  { id: 'qualification', label: '분양 자격',    emoji: '🏠' },
  { id: 'appraisal',     label: '감정평가',     emoji: '⚖️' },
  { id: 'benefit',       label: '이익 극대화',  emoji: '💰' },
]

export default function ProjectInfo() {
  const [activeTab, setActiveTab] = useState<TabId>('requirements')

  /* ─── ECharts: 비례율 3-시나리오 비교 (재건축 vs 재개발 기준/적정/최적) ─── */
  const ratioChart = {
    animation: false,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 185, right: 90, top: 12, bottom: 12 },
    xAxis: {
      type: 'value', max: 160,
      axisLabel: { formatter: '{value}%', fontSize: 11, color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    yAxis: {
      type: 'category',
      data: ['단순 재건축', '재개발 보수안', '재개발 적정안', '재개발 최적안'],
      axisLabel: { fontSize: 11, color: '#374151' },
    },
    series: [{
      type: 'bar', barWidth: 32,
      data: [
        { value: 72.50,  itemStyle: { color: '#ef4444', borderRadius: [0,6,6,0] } },
        { value: 93.30,  itemStyle: { color: '#60a5fa', borderRadius: [0,6,6,0] } },
        { value: 110.80, itemStyle: { color: '#2563eb', borderRadius: [0,6,6,0] } },
        { value: 128.20, itemStyle: { color: '#1e3a8a', borderRadius: [0,6,6,0] } },
      ],
      label: { show: true, position: 'right', fontWeight: 'bold', fontSize: 13, color: '#111827',
               formatter: '{c}%' },
    }],
  }

  /* ─── ECharts: 분담금/환급금 비교 (재건축 vs 재개발 적정안 110.80%) ─── */
  const financeChart = {
    animation: false,
    tooltip: {
      trigger: 'axis',
      formatter: (p: unknown[]) => {
        const params = p as Array<{ seriesName: string; value: number; name: string }>
        return params
          .filter(x => x.value > 0)
          .map(x => `${x.seriesName}: <strong>${(x.value / 10000).toLocaleString('ko')}만원</strong>`)
          .join('<br/>')
      },
    },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 56, right: 16, top: 24, bottom: 44 },
    xAxis: {
      type: 'category',
      data: ['재건축 (72.50%)', '재개발 적정안 (110.80%)'],
      axisLabel: { fontSize: 11, color: '#374151' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v: number) => `${(v / 10000).toFixed(0)}만`, fontSize: 10, color: '#9ca3af' },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
      axisLine: { show: false }, axisTick: { show: false },
    },
    series: [
      {
        name: '분담금 (납부 금액)',
        type: 'bar', barWidth: 48,
        data: [82500000, 0],
        itemStyle: { color: '#ef4444', borderRadius: [8, 8, 0, 0] },
        label: { show: true, position: 'top', formatter: '8,250만\n(납부)', fontSize: 11, fontWeight: 'bold', color: '#ef4444' },
      },
      {
        name: '환급금 (받는 금액)',
        type: 'bar', barWidth: 48,
        data: [0, 136700000],
        itemStyle: { color: '#2563eb', borderRadius: [8, 8, 0, 0] },
        label: { show: true, position: 'top', formatter: '1.37억\n(환급)', fontSize: 11, fontWeight: 'bold', color: '#1d4ed8' },
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── 헤더 ── */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">구기2지구 사업 상세 안내</h1>
            <p className="text-xs text-gray-400">재개발 절차 · 수지분석 · 분양자격 · 감정평가 · 2026.04.13 기준</p>
          </div>
          <Link to="/apply-consent"
            className="hidden sm:flex items-center gap-1.5 bg-blue-600 text-white text-xs px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            동의서 제출 <ChevronRight size={13} />
          </Link>
        </div>
      </header>

      {/* ── 탭 네비게이션 ── */}
      <div className="bg-white border-b border-gray-100 sticky top-[65px] z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all
                  ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <span>{tab.emoji}</span> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-10 pb-20">

        {/* ══════════════════════════════════════════════
            TAB 0 — 요건 충족 (한국부동산원 검토의견서)
        ══════════════════════════════════════════════ */}
        {activeTab === 'requirements' && (
          <div className="space-y-8">

            {/* Hero — 검토의견서 공식 결과 */}
            <div className="relative bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 text-white rounded-3xl p-8 overflow-hidden">
              <div className="absolute -right-16 -top-16 w-72 h-72 bg-white/5 rounded-full" />
              <div className="absolute right-8 bottom-8 w-40 h-40 bg-blue-500/10 rounded-full" />
              <div className="relative z-10">
                <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                  <div>
                    <span className="inline-block bg-green-500/30 border border-green-400/50 text-green-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
                      ✅ 재개발사업 요건 검토결과: 충족
                    </span>
                    <h2 className="text-3xl font-black mb-2">현황분석 검토의견서</h2>
                    <p className="text-blue-200 text-sm leading-relaxed">
                      서울특별시 종로구 구기동 재개발 사업구역에 대한<br />
                      한국부동산원 공식 현황분석 결과입니다 (2025년 4월 발행)
                    </p>
                  </div>
                  {/* REB 로고 카드 */}
                  <div className="bg-white rounded-2xl px-6 py-4 flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                        <span className="text-white font-black text-xs">RE</span>
                      </div>
                      <div>
                        <p className="text-blue-800 font-black text-sm leading-none">한국부동산원</p>
                        <p className="text-gray-400 text-xs">Korea Real Estate Board</p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">발행: 2025. 4</p>
                  </div>
                </div>
                {/* 핵심 수치 요약 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: '노후불량', value: '74.4%', sub: '기준 60% ✓', ok: true },
                    { label: '접도율', value: '13.3%', sub: '기준 40% 이하 ✓', ok: true },
                    { label: '재개발 비례율', value: '110.80%', sub: '100% 초과 → 환급 ✓', ok: true },
                    { label: '사업 요건', value: '충족', sub: '한국부동산원 공식 확인', ok: true },
                  ].map(s => (
                    <div key={s.label}
                      className={`rounded-2xl p-4 text-center border ${s.ok ? 'bg-green-500/20 border-green-400/40' : 'bg-slate-700/50 border-slate-600/40'}`}>
                      <p className="text-xs text-white/60 mb-1">{s.label}</p>
                      <p className={`text-2xl font-black leading-none ${s.ok ? 'text-green-300' : 'text-white/70'}`}>{s.value}</p>
                      <p className={`text-xs mt-1 ${s.ok ? 'text-green-300' : 'text-white/50'}`}>{s.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 요건 충족 핵심 설명 */}
            <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div>
                  <p className="font-black text-green-800 text-lg mb-2">정비계획 입안 요건 충족 확인됨</p>
                  <p className="text-green-700 text-sm leading-relaxed">
                    서울특별시의 <strong>「도시 및 주거환경정비 조례」 제6조제1항제2호</strong>에 따른
                    주택정비형 재개발의 정비계획 입안 요건을 충족하는 것으로 확인됨.
                  </p>
                  <div className="mt-3 bg-white border border-green-200 rounded-xl p-3 text-xs text-green-700">
                    <p className="font-semibold mb-1">✓ 충족 근거 (가~다 중 1개 이상 충족 시 요건 만족)</p>
                    <p>① 필수 조건: 노후불량건축물 비율 <strong>74.4%</strong> → 기준(60%) 초과 충족</p>
                    <p>② 선택 조건(나): 접도율 <strong>13.3%</strong> → 기준(40% 이하) 충족</p>
                    <p className="text-green-500 mt-1">* 과소필지·호수밀도는 미충족이나, 접도율 충족으로 요건 충족 확정</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4개 요건 상세 카드 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-xl mb-2">정비계획 입안 요건 — 항목별 검토 결과</h3>
              <p className="text-sm text-gray-400 mb-5">서울특별시 도시및주거환경정비 조례 제6조 기준 · 한국부동산원 검토 (2025.04)</p>

              <div className="space-y-3">
                {/* 필수 */}
                <div className="rounded-2xl overflow-hidden border-2 border-green-300">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">필수</span>
                      <p className="font-bold">노후불량건축물 수 / 전체 건축물 수</p>
                    </div>
                    <span className="bg-green-400 text-green-900 text-xs font-black px-3 py-1 rounded-full">✅ 충족</span>
                  </div>
                  <div className="p-5 bg-green-50/40">
                    <div className="flex items-end justify-between flex-wrap gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">기준: <strong className="text-gray-700">60% 이상</strong></p>
                        <p className="text-sm text-gray-500 mt-0.5">실제: <strong className="text-green-700 text-lg">74.4%</strong> (67동 / 90동)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">초과 달성</p>
                        <p className="text-2xl font-black text-green-600">+14.4%p</p>
                      </div>
                    </div>
                    {/* 진행 바 */}
                    <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div className="absolute left-0 top-0 h-full bg-green-500 rounded-full transition-all" style={{ width: '74.4%' }} />
                      <div className="absolute top-0 h-full w-0.5 bg-orange-400" style={{ left: '60%' }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0%</span>
                      <span className="text-orange-500 font-semibold">기준선 60%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* 가 — 과소필지 */}
                <div className="rounded-2xl overflow-hidden border-2 border-gray-200">
                  <div className="bg-gradient-to-r from-gray-500 to-slate-500 text-white px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">가 (선택)</span>
                      <p className="font-bold">과소필지 수 / 전체 필지 수</p>
                    </div>
                    <span className="bg-gray-200 text-gray-700 text-xs font-black px-3 py-1 rounded-full">△ 미충족</span>
                  </div>
                  <div className="p-5 bg-gray-50/40">
                    <div className="flex items-end justify-between flex-wrap gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">기준: <strong className="text-gray-700">40% 이상</strong></p>
                        <p className="text-sm text-gray-500 mt-0.5">실제: <strong className="text-gray-600 text-lg">15.1%</strong> (27필지 / 179필지)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">미달</p>
                        <p className="text-2xl font-black text-gray-500">-24.9%p</p>
                      </div>
                    </div>
                    <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div className="absolute left-0 top-0 h-full bg-gray-400 rounded-full" style={{ width: '15.1%' }} />
                      <div className="absolute top-0 h-full w-0.5 bg-orange-400" style={{ left: '40%' }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0%</span>
                      <span className="text-orange-500 font-semibold">기준선 40%</span>
                      <span>100%</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">※ 선택 조건 — 나·다 중 하나가 충족되면 전체 요건 충족</p>
                  </div>
                </div>

                {/* 나 — 접도율 */}
                <div className="rounded-2xl overflow-hidden border-2 border-green-300">
                  <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">나 (선택)</span>
                      <p className="font-bold">접도율 (주택접도율)</p>
                    </div>
                    <span className="bg-green-400 text-green-900 text-xs font-black px-3 py-1 rounded-full">✅ 충족</span>
                  </div>
                  <div className="p-5 bg-green-50/40">
                    <div className="flex items-end justify-between flex-wrap gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">기준: <strong className="text-gray-700">40% 이하</strong> (도로폭 6m 이상)</p>
                        <p className="text-sm text-gray-500 mt-0.5">실제: <strong className="text-green-700 text-lg">13.3%</strong> (12동 / 90동)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">기준 대비</p>
                        <p className="text-2xl font-black text-green-600">26.7%p ↓</p>
                      </div>
                    </div>
                    <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div className="absolute left-0 top-0 h-full bg-green-500 rounded-full" style={{ width: '13.3%' }} />
                      <div className="absolute top-0 h-full w-0.5 bg-orange-400" style={{ left: '40%' }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0%</span>
                      <span className="text-orange-500 font-semibold">기준선(상한) 40%</span>
                      <span>100%</span>
                    </div>
                    <div className="mt-2 bg-green-100 rounded-lg p-2 text-xs text-green-700 font-medium">
                      ✓ 이 항목 충족으로 전체 정비계획 입안 요건 최종 충족 확정
                    </div>
                  </div>
                </div>

                {/* 다 — 호수밀도 */}
                <div className="rounded-2xl overflow-hidden border-2 border-gray-200">
                  <div className="bg-gradient-to-r from-gray-500 to-slate-500 text-white px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">다 (선택)</span>
                      <p className="font-bold">호수밀도</p>
                    </div>
                    <span className="bg-gray-200 text-gray-700 text-xs font-black px-3 py-1 rounded-full">△ 미충족</span>
                  </div>
                  <div className="p-5 bg-gray-50/40">
                    <div className="flex items-end justify-between flex-wrap gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">기준: <strong className="text-gray-700">60호/ha 이상</strong></p>
                        <p className="text-sm text-gray-500 mt-0.5">실제: <strong className="text-gray-600 text-lg">16.2호/ha</strong></p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">미달</p>
                        <p className="text-2xl font-black text-gray-500">-43.8호</p>
                      </div>
                    </div>
                    <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div className="absolute left-0 top-0 h-full bg-gray-400 rounded-full" style={{ width: `${(16.2/80)*100}%` }} />
                      <div className="absolute top-0 h-full w-0.5 bg-orange-400" style={{ left: `${(60/80)*100}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0</span>
                      <span className="text-orange-500 font-semibold">기준선 60호/ha</span>
                      <span>80</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">※ 선택 조건 — 나(접도율) 충족으로 전체 요건은 이미 충족됨</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 위치 및 주변현황 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-xl mb-5">위치 및 주변현황 (한국부동산원 현황분석)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  {
                    icon: '🗺️', title: '위치 및 교통',
                    items: [
                      '북쪽: 북한산 국립공원 인접',
                      '남쪽: 서울 내사산·부암동 연접',
                      '반경 500m 이내 상명대학교',
                      '구기터널을 통해 도심 직접 연결',
                    ],
                  },
                  {
                    icon: '🏘️', title: '건축물 현황',
                    items: [
                      '단독주택: 44동',
                      '공동주택: 46동',
                      '공공·교육시설 등: 14동',
                      '총 104동 (검토 대상: 90동)',
                    ],
                  },
                  {
                    icon: '🏥', title: '공공편의시설',
                    items: [
                      '반경 1km 내 버스 노선 운행',
                      '반경 1km 내 119 안전센터',
                      '반경 1km 내 마을공원·공원',
                      '생활편의시설 충분히 확보됨',
                    ],
                  },
                ].map(block => (
                  <div key={block.title} className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-2xl mb-2">{block.icon}</p>
                    <p className="font-bold text-gray-800 mb-3">{block.title}</p>
                    <ul className="space-y-1.5">
                      {block.items.map(item => (
                        <li key={item} className="flex gap-2 text-sm text-gray-600">
                          <span className="w-1 h-1 bg-blue-400 rounded-full flex-shrink-0 mt-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* 법적 근거 */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <p className="text-sm font-bold text-blue-800 mb-3">📋 법적 근거 — 서울특별시 도시및주거환경정비 조례 제6조</p>
                <div className="text-xs text-blue-700 space-y-2 leading-relaxed font-mono bg-white/70 rounded-xl p-4">
                  <p className="font-bold text-blue-900">제6조(정비계획 입안대상지역 요건) 제2호</p>
                  <p>주택정비형 재개발구역은 면적이 <strong>1만㎡ 이상</strong>으로서 노후불량건축물의 수가</p>
                  <p>대상구역 건축물 총수의 <strong>60퍼센트 이상</strong>인 지역이고 다음 각 목의 어느 하나:</p>
                  <p className="pl-3">가. 전체 필지 중 과소필지가 <strong>40% 이상</strong>인 지역</p>
                  <p className="pl-3">나. 주택접도율이 <strong>40% 이하</strong>인 지역 (도로 폭 6m 이상 기준)</p>
                  <p className="pl-3">다. 호수밀도가 <strong>60 이상</strong>인 지역</p>
                </div>
              </div>
            </div>

            {/* 한국부동산원 검토의견서 미리보기 / 다운로드 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <p className="font-black text-lg">현황분석 검토의견서</p>
                  <p className="text-blue-200 text-xs">서울특별시 종로구 구기동 · 한국부동산원 발행 · 2025.4</p>
                </div>
              </div>
              {/* 문서 미리보기 카드 */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div className="md:col-span-1">
                    {/* 표지 미리보기 */}
                    <div className="aspect-[3/4] bg-gradient-to-b from-white to-gray-50 border-2 border-gray-200 rounded-xl flex flex-col items-center justify-center p-6 text-center relative">
                      <div className="w-full h-1.5 bg-blue-600 rounded-full mb-6" />
                      <div className="w-full h-0.5 bg-blue-200 rounded-full mb-6" />
                      <p className="text-gray-700 font-bold text-sm mb-1">현황분석 검토의견서</p>
                      <p className="text-gray-500 text-xs mb-8">[ 서울특별시 종로구 구기동 ]</p>
                      <div className="w-full h-0.5 bg-blue-200 rounded-full mb-6" />
                      <div className="w-full h-1.5 bg-blue-600 rounded-full mb-6" />
                      <p className="text-gray-400 text-xs mt-auto">2025. 4</p>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-5 h-5 bg-blue-700 rounded flex items-center justify-center">
                          <span className="text-white font-black text-[8px]">RE</span>
                        </div>
                        <span className="text-blue-700 font-bold text-xs">한국부동산원</span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-3 py-1.5">
                          <p className="text-xs text-gray-500 font-medium">표지 미리보기</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">문서 정보</p>
                      <div className="space-y-2 text-sm">
                        {[
                          ['발행 기관', '한국부동산원 (Korea Real Estate Board)'],
                          ['발행일', '2025년 4월'],
                          ['대상 지역', '서울특별시 종로구 구기동 138-1 일원'],
                          ['검토 항목', '재개발사업 입안 요건 충족 여부'],
                          ['최종 결론', '입안 요건 충족 (재개발 사업 추진 적법)'],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-gray-400">{k}</span>
                            <span className={`font-medium ${k === '최종 결론' ? 'text-green-600' : 'text-gray-700'}`}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
                      <p className="font-semibold mb-1">📌 파일 다운로드 안내</p>
                      <p>PDF 원본 파일은 추진위원회 사무실 또는 관리자 페이지에서 제공됩니다.<br />
                      파일 문의: <strong>010-5787-6695</strong> (구기동 재개발 추진위원회)</p>
                    </div>
                    <button
                      onClick={() => {
                        const a = document.createElement('a')
                        a.href = '/docs/kab-review-opinion.pdf'
                        a.download = '현황분석검토의견서_구기동_한국부동산원_2025.pdf'
                        a.click()
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                    >
                      <FileText size={16} /> PDF 다운로드 (현황분석 검토의견서)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 정비몽땅 연계 기획 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <ExternalLink size={18} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">서울시 정비몽땅 데이터 연계</h3>
                  <p className="text-xs text-gray-400">cleanup.seoul.go.kr — 서울시 정비사업 정보 공개 플랫폼</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div className="bg-indigo-50 rounded-2xl p-5">
                  <p className="font-bold text-indigo-800 mb-3">현재 활용 가능한 데이터</p>
                  <ul className="space-y-2 text-sm text-indigo-700">
                    {[
                      '사업 단계별 진행 현황 문서',
                      '시공사 선정 정보 및 계약 내용',
                      '총회 회의록 공개 문서',
                      '재무 운영 현황 및 예산',
                      '착공·준공 진행 보고서',
                    ].map(item => (
                      <li key={item} className="flex gap-2">
                        <span className="text-indigo-400">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 rounded-2xl p-5">
                  <p className="font-bold text-slate-700 mb-3">향후 개발 계획 (API 연동)</p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {[
                      '정비사업 유사 구역 비교 분석',
                      '서울시 전체 재개발 현황 지도',
                      '사업 단계별 소요 기간 통계',
                      '분양가·사업비 지역별 비교',
                      '공개 문서 자동 업로드 연동',
                    ].map(item => (
                      <li key={item} className="flex gap-2">
                        <span className="text-slate-400">◦</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <a
                href="https://cleanup.seoul.go.kr/cleanup/bsnssttus/lscrMainIndx.do"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                <ExternalLink size={15} /> 서울시 정비몽땅 사업현황 바로가기
              </a>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB 1 — 입지 분석
        ══════════════════════════════════════════════ */}
        {activeTab === 'location' && (
          <div className="space-y-8">
            {/* Hero */}
            <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-white rounded-3xl p-8 overflow-hidden">
              <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full" />
              <div className="absolute -right-4 top-12 w-40 h-40 bg-white/5 rounded-full" />
              <div className="relative z-10">
                <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  📍 서울특별시 종로구 구기동 138-1 일원
                </span>
                <h2 className="text-3xl font-black mb-2">구기2지구 입지 분석</h2>
                <p className="text-blue-100 mb-6">서울 도심·자연환경·미래 교통망의 삼박자 — 희소가치 높은 재개발 구역</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { emoji: '🚄', title: '강남 30분대', sub: 'GTX-E·강북횡단선 개통 후' },
                    { emoji: '📐', title: '88,165㎡', sub: '서울 도심 최대급 재개발 구역' },
                    { emoji: '🌿', title: '북한산 인접', sub: '도심 속 최고의 자연환경' },
                  ].map(item => (
                    <div key={item.title} className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center">
                      <p className="text-2xl mb-1">{item.emoji}</p>
                      <p className="font-bold text-sm">{item.title}</p>
                      <p className="text-blue-200 text-xs mt-0.5 leading-snug">{item.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 강북횡단선(우선 추진) + GTX-E */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 강북횡단선 — 우선 추진 강조 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-green-500 relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-black px-2.5 py-1 rounded-full animate-pulse">
                  우선 추진 ⚡
                </div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                    <span className="text-white font-black text-xs text-center leading-tight">강북<br/>횡단</span>
                  </div>
                  <div>
                    <p className="font-black text-lg text-gray-900">서울 경전철 강북횡단선</p>
                    <p className="text-xs text-gray-400">서울시 도시철도망 구축계획 · 가장 빠른 추진</p>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 mb-4">
                  <p className="text-green-800 font-bold text-sm mb-1">⚡ 핵심: GTX-E보다 먼저 추진</p>
                  <p className="text-green-700 text-sm">
                    서울시가 직접 추진하는 도시철도망 핵심 노선. 청량리~목동/홍대를 잇는
                    <strong> 동서축 25.7km</strong> 신설로, 구기동 인근 신설역 예정.
                    <strong> 강남 30분대 접근</strong>이 가장 먼저 실현됩니다.
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  {[
                    '서울시 직접 추진 — 사업 안정성 최상',
                    '구기동 인근 신설역 → 도보권 역세권 형성',
                    '동서축 단절 해소 → 부동산 프리미엄 직접 수혜',
                    '환승역 다수 → 9호선·5호선·GTX-E 환승',
                  ].map(item => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* GTX-E */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-red-500">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
                    <span className="text-white font-black text-base tracking-widest">E</span>
                  </div>
                  <div>
                    <p className="font-black text-lg text-gray-900">GTX-E 광역급행철도</p>
                    <p className="text-xs text-gray-400">인천 검암 ~ 디지털미디어시티 ~ 연신내 ~ 남양주</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {[
                    ['연신내역', '구기동에서 가장 가까운 환승역 — 차량 10분'],
                    ['디지털미디어시티', '환승 없이 직결 · 5분 내'],
                    ['수도권 횡단', '인천공항~남양주 동서 횡단축 형성'],
                    ['강북 음영 해소', '서북·동북 철도 음영지역 동시 해소'],
                  ].map(([k, v]) => (
                    <li key={k} className="flex items-start gap-3 text-sm">
                      <span className="w-6 h-6 bg-red-100 text-red-600 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold">→</span>
                      <span><strong className="text-gray-800">{k}</strong><span className="text-gray-500"> — {v}</span></span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 bg-red-50 rounded-xl p-3 text-xs text-red-700">
                  ※ GTX-E는 5차 국가철도망 계획 반영 노선으로, 강북횡단선과 함께 구기동의 더블 교통 호재를 형성합니다.
                </div>
              </div>
            </div>

            {/* 입지 강점 카드 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-xl mb-5">구기2지구 — 7가지 입지 강점</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { emoji: '🏔️', title: '북한산', sub: '도보 5분 — 국립공원 직접 접근' },
                  { emoji: '🏛️', title: '종로·광화문', sub: '서울 도심 업무지구 10분' },
                  { emoji: '🚆', title: '지하철 3·6호선', sub: '불광·연신내역 이용 가능' },
                  { emoji: '🏫', title: '종로구 학군', sub: '우수 초·중·고 밀집 지역' },
                  { emoji: '🛍️', title: '상업시설', sub: '은평뉴타운 상권 인접' },
                  { emoji: '🌇', title: '도심 접근', sub: '광화문·시청 10분 이내' },
                  { emoji: '🌳', title: '쾌적 환경', sub: '구기터널 이용 도심~북부 직결' },
                  { emoji: '📈', title: '미래 가치', sub: '강북횡단선·GTX-E 더블 호재' },
                ].map(item => (
                  <div key={item.title} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                    <p className="text-3xl mb-2">{item.emoji}</p>
                    <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB 2 — 수지 분석
        ══════════════════════════════════════════════ */}
        {activeTab === 'finance' && (
          <div className="space-y-8">
            <div className="relative bg-gradient-to-br from-emerald-700 to-teal-600 text-white rounded-3xl p-8 overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full" />
              <div className="relative z-10">
                <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  📊 구기2지구 재개발 수지분석 · 2025 국토교통부 표준건축비 · 강북횡단선·GTX-E 호재 반영
                </span>
                <h2 className="text-3xl font-black mb-2">재개발 사업 수지 분석</h2>
                <p className="text-emerald-100">조합원 480명 → 신축 1,340세대 (2.79배 확장) · 비례율 93~128% · 환급 발생 사업장</p>
              </div>
            </div>

            {/* 비례율 설명 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-xl mb-2">비례율(比例率)이란?</h3>
              <div className="bg-blue-50 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-3 flex-wrap text-sm">
                  <span className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">비례율</span>
                  <span className="text-gray-500 text-lg font-bold">=</span>
                  <span className="bg-white border border-blue-200 px-4 py-2 rounded-xl text-blue-700 font-semibold">( 종후자산 총액 − 총 사업비 )</span>
                  <span className="text-gray-500 text-lg font-bold">÷</span>
                  <span className="bg-white border border-blue-200 px-4 py-2 rounded-xl text-blue-700 font-semibold">종전자산 총액</span>
                  <span className="text-gray-500 text-lg font-bold">× 100</span>
                </div>
                <p className="text-xs text-blue-600 mt-3">
                  비례율 100% 이상 → 개발 이익이 사업 비용보다 커서 <strong>소유자가 환급금을 받습니다</strong><br/>
                  비례율 100% 미만 → 개발 이익이 사업 비용보다 작아서 <strong>소유자가 분담금을 납부합니다</strong>
                </p>
              </div>

              {/* 비례율 비교 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-red-600 text-xl">🏗️</span>
                  </div>
                  <p className="text-sm font-semibold text-red-600 mb-1">단순 재건축</p>
                  <p className="text-5xl font-black text-red-600 leading-none">72.50<span className="text-2xl">%</span></p>
                  <p className="text-xs text-red-500 mt-2 bg-red-100 rounded-lg py-1.5 px-2">소유자 분담금 발생 (납부 필요)</p>
                </div>
                <div className="bg-blue-50 border-2 border-blue-400 rounded-2xl p-5 text-center relative overflow-hidden">
                  <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">구기2지구 ★</div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 text-xl">🏘️</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">재개발 적정안</p>
                  <p className="text-5xl font-black text-blue-700 leading-none">110.80<span className="text-2xl">%</span></p>
                  <p className="text-xs text-blue-700 mt-2 bg-blue-100 rounded-lg py-1.5 px-2">소유자 환급금 발생 (돈을 받음) ✓</p>
                </div>
              </div>

              <ReactECharts option={ratioChart} style={{ height: 130 }} />
            </div>

            {/* 분담금/환급금 비교 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-xl mb-1">재개발 수지분석 — 시나리오별 비례율 비교</h3>
              <p className="text-sm text-gray-500 mb-5">
                구기2지구 88,165㎡ · 조합원 480명 → 신축 1,340세대 · 2025년 국토교통부 표준건축비 기준 · 강북횡단선·GTX-E 호재 단계별 반영
              </p>

              {/* 4개 시나리오 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* 재건축 */}
                <div className="rounded-2xl overflow-hidden border-2 border-red-200">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4">
                    <p className="font-black text-lg">단순 재건축 (비교 기준)</p>
                    <p className="text-red-100 text-xs">조합원 480명 = 신축 480세대 · 일반분양 없음</p>
                  </div>
                  <div className="p-4 space-y-2 text-sm bg-red-50/30">
                    {[
                      ['직접공사비', '850만원/평 (2025 기준)'],
                      ['일반분양가', '— (없음)'],
                      ['용적률', '180% (단순 1:1)'],
                      ['비례율', '72.50%'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-gray-500">{k}</span>
                        <span className={`font-semibold ${k === '비례율' ? 'text-red-600 text-base' : 'text-gray-800'}`}>{v}</span>
                      </div>
                    ))}
                    <div className="mt-2 bg-red-100 rounded-xl p-3 text-xs text-red-700 text-center font-bold">
                      세대당 부담금 약 8,250만원 납부
                    </div>
                  </div>
                </div>

                {/* 재개발 보수안 */}
                <div className="rounded-2xl overflow-hidden border-2 border-sky-200">
                  <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-4">
                    <p className="font-black text-lg">재개발 보수안</p>
                    <p className="text-sky-100 text-xs">현 시세 기준 · 교통 호재 미반영</p>
                  </div>
                  <div className="p-4 space-y-2 text-sm bg-sky-50/30">
                    {[
                      ['직접공사비', '850만원/평'],
                      ['일반분양가', '4,500만원/평'],
                      ['신축 세대', '1,340세대'],
                      ['비례율', '93.30%'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-gray-500">{k}</span>
                        <span className={`font-semibold ${k === '비례율' ? 'text-sky-700 text-base' : 'text-gray-800'}`}>{v}</span>
                      </div>
                    ))}
                    <div className="mt-2 bg-sky-100 rounded-xl p-3 text-xs text-sky-700 text-center font-bold">
                      세대당 환급금 약 1억 700만원 수령
                    </div>
                  </div>
                </div>

                {/* 재개발 적정안 */}
                <div className="rounded-2xl overflow-hidden border-2 border-blue-400 shadow-md">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-lg">재개발 적정안</p>
                        <p className="text-blue-200 text-xs">강북횡단선 개통 효과 반영</p>
                      </div>
                      <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-1 rounded-full">추천</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2 text-sm bg-blue-50/30">
                    {[
                      ['직접공사비', '850만원/평'],
                      ['일반분양가', '5,000만원/평 ↑'],
                      ['신축 세대', '1,340세대'],
                      ['비례율', '110.80%'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-gray-500">{k}</span>
                        <span className={`font-semibold ${k === '비례율' ? 'text-blue-700 text-base font-black' : 'text-gray-800'}`}>{v}</span>
                      </div>
                    ))}
                    <div className="mt-2 bg-blue-100 rounded-xl p-3 text-xs text-blue-800 text-center font-bold">
                      세대당 환급금 약 1억 3,670만원 수령 ✓
                    </div>
                  </div>
                </div>

                {/* 재개발 최적안 */}
                <div className="rounded-2xl overflow-hidden border-2 border-indigo-400">
                  <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white p-4">
                    <p className="font-black text-lg">재개발 최적안</p>
                    <p className="text-indigo-200 text-xs">강북횡단선 + GTX-E 동시 개통</p>
                  </div>
                  <div className="p-4 space-y-2 text-sm bg-indigo-50/30">
                    {[
                      ['직접공사비', '850만원/평'],
                      ['일반분양가', '5,500만원/평 ↑↑'],
                      ['신축 세대', '1,340세대'],
                      ['비례율', '128.20%'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-gray-500">{k}</span>
                        <span className={`font-semibold ${k === '비례율' ? 'text-indigo-700 text-base font-black' : 'text-gray-800'}`}>{v}</span>
                      </div>
                    ))}
                    <div className="mt-2 bg-indigo-100 rounded-xl p-3 text-xs text-indigo-800 text-center font-bold">
                      세대당 환급금 약 1억 6,620만원 수령 ✓
                    </div>
                  </div>
                </div>
              </div>

              {/* 환급 사업장 핵심 근거 */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-5 mb-5">
                <p className="font-black text-blue-900 text-lg mb-3">💡 환급 사업장이 되는 핵심 근거</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  {[
                    { icon: '📈', title: '2.79배 세대 확장', desc: '조합원 480명 → 신축 1,340세대. 일반분양 860세대 추가 발생으로 사업이익 극대화. 환급 발생의 본질적 원인.' },
                    { icon: '🚇', title: '강북횡단선 우선 추진', desc: '서울시 직접 추진하는 도시철도망 핵심 노선. 구기동 인근 신설역으로 분양가 +10~15% 효과 기대 (적정안 5,000만원/평).' },
                    { icon: '🏗️', title: '2025 국토교통부 단가', desc: '국토교통부 표준건축비 + 강북지역 신축 평균 적용 직접공사비 850만원/평. 부대공사·설계감리·금융비용 등 11개 항목 표준 회계.' },
                  ].map(item => (
                    <div key={item.title} className="bg-white rounded-xl p-4">
                      <p className="text-2xl mb-1">{item.icon}</p>
                      <p className="font-bold text-gray-800 mb-1">{item.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <ReactECharts option={financeChart} style={{ height: 220 }} />
              <p className="text-xs text-gray-400 mt-3 text-center">
                * 2025년 국토교통부 표준건축비 + 일반 재개발 회계 기준 모델 · 실제 감정평가 결과 및 시공사 도급계약 조건에 따라 변동 가능
              </p>
            </div>

            {/* 재개발 수지분석 상세 산식 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-xl mb-1">재개발 수지분석 상세 산식 (적정안 기준)</h3>
              <p className="text-sm text-gray-400 mb-5">
                구기2지구 88,165㎡ · 조합원 480명 → 신축 1,340세대 · 직접공사비 850만원/평 (2025 국토교통부) · 일반분양가 5,000만원/평 · 강북횡단선 개통 효과 반영
              </p>

              {/* 비례율 산식 시각화 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5 mb-5">
                <p className="text-sm font-bold text-blue-800 mb-4 text-center">비례율 = ( 종후자산 총액 − 총 사업비 ) ÷ 종전자산 총액 × 100</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-center mb-4">
                  {[
                    { label: '종후자산 총액', value: '20,922억원', desc: '일반분양 14,190억\n+ 조합원분양 6,732억', color: 'bg-green-100 border-green-300 text-green-800' },
                    { label: '(-) 총 사업비', value: '7,630억원', desc: '직접공사비·설계감리·이주비\n+ 금융·보상·부담금·예비비', color: 'bg-red-100 border-red-300 text-red-800' },
                    { label: '종전자산 총액', value: '12,000억원', desc: '단독주택 7,200억(60%)\n+ 다세대빌라 4,800억(40%)', color: 'bg-amber-100 border-amber-300 text-amber-800' },
                  ].map(item => (
                    <div key={item.label} className={`${item.color} border-2 rounded-xl p-4`}>
                      <p className="text-xs font-semibold mb-1">{item.label}</p>
                      <p className="text-2xl font-black mb-1">{item.value}</p>
                      <p className="text-xs whitespace-pre-line opacity-80 leading-snug">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-700 text-white rounded-xl p-4 text-center">
                  <p className="text-sm opacity-80 mb-1">비례율 산출</p>
                  <p className="text-lg font-bold">( 20,922억 − 7,630억 ) ÷ 12,000억 × 100</p>
                  <p className="text-4xl font-black mt-2">= 110.80%</p>
                </div>
              </div>

              {/* 사업비 내역 상세 */}
              <div className="overflow-x-auto mb-5">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="text-left px-3 py-2.5 rounded-tl-lg">항목</th>
                      <th className="text-right px-3 py-2.5">기준 단가</th>
                      <th className="text-right px-3 py-2.5">적용 면적/세대</th>
                      <th className="text-right px-3 py-2.5 rounded-tr-lg">금액 (억원)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { cat: '수입', item: '일반분양 수입', rate: '5,000만원/평', qty: '33평 × 860세대', amt: '14,190', color: 'bg-green-50', bold: false },
                      { cat: '수입', item: '조합원 분양 수입', rate: '4,250만원/평 (85%)', qty: '33평 × 480세대', amt: '6,732', color: 'bg-green-50', bold: false },
                      { cat: '수입', item: '종후자산 총액', rate: '', qty: '신축 1,340세대 합계', amt: '20,922', color: 'bg-green-100', bold: true },
                      { cat: '비용', item: '직접공사비', rate: '850만원/평 (2025 국토부)', qty: '연면적 약 60,000평', amt: '5,100', color: 'bg-red-50', bold: false },
                      { cat: '비용', item: '부대공사비', rate: '직접공사비의 15%', qty: '조경·외부토목·지장물 등', amt: '765', color: 'bg-red-50', bold: false },
                      { cat: '비용', item: '설계·감리비', rate: '직접공사비의 5%', qty: '건축·구조·기계설비·감리', amt: '255', color: 'bg-red-50', bold: false },
                      { cat: '비용', item: '일반관리·판촉비', rate: '직접공사비의 3%', qty: '시공사 일반관리비', amt: '153', color: 'bg-red-50', bold: false },
                      { cat: '비용', item: '이주비 이자', rate: '세대당 1.5억 × 6%', qty: '480세대 × 평균 3년', amt: '130', color: 'bg-red-50', bold: false },
                      { cat: '비용', item: 'PF 금융비용', rate: '대출잔액 × 5~6%', qty: '사업기간 전체', amt: '350', color: 'bg-red-50', bold: false },
                      { cat: '비용', item: '보상비', rate: '영업·세입자·이주촉진', qty: '도시정비법 제74조', amt: '220', color: 'bg-red-50', bold: false },
                      { cat: '비용', item: '부담금 (광역교통·학교·기반)', rate: '광역교통시설부담금 외', qty: '대도시광역교통법', amt: '380', color: 'bg-red-50', bold: false },
                      { cat: '비용', item: '예비비', rate: '직접공사비의 2%', qty: '예측 불가 비용', amt: '110', color: 'bg-red-50', bold: false },
                      { cat: '비용', item: '분양홍보·조합운영비', rate: '모델하우스·MGM·운영', qty: '사업기간 전체', amt: '167', color: 'bg-red-50', bold: false },
                      { cat: '비용', item: '총 사업비', rate: '', qty: '11개 항목 합계', amt: '7,630', color: 'bg-red-100', bold: true },
                      { cat: '기준', item: '종전자산 — 단독주택', rate: '공시지가기준법 + 원가법', qty: '288명 × 평균 25억', amt: '7,200', color: 'bg-amber-50', bold: false },
                      { cat: '기준', item: '종전자산 — 다세대빌라', rate: '거래사례비교법', qty: '192명 × 평균 25억', amt: '4,800', color: 'bg-amber-50', bold: false },
                      { cat: '기준', item: '종전자산 총액 (감정평가)', rate: '2개 이상 평가법인 산술평균', qty: '480명 합계', amt: '12,000', color: 'bg-amber-100', bold: true },
                    ].map(row => (
                      <tr key={row.item} className={`${row.color} ${row.bold ? 'font-bold' : ''}`}>
                        <td className="px-3 py-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded mr-2 ${row.cat === '수입' ? 'bg-green-200 text-green-800' : row.cat === '비용' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>{row.cat}</span>
                          {row.item}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-500">{row.rate}</td>
                        <td className="px-3 py-2 text-right text-gray-500">{row.qty}</td>
                        <td className={`px-3 py-2 text-right font-semibold ${row.bold ? 'text-gray-900 text-sm' : 'text-gray-700'}`}>{row.amt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 시나리오별 비례율 요약 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🏆</div>
                  <div className="flex-1">
                    <p className="font-black text-blue-900 text-lg mb-3">구기2지구 재개발 — 시나리오별 비례율 요약</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                      {[
                        { label: '단순 재건축', value: '72.50%', color: 'text-red-600', sub: '0.83억 분담', bg: 'bg-red-50' },
                        { label: '재개발 보수안', value: '93.30%', color: 'text-sky-700', sub: '1.07억 환급', bg: 'bg-sky-50' },
                        { label: '재개발 적정안', value: '110.80%', color: 'text-blue-800 font-black', sub: '1.37억 환급 ★', bg: 'bg-blue-100' },
                        { label: '재개발 최적안', value: '128.20%', color: 'text-indigo-800', sub: '1.66억 환급', bg: 'bg-indigo-50' },
                      ].map(item => (
                        <div key={item.label} className={`${item.bg} rounded-xl p-3`}>
                          <p className="text-xs text-gray-500">{item.label}</p>
                          <p className={`font-bold text-xl ${item.color}`}>{item.value}</p>
                          <p className="text-xs text-gray-500">{item.sub}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-blue-600 mt-3 text-center">
                      * 적정안 비례율 110.80% — 강북횡단선 개통 효과로 종로구 분양가 5,000만원/평 달성 시 · 조합원 480명 평균 종전자산 25억 가정
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 수지분석 핵심 요약 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { emoji: '📈', title: '재개발 적정 비례율', value: '110.80%', desc: '강북횡단선 개통 후 분양가 5,000만원/평 기준. 비례율 100% 초과 — 소유자 1인당 평균 1.37억원 환급.', color: 'bg-blue-50 border-blue-300' },
                { emoji: '🔄', title: '재건축 대비 유리', value: '+38.30%p', desc: '단순 재건축(72.50%) 대비 38.30%p 높은 비례율. 재건축 분담금 8,250만원 → 재개발 환급금 1.37억원.', color: 'bg-indigo-50 border-indigo-200' },
                { emoji: '💰', title: '소유자 최대 이익', value: '~2.19억원', desc: '재건축 분담금 8,250만원 + 재개발 환급금 1억 3,670만원 = 세대당 차액 약 2억 1,920만원 유리.', color: 'bg-amber-50 border-amber-200' },
              ].map(item => (
                <div key={item.title} className={`${item.color} border-2 rounded-2xl p-5`}>
                  <p className="text-3xl mb-3">{item.emoji}</p>
                  <p className="font-bold text-gray-900 mb-1">{item.title}</p>
                  <p className="text-3xl font-black text-gray-900 mb-3">{item.value}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB 3 — 분양 자격
        ══════════════════════════════════════════════ */}
        {activeTab === 'qualification' && (
          <div className="space-y-8">
            <div className="relative bg-gradient-to-br from-violet-700 to-indigo-600 text-white rounded-3xl p-8 overflow-hidden">
              <div className="absolute -left-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full" />
              <div className="relative z-10">
                <span className="inline-block bg-white/20 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  🏠 도시 및 주거환경정비법 기준
                </span>
                <h2 className="text-3xl font-black mb-2">조합원 분양신청 자격</h2>
                <p className="text-violet-200">분양 유형별 3단계 자격 요건 · 분담금 계산 방식</p>
              </div>
            </div>

            {/* 3단계 자격 */}
            <div className="space-y-4">
              {[
                {
                  tier: 1, emoji: '🏠',
                  title: '아파트 1채를 신청할 수 있는 자격',
                  gradient: 'from-blue-500 to-blue-700',
                  badgeColor: 'bg-blue-100 text-blue-700',
                  items: [
                    { icon: '✓', text: '주택을 소유한 경우 (단독주택, 다가구, 다세대 등)', key: true },
                    { icon: '✓', text: '상가를 소유하고 최소 동의에 의한 이상일 경우', key: false },
                    { icon: '✓', text: '토지가 90㎡ 이상일 경우', key: false },
                  ],
                  note: '가장 기본적인 자격 — 토지등소유자 대다수가 해당됩니다',
                },
                {
                  tier: 2, emoji: '🏠🏠',
                  title: '아파트 2채를 신청할 수 있는 자격',
                  gradient: 'from-emerald-500 to-teal-600',
                  badgeColor: 'bg-emerald-100 text-emerald-700',
                  items: [
                    { icon: '✓', text: '주택으로 동재된 면적이 분양신청면적보다 클 경우', key: true },
                    { icon: '✓', text: '상가를 1채는 60㎡ 이하 면적을 신청할 경우', key: false },
                  ],
                  note: '대형 주택 또는 상가를 보유한 경우 — 2채 배정 혜택',
                },
                {
                  tier: 3, emoji: '🏠🏠🏠',
                  title: '아파트 3채를 신청할 수 있는 자격',
                  gradient: 'from-amber-500 to-orange-600',
                  badgeColor: 'bg-amber-100 text-amber-700',
                  items: [
                    { icon: '✓', text: '종전자산금액(감정가격)이 최소분양금액의 3배 이상일 경우', key: true },
                  ],
                  note: '대규모 자산 소유자 — 고가 부동산 보유 시 3채까지 배정 가능',
                },
              ].map(q => (
                <div key={q.tier} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className={`bg-gradient-to-r ${q.gradient} text-white px-6 py-5 flex items-center justify-between`}>
                    <div>
                      <p className="text-white/70 text-xs mb-0.5">자격 유형 {q.tier}</p>
                      <h3 className="font-black text-xl">{q.title}</h3>
                    </div>
                    <div className="text-3xl bg-white/15 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0">
                      {q.tier}
                    </div>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3 mb-4">
                      {q.items.map(item => (
                        <li key={item.text} className={`flex gap-3 p-3 rounded-xl ${item.key ? 'bg-gray-50' : ''}`}>
                          <CheckCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                          <span className={`text-sm ${item.key ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                    <div className={`${q.badgeColor} rounded-xl p-3 text-xs font-medium`}>
                      📌 {q.note}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 분담금 계산 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-xl mb-5">조합원 분담금(환급금) 산정 방식</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5">
                  <p className="text-sm font-bold text-blue-800 mb-3">① 관리가액 산정</p>
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">관리가액</span>
                    <span className="text-gray-400 font-bold text-lg">=</span>
                    <span className="bg-white border-2 border-blue-300 px-4 py-2 rounded-xl text-blue-700 font-semibold">종전자산 감정가액</span>
                    <span className="text-gray-400 font-bold text-lg">×</span>
                    <span className="bg-white border-2 border-blue-300 px-4 py-2 rounded-xl text-blue-700 font-semibold">비례율</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5">
                  <p className="text-sm font-bold text-orange-800 mb-3">② 분담금 또는 환급금 산정</p>
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    <span className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold">분담금(환급금)</span>
                    <span className="text-gray-400 font-bold text-lg">=</span>
                    <span className="bg-white border-2 border-orange-300 px-4 py-2 rounded-xl text-orange-700 font-semibold">조합원 분양가</span>
                    <span className="text-gray-400 font-bold text-lg">-</span>
                    <span className="bg-white border-2 border-orange-300 px-4 py-2 rounded-xl text-orange-700 font-semibold">관리가액</span>
                  </div>
                  <p className="text-xs text-orange-600 mt-2">음수(−) = 환급금 (소유자가 받음) | 양수(+) = 분담금 (소유자가 납부)</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left px-3 py-2 font-semibold text-gray-600">시나리오</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600">종전자산 (천원)</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600">비례율</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600">관리가액</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600">분양가</th>
                        <th className="text-right px-3 py-2 font-semibold text-gray-600">결과</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="bg-red-50">
                        <td className="px-3 py-2.5 text-gray-700">재건축</td>
                        <td className="px-3 py-2.5 text-right">1,000,000</td>
                        <td className="px-3 py-2.5 text-right font-bold text-red-600">68.03%</td>
                        <td className="px-3 py-2.5 text-right">680,300</td>
                        <td className="px-3 py-2.5 text-right">1,200,000</td>
                        <td className="px-3 py-2.5 text-right font-black text-red-600">+519,700 납부</td>
                      </tr>
                      <tr className="bg-green-50">
                        <td className="px-3 py-2.5 text-gray-700">재개발+모아타운</td>
                        <td className="px-3 py-2.5 text-right">1,000,000</td>
                        <td className="px-3 py-2.5 text-right font-bold text-green-600">123.29%</td>
                        <td className="px-3 py-2.5 text-right">1,232,900</td>
                        <td className="px-3 py-2.5 text-right">1,200,000</td>
                        <td className="px-3 py-2.5 text-right font-black text-green-600">-32,900 환급</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB 4 — 감정평가
        ══════════════════════════════════════════════ */}
        {activeTab === 'appraisal' && (
          <div className="space-y-8">
            <div className="relative bg-gradient-to-br from-amber-600 to-orange-500 text-white rounded-3xl p-8 overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 rounded-l-full" />
              <div className="relative z-10">
                <span className="inline-block bg-white/20 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  ⚖️ 감정평가에 관한 규칙 (국토교통부 고시 제100호)
                </span>
                <h2 className="text-3xl font-black mb-2">감정평가 기준 및 방법</h2>
                <p className="text-amber-100">종전·종후자산 평가 시기 · 토지/건물 평가 방법 · 담당 기관</p>
              </div>
            </div>

            {/* 타임라인 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-xl mb-6">감정평가 실시 시기 — 전체 타임라인</h3>
              <div className="relative space-y-4 pl-14">
                <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-300 via-amber-300 to-gray-200" />
                {[
                  { n: 1, title: '사업관리계획 수립',           sub: '재개발 사업의 기본 방향 결정',          type: 'normal' },
                  { n: 2, title: '조합 설립',                   sub: '토지등소유자 3/4 이상 동의 후 조합 설립', type: 'normal' },
                  { n: 3, title: '건축 계획 심의 (통합심의)',   sub: '건축 계획 및 용적률, 층수 등 결정',       type: 'normal' },
                  { n: 4, title: '조합원 분양 신청',            sub: '조합원 분양 자격 확인 및 신청 접수',       type: 'normal' },
                  { n: 5, title: '★ 종전자산 감정평가',         sub: '기준시점: 건축 계획 심의 완료 후\n현재 보유 부동산 평가 → 관리가액 산정 기준', type: 'appraisal1' },
                  { n: 6, title: '관리처분계획 수립 ★ 핵심',   sub: '종전자산 감정 결과 기반 → 각 소유자별 권리 배분 계획 수립',                    type: 'key' },
                  { n: 7, title: '사업시행계획 인가 고시',       sub: '관리처분계획 인가 후 철거·착공 단계 진행',  type: 'normal' },
                  { n: 8, title: '★ 종후자산 감정평가',         sub: '기준시점: 조합원 분양신청 접수 완료일\n신축 아파트 가치 평가 → 분양가 결정 기준',  type: 'appraisal2' },
                  { n: 9, title: '철거 및 착공 → 입주',         sub: '기존 건물 철거, 신축 아파트 건설 및 입주',   type: 'end' },
                ].map(item => {
                  const isHighlight = item.type.startsWith('appraisal')
                  const isKey = item.type === 'key'
                  return (
                    <div key={item.n} className="relative flex gap-4 items-start">
                      <div className={`absolute -left-9 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm z-10 shadow-md
                        ${isHighlight ? 'bg-amber-500 text-white shadow-amber-200' :
                          isKey ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-gray-200 text-gray-600'}`}>
                        {item.n}
                      </div>
                      <div className={`flex-1 rounded-xl p-4 border
                        ${isHighlight ? 'bg-amber-50 border-amber-300 border-2' :
                          isKey ? 'bg-blue-50 border-blue-300 border-2' : 'bg-gray-50 border-gray-100'}`}>
                        <p className={`font-bold text-sm ${isHighlight ? 'text-amber-800' : isKey ? 'text-blue-800' : 'text-gray-700'}`}>
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 whitespace-pre-line leading-relaxed">{item.sub}</p>
                        {isHighlight && (
                          <span className="inline-block mt-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold">
                            감정평가 실시
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 물건 유형별 평가 방법 — 단독주택 / 다세대빌라 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-xl mb-2">물건 유형별 감정평가 방법</h3>
              <p className="text-sm text-gray-500 mb-5">
                구기2지구 토지등소유자 480명은 크게 <strong>단독주택·다가구(약 60%)</strong>와 <strong>다세대빌라·연립(약 40%)</strong>로 나뉩니다. 두 유형은 평가 방법이 완전히 다릅니다.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 단독주택 — 토지+건물 분리평가 */}
                <div className="border-2 border-amber-300 rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">🏡</span>
                      <span className="bg-white/20 text-xs font-semibold px-2 py-0.5 rounded">유형 A</span>
                    </div>
                    <p className="font-black text-lg">단독주택 · 다가구</p>
                    <p className="text-amber-100 text-xs">토지 + 건물 분리평가 (개별평가)</p>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-800">
                      <p className="font-bold mb-1">[1] 토지 — 공시지가기준법</p>
                      <p className="leading-relaxed">개별공시지가 × 시점수정(지가변동률) × 지역요인 × 개별요인 × 그 밖의 요인 보정</p>
                      <p className="font-mono text-[11px] mt-2 bg-white rounded p-1.5 text-amber-900">
                        토지가액 = 공시지가 × 1.10~1.40
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-800">
                      <p className="font-bold mb-1">[2] 건물 — 원가법</p>
                      <p className="leading-relaxed">재조달원가 × 잔가율(경과연수 반영) × 면적</p>
                      <p className="font-mono text-[11px] mt-2 bg-white rounded p-1.5 text-blue-900">
                        구조별 단가 (목조 50만, 조적 60만, RC 95만/㎡)
                      </p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-xs text-emerald-800">
                      <p className="font-bold mb-1">[3] 종전자산 = 토지 + 건물</p>
                      <p>합산 후 2개 이상 감정평가법인의 산술평균값으로 확정</p>
                    </div>
                    <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-3 text-center">
                      <p className="text-xs text-amber-900 font-semibold">구기동 단독 평균 추정</p>
                      <p className="text-2xl font-black text-amber-700 mt-1">25억원</p>
                      <p className="text-xs text-amber-700">대지 60평 × 평당 약 3,500~4,200만원</p>
                    </div>
                  </div>
                </div>

                {/* 다세대빌라 — 거래사례비교법 (일괄평가) */}
                <div className="border-2 border-purple-300 rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">🏢</span>
                      <span className="bg-white/20 text-xs font-semibold px-2 py-0.5 rounded">유형 B</span>
                    </div>
                    <p className="font-black text-lg">다세대빌라 · 연립</p>
                    <p className="text-purple-100 text-xs">거래사례비교법 (일괄평가)</p>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="bg-purple-50 rounded-xl p-3 text-xs text-purple-800">
                      <p className="font-bold mb-1">[1] 거래사례 수집</p>
                      <p className="leading-relaxed">인근 동·일지역 유사 다세대 거래사례 3건 이상 수집 (실거래가 기준)</p>
                    </div>
                    <div className="bg-fuchsia-50 rounded-xl p-3 text-xs text-fuchsia-800">
                      <p className="font-bold mb-1">[2] 사정·시점·지역·개별 보정</p>
                      <p className="leading-relaxed">사정보정 × 시점수정 × 지역요인 × 개별요인 × 면적</p>
                      <p className="font-mono text-[11px] mt-2 bg-white rounded p-1.5 text-fuchsia-900">
                        평가가액 = 사례단가 × 보정률 × 면적
                      </p>
                    </div>
                    <div className="bg-pink-50 rounded-xl p-3 text-xs text-pink-800">
                      <p className="font-bold mb-1">[3] 공시가격 보정 방식 (보조)</p>
                      <p className="leading-relaxed">공동주택 공시가격 × 보정률(1.5~2.0배) — 약식 추정 시 사용</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-100 to-fuchsia-100 rounded-xl p-3 text-center">
                      <p className="text-xs text-purple-900 font-semibold">구기동 다세대 평균 추정</p>
                      <p className="text-2xl font-black text-purple-700 mt-1">25억원</p>
                      <p className="text-xs text-purple-700">전용 60~85㎡ · 시세 + 공시가격 1.8배</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 토지 감정 - 공시지가기준법 (간단 카드) */}
              <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
                <p className="font-bold mb-1">⚖️ 법적 근거</p>
                감정평가에 관한 규칙 (국토교통부 고시 제100호) 제14조 · 도시 및 주거환경정비법 제74조에 의거,
                <strong> 2개 이상의 감정평가법인이 평가한 금액의 산술평균값</strong>으로 확정됩니다.
              </div>
            </div>

            {/* 탁상감정 (사전 약식 추정) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <h3 className="font-bold text-xl">탁상감정 (탁감) — 사전 약식 추정</h3>
                  <p className="text-xs text-gray-500">정식 감정평가 전, 본인 부동산의 대략적 평가액을 무료/저비용으로 미리 알아볼 수 있는 절차</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-4 mb-4 text-sm text-cyan-900">
                <p className="font-bold mb-2">💡 탁상감정이란?</p>
                <p className="leading-relaxed text-xs">
                  감정평가법인이 현장 방문 없이 공시지가, 실거래가, 인근 사례 등 <strong>서류 자료만으로 약식 추정</strong>한 가액입니다.
                  정식 감정평가 의뢰 전에 권리가액·분담금을 미리 가늠하기 위해 활용되며, 보통 <strong>5개 평가법인의 결과를 비교</strong>하여 오차를 검증합니다.
                </p>
              </div>

              {/* 탁감 가능 항목 */}
              <p className="font-bold text-gray-800 mb-3 text-sm">📌 탁상감정으로 추정 가능한 항목</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                {[
                  { icon: '🏞️', title: '토지', range: '±10~20%', desc: '개별공시지가 × 보정률(1.10~1.40) — 단독주택·상가 대지' },
                  { icon: '🏡', title: '단독주택·다가구', range: '±10~15%', desc: '토지가액 + 건물가액(원가법) 분리 산출 후 합산' },
                  { icon: '🏢', title: '다세대빌라·연립', range: '±10~15%', desc: '공시가격 × 1.5~2.0 또는 거래사례 단가 적용' },
                  { icon: '🏬', title: '상가·근린생활시설', range: '±10~20%', desc: '수익환원법 또는 거래사례비교법 약식 적용' },
                  { icon: '🏠', title: '아파트', range: '±5~10%', desc: '동일 단지 실거래가 기준 — 가장 오차가 적음' },
                  { icon: '📐', title: '나대지·맹지', range: '±15~25%', desc: '오차 범위가 가장 큼 — 정식감정 권장' },
                ].map(item => (
                  <div key={item.title} className="border border-gray-200 rounded-xl p-3 hover:border-cyan-400 hover:bg-cyan-50/30 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-xs font-bold bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">오차 {item.range}</span>
                    </div>
                    <p className="font-bold text-sm text-gray-800 mb-0.5">{item.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* 약식 추정 산식 */}
              <p className="font-bold text-gray-800 mb-3 text-sm">🧮 본인 부동산 약식 종전자산 추정 산식</p>
              <div className="space-y-3">
                <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4">
                  <p className="text-xs font-bold text-amber-800 mb-2">[단독주택·다가구]</p>
                  <p className="font-mono text-xs text-amber-900 bg-white rounded p-2">
                    종전자산 ≈ (개별공시지가 × 면적 × 보정률 1.20) + (재조달원가 × 잔가율 × 건축면적)
                  </p>
                  <p className="text-xs text-amber-700 mt-2">예: 대지 60평 × 평당 공시지가 2,000만원 × 1.20 + 건물 약 1.5억 = <strong>약 15.9억원</strong></p>
                </div>
                <div className="bg-purple-50 border-l-4 border-purple-400 rounded-r-xl p-4">
                  <p className="text-xs font-bold text-purple-800 mb-2">[다세대빌라·연립]</p>
                  <p className="font-mono text-xs text-purple-900 bg-white rounded p-2">
                    종전자산 ≈ 공동주택 공시가격 × 보정률 1.80 (또는 인근 거래사례단가 × 면적)
                  </p>
                  <p className="text-xs text-purple-700 mt-2">예: 공시가격 6억 × 1.80 = <strong>약 10.8억원</strong></p>
                </div>
              </div>

              <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-xl p-3 text-xs text-yellow-800">
                <strong>⚠️ 주의:</strong> 탁상감정은 어디까지나 <strong>사전 약식 추정</strong>입니다. 실제 종전자산 평가액은 사업시행인가 고시일을 기준으로 정식 감정평가법인이 산정하며, 개별요인 차이로 약 ±10~15%의 차이가 발생할 수 있습니다.
              </div>
            </div>

            {/* 담당 기관 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-xl mb-4">감정평가 담당 기관 — 재개발 (구기2지구 해당)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: '🏛️', title: '의뢰자', desc: '시장·군수 (종로구청장)\n서울특별시장 의뢰 가능' },
                  { icon: '🔍', title: '평가 기관', desc: '2개 이상의 감정평가법인\n(도정법 제74조 기준)' },
                  { icon: '📋', title: '관련 법령', desc: '도정법 제74조\n감정평가에 관한 규칙' },
                ].map(item => (
                  <div key={item.title} className="bg-gray-50 rounded-xl p-5 text-center">
                    <p className="text-3xl mb-2">{item.icon}</p>
                    <p className="font-bold text-gray-800 mb-1">{item.title}</p>
                    <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB 5 — 이익 극대화
        ══════════════════════════════════════════════ */}
        {activeTab === 'benefit' && (
          <div className="space-y-8">
            <div className="relative bg-gradient-to-br from-indigo-700 via-purple-600 to-violet-600 text-white rounded-3xl p-8 overflow-hidden">
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full -translate-x-8 translate-y-12" />
              <div className="relative z-10">
                <span className="inline-block bg-white/20 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  💰 조합원 이익 극대화 전략
                </span>
                <h2 className="text-3xl font-black mb-2">정비사업을 통한<br />조합원 이익 극대화</h2>
                <p className="text-indigo-200">개발이익 극대화 · 사업비 최소화 · 투명한 조합 운영</p>
              </div>
            </div>

            {/* 핵심 공식 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-xl mb-4">조합원 분담금 감소의 Key Point</h3>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6">
                <p className="text-center text-sm font-bold text-indigo-600 mb-4">개발이익 = 총 수입액 − 총 사업비</p>
                <div className="flex items-center justify-center gap-3 flex-wrap text-sm">
                  <div className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-center">
                    <p className="text-xs opacity-80 mb-0.5">조합원</p>
                    <p>분담금 감소</p>
                  </div>
                  <span className="text-gray-400 text-xl font-bold">⟵</span>
                  <div className="bg-white border-2 border-green-300 px-5 py-3 rounded-xl font-bold text-green-700 text-center">
                    <p className="text-xs opacity-80 mb-0.5">↑ 극대화</p>
                    <p>총 수입액</p>
                  </div>
                  <span className="text-gray-400 font-bold">+</span>
                  <div className="bg-white border-2 border-red-200 px-5 py-3 rounded-xl font-bold text-red-600 text-center">
                    <p className="text-xs opacity-80 mb-0.5">↓ 최소화</p>
                    <p>총 사업비</p>
                  </div>
                </div>
                <p className="text-xs text-center text-indigo-500 mt-4">
                  개발이익이 커질수록 비례율이 상승 → 소유자 분담금 감소 또는 환급금 증가
                </p>
              </div>
            </div>

            {/* 3가지 전략 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  no: '01', emoji: '📐',
                  title: '분양면적 증대',
                  sub: '총 수입액 극대화',
                  gradient: 'from-blue-600 to-blue-700',
                  items: [
                    '우수한 입지를 활용한 최적 평면 배치',
                    '일반분양 세대수 최적화 계획 수립',
                    '최대한의 규모별 세대수 적용',
                    '분양면적 당 가치 극대화',
                  ],
                },
                {
                  no: '02', emoji: '🏆',
                  title: '분양단가 제고',
                  sub: '수익성 향상',
                  gradient: 'from-emerald-600 to-teal-600',
                  items: [
                    '대형 브랜드 건설사(1군 시공사) 선정',
                    '적정 분양 시점 선정 (시장 상황 고려)',
                    '분양가 상한제 적용 여부 검토',
                    '커뮤니티·조경 등 부가가치 극대화',
                  ],
                },
                {
                  no: '03', emoji: '✂️',
                  title: '총 사업비 절감',
                  sub: '비용 최소화',
                  gradient: 'from-purple-600 to-indigo-600',
                  items: [
                    '투명한 조합 운영으로 불필요한 비용 차단',
                    '공사비 경쟁 입찰로 최적 계약 체결',
                    '사업단계별 비용 점검 위원회 운영',
                    '계약서·정산서 항목별 원가 검증',
                  ],
                },
              ].map(s => (
                <div key={s.no} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`bg-gradient-to-br ${s.gradient} text-white p-6`}>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-5xl font-black opacity-30">{s.no}</span>
                      <span className="text-3xl">{s.emoji}</span>
                    </div>
                    <h3 className="font-black text-xl">{s.title}</h3>
                    <p className="text-white/70 text-sm mt-0.5">{s.sub}</p>
                  </div>
                  <div className="p-5">
                    <ul className="space-y-2.5">
                      {s.items.map(item => (
                        <li key={item} className="flex gap-2.5 text-sm text-gray-600">
                          <CheckCircle size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* 체크포인트 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-xl mb-5">단계별 사업비 절감 체크포인트</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { phase: '사업 기획', icon: '📋', items: ['합리적 사업 조건', '불필요 비용 배제', '최적 계획 세대수'] },
                  { phase: '조합 운영', icon: '👥', items: ['투명한 운영 공개', '비용 내역 전체 공시', '적법한 총회 운영'] },
                  { phase: '공사비 관리', icon: '🔧', items: ['경쟁 입찰 도입', '공사비 검증 위원회', '항목별 원가 분석'] },
                  { phase: '분양 전략', icon: '🏗️', items: ['1군 시공사 선정', '최적 분양 시점 결정', '계약서 꼼꼼 점검'] },
                ].map(col => (
                  <div key={col.phase} className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-4">
                    <p className="text-xl mb-1">{col.icon}</p>
                    <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">{col.phase}</p>
                    <ul className="space-y-1.5">
                      {col.items.map(item => (
                        <li key={item} className="text-xs text-gray-600 flex gap-1.5">
                          <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl p-10 text-white text-center">
              <p className="text-4xl mb-4">🤝</p>
              <h3 className="text-2xl font-black mb-3">지금 동의서를 제출하세요</h3>
              <p className="text-blue-200 mb-8 leading-relaxed">
                더 많은 소유자가 동의할수록 사업 추진이 빨라집니다.<br />
                비례율 123.29%의 혜택을 누리기 위한 첫걸음입니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/apply-consent"
                  className="px-8 py-4 bg-white text-blue-700 rounded-2xl font-black hover:bg-blue-50 transition-colors text-base shadow-lg shadow-blue-900/30">
                  동의서 전자제출 →
                </Link>
                <Link to="/#status"
                  className="px-8 py-4 bg-white/15 border border-white/30 text-white rounded-2xl font-semibold hover:bg-white/25 transition-colors">
                  추진 현황 보기
                </Link>
              </div>
              <p className="text-xs text-blue-300 mt-6">문의: 010-5787-6695 · 평일 09:00~18:00</p>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-400 space-y-1">
          <p>© 2026 종로구 구기재개발추진위원회 · 문의: 010-5787-6695</p>
          <p className="text-xs text-gray-500">
            본 자료는 사업 안내용으로 작성되었습니다. 비례율 및 분담금은 실제 감정평가 결과에 따라 변동될 수 있습니다.
          </p>
        </div>
      </footer>
    </div>
  )
}
