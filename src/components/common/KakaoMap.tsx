import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    kakao: any
  }
}

export interface ParcelClick {
  lat: number
  lng: number
  address: string         // 도로명 또는 지번
  jibunAddress: string    // 지번
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

const GUKI_CENTER = { lat: 37.6027, lng: 126.9602 }

// 구기2지구 사업구역 대략 경계 (실제 정비계획 폴리곤 좌표는 추후 정밀화)
const PROJECT_POLYGON: [number, number][] = [
  [37.6042, 126.9588],
  [37.6048, 126.9612],
  [37.6035, 126.9625],
  [37.6018, 126.9622],
  [37.6010, 126.9605],
  [37.6018, 126.9588],
  [37.6030, 126.9580],
]

export default function KakaoMap({
  lat = GUKI_CENTER.lat,
  lng = GUKI_CENTER.lng,
  level = 4,
  height = 'h-96',
  className = '',
  showProjectBoundary = true,
  onParcelClick,
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const markerRef = useRef<any>(null)

  // SDK 로드 (index.html에 autoload=false로 삽입됨)
  useEffect(() => {
    if (window.kakao?.maps?.services) {
      setLoaded(true)
      return
    }
    if (!window.kakao?.maps?.load) {
      setError('Kakao SDK가 로드되지 않았습니다. .env.local의 VITE_KAKAO_JS_KEY를 확인하세요.')
      return
    }
    window.kakao.maps.load(() => setLoaded(true))
  }, [])

  // 지도 초기화
  useEffect(() => {
    if (!loaded || !mapRef.current) return
    const { kakao } = window
    const center = new kakao.maps.LatLng(lat, lng)

    const map = new kakao.maps.Map(mapRef.current, { center, level })
    map.addControl(new kakao.maps.MapTypeControl(), kakao.maps.ControlPosition.TOPRIGHT)
    map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT)

    // 사업구역 폴리곤
    if (showProjectBoundary) {
      const path = PROJECT_POLYGON.map(([la, lo]) => new kakao.maps.LatLng(la, lo))
      const polygon = new kakao.maps.Polygon({
        path,
        strokeWeight: 2,
        strokeColor: '#1d4ed8',
        strokeOpacity: 0.9,
        strokeStyle: 'solid',
        fillColor: '#3b82f6',
        fillOpacity: 0.18,
      })
      polygon.setMap(map)

      const labelPos = new kakao.maps.LatLng(37.6029, 126.9603)
      new kakao.maps.CustomOverlay({
        position: labelPos,
        content: `<div style="background:#1d4ed8;color:#fff;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:700;font-family:'Noto Sans KR',sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.25);">구기2지구 사업구역</div>`,
        yAnchor: 0.5,
        map,
      })
    }

    const geocoder = new kakao.maps.services.Geocoder()

    // 지도 클릭 → 좌표 → 주소 변환 → 부모로 전달
    kakao.maps.event.addListener(map, 'click', (mouseEvent: any) => {
      const latlng = mouseEvent.latLng

      if (markerRef.current) markerRef.current.setMap(null)
      const marker = new kakao.maps.Marker({ position: latlng, map })
      markerRef.current = marker

      geocoder.coord2Address(
        latlng.getLng(),
        latlng.getLat(),
        (result: any[], status: string) => {
          if (status !== kakao.maps.services.Status.OK || !result[0]) return
          const r = result[0]
          const jibun = r.address?.address_name || ''
          const road = r.road_address?.address_name || jibun
          onParcelClick?.({
            lat: latlng.getLat(),
            lng: latlng.getLng(),
            address: road,
            jibunAddress: jibun,
          })
        }
      )
    })
  }, [loaded, lat, lng, level, showProjectBoundary, onParcelClick])

  if (error) {
    return (
      <div className={`${height} ${className} bg-red-50 border border-red-200 rounded-xl flex items-center justify-center text-sm text-red-700 px-4 text-center`}>
        {error}
      </div>
    )
  }

  return (
    <div className={`${height} ${className} relative rounded-xl overflow-hidden border border-gray-200`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-500">카카오맵 로딩 중...</span>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}
