/**
 * NaverMap Component — Naver Maps JavaScript API v3
 *
 * ▶ API 키 발급 방법:
 *   1. https://www.ncloud.com/ 접속 → 회원가입/로그인
 *   2. Console → AI·NAVER API → Maps → Application 등록
 *   3. 서비스 URL에 http://localhost:5173 추가
 *   4. 아래 NAVER_MAPS_CLIENT_ID에 발급받은 Client ID 입력
 *
 * ▶ 무료 할당량: 월 3만 건 (개인/소규모 프로젝트 충분)
 */

import { useEffect, useRef, useState } from 'react'

// ✅ 여기에 Naver Cloud Platform에서 발급받은 Client ID를 입력하세요
const NAVER_MAPS_CLIENT_ID = 'YOUR_NAVER_MAPS_CLIENT_ID'

interface NaverMapProps {
  lat?: number
  lng?: number
  zoom?: number
  markerTitle?: string
  height?: string
  className?: string
}

declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (el: HTMLElement | string, opts: Record<string, unknown>) => unknown
        LatLng: new (lat: number, lng: number) => unknown
        Marker: new (opts: Record<string, unknown>) => unknown
        InfoWindow: new (opts: Record<string, unknown>) => unknown
        MapTypeId: { NORMAL: string }
      }
    }
  }
}

export default function NaverMap({
  lat = 37.6027,
  lng = 126.9590,
  zoom = 16,
  markerTitle = '구기동 재개발 사업구역',
  height = 'h-64',
  className = '',
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const hasApiKey = NAVER_MAPS_CLIENT_ID !== 'YOUR_NAVER_MAPS_CLIENT_ID'

  useEffect(() => {
    if (!hasApiKey) return

    // 이미 스크립트가 로드된 경우
    if (window.naver?.maps) {
      setLoaded(true)
      return
    }

    const scriptId = 'naver-maps-script'
    if (document.getElementById(scriptId)) {
      // 로딩 중이면 대기
      const check = setInterval(() => {
        if (window.naver?.maps) {
          setLoaded(true)
          clearInterval(check)
        }
      }, 100)
      return () => clearInterval(check)
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_MAPS_CLIENT_ID}`
    script.async = true
    script.onload = () => setLoaded(true)
    script.onerror = () => setError(true)
    document.head.appendChild(script)
  }, [hasApiKey])

  useEffect(() => {
    if (!loaded || !mapRef.current || !window.naver?.maps) return

    const center = new window.naver.maps.LatLng(lat, lng)

    const map = new window.naver.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeId: window.naver.maps.MapTypeId.NORMAL,
    })

    const marker = new window.naver.maps.Marker({
      position: center,
      map,
      title: markerTitle,
    })

    const infoWindow = new window.naver.maps.InfoWindow({
      content: `
        <div style="padding:10px 14px;font-family:'Noto Sans KR',sans-serif;min-width:180px;">
          <p style="font-weight:700;font-size:14px;color:#1e40af;margin:0 0 4px 0;">📍 ${markerTitle}</p>
          <p style="font-size:12px;color:#6b7280;margin:0;">서울특별시 종로구 구기동 138-1 일원</p>
        </div>
      `,
    })

    // 마커 클릭 시 인포윈도우 표시
    // @ts-expect-error naver maps event
    window.naver.maps.Event.addListener(marker, 'click', () => {
      // @ts-expect-error naver maps method
      if (infoWindow.getMap()) {
        // @ts-expect-error naver maps method
        infoWindow.close()
      } else {
        // @ts-expect-error naver maps method
        infoWindow.open(map, marker)
      }
    })

    // 초기 인포윈도우 열기
    // @ts-expect-error naver maps method
    infoWindow.open(map, marker)
  }, [loaded, lat, lng, zoom, markerTitle])

  const naverMapLink = `https://map.naver.com/v5/search/${encodeURIComponent('서울특별시 종로구 구기동 138-1')}`

  // API 키 미설정 시: 안내 UI + 지도 바로가기 버튼
  if (!hasApiKey) {
    return (
      <div className={`${height} ${className} relative overflow-hidden rounded-xl`}>
        {/* 배경 지도 스타일 */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-teal-50">
          {/* 격자 패턴 */}
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* 도로 시뮬레이션 */}
          <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#cbd5e1" strokeWidth="3"/>
            <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#cbd5e1" strokeWidth="2"/>
            <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#cbd5e1" strokeWidth="2"/>
            <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#cbd5e1" strokeWidth="1.5"/>
            <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#cbd5e1" strokeWidth="1.5"/>
          </svg>

          {/* 지역 블록 */}
          <div className="absolute top-4 left-6 w-20 h-12 bg-green-200/60 rounded border border-green-300/40 text-xs flex items-center justify-center text-green-700 font-medium">북한산</div>
          <div className="absolute bottom-6 right-8 w-16 h-10 bg-amber-100/70 rounded border border-amber-200/40 text-xs flex items-center justify-center text-amber-700 font-medium">부암동</div>

          {/* 구기동 표시 블록 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-24 h-16 bg-blue-200/70 rounded border-2 border-blue-400/60 flex items-center justify-center">
              <span className="text-xs font-bold text-blue-700">구기동</span>
            </div>
          </div>
        </div>

        {/* 마커 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full -mt-2 z-10">
          <div className="flex flex-col items-center">
            <div className="bg-blue-600 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg mb-1 whitespace-nowrap font-medium">
              📍 구기동 재개발 사업구역
            </div>
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md" />
            <div className="w-0.5 h-3 bg-red-400" />
          </div>
        </div>

        {/* 네이버 지도 열기 버튼 (항상 표시) */}
        <a
          href={naverMapLink}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-white text-gray-800 text-xs px-3 py-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200 font-medium"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#03C75A"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
          </svg>
          네이버 지도에서 보기 →
        </a>

        {/* API 키 안내 (개발 환경에서만 표시) */}
        <div className="absolute top-2 left-2 right-2 z-20">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 flex items-start gap-1.5">
            <span className="flex-shrink-0 mt-0.5">⚠️</span>
            <span>
              <strong>Naver Maps API 키 필요</strong>
              <br />
              <code className="bg-amber-100 px-1 rounded">NaverMap.tsx</code>의 <code className="bg-amber-100 px-1 rounded">NAVER_MAPS_CLIENT_ID</code>에 키를 입력하면 실제 지도가 표시됩니다.
            </span>
          </div>
        </div>
      </div>
    )
  }

  // API 키 설정 + 스크립트 에러
  if (error) {
    return (
      <div className={`${height} ${className} bg-red-50 rounded-xl flex flex-col items-center justify-center gap-2`}>
        <p className="text-red-600 text-sm font-medium">지도를 불러올 수 없습니다</p>
        <a href={naverMapLink} target="_blank" rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline">네이버 지도에서 보기 →</a>
      </div>
    )
  }

  // 실제 네이버 지도 렌더링
  return (
    <div className={`${height} ${className} relative rounded-xl overflow-hidden`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-500">지도 로딩 중...</span>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
      <a
        href={naverMapLink}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-white text-gray-800 text-xs px-3 py-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-200 font-medium"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#03C75A"/>
          <circle cx="12" cy="9" r="2.5" fill="white"/>
        </svg>
        크게 보기
      </a>
    </div>
  )
}
