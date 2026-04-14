import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import KakaoMap, { type ParcelClick } from '../components/common/KakaoMap'
import { calculatePersonalShare, formatKRW } from '../utils/calculations'
import { ArrowLeft, ExternalLink, Info, MapPin, Home, AlertCircle, CheckCircle } from 'lucide-react'

// 구기2지구 시나리오별 비례율 (project_guki2 메모리 기준)
const SCENARIOS = [
  { key: 'conservative', label: '재개발 보수안', rate: 93.30,  unitPrice: 4500 },
  { key: 'moderate',     label: '재개발 적정안 ★', rate: 110.80, unitPrice: 5000, recommended: true },
  { key: 'optimistic',   label: '재개발 최적안', rate: 128.20, unitPrice: 5500 },
]

// 조합원 분양가 (적정안 기준 — 일반분양가 5,000만/평 × 조합원 할인 ~85%)
// 실제 단가는 관리처분계획 단계에서 확정. 본 표는 사전 시뮬레이션용.
const UNIT_TYPES = [
  { code: '59A',  name: '59A형', exclusive: 59,  pyeong: 17.85, price: 760_000_000,  desc: '소형 (전용 59㎡)' },
  { code: '74A',  name: '74A형', exclusive: 74,  pyeong: 22.39, price: 950_000_000,  desc: '중소형 (전용 74㎡)' },
  { code: '84A',  name: '84A형', exclusive: 84,  pyeong: 25.42, price: 1_080_000_000, desc: '국민평형 (전용 84㎡)' },
  { code: '84B',  name: '84B형', exclusive: 84,  pyeong: 25.42, price: 1_060_000_000, desc: '국민평형 코너' },
  { code: '114',  name: '114형', exclusive: 114, pyeong: 34.50, price: 1_470_000_000, desc: '대형 (전용 114㎡)' },
]

export default function MyShare() {
  const [parcel, setParcel] = useState<ParcelClick | null>(null)
  const [beforeAsset, setBeforeAsset] = useState<number>(2_500_000_000) // 25억 기본
  const [scenarioKey, setScenarioKey] = useState<string>('moderate')
  const [primaryUnit, setPrimaryUnit] = useState<string>('84A')
  const [enableSecondUnit, setEnableSecondUnit] = useState<boolean>(false)
  const [secondaryUnit, setSecondaryUnit] = useState<string>('59A')

  const scenario = SCENARIOS.find(s => s.key === scenarioKey) || SCENARIOS[1]
  const primary  = UNIT_TYPES.find(u => u.code === primaryUnit)!
  const secondary = UNIT_TYPES.find(u => u.code === secondaryUnit)!

  // 권리가액 = 종전자산 × 비례율
  const rightValue = beforeAsset * (scenario.rate / 100)

  // 분양가 합계
  const totalSalePrice = primary.price + (enableSecondUnit ? secondary.price : 0)

  // 분담금 = 분양가 - 권리가액 (음수 = 환급)
  const personalShare = useMemo(
    () => calculatePersonalShare(beforeAsset, scenario.rate, totalSalePrice),
    [beforeAsset, scenario.rate, totalSalePrice]
  )

  // 1+1 가능 조건: 권리가액 ≥ 1순위 분양가 (도정법 제76조 운용 관행)
  const canApply1Plus1 = rightValue >= primary.price

  // ValueShopping 딥링크
  const valueShoppingUrl = parcel
    ? `https://valueshopping.land/main/map?addr=${encodeURIComponent(parcel.jibunAddress || parcel.address)}`
    : 'https://valueshopping.land/main/map'

  function handleParcelClick(info: ParcelClick) {
    setParcel(info)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-base font-bold text-gray-900">내 분담금 시뮬레이터</h1>
            <p className="text-xs text-gray-500">구기2지구 — 지도에서 내 부동산 클릭 → 평형 선택 → 자동 산출</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* STEP 1 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">1</span>
            <h2 className="font-semibold text-gray-900">지도에서 내 부동산을 클릭하세요</h2>
          </div>

          <KakaoMap height="h-[460px]" onParcelClick={handleParcelClick} />

          {parcel && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <MapPin size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-blue-900">{parcel.address || parcel.jibunAddress}</p>
                  {parcel.jibunAddress && parcel.address !== parcel.jibunAddress && (
                    <p className="text-xs text-blue-700 mt-0.5">지번: {parcel.jibunAddress}</p>
                  )}
                  <p className="text-xs text-blue-600 mt-1">
                    위도 {parcel.lat.toFixed(6)} · 경도 {parcel.lng.toFixed(6)}
                  </p>
                </div>
                <a
                  href={valueShoppingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-white hover:bg-gray-50 border border-blue-300 text-blue-700 text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap"
                >
                  ValueShopping 탁감 <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
        </section>

        {/* STEP 2 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">2</span>
            <h2 className="font-semibold text-gray-900">종전 감정평가금액 입력</h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-1.5">
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <span>
                정밀치는 정식 감정평가법인이 산정하지만, <strong>ValueShopping 탁상감정</strong> 또는 자체 추정치를 입력하면 즉시 분담금이 계산됩니다.
                단독·다세대 평균은 약 25억 (오차 ±10~15%).
              </span>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex justify-between mb-1">
                내 부동산 종전가액 (원)
                <span className="text-gray-500 text-xs">{formatKRW(beforeAsset)}</span>
              </label>
              <input
                type="number"
                value={beforeAsset}
                step={10000000}
                onChange={(e) => setBeforeAsset(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex gap-1.5 mt-2">
                {[1_500_000_000, 2_000_000_000, 2_500_000_000, 3_000_000_000, 4_000_000_000].map(v => (
                  <button
                    key={v}
                    onClick={() => setBeforeAsset(v)}
                    className={`text-xs px-2.5 py-1 rounded-md border ${
                      beforeAsset === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {formatKRW(v)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* STEP 3: 시나리오 + 평형 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">3</span>
            <h2 className="font-semibold text-gray-900">사업 시나리오 · 분양 평형 선택</h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
            {/* 시나리오 */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">사업 시나리오 (비례율)</p>
              <div className="grid grid-cols-3 gap-2">
                {SCENARIOS.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setScenarioKey(s.key)}
                    className={`p-3 rounded-lg border-2 text-left transition ${
                      scenarioKey === s.key
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <p className="text-xs text-gray-600">{s.label}</p>
                    <p className="text-lg font-bold text-gray-900 mt-0.5">{s.rate.toFixed(2)}%</p>
                    <p className="text-[11px] text-gray-500">분양가 {s.unitPrice}만/평</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 1순위 평형 */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">1순위 평형</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {UNIT_TYPES.map(u => (
                  <button
                    key={u.code}
                    onClick={() => setPrimaryUnit(u.code)}
                    className={`p-3 rounded-lg border-2 text-center transition ${
                      primaryUnit === u.code
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <p className="text-sm font-bold text-gray-900">{u.name}</p>
                    <p className="text-[11px] text-gray-500">{u.pyeong.toFixed(0)}평</p>
                    <p className="text-xs text-blue-700 font-semibold mt-1">{formatKRW(u.price)}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 1+1 (2채) */}
            <div className={`rounded-lg border p-3 ${canApply1Plus1 ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSecondUnit}
                  disabled={!canApply1Plus1}
                  onChange={(e) => setEnableSecondUnit(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium text-gray-900">
                  1+1 (2채) 신청
                </span>
                {canApply1Plus1 ? (
                  <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">신청 가능</span>
                ) : (
                  <span className="text-xs text-gray-500">권리가액이 1순위 분양가보다 높아야 신청 가능</span>
                )}
              </label>

              {enableSecondUnit && canApply1Plus1 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">2순위 평형 (1순위보다 작아야 함)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {UNIT_TYPES.filter(u => u.exclusive < primary.exclusive).map(u => (
                      <button
                        key={u.code}
                        onClick={() => setSecondaryUnit(u.code)}
                        className={`p-2.5 rounded-lg border-2 text-center transition ${
                          secondaryUnit === u.code
                            ? 'border-emerald-600 bg-white'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <p className="text-sm font-bold">{u.name}</p>
                        <p className="text-[11px] text-emerald-700 font-semibold">{formatKRW(u.price)}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-2">
                    ※ 도정법 제76조 운용 관행: 권리가액 ≥ 1순위 분양가 + α 인 경우 1+1 가능. 정관에서 별도 제한 가능.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* STEP 4: 결과 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">4</span>
            <h2 className="font-semibold text-gray-900">분담금 · 환급금 산출 결과</h2>
          </div>

          <div className={`rounded-xl p-6 text-white ${personalShare > 0 ? 'bg-gradient-to-br from-rose-500 to-rose-700' : 'bg-gradient-to-br from-emerald-500 to-emerald-700'}`}>
            <div className="flex items-center gap-2 text-sm opacity-90">
              {personalShare > 0 ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
              <span>{personalShare > 0 ? '추가 분담금이 필요합니다' : '환급 대상입니다'}</span>
            </div>
            <p className="text-4xl font-extrabold mt-2">
              {personalShare > 0 ? '+' : '−'}{formatKRW(Math.abs(personalShare))}
            </p>
            <p className="text-xs opacity-80 mt-1">
              {scenario.label} · 비례율 {scenario.rate.toFixed(2)}%
            </p>
          </div>

          <div className="mt-3 bg-white border border-gray-200 rounded-xl p-5 space-y-2 text-sm">
            <Row label="종전 감정평가금액" value={formatKRW(beforeAsset)} />
            <Row label={`× 비례율 (${scenario.label})`} value={`${scenario.rate.toFixed(2)}%`} />
            <Row label="= 권리가액" value={formatKRW(rightValue)} highlight />
            <div className="border-t border-gray-200 my-2" />
            <Row label={`1순위: ${primary.name} (전용 ${primary.exclusive}㎡)`} value={formatKRW(primary.price)} />
            {enableSecondUnit && canApply1Plus1 && (
              <Row label={`2순위: ${secondary.name} (전용 ${secondary.exclusive}㎡)`} value={formatKRW(secondary.price)} />
            )}
            <Row label="− 분양가 합계" value={formatKRW(totalSalePrice)} />
            <div className="border-t border-gray-200 my-2" />
            <Row
              label={personalShare > 0 ? '= 추가 분담금' : '= 환급금'}
              value={`${personalShare > 0 ? '+' : '−'}${formatKRW(Math.abs(personalShare))}`}
              highlight
              colorClass={personalShare > 0 ? 'text-rose-600' : 'text-emerald-600'}
            />
          </div>

          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-1.5">
            <Info size={13} className="flex-shrink-0 mt-0.5" />
            <span>
              본 시뮬레이션은 사전 추정용입니다. 실제 분담금은 <strong>관리처분계획</strong> 단계에서 정식 감정평가 + 조합총회 의결로 확정됩니다.
              산식: 「도시 및 주거환경정비법」 제74조 · 제76조 기준.
            </span>
          </div>
        </section>

        {/* 추가 액션 */}
        <section className="grid grid-cols-2 gap-3">
          <Link to="/project-info" className="bg-white border border-gray-200 hover:border-blue-400 rounded-xl p-4 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Home size={16} /> 사업 안내 다시 보기
          </Link>
          <Link to="/apply-consent" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-4 flex items-center gap-2 text-sm font-medium">
            <CheckCircle size={16} /> 동의서 제출하기
          </Link>
        </section>
      </main>
    </div>
  )
}

function Row({ label, value, highlight = false, colorClass = '' }: { label: string; value: string; highlight?: boolean; colorClass?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`${highlight ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{label}</span>
      <span className={`${highlight ? 'font-bold text-base' : 'text-gray-900'} ${colorClass}`}>{value}</span>
    </div>
  )
}
