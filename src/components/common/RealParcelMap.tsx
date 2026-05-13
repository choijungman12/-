import { MapContainer, TileLayer, LayersControl, Polygon, Tooltip, Marker } from 'react-leaflet'
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
  if (mode === 'price') return p.recentSale ? '#1d4ed8' : '#94a3b8'
  return '#94a3b8'
}

// 부동산플래닛 스타일 가격 마커 (실거래가 모드)
function priceLabelIcon(price: number, year: number, type: string) {
  const eok = (price / 10000).toFixed(price >= 10000 ? 1 : 1)
  return L.divIcon({
    className: 'price-label-icon',
    iconSize: [80, 44],
    iconAnchor: [40, 44],
    html: `
      <div style="
        position: relative;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
        color: #fff;
        padding: 4px 8px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(29,78,216,0.45);
        border: 1.5px solid #fff;
        font-family: 'Noto Sans KR', sans-serif;
        font-size: 11px;
        line-height: 1.15;
        font-weight: 700;
        white-space: nowrap;
        min-width: 56px;
      ">
        <span style="font-size:9px;font-weight:600;opacity:0.9;letter-spacing:0.2px">${type}</span>
        <span style="font-size:14px;font-weight:900">${eok}억</span>
        <span style="font-size:8px;opacity:0.85">${year}년</span>
        <span style="
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 7px solid #1d4ed8;
        "></span>
      </div>
    `,
  })
}

interface Props {
  parcels: Parcel[]
  selected: Parcel[]
  layer: LayerMode
  onToggleSelect: (p: Parcel) => void
  height?: string
}

export default function RealParcelMap({ parcels, selected, layer, onToggleSelect, height = '560px' }: Props) {
  return (
    <div style={{ height }} className="relative">
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_DEFAULT_ZOOM}
        scrollWheelZoom
        style={{ height: '100%', width: '100%', borderRadius: '0' }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="위성 (Esri)">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="일반 지도 (OSM)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="밝은 지도 (Carto)">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{y}/{x}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.Overlay checked name="도로명·지명 라벨">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{y}/{x}{r}.png"
              opacity={0.95}
            />
          </LayersControl.Overlay>
        </LayersControl>

        {/* 필지 폴리곤 오버레이 */}
        {parcels.map((p) => {
          const isSelected = !!selected.find(s => s.id === p.id)
          const color = getParcelColor(p, layer)
          const positions = parcelLatLngPolygon(p)
          return (
            <Polygon
              key={`${p.id}-${layer}-${isSelected}`}
              positions={positions}
              pathOptions={{
                color: isSelected ? '#1d4ed8' : '#1e293b',
                weight: isSelected ? 3 : 1,
                opacity: 0.9,
                fillColor: color,
                fillOpacity: isSelected ? 0.85 : 0.55,
              }}
              eventHandlers={{ click: () => onToggleSelect(p) }}
            >
              <Tooltip direction="top" offset={[0, -4]} opacity={0.97} sticky>
                <div style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 12, minWidth: 180 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    {p.jibun} <span style={{ fontSize: 10, color: '#64748b', fontWeight: 400 }}>{p.bldgType}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
                    {p.areaM2}㎡ ({formatPyeong(p.areaM2)}) · {p.zoning}
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                    준공 {p.buildYear || '-'} · 구조 {p.structure}
                  </div>
                  <div style={{
                    marginTop: 6, paddingTop: 6, borderTop: '1px dashed #e2e8f0',
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 11,
                  }}>
                    <span style={{
                      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                      background: color,
                    }} />
                    <span style={{ color: '#334155', fontWeight: 600 }}>
                      {layer === 'age'       && `${AGE_GRADE_META[gradeAge(p)].label} (${AGE_GRADE_META[gradeAge(p)].description})`}
                      {layer === 'road'      && ROAD_GRADE_META[gradeRoad(p)].label}
                      {layer === 'redevelop' && (isRedevelopable(p).yes ? '재개발 적격' : '기준 미달')}
                      {layer === 'price'     && (p.recentSale ? `최근 ${(p.recentSale.price/10000).toFixed(1)}억 거래` : '거래 사례 없음')}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>클릭하여 선택</div>
                </div>
              </Tooltip>
            </Polygon>
          )
        })}

        {/* 실거래가 모드 — 가격 마커 (부동산플래닛 스타일) */}
        {layer === 'price' && parcels.filter(p => p.recentSale).map(p => (
          <Marker
            key={`price-${p.id}`}
            position={parcelCenter(p)}
            icon={priceLabelIcon(p.recentSale!.price, p.recentSale!.year, p.bldgType)}
            eventHandlers={{ click: () => onToggleSelect(p) }}
          />
        ))}
      </MapContainer>
    </div>
  )
}
