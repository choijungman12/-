import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { useAppStore } from '../store'
import { calculateConsentRate } from '../utils/calculations'
import NaverMap from '../components/common/NaverMap'

// 슬라이드 아이템: 벡터 기반 SVG 비주얼 (무제한 해상도, 로딩 없음)
function SlideItem({ slide, active }: { slide: Slide; active: boolean }) {
  return (
    <div className={`absolute inset-0 transition-opacity duration-1000 ${active ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
      <div className="w-full h-full relative overflow-hidden">
        {slide.visual}
      </div>
    </div>
  )
}

// 썸네일: SVG 비주얼 축소 렌더
function ThumbItem({ slide }: { slide: Slide }) {
  return (
    <div className={`w-full h-full bg-gradient-to-br ${slide.gradient} flex items-center justify-center relative overflow-hidden`}>
      <div className="absolute inset-0">{slide.visual}</div>
      <span className="absolute bottom-1 left-1 right-1 text-white text-[10px] font-bold z-10 drop-shadow-md truncate text-center">
        {slide.tags[0]}
      </span>
    </div>
  )
}

interface Slide {
  src: string
  title: string
  desc: string
  tags: string[]
  gradient: string
  visual: React.ReactNode
}

function BuildingSilhouette({ color = '#fff', opacity = 0.15 }: { color?: string; opacity?: number }) {
  return (
    <svg viewBox="0 0 800 300" className="absolute bottom-0 left-0 right-0 w-full" style={{ opacity }}>
      {/* 배경 산 */}
      <ellipse cx="150" cy="300" rx="250" ry="130" fill="#166534" opacity="0.6" />
      <ellipse cx="650" cy="300" rx="220" ry="110" fill="#15803d" opacity="0.5" />
      {/* 타워 */}
      {[80,160,230,310,380,440,500,570,630,700].map((x, i) => {
        const h = [180,220,160,240,200,190,215,175,230,160][i]
        const w = [34,28,30,32,36,28,30,34,28,32][i]
        return (
          <g key={x}>
            <rect x={x} y={300 - h} width={w} height={h} fill={color} opacity={0.9} rx="2" />
            {/* 창문 격자 */}
            {Array.from({ length: Math.floor(h / 18) }).map((_, r) =>
              Array.from({ length: Math.floor(w / 10) }).map((_, c) => (
                <rect key={`${r}-${c}`} x={x + 3 + c * 10} y={300 - h + 8 + r * 18} width={6} height={10} fill="#bfdbfe" opacity={0.4} rx="1" />
              ))
            )}
            {/* 옥상 */}
            <rect x={x - 2} y={300 - h - 6} width={w + 4} height={6} fill={color} opacity={0.7} rx="1" />
          </g>
        )
      })}
    </svg>
  )
}

const slides: Slide[] = [
  {
    src: './images/slides/slide-01.jpg',
    title: '도시연결 재개발 조감도',
    desc: '교통 중심지와 연결되는 서울특별시 종로구 구기동 재개발 사업구역 전경',
    tags: ['평창동역', '성북·강역', '중심지 연결'],
    gradient: 'from-sky-500 via-blue-600 to-indigo-700',
    visual: (
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
        <BuildingSilhouette color="#e0f2fe" opacity={0.25} />
        <div className="absolute top-8 right-12 flex gap-3">
          {['평창동역','성북·강역','중심지 연결'].map(t => (
            <span key={t} className="bg-white/20 backdrop-blur text-white text-xs px-3 py-1 rounded-full border border-white/30">{t}</span>
          ))}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-8 py-5 shadow-2xl">
            <p className="text-white/70 text-sm mb-1">서울특별시 종로구</p>
            <p className="text-white text-xl font-bold leading-tight">재개발·재건축<br/>도시개발 통합 사이트</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    src: './images/slides/slide-02.jpg',
    title: '야간 주거단지 조감도',
    desc: '밤이 되어도 빛나는 고품격 친환경 주거환경 야간 렌더링',
    tags: ['야간 조감도', '고급 주거', '친환경 단지'],
    gradient: 'from-slate-900 via-blue-950 to-indigo-950',
    visual: (
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-950 to-indigo-950">
        {/* 별빛 */}
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-white rounded-full" style={{
            top: `${Math.random() * 50}%`, left: `${Math.random() * 100}%`, opacity: Math.random() * 0.7 + 0.3
          }} />
        ))}
        {/* 노을 */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-orange-900/40 to-transparent" />
        <BuildingSilhouette color="#fbbf24" opacity={0.3} />
        {/* 불빛 효과 */}
        <div className="absolute bottom-20 left-0 right-0 h-16" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(251,191,36,0.15) 0%, transparent 100%)'
        }} />
      </div>
    ),
  },
  {
    src: './images/slides/slide-03.jpg',
    title: '친환경 주거단지 조감도',
    desc: '북한산과 어우러진 자연 친화적 미래 주거단지 모습',
    tags: ['친환경', '북한산 조망', '자연 친화'],
    gradient: 'from-emerald-600 via-teal-600 to-sky-700',
    visual: (
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-400 to-emerald-600">
        {/* 산 */}
        <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full">
          <ellipse cx="200" cy="350" rx="300" ry="180" fill="#166534" opacity="0.7" />
          <ellipse cx="600" cy="350" rx="280" ry="160" fill="#15803d" opacity="0.6" />
          <polygon points="400,60 180,280 620,280" fill="#14532d" opacity="0.6" />
          <polygon points="250,100 80,280 420,280" fill="#166534" opacity="0.5" />
          <polygon points="560,120 360,280 760,280" fill="#15803d" opacity="0.5" />
        </svg>
        <BuildingSilhouette color="#ffffff" opacity={0.3} />
      </div>
    ),
  },
  {
    src: './images/slides/slide-04.jpg',
    title: '구기동 재개발 추진위원회',
    desc: '구기동 재개발 추진위원회 현장 전경 — 서울특별시 종로구',
    tags: ['추진위원회', '현장 전경', '종로구'],
    gradient: 'from-amber-400 via-orange-400 to-sky-500',
    visual: (
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-amber-100 to-amber-200">
        <BuildingSilhouette color="#78350f" opacity={0.2} />
        {/* 도로 */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-400/60 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 h-2 bg-gray-500/30" />
        {/* 표지석 */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
          <div className="bg-gray-800/80 backdrop-blur border-l-4 border-blue-500 px-6 py-3 rounded-r-xl shadow-xl">
            <p className="text-white text-sm font-bold">구기동 재개발 추진위원회</p>
            <p className="text-white/70 text-xs">서울특별시 종로구</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    src: './images/slides/slide-05.jpg',
    title: '재개발 전후 비교',
    desc: '낡은 주거지에서 현대적 주거단지로, 새로운 재탄생의 모습',
    tags: ['재개발 전', '재개발 후', '주거환경 개선'],
    gradient: 'from-gray-500 to-blue-600',
    visual: (
      <div className="absolute inset-0 flex">
        {/* 전 (Before) */}
        <div className="flex-1 bg-gradient-to-b from-gray-400 to-gray-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 21px)' }} />
          {/* 노후 건물들 */}
          {[60,120,175,230].map((x, i) => {
            const h = [80,100,70,90][i]
            return <div key={x} className="absolute bottom-0 bg-gray-600/80 border border-gray-500/50" style={{ left: x, width: 40, height: h }} />
          })}
          <div className="absolute top-4 left-4 bg-black/50 text-white/80 text-xs px-2 py-1 rounded">재개발 前</div>
          <div className="absolute bottom-4 left-4 text-white/70 text-xs">노후 주거지</div>
        </div>
        {/* 구분선 */}
        <div className="w-1 bg-white/60 z-10 flex items-center justify-center">
          <div className="bg-white text-gray-700 text-xs font-bold px-2 py-1 rounded shadow-lg rotate-0">→</div>
        </div>
        {/* 후 (After) */}
        <div className="flex-1 bg-gradient-to-b from-sky-400 to-blue-700 relative overflow-hidden">
          <BuildingSilhouette color="#bfdbfe" opacity={0.3} />
          <div className="absolute top-4 right-4 bg-blue-600/70 text-white text-xs px-2 py-1 rounded">재개발 後</div>
          <div className="absolute bottom-4 right-4 text-white/80 text-xs">현대 주거단지</div>
        </div>
      </div>
    ),
  },
  {
    src: './images/slides/slide-06.jpg',
    title: '전체 조감도 (교통·입지 중심)',
    desc: '대중교통 접근성이 뛰어난 구기동 재개발 대단지 전체 조감도',
    tags: ['교통 중심', '입지 우수', '대단지'],
    gradient: 'from-blue-700 via-sky-600 to-teal-600',
    visual: (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-sky-600 to-teal-500">
        <BuildingSilhouette color="#e0f2fe" opacity={0.28} />
        {/* 도로망 */}
        <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full opacity-20">
          <line x1="0" y1="300" x2="800" y2="200" stroke="white" strokeWidth="8" />
          <line x1="0" y1="350" x2="800" y2="260" stroke="white" strokeWidth="5" />
          <line x1="200" y1="0" x2="300" y2="400" stroke="white" strokeWidth="4" />
          <line x1="500" y1="0" x2="600" y2="400" stroke="white" strokeWidth="4" />
        </svg>
        <div className="absolute bottom-20 left-8 bg-white/20 backdrop-blur border border-white/30 rounded-xl px-4 py-2">
          <p className="text-white text-xs">교통·입지 중심 재개발</p>
          <p className="text-white/70 text-xs">서울특별시 종로구 구기동</p>
        </div>
      </div>
    ),
  },
  {
    src: './images/slides/slide-07.jpg',
    title: '재개발·재건축 통합 정보 플랫폼',
    desc: '서울특별시 종로구 재개발·재건축·도시개발 통합 정보 플랫폼',
    tags: ['통합 플랫폼', '스마트 서비스', '디지털 전환'],
    gradient: 'from-violet-700 via-purple-700 to-blue-800',
    visual: (
      <div className="absolute inset-0 bg-gradient-to-br from-violet-800 via-purple-700 to-blue-800">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 shadow-2xl mx-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
              <p className="text-white font-bold text-sm">서울시 통합 정보 플랫폼</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['사업 현황','자료 서비스','민원 신청','나의 관심'].map(m => (
                <div key={m} className="bg-white/10 rounded-lg px-3 py-2 text-white/80 text-xs text-center">{m}</div>
              ))}
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              {['재개발','재건축','도시정비','AI 서비스'].map(t => (
                <span key={t} className="text-white/60 text-xs bg-white/10 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    src: './images/slides/slide-08.jpg',
    title: '새로운 도시의 시작',
    desc: '구기동 재개발 추진위원회가 그리는 새로운 도시의 미래 비전',
    tags: ['비전 2030', '새로운 도시', '주거 혁신'],
    gradient: 'from-amber-500 via-orange-500 to-rose-600',
    visual: (
      <div className="absolute inset-0 bg-gradient-to-b from-amber-400 via-orange-500 to-rose-700">
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-sky-300/50 to-transparent" />
        <BuildingSilhouette color="#fff7ed" opacity={0.25} />
        {/* 태양 */}
        <div className="absolute top-12 right-24 w-20 h-20 bg-yellow-300/40 rounded-full blur-xl" />
        <div className="absolute top-16 right-28 w-12 h-12 bg-yellow-200/60 rounded-full" />
        {/* 표지석 */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
          <div className="bg-stone-800/80 backdrop-blur px-8 py-4 rounded-xl shadow-2xl text-center">
            <p className="text-white/70 text-xs mb-1">구기동 재개발 추진위원회</p>
            <p className="text-white font-bold text-lg">새로운 도시의 시작</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    src: './images/slides/slide-09.jpg',
    title: '구기동 대단지 조감도',
    desc: '종로구 구기동 재개발 대단지 최종 완공 조감도',
    tags: ['대단지', '완공 조감도', '구기동'],
    gradient: 'from-blue-600 via-sky-500 to-cyan-500',
    visual: (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400">
        <BuildingSilhouette color="#f0f9ff" opacity={0.3} />
        <div className="absolute inset-0 opacity-10" style={{
          background: 'repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,255,255,0.3) 60px, rgba(255,255,255,0.3) 61px)'
        }} />
        <div className="absolute bottom-16 right-8 bg-white/20 backdrop-blur rounded-xl px-4 py-2 border border-white/30">
          <p className="text-white text-xs font-bold">서울특별시 종로구</p>
          <p className="text-white/80 text-xs">구기동 재개발 사업구역</p>
        </div>
      </div>
    ),
  },
  {
    src: './images/slides/slide-10.jpg',
    title: '도시계획 전략 지도',
    desc: '길동 전략거점 및 9호선 연장에 따른 도시계획 현황 지도',
    tags: ['길동 전략거점', '9호선 연장', '도시계획'],
    gradient: 'from-green-600 via-teal-500 to-blue-600',
    visual: (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-blue-100">
        <svg viewBox="0 0 800 500" className="absolute inset-0 w-full h-full">
          {/* 배경 구역들 */}
          <rect x="0" y="0" width="800" height="500" fill="#f1f5f9" />
          <ellipse cx="300" cy="200" rx="180" ry="140" fill="#bbf7d0" opacity="0.7" stroke="#86efac" strokeWidth="1" />
          <ellipse cx="550" cy="150" rx="120" ry="100" fill="#fde68a" opacity="0.6" stroke="#fcd34d" strokeWidth="1" />
          <ellipse cx="200" cy="380" rx="150" ry="100" fill="#c7d2fe" opacity="0.6" stroke="#a5b4fc" strokeWidth="1" />
          <ellipse cx="600" cy="350" rx="130" ry="110" fill="#fca5a5" opacity="0.4" stroke="#f87171" strokeWidth="1" />
          {/* 도로망 */}
          <line x1="0" y1="250" x2="800" y2="230" stroke="#94a3b8" strokeWidth="6" />
          <line x1="0" y1="270" x2="800" y2="250" stroke="#e2e8f0" strokeWidth="3" />
          <line x1="380" y1="0" x2="360" y2="500" stroke="#94a3b8" strokeWidth="5" />
          {/* 전략거점 */}
          <circle cx="380" cy="235" r="45" fill="#3b82f6" opacity="0.9" />
          <circle cx="380" cy="235" r="65" fill="#3b82f6" opacity="0.15" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,3" />
          <text x="380" y="230" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">길동</text>
          <text x="380" y="248" textAnchor="middle" fill="white" fontSize="11">전략거점</text>
          {/* 9호선 */}
          <line x1="50" y1="420" x2="750" y2="380" stroke="#d97706" strokeWidth="8" strokeDasharray="20,8" opacity="0.8" />
          <text x="180" y="410" fill="#92400e" fontSize="12" fontWeight="bold">9호선연장</text>
          {/* 라벨들 */}
          <rect x="480" y="110" width="80" height="28" rx="4" fill="#fef3c7" stroke="#fcd34d" />
          <text x="520" y="129" textAnchor="middle" fill="#92400e" fontSize="11">생태보전형</text>
          <rect x="40" y="340" width="90" height="28" rx="4" fill="#ede9fe" stroke="#a78bfa" />
          <text x="85" y="359" textAnchor="middle" fill="#5b21b6" fontSize="10">보전·관리형</text>
        </svg>
      </div>
    ),
  },
]

export default function PublicHome() {
  const { notices, owners, project } = useAppStore()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const buildingChartRef = useRef<HTMLDivElement>(null)

  // 히어로 배경: 슬라이드 SVG 비주얼을 순환 (벡터 기반 무손실 품질)
  const heroBgIndices = [8, 2, 5, 7, 0]
  const [heroBgIdx, setHeroBgIdx] = useState(0)

  // 히어로 배경 자동 전환 (6초)
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroBgIdx((prev) => (prev + 1) % heroBgIndices.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  // 갤러리 슬라이더 상태
  const [slideIdx, setSlideIdx] = useState(0)
  const [slidesPaused, setSlidesPaused] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)

  // 슬라이드 자동 재생
  useEffect(() => {
    if (slidesPaused || lightboxOpen) return
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slidesPaused, lightboxOpen])

  // 라이트박스 키보드 네비게이션
  useEffect(() => {
    if (!lightboxOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') setLightboxIdx((prev) => (prev + 1) % slides.length)
      if (e.key === 'ArrowLeft') setLightboxIdx((prev) => (prev - 1 + slides.length) % slides.length)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen])

  const agreed = owners.filter((o) => o.consentStatus === 'agreed').length
  const consentRate = calculateConsentRate(agreed, owners.length)

  const buildingChartOption = {
    animation: false,
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#1f2937' } },
    series: [{
      name: '건축물 현황',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      labelLine: { show: false },
      data: [
        { value: 44, name: '단독주택 (48.9%)', itemStyle: { color: '#57b5e7' } },
        { value: 32, name: '공동주택 (35.6%)', itemStyle: { color: '#8dd3c7' } },
        { value: 12, name: '근린생활시설 (13.3%)', itemStyle: { color: '#fbba72' } },
        { value: 2, name: '기타 (2.2%)', itemStyle: { color: '#fc8d62' } },
      ],
    }],
  }

  const consentChartOption = {
    animation: false,
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['1월', '2월', '3월', '4월', '5월(예상)', '6월(목표)'],
      axisLabel: { color: '#1f2937' },
    },
    yAxis: {
      type: 'value', name: '동의율 (%)', min: 0, max: 100,
      axisLabel: { color: '#1f2937', formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#e5e7eb' } },
    },
    series: [
      {
        name: '동의율',
        type: 'line',
        smooth: true,
        data: [25, 38, null, 60, null, null],
        itemStyle: { color: '#57b5e7' },
        connectNulls: false,
        lineStyle: { width: 3 },
        areaStyle: { color: 'rgba(87,181,231,0.2)' },
        symbol: 'none',
      },
      {
        name: '목표 동의율',
        type: 'line',
        smooth: true,
        data: [20, 30, 40, 45, 50, 55],
        itemStyle: { color: '#fc8d62' },
        lineStyle: { width: 3, type: 'dashed' },
        symbol: 'none',
      },
    ],
    legend: { bottom: 0 },
  }

  const faqs = [
    {
      q: '재개발 사업의 추진 절차는 어떻게 되나요?',
      a: '재개발 사업은 정비계획 수립 및 정비구역 지정, 추진위원회 승인, 조합 설립 인가, 사업시행계획 인가, 관리처분계획 인가, 착공 및 준공, 이전고시 및 청산의 단계로 진행됩니다.',
    },
    {
      q: '동의서는 어떻게 제출하나요?',
      a: '동의서는 웹사이트에서 다운로드하여 작성 후 추진위원회 사무실에 직접 제출하거나, 온라인으로 제출할 수 있습니다. 자세한 내용은 \'동의서 제출 안내\' 공지사항을 참고해주세요.',
    },
    {
      q: '추진위원회는 어떤 역할을 하나요?',
      a: '추진위원회는 재개발 사업의 초기 단계에서 정비계획 수립, 조합 설립 준비, 주민 의견 수렴 등의 역할을 담당합니다. 추진위원회는 토지등소유자 과반수의 동의를 받아 구성됩니다.',
    },
    {
      q: '재개발 사업에 필요한 동의율은 얼마인가요?',
      a: '추진위원회 구성을 위해서는 토지등소유자 과반수의 동의가 필요하며, 조합 설립을 위해서는 토지등소유자의 3/4 이상 및 토지면적의 1/2 이상의 동의가 필요합니다.',
    },
  ]

  const pinned = notices.filter((n) => n.isPinned).slice(0, 3)
  const latestNotices = notices.slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ─── 헤더 ─── */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-blue-600">종로구 구기재개발추진위원회</h1>
          <nav className="hidden lg:flex space-x-8">
            {['사업개요', '갤러리', '추진현황', '알림마당', '자료실', '참여마당'].map((item, i) => (
              <a key={item} href={`#${['overview','gallery','status','notice','resources','participation'][i]}`}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors">{item}</a>
            ))}
            <Link to="/project-info" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors border-b-2 border-blue-600 pb-0.5">
              사업안내
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors">
              관리자 로그인
            </Link>
            <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
              회원가입
            </button>
          </div>
        </div>
      </header>

      {/* ─── 히어로 섹션 ─── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-sky-900">
        {/* 배경: 슬라이드 SVG 비주얼 순환 */}
        {heroBgIndices.map((slideIdx, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === heroBgIdx ? 1 : 0 }}
          >
            {slides[slideIdx].visual}
          </div>
        ))}
        {/* 어두운 오버레이 — 텍스트 가독성 확보 */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/40 to-blue-900/55" />

        {/* 하단 페이드 인디케이터 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroBgIndices.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroBgIdx(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === heroBgIdx ? 'bg-white w-6' : 'bg-white/40'}`}
              aria-label={`배경 ${i + 1}`}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/30 text-sm font-semibold mb-6">
              현재 단계: 정비계획 수립
            </span>
            <h2 className="text-5xl font-bold text-white leading-tight mb-6">
              구기동<br />
              <span className="text-sky-300">재개발 사업</span>
            </h2>
            <p className="text-xl text-white/85 mb-10 leading-relaxed">
              서울특별시 종로구 구기동 138-1 일원의 주거환경 개선을 위한<br />
              재개발 사업을 추진하고 있습니다.<br />
              더 나은 주거환경과 지역 발전을 위해 함께 참여해주세요.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/apply-consent"
                className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-4 rounded-xl text-base font-medium transition-colors shadow-lg shadow-blue-900/50">
                동의서 제출하기
              </Link>
              <Link to="/project-info"
                className="bg-white/15 hover:bg-white/25 text-white border border-white/40 backdrop-blur-sm px-8 py-4 rounded-xl text-base font-medium transition-colors">
                사업안내 보기
              </Link>
              <Link to="/my-share"
                className="bg-amber-500 hover:bg-amber-400 text-white px-8 py-4 rounded-xl text-base font-semibold transition-colors shadow-lg shadow-amber-900/40">
                🏠 내 분담금 계산
              </Link>
              <Link to="/apply"
                className="bg-white/10 hover:bg-white/20 text-white/80 border border-white/30 backdrop-blur-sm px-6 py-4 rounded-xl text-sm font-medium transition-colors">
                추진위원회 모집 신청
              </Link>
            </div>
          </div>

          {/* 히어로 통계 카드 */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: '구역 면적', value: '88,165.5', unit: 'm²', desc: '약 2.67만평', color: 'from-blue-500/90 to-blue-600/90' },
              { label: '현재 동의율', value: `${consentRate.toFixed(1)}`, unit: '%', desc: `${agreed}명/${owners.length}명`, color: 'from-green-500/90 to-green-600/90' },
              { label: '신축 세대', value: '1,340', unit: '세대', desc: '조합원 480명 → 2.79배 확장', color: 'from-purple-500/90 to-purple-600/90' },
              { label: '노후건물 비율', value: '74.4', unit: '%', desc: '기준(60%) 충족', color: 'from-orange-500/90 to-orange-600/90' },
            ].map((stat) => (
              <div key={stat.label}
                className={`bg-gradient-to-br ${stat.color} backdrop-blur-sm text-white p-6 rounded-2xl shadow-lg border border-white/10`}>
                <p className="text-sm font-medium opacity-80 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">
                  {stat.value}<span className="text-lg ml-0.5">{stat.unit}</span>
                </p>
                <p className="text-sm opacity-70 mt-1">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 진행 단계 ─── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12">재개발 사업 진행 단계</h3>
          <div className="relative flex justify-between items-start max-w-5xl mx-auto">
            {[
              '정비계획\n수립', '추진위원회\n승인', '조합 설립\n인가',
              '사업시행\n인가', '관리처분\n인가', '착공/준공', '이전고시\n청산'
            ].map((label, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div className="relative w-full flex items-center justify-center mb-3">
                  {idx > 0 && (
                    <div className={`absolute right-1/2 top-1/2 -translate-y-1/2 h-0.5 w-full
                      ${idx === 0 ? 'bg-blue-500' : 'bg-gray-200'}`} />
                  )}
                  <div className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold border-2 shadow-sm
                    ${idx === 0
                      ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200'
                      : 'bg-white text-gray-400 border-gray-200'}`}>
                    {idx === 0 ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : idx + 1}
                  </div>
                </div>
                <span className={`text-xs font-medium text-center whitespace-pre-line leading-tight
                  ${idx === 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                  {label}
                </span>
                {idx === 0 && (
                  <span className="mt-1.5 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">현재</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 사업 갤러리 ─── */}
      <section id="gallery" className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-3">사업 갤러리</h2>
          <p className="text-center text-gray-500 mb-10">구기동 재개발 사업의 현재와 미래를 한눈에 확인하세요</p>

          {/* 메인 슬라이더 */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer select-none"
            style={{ height: '520px' }}
            onMouseEnter={() => setSlidesPaused(true)}
            onMouseLeave={() => setSlidesPaused(false)}
            onClick={() => { setLightboxIdx(slideIdx); setLightboxOpen(true) }}
          >
            {/* 슬라이드 이미지 */}
            {slides.map((slide, idx) => (
              <SlideItem key={idx} slide={slide} active={idx === slideIdx} />
            ))}

            {/* 하단 그라디언트 오버레이 */}
            <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-20" />

            {/* 슬라이드 텍스트 */}
            <div className="absolute bottom-0 inset-x-0 p-8 pointer-events-none z-30">
              <p className="text-white/60 text-sm mb-1.5 font-medium tracking-wider uppercase">
                {String(slideIdx + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </p>
              <h3 className="text-white text-2xl md:text-3xl font-bold mb-2 drop-shadow">{slides[slideIdx].title}</h3>
              <p className="text-white/75 text-sm md:text-base">{slides[slideIdx].desc}</p>
            </div>

            {/* 확대 힌트 */}
            <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white/90 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 pointer-events-none z-30">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              클릭하여 크게 보기
            </div>

            {/* 자동재생 일시정지 표시 */}
            {slidesPaused && (
              <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm text-white/90 text-xs px-3 py-1.5 rounded-full z-30 flex items-center gap-1.5 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-white/70 inline-block" />
                일시정지
              </div>
            )}

            {/* 이전 버튼 */}
            <button
              onClick={(e) => { e.stopPropagation(); setSlideIdx((slideIdx - 1 + slides.length) % slides.length) }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors text-2xl font-light z-30"
              aria-label="이전"
            >
              ‹
            </button>

            {/* 다음 버튼 */}
            <button
              onClick={(e) => { e.stopPropagation(); setSlideIdx((slideIdx + 1) % slides.length) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors text-2xl font-light z-30"
              aria-label="다음"
            >
              ›
            </button>

            {/* 도트 인디케이터 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30 pointer-events-none">
              {slides.map((_, idx) => (
                <div
                  key={idx}
                  className={`rounded-full transition-all duration-400 ${idx === slideIdx ? 'w-7 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`}
                />
              ))}
            </div>
          </div>

          {/* 썸네일 스트립 */}
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {slides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => setSlideIdx(idx)}
                className={`flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 relative ${
                  idx === slideIdx
                    ? 'border-blue-500 shadow-lg shadow-blue-200 scale-105'
                    : 'border-transparent opacity-55 hover:opacity-85'
                }`}
                style={{ height: '72px', width: '112px' }}
                title={slide.title}
              >
                <ThumbItem slide={slide} />
                {idx === slideIdx && (
                  <div className="absolute bottom-0 inset-x-0 bg-blue-500/70 text-white text-xs text-center py-0.5 truncate px-1">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 사업 개요 ─── */}
      <section id="overview" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4">사업 개요</h2>
          <p className="text-center text-gray-500 mb-16">서울특별시 종로구 구기동 138-1 일원 주택정비형 재개발사업</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 사업 위치 및 규모 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">📍</div>
                사업 위치 및 규모
              </h3>
              <div className="space-y-3">
                {[
                  ['사업 위치', '서울특별시 종로구 구기동 138-1 일원'],
                  ['구역 면적', '88,165.5m²'],
                  ['필지 수', '179필지'],
                  ['건축물 수', '90동 (주건축물 기준)'],
                  ['용도지역', '제1종전용주거지역, 제1종·제2종일반주거지역, 자연녹지지역'],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="font-medium text-gray-500 w-28 flex-shrink-0 text-sm">{k}</span>
                    <span className="text-gray-800 text-sm">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 건축물 현황 차트 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">🏘️</div>
                현재 건축물 현황
              </h3>
              <ReactECharts option={buildingChartOption} style={{ height: 220 }} />
            </div>

            {/* 추진 요건 검토 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">📋</div>
                재개발 추진 요건 검토 결과
              </h3>
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    {['항목', '현황', '기준', '충족 여부'].map((h) => (
                      <th key={h} className="py-2 px-3 bg-gray-50 text-left font-medium text-gray-600 first:rounded-l-lg last:rounded-r-lg">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['노후·불량 건축물 비율', '74.4%', '60% 이상', true],
                    ['과소필지 비율', '15.1%', '40% 이상', false],
                    ['접도율', '13.3%', '40% 이하', true],
                    ['호수밀도', '16.2호/ha', '60호/ha 이상', false],
                  ].map(([label, value, std, ok], i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2.5 px-3 text-gray-700">{label as string}</td>
                      <td className="py-2.5 px-3 font-semibold">{value as string}</td>
                      <td className="py-2.5 px-3 text-gray-500 text-xs">{std as string}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                          ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {ok ? '충족' : '미충족'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 p-3 bg-green-50 rounded-xl text-xs text-green-700">
                종합: 서울특별시 「도시 및 주거환경정비 조례」 제6조제1항제2호에 따른 주택정비형 재개발의 정비계획 입안 요건을 충족하는 것으로 확인됨.
              </div>
            </div>

            {/* 동의서 현황 차트 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">📊</div>
                동의서 제출 현황
              </h3>
              <ReactECharts option={consentChartOption} style={{ height: 220 }} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── 추진 현황 ─── */}
      <section id="status" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4">추진 현황</h2>
          <p className="text-center text-gray-500 mb-14">2026년 4월 13일 기준</p>

          <div className="max-w-4xl mx-auto space-y-10">
            {/* ── 정비계획 입안 요건 충족 결과 ── */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">정비계획 입안 요건 — 충족 확인</h3>
                  <p className="text-xs text-gray-500">한국부동산원 현황분석 검토의견서 (2026년 1월) · 서울특별시 도시 및 주거환경정비 조례 제6조제1항제2호</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  {[
                    { label: '노후·불량 건축물', value: '74.4%', standard: '기준 60% 이상', met: true },
                    { label: '과소필지 비율', value: '15.1%', standard: '기준 40% 이상', met: false },
                    { label: '접도율', value: '13.3%', standard: '기준 40% 이하', met: true },
                    { label: '호수밀도', value: '16.2호/ha', standard: '기준 60호/ha+', met: false },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-xl p-4 border ${item.met ? 'bg-white border-green-200' : 'bg-white border-orange-100'}`}>
                      <div className={`text-xs font-semibold mb-1 flex items-center gap-1 ${item.met ? 'text-green-600' : 'text-orange-500'}`}>
                        {item.met ? '✓ 충족' : '△ 미충족'}
                      </div>
                      <p className="text-2xl font-bold text-gray-900 leading-tight">{item.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-snug">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.standard}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl p-4 border border-green-200">
                  <p className="text-sm font-bold text-green-800 flex items-center gap-2">
                    <span>✅</span> 종합 판정: 정비계획 입안 요건 충족
                  </p>
                  <p className="text-xs text-green-700 mt-1.5 leading-relaxed">
                    노후·불량 건축물 비율(74.4%) 및 접도율(13.3%) 2개 요건 충족으로, 서울특별시 「도시 및 주거환경정비 조례」
                    제6조제2항 단서 조항에 따라 정비계획 입안이 <strong>가능</strong>합니다.
                    한국부동산원 현황분석 검토의견서에 의해 공식 확인된 결과입니다 (2026년 1월 기준).
                  </p>
                </div>
              </div>
            </div>

            {/* ── 재개발 사업 핵심 강점 ── */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">구기2지구 재개발 — 핵심 강점</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-600 text-white rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold text-lg">🏗️</div>
                    <div>
                      <p className="font-bold text-lg">주택정비형 재개발사업</p>
                      <p className="text-blue-200 text-xs">도시 및 주거환경정비법 (도정법) 기반</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-blue-100">
                    <li className="flex gap-2"><span className="text-white flex-shrink-0">✓</span> 한국부동산원 요건 충족 공식 확인 (2026.01)</li>
                    <li className="flex gap-2"><span className="text-white flex-shrink-0">✓</span> 비례율 93~128% 달성 가능 (적정안 110.80% 환급)</li>
                    <li className="flex gap-2"><span className="text-white flex-shrink-0">✓</span> 강북횡단선·GTX-E 교통 호재 → 분양가 상승</li>
                    <li className="flex gap-2"><span className="text-white flex-shrink-0">✓</span> 조합원 480명 → 신축 1,340세대 (2.79배 확장)</li>
                    <li className="flex gap-2"><span className="text-yellow-300 flex-shrink-0">★</span> 구기동 현재 추진 방식</li>
                  </ul>
                  <div className="mt-4 bg-white/15 rounded-xl p-3 text-xs text-white font-medium text-center">
                    ✅ 재개발 방식 — 소유자에게 가장 유리
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">📊</div>
                    <div>
                      <p className="font-bold text-lg text-gray-800">수지분석 요약</p>
                      <p className="text-gray-400 text-xs">2025 국토부 기준 · 강북횡단선 반영</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: '재건축 (비교)', ratio: '72.50%', note: '8,250만 분담', w: '57', color: 'bg-red-400' },
                      { label: '재개발 보수안', ratio: '93.30%', note: '1.07억 환급', w: '73', color: 'bg-sky-400' },
                      { label: '재개발 적정안', ratio: '110.80%', note: '1.37억 환급', w: '87', color: 'bg-blue-600' },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">{item.label}</span>
                          <span className="font-bold text-gray-800">{item.ratio} — {item.note}</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.w}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-blue-50 rounded-xl p-3 text-xs text-blue-700 font-medium text-center">
                    자세한 수지분석 → <a href="/project-info" className="underline font-bold">사업안내 페이지</a>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 추진 로드맵 ── */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">재개발 추진 로드맵</h3>
              <div className="space-y-3">
                {[
                  { step: 1, title: '정비계획 수립 및 정비구역 지정', desc: '한국부동산원 검토 완료(2026.01). 정비계획 입안 요건 충족 확인. 동의서 징구 진행 중.', status: 'current', date: '2026년 1~6월' },
                  { step: 2, title: '추진위원회 승인', desc: '토지등소유자 과반수(50%+1) 동의 획득 후 종로구청에 추진위원회 승인 신청.', status: 'next', date: '2026년 하반기 목표' },
                  { step: 3, title: '조합 설립 인가', desc: '추진위원회 승인 후 토지등소유자 3/4 이상 동의를 받아 조합을 설립합니다.', status: 'future', date: '2027년 예정' },
                  { step: 4, title: '사업시행계획 인가', desc: '조합 설립 후 건축계획 수립, 사업시행계획서를 작성하여 구청에 인가 신청.', status: 'future', date: '2028년 예정' },
                  { step: 5, title: '관리처분계획 인가', desc: '사업시행 인가 후 각 소유자별 권리 배분(분양·현금 청산)에 관한 계획 수립.', status: 'future', date: '2029년 예정' },
                  { step: 6, title: '착공 및 준공', desc: '철거 후 아파트 신축 공사 시작, 완공 후 임시 이주.', status: 'future', date: '2030~2033년 예정' },
                  { step: 7, title: '이전고시 및 청산', desc: '준공 후 입주, 분양 완료 후 조합 청산.', status: 'future', date: '2033년 이후' },
                ].map((item) => (
                  <div key={item.step} className={`flex gap-4 p-4 rounded-xl border transition-colors
                    ${item.status === 'current' ? 'bg-blue-50 border-blue-200' : item.status === 'next' ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-bold
                      ${item.status === 'current' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' :
                        item.status === 'next' ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {item.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`font-bold ${item.status === 'current' ? 'text-blue-700' : item.status === 'next' ? 'text-orange-700' : 'text-gray-600'}`}>
                          {item.title}
                        </h4>
                        {item.status === 'current' && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">현재 진행</span>}
                        {item.status === 'next' && <span className="text-xs bg-orange-400 text-white px-2 py-0.5 rounded-full">다음 단계</span>}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                      <p className={`text-xs mt-1 font-medium ${item.status === 'current' ? 'text-blue-500' : 'text-gray-400'}`}>📅 {item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 알림마당 ─── */}
      <section id="notice" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">알림마당</h2>
          <div className="max-w-4xl mx-auto space-y-8">
            {/* 공지사항 */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center">
                <h3 className="font-bold">공지사항</h3>
                <Link to="/admin/notice" className="text-white/80 hover:text-white text-sm">더보기 →</Link>
              </div>
              <ul className="divide-y divide-gray-100">
                {latestNotices.map((n) => (
                  <li key={n.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 min-w-0">
                        {n.category === 'urgent' && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full flex-shrink-0">긴급</span>
                        )}
                        {n.isPinned && <span className="text-blue-500 text-xs flex-shrink-0">📌</span>}
                        <a href="#" className="hover:text-blue-600 text-sm truncate">{n.title}</a>
                      </div>
                      <span className="text-gray-400 text-xs flex-shrink-0 ml-4">{n.createdAt}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* 자주 묻는 질문 */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-blue-600 text-white flex justify-between items-center">
                <h3 className="font-bold">자주 묻는 질문</h3>
                <Link to="/admin/qna" className="text-white/80 hover:text-white text-sm">더보기 →</Link>
              </div>
              <div className="divide-y divide-gray-100">
                {faqs.map((faq, i) => (
                  <div key={i} className="px-6 py-4">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex justify-between items-center w-full text-left font-medium text-sm hover:text-blue-600 gap-2"
                    >
                      <span>{faq.q}</span>
                      <span className="text-gray-400 flex-shrink-0">{openFaq === i ? '▲' : '▼'}</span>
                    </button>
                    {openFaq === i && (
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 자료실 ─── */}
      <section id="resources" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4">자료실</h2>
          <p className="text-center text-gray-500 mb-14">공식 문서와 법령 자료를 다운로드하실 수 있습니다</p>
          <div className="max-w-4xl mx-auto space-y-8">

            {/* ── 핵심 공문서 ── */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                <span>📊</span> 한국부동산원 현황분석 검토의견서
              </h3>
              <p className="text-blue-200 text-xs mb-5">
                구기동 재개발 사업의 법적 근거가 되는 핵심 공문서 (2026년 1월 발급)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                {[
                  { label: '검토 기관', value: '한국부동산원' },
                  { label: '검토 기준일', value: '2026년 1월' },
                  { label: '종합 결과', value: '입안 요건 충족' },
                ].map((item) => (
                  <div key={item.label} className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-blue-200 text-xs mb-0.5">{item.label}</p>
                    <p className="font-bold text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/docs/kab-review-opinion.pdf"
                  download
                  onClick={(e) => { e.preventDefault(); import('react-hot-toast').then(m => m.default.success('파일을 준비 중입니다. 추진위원회에 문의하세요.')) }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-blue-700 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors"
                >
                  ⬇️ PDF 다운로드
                </a>
                <a
                  href="/docs/kab-review-opinion.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => { e.preventDefault(); import('react-hot-toast').then(m => m.default.success('파일을 준비 중입니다. 추진위원회에 문의하세요.')) }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/15 hover:bg-white/25 text-white rounded-xl font-semibold text-sm border border-white/30 transition-colors"
                >
                  🔍 온라인으로 보기
                </a>
              </div>
              <p className="text-blue-300 text-xs mt-3 text-center">
                * 원본 파일이 등록되면 자동으로 다운로드됩니다. 현재 준비 중입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 동의서 양식 */}
              <div className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">📄 동의서 양식</h3>
                <div className="space-y-2.5">
                  {[
                    { title: '정비계획 입안 동의서', badge: '필수' },
                    { title: '정비계획 입안 반대 동의서', badge: null },
                    { title: '개인정보 수집 및 이용 동의서', badge: null },
                    { title: '대표소유자 선임 동의서', badge: null },
                  ].map((item) => (
                    <div key={item.title} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">📄</div>
                        <span className="text-sm font-medium truncate">{item.title}</span>
                        {item.badge && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full flex-shrink-0">{item.badge}</span>}
                      </div>
                      <Link to="/apply-consent" className="text-blue-600 text-xs hover:underline flex-shrink-0 ml-2 font-medium">
                        전자제출 →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* 관련 법령 */}
              <div className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">⚖️ 관련 법령</h3>
                <div className="space-y-2.5">
                  {[
                    { title: '도시 및 주거환경정비법 (도정법)', url: 'https://www.law.go.kr/lsInfoP.do?lsiSeq=246716' },
                    { title: '서울특별시 도시 및 주거환경정비 조례', url: 'https://www.seoul.go.kr' },
                    { title: '전자서명법 (동의서 법적 효력)', url: 'https://www.law.go.kr' },
                    { title: '감정평가에 관한 규칙 (국토교통부)', url: 'https://www.law.go.kr' },
                  ].map((item) => (
                    <a
                      key={item.title}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">⚖️</div>
                        <span className="text-sm font-medium truncate">{item.title}</span>
                      </div>
                      <span className="text-blue-600 text-xs flex-shrink-0 ml-2">🔗 보기</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* 주민설명회 자료 */}
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">📑 주민설명회 및 회의 자료</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { title: '제1차 주민설명회 자료', date: '2026-02-15', type: 'PDF' },
                  { title: '제2차 주민설명회 자료', date: '2026-03-10', type: 'PDF' },
                  { title: '정비계획 입안 요건 검토 요약', date: '2026-01-31', type: 'PDF' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer"
                    onClick={() => import('react-hot-toast').then(m => m.default.success('파일을 준비 중입니다. 추진위원회에 문의하세요.'))}>
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-red-600">{item.type}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 참여마당 ─── */}
      <section id="participation" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">참여마당</h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 추진위원회 모집 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>👥</span> 추진위원회 모집
              </h3>
              <p className="text-gray-600 mb-4 text-sm">구기동 재개발사업에 적극적으로 참여하고 기여할 주민을 모집합니다.</p>
              <ul className="space-y-2 mb-6 text-sm">
                {[
                  '자격: 구기동 내 토지 또는 건축물 소유자',
                  '역할: 재개발사업의 초기 단계부터 계획 수립 및 진행에 참여',
                  '모집기간: 2026년 4월 15일 ~ 5월 31일',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-blue-500 flex-shrink-0">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/apply"
                className="block text-center bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium">
                신청하기
              </Link>
            </div>

            {/* 문의하기 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>💬</span> 문의하기
              </h3>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="이름을 입력하세요" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                  <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="이메일을 입력하세요" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">문의내용</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" rows={3} placeholder="문의내용을 입력하세요" />
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm">
                제출하기
              </button>
            </div>

            {/* 사업 위치 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm md:col-span-2">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📍</span> 추진위원회 사무실
              </h3>
              {/* Google Maps embed — API 키 불필요 */}
              <div className="relative rounded-xl overflow-hidden mb-4 border border-gray-200" style={{ height: '200px' }}>
                <iframe
                  title="구기동 재개발 사업구역 위치"
                  src="https://maps.google.com/maps?q=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C+%EC%A2%85%EB%A1%9C%EA%B5%AC+%EA%B5%AC%EA%B8%B0%EB%8F%99+138-1&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  href="https://maps.google.com/maps?q=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C+%EC%A2%85%EB%A1%9C%EA%B5%AC+%EA%B5%AC%EA%B8%B0%EB%8F%99+138-1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5 bg-white text-gray-700 text-xs px-3 py-1.5 rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200 font-medium"
                >
                  구글 지도에서 보기 →
                </a>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {[
                  { icon: '📌', label: '주소', value: '종로구 구기동 123-45 구기빌딩 2층' },
                  { icon: '📞', label: '전화', value: '010-5787-6695' },
                  { icon: '📧', label: '이메일', value: 'guki@redevelopment.org' },
                  { icon: '🕐', label: '운영시간', value: '평일 09:00~18:00' },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-gray-500 text-xs mb-0.5">{item.icon} {item.label}</p>
                    <p className="font-medium text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 푸터 ─── */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">종로구 구기재개발추진위원회</h3>
              <p className="text-gray-400 text-sm">서울특별시 종로구 구기동 123-45 구기빌딩 2층</p>
              <p className="text-gray-400 text-sm">연락처: 010-5787-6695</p>
              <p className="text-gray-400 text-sm">이메일: guki@redevelopment.org</p>
            </div>
            <div className="grid grid-cols-2 gap-12">
              <div>
                <h4 className="font-bold mb-4">바로가기</h4>
                <ul className="space-y-2">
                  {[['사업개요', '#overview'], ['갤러리', '#gallery'], ['추진현황', '#status'], ['알림마당', '#notice'], ['자료실', '#resources'], ['참여마당', '#participation']].map(([label, href]) => (
                    <li key={label}><a href={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">관련 기관</h4>
                <ul className="space-y-2">
                  {[['서울특별시', 'https://www.seoul.go.kr'], ['종로구청', 'https://www.jongno.go.kr'], ['한국부동산원', 'https://www.kab.co.kr'], ['국토교통부', 'https://www.molit.go.kr']].map(([name, url]) => (
                    <li key={name}><a href={url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">{name}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© 2026 종로구 구기재개발추진위원회. All rights reserved.</p>

            <div className="mt-2 space-x-4">
              <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
              <a href="#" className="hover:text-white transition-colors">이용약관</a>
              <a href="#" className="hover:text-white transition-colors">사이트맵</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── 라이트박스 ─── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* 헤더 */}
          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/60 to-transparent z-10" onClick={(e) => e.stopPropagation()}>
            <div>
              <p className="text-white/50 text-xs mb-0.5">{String(lightboxIdx + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</p>
              <p className="text-white font-semibold text-lg leading-tight">{slides[lightboxIdx].title}</p>
              <p className="text-white/60 text-sm">{slides[lightboxIdx].desc}</p>
            </div>
            <button
              onClick={() => setLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white text-2xl flex items-center justify-center transition-colors flex-shrink-0 ml-4"
              aria-label="닫기"
            >
              ×
            </button>
          </div>

          {/* 메인 이미지 */}
          <div
            className="relative max-w-5xl w-full mx-4 rounded-xl overflow-hidden shadow-2xl"
            style={{ maxHeight: '70vh', aspectRatio: '16/9' }}
            onClick={(e) => e.stopPropagation()}
          >
            <SlideItem slide={slides[lightboxIdx]} active={true} />
          </div>

          {/* 이전 버튼 */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/25 text-white text-3xl rounded-full flex items-center justify-center transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + slides.length) % slides.length) }}
            aria-label="이전"
          >
            ‹
          </button>

          {/* 다음 버튼 */}
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/25 text-white text-3xl rounded-full flex items-center justify-center transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % slides.length) }}
            aria-label="다음"
          >
            ›
          </button>

          {/* 하단 썸네일 바 */}
          <div
            className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-4 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center gap-2 overflow-x-auto scrollbar-hide">
              {slides.map((slide, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIdx(idx)}
                  className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    idx === lightboxIdx
                      ? 'border-white opacity-100 scale-110 shadow-xl'
                      : 'border-transparent opacity-40 hover:opacity-70'
                  }`}
                  style={{ width: '72px', height: '48px' }}
                  title={slide.title}
                >
                  <ThumbItem slide={slide} />
                </button>
              ))}
            </div>
            <p className="text-center text-white/30 text-xs mt-3">ESC 또는 배경 클릭으로 닫기 · ← → 키로 이동</p>
          </div>
        </div>
      )}
    </div>
  )
}
