import { useState } from 'react'
import { MapPin, Check } from 'lucide-react'

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

// 구기2지구 주요 필지 — 실제 사업구역 내 대표 지번 (사전 시뮬레이션용)
const SAMPLE_PARCELS = [
  { id: 'A', jibun: '구기동 138-1',  road: '진흥로 123',  lat: 37.6035, lng: 126.9598, type: '단독주택', area: '198㎡' },
  { id: 'B', jibun: '구기동 138-5',  road: '진흥로 125',  lat: 37.6038, lng: 126.9605, type: '단독주택', area: '165㎡' },
  { id: 'C', jibun: '구기동 138-12', road: '진흥로 127',  lat: 37.6040, lng: 126.9612, type: '다세대빌라', area: '89㎡' },
  { id: 'D', jibun: '구기동 140-3',  road: '진흥로 130',  lat: 37.6028, lng: 126.9600, type: '단독주택', area: '231㎡' },
  { id: 'E', jibun: '구기동 142-7',  road: '진흥로 132',  lat: 37.6026, lng: 126.9608, type: '다세대빌라', area: '76㎡' },
  { id: 'F', jibun: '구기동 144-2',  road: '진흥로 134',  lat: 37.6024, lng: 126.9615, type: '근린생활시설', area: '145㎡' },
  { id: 'G', jibun: '구기동 148-1',  road: '진흥로 140',  lat: 37.6018, lng: 126.9603, type: '단독주택', area: '212㎡' },
  { id: 'H', jibun: '구기동 150-4',  road: '진흥로 142',  lat: 37.6016, lng: 126.9611, type: '다가구주택', area: '258㎡' },
]

export default function KakaoMap({
  height = 'h-96',
  className = '',
  onParcelClick,
}: KakaoMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleSelect = (p: typeof SAMPLE_PARCELS[number]) => {
    setSelectedId(p.id)
    onParcelClick?.({
      lat: p.lat,
      lng: p.lng,
      address: p.road,
      jibunAddress: p.jibun,
    })
  }

  const selected = SAMPLE_PARCELS.find(p => p.id === selectedId)

  // 선택된 필지가 있으면 해당 주소로, 없으면 구기동 138-1 일원으로
  const mapQuery = selected
    ? encodeURIComponent(`서울특별시 종로구 ${selected.jibun}`)
    : encodeURIComponent('서울특별시 종로구 구기동 138-1')

  return (
    <div className={`${className} rounded-xl overflow-hidden border border-gray-200 bg-white`}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
        {/* Google Maps 영역 */}
        <div className={`lg:col-span-3 relative ${height}`}>
          <iframe
            key={mapQuery}
            title="구기2지구 위치 지도"
            src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=17&ie=UTF8&iwloc=&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          {/* 배지 */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-md border border-gray-200 text-xs pointer-events-none">
            <p className="font-bold text-gray-800 flex items-center gap-1">
              <MapPin size={12} className="text-blue-600" /> 구기2지구 사업구역
            </p>
            <p className="text-gray-500 mt-0.5">서울특별시 종로구 구기동 138-1 일원</p>
          </div>
          {/* Google Maps 바로가기 */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 bg-white text-gray-700 text-xs px-3 py-1.5 rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200 font-medium"
          >
            Google 지도에서 크게 보기 →
          </a>
        </div>

        {/* 필지 선택 패널 */}
        <div className={`lg:col-span-2 ${height} overflow-y-auto bg-gradient-to-b from-gray-50 to-white border-l border-gray-200`}>
          <div className="sticky top-0 bg-white/95 backdrop-blur px-4 py-3 border-b border-gray-200 z-10">
            <p className="font-bold text-sm text-gray-800">📍 내 부동산 선택</p>
            <p className="text-xs text-gray-500 mt-0.5">아래 목록에서 소유 필지를 선택하세요</p>
          </div>
          <ul className="p-3 space-y-2">
            {SAMPLE_PARCELS.map(p => {
              const isSelected = selectedId === p.id
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(p)}
                    className={`w-full text-left rounded-xl border-2 p-3 transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-700 text-white shadow-md'
                        : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                          {p.jibun}
                        </p>
                        <p className={`text-xs mt-0.5 truncate ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                          {p.road}
                        </p>
                        <div className="flex gap-2 mt-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {p.type}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {p.area}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-white text-blue-600' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isSelected ? <Check size={14} /> : <span className="text-xs font-bold">{p.id}</span>}
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="px-4 pb-4">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              ※ 본 목록은 시뮬레이션용 대표 필지입니다. 실제 본인 소유 부동산 정보는 추진위원회에 문의 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
