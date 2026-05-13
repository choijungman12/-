import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, LayersControl, Polygon, Tooltip, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  type Parcel,
  parcelLatLngPolygon, parcelCenter,
  MAP_CENTER, MAP_DEFAULT_ZOOM,
} from '../../data/gukiParcels'
import {
  gradeAge, AGE_GRADE_META,
  gradeRoad, ROAD_GRADE_META,
  isRedevelopable,
  formatPyeong,
} from '../../utils/appraisal'

export type LayerMode = 'age' | 'road' | 'redevelop' | 'price'

function getParcelColor(p: Parcel, mode: LayerMode): string {
  if (mode === 'age') return AGE_GRADE_META[gradeAge(p)].color
  if (mode === 'road') return ROAD_GRADE_META[gradeRoad(p)].color
  if (mode === 'redevelop') return isRedevelopable(p).yes ? '#dc2626' : '#94a3b8'
  if (mode === 'price') return p.recentSale ? '#1d4ed8' : '#64748b'
  return '#94a3b8'
}

// 지번 라벨 (항상 표시) — 위성 지도 위에 또렷한 흰색 박스
function jibunIcon(jibun: string, isSelected: boolean) {
  return L.divIcon({
    className: 'jibun-label-icon',
    iconSize: [56, 18],
    iconAnchor: [28, 9],
    html: `
      <div style="
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: ${isSelected ? '#1d4ed8' : 'rgba(255,255,255,0.92)'};
        color: ${isSelected ? '#fff' : '#0f172a'};
        padding: 1px 6px;
        border-radius: 4px;
        border: 1px solid ${isSelected ? '#1e3a8a' : 'rgba(15,23,42,0.4)'};
        font-family: 'Noto Sans KR', sans-serif;
        font-size: 10px;
        font-weight: 800;
        line-height: 1.3;
        white-space: nowrap;
        box-shadow: 0 1px 3px rgba(0,0,0,0.5);
        letter-spacing: -0.2px;
      ">${jibun}</div>
    `,
  })
}

// 가격 라벨 (실거래가 모드) — 부동산플래닛 스타일
function priceLabelIcon(price: number, year: number, type: string) {
  const eok = (price / 10000).toFixed(1)
  return L.divIcon({
    className: 'price-label-icon',
    iconSize: [82, 50],
    iconAnchor: [41, 50],
    html: `
      <div style="
        position: relative;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
        color: #fff;
        padding: 4px 10px;
        border-radius: 8px;
        box-shadow: 0 3px 10px rgba(29,78,216,0.55);
        border: 1.5px solid #fff;
        font-family: 'Noto Sans KR', sans-serif;
        font-size: 11px;
        line-height: 1.15;
        font-weight: 700;
        white-space: nowrap;
        min-width: 60px;
      ">
        <span style="font-size:9px;font-weight:600;opacity:0.92">${type}</span>
        <span style="font-size:15px;font-weight:900">${eok}억</span>
        <span style="font-size:9px;opacity:0.85">${year}년</span>
        <span style="
          position: absolute;
          bottom: -7px;
          left: 50%;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 8px solid #1d4ed8;
        "></span>
      </div>
    `,
  })
}

// 합필 외곽선 — 선택 필지 각각의 외곽 링을 굵게 표시
function mergedOutlineSegments(selected: Parcel[]): Array<Array<[number, number]>> {
  return selected.map(p => {
    const ring = parcelLatLngPolygon(p)
    return [...ring, ring[0]]
  })
}

// 지도 패닝/줌 컨트롤러 — 외부에서 focusParcel을 받아 해당 위치로 부드럽게 이동
function MapController({ focusParcel }: { focusParcel: Parcel | null }) {
  const map = useMap()
  useEffect(() => {
    if (!focusParcel) return
    const [lat, lng] = parcelCenter(focusParcel)
    map.flyTo([lat, lng], 18, { duration: 0.8 })
  }, [focusParcel, map])
  return null
}

interface Props {
  parcels: Parcel[]
  selected: Parcel[]
  layer: LayerMode
  mergeMode: boolean
  onToggleSelect: (p: Parcel) => void
  focusParcel?: Parcel | null
  height?: string
}

export default function RealParcelMap({ parcels, selected, layer, mergeMode, onToggleSelect, focusParcel = null, height = '620px' }: Props) {
  const selectedIds = useMemo(() => new Set(selected.map(s => s.id)), [selected])
  const mergedRings = useMemo(() => (mergeMode && selected.length > 1 ? mergedOutlineSegments(selected) : []), [mergeMode, selected])

  return (
    <div style={{ height }} className="relative">
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_DEFAULT_ZOOM}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <MapController focusParcel={focusParcel} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="위성지도 (Esri)">
            <TileLayer
              attribution='Tiles &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="V-World 위성 (한국)">
            <TileLayer
              attribution='&copy; V-World'
              url="https://xdworld.vworld.kr/2d/Satellite/service/{z}/{y}/{x}.jpeg"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="일반 지도 (OSM)">
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="밝은 지도 (Carto)">
            <TileLayer
              attribution='&copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{y}/{x}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.Overlay checked name="도로명·지명 라벨">
            <TileLayer
              attribution='&copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{y}/{x}{r}.png"
              opacity={0.95}
            />
          </LayersControl.Overlay>
          <LayersControl.Overlay name="V-World 지명 (한국)">
            <TileLayer
              attribution='&copy; V-World'
              url="https://xdworld.vworld.kr/2d/Hybrid/service/{z}/{y}/{x}.png"
              opacity={0.92}
            />
          </LayersControl.Overlay>
        </LayersControl>

        {/* 필지 폴리곤 */}
        {parcels.map((p) => {
          const isSelected = selectedIds.has(p.id)
          const color = getParcelColor(p, layer)
          const positions = parcelLatLngPolygon(p)
          return (
            <Polygon
              key={`${p.id}-${layer}-${isSelected}-${mergeMode}`}
              positions={positions}
              pathOptions={{
                color: isSelected ? '#1d4ed8' : '#0f172a',
                weight: isSelected ? 2.5 : 1,
                opacity: 0.92,
                fillColor: color,
                fillOpacity: isSelected ? 0.78 : 0.5,
              }}
              eventHandlers={{ click: () => onToggleSelect(p) }}
            >
              <Tooltip direction="top" offset={[0, -4]} opacity={0.97} sticky>
                <div style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 12, minWidth: 200 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    {p.jibun} <span style={{ fontSize: 10, color: '#64748b', fontWeight: 400 }}>{p.bldgType}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
                    {p.areaM2}㎡ ({formatPyeong(p.areaM2)}) · {p.zoning}
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                    {p.buildingRegistry ? `준공 ${p.buildYear} · ${p.buildingRegistry.households}세대 · ${p.structure}` : '나대지 (건물 없음)'}
                  </div>
                  <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed #e2e8f0',
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ color: '#334155', fontWeight: 600 }}>
                      {layer === 'age'       && `${AGE_GRADE_META[gradeAge(p)].label} (${AGE_GRADE_META[gradeAge(p)].description})`}
                      {layer === 'road'      && ROAD_GRADE_META[gradeRoad(p)].label}
                      {layer === 'redevelop' && (isRedevelopable(p).yes ? '재개발 적격' : '기준 미달')}
                      {layer === 'price'     && (p.recentSale ? `최근 ${(p.recentSale.price/10000).toFixed(1)}억 거래` : '거래 사례 없음')}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                    {isSelected ? '✓ 선택됨 · 다시 클릭하면 해제' : '클릭하여 토지·건축물대장·토지이용계획 조회'}
                  </div>
                </div>
              </Tooltip>
            </Polygon>
          )
        })}

        {/* 합필 외곽선 — 선택된 필지를 굵은 라인으로 강조 */}
        {mergedRings.map((ring, idx) => (
          <Polyline
            key={`merged-${idx}`}
            positions={ring}
            pathOptions={{
              color: '#fbbf24',
              weight: 4,
              opacity: 0.95,
              dashArray: '8, 4',
            }}
          />
        ))}

        {/* 지번 라벨 (항상 표시) */}
        {parcels.map(p => (
          <Marker
            key={`jibun-${p.id}`}
            position={parcelCenter(p)}
            icon={jibunIcon(p.jibun, selectedIds.has(p.id))}
            interactive={false}
          />
        ))}

        {/* 실거래가 모드 — 가격 라벨 */}
        {layer === 'price' && parcels.filter(p => p.recentSale).map(p => {
          const [lat, lng] = parcelCenter(p)
          return (
            <Marker
              key={`price-${p.id}`}
              position={[lat + 0.00015, lng]}
              icon={priceLabelIcon(p.recentSale!.price, p.recentSale!.year, p.bldgType)}
              eventHandlers={{ click: () => onToggleSelect(p) }}
            />
          )
        })}
      </MapContainer>
    </div>
  )
}
