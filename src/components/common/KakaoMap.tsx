import { useState } from 'react'

export interface ParcelClick {
  lat: number
  lng: number
  address: string
  jibunAddress: string
}

interface KakaoMapProps {
  lat?: number
  lng?: number
  level?: number
  height?: string
  className?: string
  showProjectBoundary?: boolean
  onParcelClick?: (info: ParcelClick) => void
}

// 구기2지구 사업구역 내 주요 필지 (SVG 시뮬레이션용 — 실제 좌표는 추후 정밀화)
const SAMPLE_PARCELS = [
  { id: 'A', x: 140, y: 110, w: 90,  h: 60, jibun: '구기동 138-1',  road: '진흥로 123', lat: 37.6035, lng: 126.9598 },
  { id: 'B', x: 240, y: 100, w: 80,  h: 70, jibun: '구기동 138-5',  road: '진흥로 125', lat: 37.6038, lng: 126.9605 },
  { id: 'C', x: 330, y: 120, w: 70,  h: 55, jibun: '구기동 138-12', road: '진흥로 127', lat: 37.6040, lng: 126.9612 },
  { id: 'D', x: 150, y: 180, w: 75,  h: 65, jibun: '구기동 140-3',  road: '진흥로 130', lat: 37.6028, lng: 126.9600 },
  { id: 'E', x: 235, y: 180, w: 85,  h: 65, jibun: '구기동 142-7',  road: '진흥로 132', lat: 37.6026, lng: 126.9608 },
  { id: 'F', x: 330, y: 185, w: 75,  h: 60, jibun: '구기동 144-2',  road: '진흥로 134', lat: 37.6024, lng: 126.9615 },
  { id: 'G', x: 160, y: 255, w: 95,  h: 60, jibun: '구기동 148-1',  road: '진흥로 140', lat: 37.6018, lng: 126.9603 },
  { id: 'H', x: 265, y: 255, w: 80,  h: 60, jibun: '구기동 150-4',  road: '진흥로 142', lat: 37.6016, lng: 126.9611 },
]

export default function KakaoMap({
  height = 'h-96',
  className = '',
  onParcelClick,
}: KakaoMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleClick = (p: typeof SAMPLE_PARCELS[number]) => {
    setSelectedId(p.id)
    onParcelClick?.({
      lat: p.lat,
      lng: p.lng,
      address: p.road,
      jibunAddress: p.jibun,
    })
  }

  return (
    <div className={`${height} ${className} relative rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-br from-emerald-50 via-sky-50 to-blue-100`}>
      {/* 배경 그리드 */}
      <svg viewBox="0 0 500 380" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.6" />
          </pattern>
          <linearGradient id="parkG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>
        <rect width="500" height="380" fill="url(#grid)" />

        {/* 북한산 (북쪽 녹지) */}
        <ellipse cx="90" cy="60" rx="130" ry="50" fill="url(#parkG)" opacity="0.6" />
        <ellipse cx="420" cy="55" rx="110" ry="45" fill="url(#parkG)" opacity="0.55" />
        <text x="90" y="65" textAnchor="middle" fill="#166534" fontSize="12" fontWeight="700">🏔 북한산</text>

        {/* 도로 */}
        <line x1="0" y1="90" x2="500" y2="90" stroke="#94a3b8" strokeWidth="6" opacity="0.5" />
        <line x1="0" y1="230" x2="500" y2="230" stroke="#94a3b8" strokeWidth="4" opacity="0.5" />
        <line x1="0" y1="340" x2="500" y2="340" stroke="#94a3b8" strokeWidth="6" opacity="0.5" />
        <line x1="125" y1="0" x2="125" y2="380" stroke="#94a3b8" strokeWidth="3" opacity="0.4" />
        <line x1="420" y1="0" x2="420" y2="380" stroke="#94a3b8" strokeWidth="3" opacity="0.4" />
        <text x="10" y="86" fill="#475569" fontSize="10" fontWeight="600">진흥로</text>
        <text x="10" y="336" fill="#475569" fontSize="10" fontWeight="600">구기터널로</text>

        {/* 사업구역 경계 */}
        <polygon
          points="125,90 420,90 430,340 115,340"
          fill="#3b82f6"
          fillOpacity="0.08"
          stroke="#1d4ed8"
          strokeWidth="2"
          strokeDasharray="6,3"
        />
        <rect x="210" y="95" width="130" height="20" fill="#1d4ed8" rx="4" />
        <text x="275" y="110" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">구기2지구 사업구역</text>

        {/* 필지 */}
        {SAMPLE_PARCELS.map(p => {
          const selected = selectedId === p.id
          return (
            <g key={p.id} className="cursor-pointer" onClick={() => handleClick(p)}>
              <rect
                x={p.x}
                y={p.y}
                width={p.w}
                height={p.h}
                fill={selected ? '#2563eb' : '#fef3c7'}
                fillOpacity={selected ? 0.85 : 0.7}
                stroke={selected ? '#1e40af' : '#d97706'}
                strokeWidth={selected ? 2.5 : 1.2}
                rx="3"
              >
                <title>{p.jibun}</title>
              </rect>
              <text
                x={p.x + p.w / 2}
                y={p.y + p.h / 2 + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill={selected ? '#fff' : '#78350f'}
                pointerEvents="none"
              >
                {p.id}
              </text>
            </g>
          )
        })}

        {/* 방위 */}
        <g transform="translate(460, 30)">
          <circle cx="0" cy="0" r="14" fill="#fff" stroke="#64748b" strokeWidth="1" />
          <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="700" fill="#334155">N</text>
        </g>
      </svg>

      {/* 상단 안내 */}
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-sm border border-gray-200 text-xs">
        <p className="font-bold text-gray-800">🗺 구기2지구 인터랙티브 지도</p>
        <p className="text-gray-500 mt-0.5">노란색 필지를 클릭하세요</p>
      </div>

      {/* 선택 정보 */}
      {selectedId && (
        <div className="absolute bottom-3 left-3 right-3 bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm">
          <p className="font-bold">
            ✓ 선택됨: {SAMPLE_PARCELS.find(p => p.id === selectedId)?.jibun}
          </p>
          <p className="text-blue-100 text-xs mt-0.5">
            {SAMPLE_PARCELS.find(p => p.id === selectedId)?.road}
          </p>
        </div>
      )}
    </div>
  )
}
