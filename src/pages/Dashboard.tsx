import ReactECharts from 'echarts-for-react'
import { useAppStore } from '../store'
import { formatKRW, calculateConsentRate } from '../utils/calculations'
import {
  Users, MapPin, FileCheck, TrendingUp,
  AlertCircle, CheckCircle, Clock, ChevronRight,
  Calendar, Building2
} from 'lucide-react'
import { Link } from 'react-router-dom'

const stageLabels: Record<string, { label: string; index: number }> = {
  planning:       { label: '정비계획 수립', index: 0 },
  committee:      { label: '추진위원회 승인', index: 1 },
  association:    { label: '조합 설립 인가', index: 2 },
  implementation: { label: '사업시행계획 인가', index: 3 },
  management:     { label: '관리처분계획 인가', index: 4 },
  construction:   { label: '착공 및 준공', index: 5 },
  completion:     { label: '이전고시 및 청산', index: 6 },
}

const stages = [
  '정비계획\n수립', '추진위원회\n승인', '조합 설립\n인가',
  '사업시행\n인가', '관리처분\n인가', '착공/준공', '이전고시\n청산'
]

// 정비계획 입안 요건 (한국부동산원 검토결과 기반 — 변경 시 Settings에서 수정)
const REQUIREMENTS = [
  { label: '노후불량 건축물 비율', value: '74.4%', basis: '기준 60% 이상', ok: true },
  { label: '과소필지 비율', value: '15.1%', basis: '기준 40% 이상', ok: false },
  { label: '접도율', value: '13.3%', basis: '기준 40% 이하', ok: true },
  { label: '호수밀도', value: '16.2호/ha', basis: '기준 60호/ha 이상', ok: false },
]

export default function Dashboard() {
  const { project, owners, committeeMembers, schedules, notices } = useAppStore()

  const totalOwners = owners.length
  const agreed   = owners.filter((o) => o.consentStatus === 'agreed').length
  const opposed  = owners.filter((o) => o.consentStatus === 'opposed').length
  const pending  = owners.filter((o) => o.consentStatus === 'pending').length
  const withdrawn = owners.filter((o) => o.consentStatus === 'withdrawn').length
  const consentRate = calculateConsentRate(agreed, totalOwners)
  const activeCommittee = committeeMembers.filter((m) => m.isActive).length
  const currentStageIdx = stageLabels[project.currentStage]?.index ?? 0

  // 진행 중 + 예정 일정 (최대 4개)
  const upcomingSchedules = schedules
    .filter((s) => s.status === 'in_progress' || s.status === 'planned')
    .slice(0, 4)

  // 최근 공지사항 (최대 5개)
  const recentNotices = notices.slice(0, 5)

  // 동의서 현황 도넛 차트
  const consentChartOption = {
    animation: false,
    tooltip: { trigger: 'item', formatter: '{b}: {c}명 ({d}%)' },
    legend: {
      bottom: 2,
      orient: 'horizontal',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 10,
      textStyle: { fontSize: 10, color: '#6b7280' },
    },
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '33%',
        style: {
          text: `${consentRate.toFixed(1)}%`,
          font: 'bold 22px sans-serif',
          fill: '#111827',
          textAlign: 'center',
        },
      },
      {
        type: 'text',
        left: 'center',
        top: '49%',
        style: {
          text: `${agreed}/${totalOwners}명`,
          font: '11px sans-serif',
          fill: '#9ca3af',
          textAlign: 'center',
        },
      },
    ],
    series: [{
      type: 'pie',
      radius: ['44%', '65%'],
      center: ['50%', '42%'],
      itemStyle: { borderRadius: 5, borderWidth: 2, borderColor: '#fff' },
      label: { show: false },
      emphasis: { scale: true, scaleSize: 4 },
      data: [
        { value: agreed,    name: `동의 (${agreed}명)`,    itemStyle: { color: '#22c55e' } },
        { value: opposed,   name: `반대 (${opposed}명)`,   itemStyle: { color: '#ef4444' } },
        { value: pending,   name: `미결정 (${pending}명)`, itemStyle: { color: '#94a3b8' } },
        { value: withdrawn, name: `철회 (${withdrawn}명)`, itemStyle: { color: '#d1d5db' } },
      ].filter((d) => d.value > 0),
    }],
  }

  // 월별 동의 추이 (2026년 기준)
  const trendChartOption = {
    animation: false,
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#f9fafb', fontSize: 12 },
      formatter: (params: unknown[]) => {
        const p = params as Array<{ seriesName: string; value: number | null; name: string; color: string }>
        const lines = p
          .filter((item) => item.seriesName && item.value !== null)
          .map((item) => `<span style="color:${item.color}">●</span> ${item.seriesName}: <strong>${item.value}%</strong>`)
        return `<div style="font-weight:600;margin-bottom:4px">${p[0]?.name}</div>${lines.join('<br/>')}`
      },
    },
    grid: { left: 48, right: 16, top: 16, bottom: 50 },
    xAxis: {
      type: 'category',
      data: ['1월', '2월', '3월', '4월', '5월', '6월'],
      boundaryGap: false,
      axisLabel: { fontSize: 11, color: '#6b7280', interval: 0 },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: '동의율',
      nameTextStyle: { fontSize: 10, color: '#9ca3af', padding: [0, 24, 0, 0] },
      max: 100,
      min: 0,
      interval: 25,
      axisLabel: { formatter: '{value}%', fontSize: 10, color: '#9ca3af' },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
    },
    series: [
      {
        name: '실적',
        type: 'line',
        smooth: 0.4,
        data: [25, 38, null, Number(consentRate.toFixed(1)), null, null],
        itemStyle: { color: '#3b82f6', borderWidth: 2, borderColor: '#fff' },
        lineStyle: { width: 3, color: '#3b82f6' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59,130,246,0.28)' },
              { offset: 1, color: 'rgba(59,130,246,0.02)' },
            ],
          },
        },
        symbol: 'circle', symbolSize: 8,
        connectNulls: false,
        z: 3,
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#22c55e', width: 1.5, type: 'dotted' },
          label: { show: true, position: 'end', color: '#16a34a', fontSize: 10, formatter: '목표 50%' },
          data: [{ yAxis: 50 }],
        },
      },
      {
        name: '목표',
        type: 'line',
        smooth: 0.4,
        data: [20, 30, 40, 45, 50, 55],
        lineStyle: { type: 'dashed', color: '#f97316', width: 2 },
        itemStyle: { color: '#f97316' },
        symbol: 'none',
        z: 2,
        markArea: {
          silent: true,
          itemStyle: { color: 'rgba(249,115,22,0.05)' },
          label: {
            show: true,
            position: 'insideTopLeft',
            color: '#fb923c',
            fontSize: 9,
            formatter: '예상',
          },
          data: [[{ xAxis: '4월' }, { xAxis: '6월' }]],
        },
      },
    ],
    legend: {
      bottom: 0,
      data: [
        { name: '실적', icon: 'circle' },
        { name: '목표', icon: 'roundRect' },
      ],
      itemWidth: 12,
      itemHeight: 4,
      textStyle: { fontSize: 11, color: '#6b7280' },
    },
  }

  const statCards = [
    {
      label: '토지등소유자',
      value: `${totalOwners}명`,
      sub: `전체 ${project.ownerCount}명 중`,
      icon: Users,
      color: 'bg-blue-500',
      link: '/admin/owners',
    },
    {
      label: '현재 동의율',
      value: `${consentRate.toFixed(1)}%`,
      sub: consentRate >= 50 ? '목표(50%) 달성!' : `목표까지 ${(50 - consentRate).toFixed(1)}% 필요`,
      icon: FileCheck,
      color: consentRate >= 50 ? 'bg-green-500' : 'bg-amber-500',
      link: '/admin/consent',
    },
    {
      label: '추진위원',
      value: `${activeCommittee}명`,
      sub: '활동 중',
      icon: Users,
      color: 'bg-purple-500',
      link: '/admin/committee',
    },
    {
      label: '사업 구역',
      value: `${project.totalArea.toLocaleString()}`,
      sub: `m²  ·  ${(project.totalArea / 10000).toFixed(2)}ha`,
      icon: MapPin,
      color: 'bg-teal-500',
      link: '/admin/project',
    },
  ]

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
          <p className="text-sm text-gray-500 mt-0.5">{project.address}</p>
        </div>
        <span className="text-xs text-gray-400 mt-1">
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 기준
        </span>
      </div>

      {/* 사업 진행 단계 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">사업 진행 단계</h3>
          <Link to="/admin/schedule" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
            일정 관리 <ChevronRight size={12} />
          </Link>
        </div>
        <div className="flex items-center justify-between overflow-x-auto pb-2 gap-1">
          {stages.map((stage, idx) => {
            const isActive = idx === currentStageIdx
            const isDone   = idx < currentStageIdx
            return (
              <div key={idx} className="flex items-center min-w-0 flex-1">
                <div className="flex flex-col items-center w-full">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors flex-shrink-0
                      ${isActive ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-200' :
                        isDone   ? 'bg-green-500 border-green-500 text-white' :
                                   'bg-white border-gray-300 text-gray-400'}`}
                  >
                    {isDone ? <CheckCircle size={18} /> : idx + 1}
                  </div>
                  <span className={`text-xs mt-1.5 text-center whitespace-pre-line leading-tight
                    ${isActive ? 'text-primary-600 font-semibold' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                    {stage}
                  </span>
                </div>
                {idx < stages.length - 1 && (
                  <div className={`h-0.5 w-full mx-1 flex-shrink-0 max-w-[24px]
                    ${idx < currentStageIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.label} to={card.link} className="card hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 leading-tight">{card.value}</p>
                  {card.sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{card.sub}</p>}
                </div>
                <div className={`${card.color} rounded-xl p-2.5 flex-shrink-0`}>
                  <Icon size={20} className="text-white" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 동의서 현황 */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">동의서 현황</h3>
            <Link to="/admin/consent" className="text-xs text-primary-600 hover:underline">자세히 보기</Link>
          </div>
          <ReactECharts option={consentChartOption} style={{ height: 220 }} />
          {/* 동의율 프로그레스 바 */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>동의율 <strong>{consentRate.toFixed(1)}%</strong></span>
              <span className="text-gray-400">목표 50%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${consentRate >= 50 ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'}`}
                style={{ width: `${Math.min(consentRate, 100)}%` }}
              />
            </div>
            {/* 50% 목표선 표시 */}
            <div className="relative h-0">
              <div className="absolute w-px h-3 bg-orange-400 top-[-13px]" style={{ left: '50%' }} />
            </div>
            {consentRate < 50 ? (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <AlertCircle size={12} />
                추진위원회 승인을 위해 <strong>{(50 - consentRate).toFixed(1)}%</strong> 추가 동의 필요
              </p>
            ) : (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle size={12} />
                추진위원회 구성 동의율 목표 달성
              </p>
            )}
          </div>
        </div>

        {/* 월별 추이 */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">동의 추이 (2026년)</h3>
            <span className="text-xs text-gray-400">월별 동의율 변화</span>
          </div>
          <ReactECharts option={trendChartOption} style={{ height: 220 }} />
          <p className="text-xs text-gray-400 mt-2">* 5월·6월은 예상치이며 동의서 제출에 따라 변동될 수 있습니다.</p>
        </div>
      </div>

      {/* 진행 일정 + 공지사항 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 진행 일정 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={16} className="text-primary-500" /> 진행 일정
            </h3>
            <Link to="/admin/schedule" className="text-xs text-primary-600 hover:underline">전체보기</Link>
          </div>
          <div className="space-y-2">
            {upcomingSchedules.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">진행 중인 일정이 없습니다.</p>
            ) : upcomingSchedules.map((s) => {
              const statusMeta: Record<string, { cls: string; label: string; icon: React.ReactNode }> = {
                in_progress: { cls: 'badge-blue',   label: '진행중', icon: <Clock size={10} className="mr-0.5" /> },
                planned:     { cls: 'badge-gray',   label: '예정',   icon: null },
                completed:   { cls: 'badge-green',  label: '완료',   icon: <CheckCircle size={10} className="mr-0.5" /> },
                delayed:     { cls: 'badge-red',    label: '지연',   icon: <AlertCircle size={10} className="mr-0.5" /> },
              }
              const meta = statusMeta[s.status]
              return (
                <div key={s.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {s.startDate} {s.endDate && s.endDate !== s.startDate ? `~ ${s.endDate}` : ''}
                    </p>
                  </div>
                  <span className={`${meta.cls} flex items-center text-xs flex-shrink-0`}>
                    {meta.icon}{meta.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 최근 공지사항 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building2 size={16} className="text-primary-500" /> 최근 공지사항
            </h3>
            <Link to="/admin/notice" className="text-xs text-primary-600 hover:underline">전체보기</Link>
          </div>
          <div className="space-y-0.5">
            {recentNotices.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">등록된 공지사항이 없습니다.</p>
            ) : recentNotices.map((n) => (
              <Link
                key={n.id}
                to="/admin/notice"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 group transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {n.category === 'urgent' && <span className="badge-red flex-shrink-0">긴급</span>}
                  {n.category === 'event'  && <span className="badge-blue flex-shrink-0">행사</span>}
                  {n.isPinned && <span className="text-primary-400 flex-shrink-0 text-xs">📌</span>}
                  <p className="text-sm text-gray-700 truncate group-hover:text-primary-600">
                    {n.title}
                  </p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{n.createdAt}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 사업 추진 요건 검토 현황 */}
      <div className="card bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <h3 className="font-semibold mb-1 flex items-center gap-2">
          <TrendingUp size={18} /> 정비계획 입안 요건 검토 현황
        </h3>
        <p className="text-xs text-primary-200 mb-4">한국부동산원 현황분석 검토의견서 기준 (2026년 1월)</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {REQUIREMENTS.map((item) => (
            <div key={item.label} className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                {item.ok
                  ? <CheckCircle size={14} className="text-green-300" />
                  : <AlertCircle size={14} className="text-yellow-300" />
                }
                <span className={`text-xs font-semibold ${item.ok ? 'text-green-300' : 'text-yellow-300'}`}>
                  {item.ok ? '충족' : '미충족'}
                </span>
              </div>
              <p className="text-2xl font-bold leading-none mb-1">{item.value}</p>
              <p className="text-xs text-primary-200 leading-snug">{item.label}</p>
              <p className="text-xs text-primary-300 mt-1">{item.basis}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-primary-200 mt-4 leading-relaxed">
          * 서울특별시 「도시 및 주거환경정비 조례」 제6조제1항제2호 기준 — 노후불량 건축물 비율·접도율 2개 요건 충족으로 정비계획 입안 가능
        </p>
      </div>
    </div>
  )
}
