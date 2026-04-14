import { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { useAppStore } from '../store'
import { FileCheck, Download, CheckCircle, XCircle, Clock, AlertCircle, ChevronRight, Smartphone, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { openConsentPDF, loadConsentRecords, type ConsentRecord } from '../utils/consentPDF'

export default function Consent() {
  const { owners, updateConsentStatus } = useAppStore()
  const [activeTab, setActiveTab] = useState<'status' | 'electronic' | 'form' | 'verify'>('status')
  const [records, setRecords] = useState<ConsentRecord[]>([])

  useEffect(() => {
    setRecords(loadConsentRecords())
    const onStorage = () => setRecords(loadConsentRecords())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function deleteRecord(certId: string) {
    if (!confirm(`접수번호 ${certId} 기록을 삭제하시겠습니까?`)) return
    const next = records.filter(r => r.certId !== certId)
    localStorage.setItem('guki-consent-records', JSON.stringify(next))
    setRecords(next)
    toast.success('삭제되었습니다.')
  }
  const [selectedOwner, setSelectedOwner] = useState('')
  const [consentType, setConsentType] = useState<'agreed' | 'opposed'>('agreed')
  const [submitterName, setSubmitterName] = useState('')

  const counts = {
    agreed:    owners.filter((o) => o.consentStatus === 'agreed').length,
    opposed:   owners.filter((o) => o.consentStatus === 'opposed').length,
    pending:   owners.filter((o) => o.consentStatus === 'pending').length,
    withdrawn: owners.filter((o) => o.consentStatus === 'withdrawn').length,
  }
  const total = owners.length
  const consentRate = total ? (counts.agreed / total * 100) : 0
  const landConsentRate = (() => {
    const totalLand = owners.reduce((s, o) => s + o.landArea, 0)
    const agreedLand = owners.filter((o) => o.consentStatus === 'agreed').reduce((s, o) => s + o.landArea, 0)
    return totalLand ? (agreedLand / totalLand * 100) : 0
  })()

  const chartOption = {
    animation: false,
    tooltip: { trigger: 'item', formatter: '{b}: {c}명 ({d}%)' },
    series: [{
      type: 'pie',
      radius: ['35%', '65%'],
      itemStyle: { borderRadius: 8, borderWidth: 2, borderColor: '#fff' },
      label: { fontSize: 12 },
      data: [
        { value: counts.agreed, name: '동의', itemStyle: { color: '#22c55e' } },
        { value: counts.opposed, name: '반대', itemStyle: { color: '#ef4444' } },
        { value: counts.pending, name: '미결정', itemStyle: { color: '#f59e0b' } },
        { value: counts.withdrawn, name: '철회', itemStyle: { color: '#94a3b8' } },
      ],
    }],
  }

  // 구역별 동의율 (시뮬레이션 데이터)
  const areaChartOption = {
    animation: false,
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['1구역', '2구역', '3구역', '4구역', '5구역'],
      axisLabel: { fontSize: 11 },
    },
    yAxis: { type: 'value', name: '동의율(%)', max: 100, axisLabel: { formatter: '{value}%', fontSize: 11 } },
    series: [{
      type: 'bar',
      data: [
        { value: 68, itemStyle: { color: '#22c55e' } },
        { value: 45, itemStyle: { color: '#f59e0b' } },
        { value: 72, itemStyle: { color: '#22c55e' } },
        { value: 38, itemStyle: { color: '#ef4444' } },
        { value: 55, itemStyle: { color: '#f59e0b' } },
      ],
      label: { show: true, position: 'top', fontSize: 11, formatter: '{c}%' },
      barMaxWidth: 50,
      itemStyle: { borderRadius: [4, 4, 0, 0] },
    }],
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
  }

  function handleConsentSubmit() {
    if (!selectedOwner || !submitterName) {
      toast.error('소유자와 제출자 이름을 확인해주세요.')
      return
    }
    const date = new Date().toISOString().slice(0, 10)
    updateConsentStatus(selectedOwner, consentType, date)
    toast.success(`동의서가 접수되었습니다. (${consentType === 'agreed' ? '동의' : '반대'})`)
    setSelectedOwner('')
    setSubmitterName('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">동의서 관리</h2>
        <p className="section-subtitle">정비계획 입안을 위한 동의서 현황 및 접수 관리</p>
      </div>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '인원 기준 동의율', value: `${consentRate.toFixed(1)}%`, target: '과반수(50%) 이상', ok: consentRate >= 50, icon: '👥' },
          { label: '토지면적 기준 동의율', value: `${landConsentRate.toFixed(1)}%`, target: '1/2(50%) 이상 (조합 설립 시)', ok: landConsentRate >= 50, icon: '🗺️' },
          { label: '동의자 수', value: `${counts.agreed}명`, target: `전체 ${total}명`, ok: true, icon: '✅' },
          { label: '미결정자 수', value: `${counts.pending}명`, target: '조속한 독려 필요', ok: false, icon: '⏳' },
        ].map((item) => (
          <div key={item.label} className="card">
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            <p className="text-xs font-medium text-gray-600 mt-0.5">{item.label}</p>
            <p className={`text-xs mt-1 ${item.ok ? 'text-green-600' : 'text-amber-600'}`}>
              {item.target}
            </p>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {[
            { key: 'status', label: '동의 현황' },
            { key: 'electronic', label: `전자동의서 접수 (${records.length})` },
            { key: 'form', label: '동의서 접수' },
            { key: 'verify', label: '동의율 검증' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors -mb-px
                ${activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'status' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">동의 현황 분포</h3>
            <ReactECharts option={chartOption} style={{ height: 280 }} />
          </div>
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">구역별 동의율</h3>
            <ReactECharts option={areaChartOption} style={{ height: 280 }} />
          </div>

          {/* 소유자 목록 */}
          <div className="card lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4">소유자별 동의 현황</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="table-header">이름</th>
                    <th className="table-header">주소</th>
                    <th className="table-header text-right">토지(m²)</th>
                    <th className="table-header text-right">건물(m²)</th>
                    <th className="table-header">동의 상태</th>
                    <th className="table-header">동의/반대 일자</th>
                    <th className="table-header">빠른 변경</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {owners.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">{o.name}</td>
                      <td className="table-cell text-gray-500 text-xs max-w-[160px] truncate">{o.address}</td>
                      <td className="table-cell text-right">{o.landArea || '-'}</td>
                      <td className="table-cell text-right">{o.buildingArea || '-'}</td>
                      <td className="table-cell">
                        <span className={
                          o.consentStatus === 'agreed' ? 'badge-green' :
                          o.consentStatus === 'opposed' ? 'badge-red' :
                          o.consentStatus === 'withdrawn' ? 'badge-gray' : 'badge-yellow'
                        }>
                          {o.consentStatus === 'agreed' ? '동의' :
                           o.consentStatus === 'opposed' ? '반대' :
                           o.consentStatus === 'withdrawn' ? '철회' : '미결정'}
                        </span>
                      </td>
                      <td className="table-cell text-xs text-gray-500">{o.consentDate || '-'}</td>
                      <td className="table-cell">
                        <div className="flex gap-1">
                          <button
                            onClick={() => { updateConsentStatus(o.id, 'agreed', new Date().toISOString().slice(0,10)); toast.success('동의로 변경') }}
                            className="p-1 rounded hover:bg-green-50 text-green-600" title="동의"
                          ><CheckCircle size={14} /></button>
                          <button
                            onClick={() => { updateConsentStatus(o.id, 'opposed', new Date().toISOString().slice(0,10)); toast.success('반대로 변경') }}
                            className="p-1 rounded hover:bg-red-50 text-red-500" title="반대"
                          ><XCircle size={14} /></button>
                          <button
                            onClick={() => { updateConsentStatus(o.id, 'pending'); toast.success('미결정으로 변경') }}
                            className="p-1 rounded hover:bg-yellow-50 text-yellow-600" title="미결정"
                          ><Clock size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'electronic' && (
        <div className="space-y-4">
          <div className="card bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="flex items-center gap-3">
              <Smartphone size={24} className="flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-base">전자동의서 자동 접수 내역</h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  홈페이지 → 추진위 동의 → 카카오/PASS 인증을 거쳐 제출된 전자동의서가 자동으로 여기에 저장됩니다.
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black">{records.length}</p>
                <p className="text-xs text-blue-100">건 접수됨</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">추진위 구성원 (동의자) 목록</h3>
              <p className="text-xs text-gray-400">전자서명 · 법적 효력 인정</p>
            </div>
            {records.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Smartphone size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm">아직 접수된 전자동의서가 없습니다.</p>
                <p className="text-xs mt-1">홈페이지의 "추진위 동의" 버튼을 통해 동의서가 제출되면 자동으로 표시됩니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="table-header">접수번호</th>
                      <th className="table-header">동의자</th>
                      <th className="table-header">연락처</th>
                      <th className="table-header">소유 부동산</th>
                      <th className="table-header">소유구분</th>
                      <th className="table-header">인증수단</th>
                      <th className="table-header">서명일시</th>
                      <th className="table-header text-center">PDF</th>
                      <th className="table-header text-center">삭제</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {records.map((r) => (
                      <tr key={r.certId} className="hover:bg-blue-50/30">
                        <td className="table-cell font-mono text-[11px] text-gray-500">{r.certId}</td>
                        <td className="table-cell">
                          <p className="font-semibold text-gray-900">{r.name}</p>
                          <p className="text-[11px] text-gray-400">{r.birthdate}</p>
                        </td>
                        <td className="table-cell text-xs text-gray-600">{r.phone}</td>
                        <td className="table-cell text-xs text-gray-600 max-w-[180px] truncate">{r.propertyAddress}</td>
                        <td className="table-cell">
                          <span className="badge-blue">{r.propertyType}</span>
                          {r.propertyArea && <span className="ml-1 text-[11px] text-gray-400">{r.propertyArea}m²</span>}
                        </td>
                        <td className="table-cell">
                          <span className={r.authMethod === 'kakao' ? 'badge-yellow' : 'badge-blue'}>
                            {r.authMethod === 'kakao' ? '카카오' : `PASS${r.carrier ? ' · ' + r.carrier.toUpperCase() : ''}`}
                          </span>
                        </td>
                        <td className="table-cell text-[11px] text-gray-500">{r.signedAt}</td>
                        <td className="table-cell text-center">
                          <button
                            onClick={() => openConsentPDF(r)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium"
                          >
                            <Download size={12} /> PDF
                          </button>
                        </td>
                        <td className="table-cell text-center">
                          <button
                            onClick={() => deleteRecord(r.certId)}
                            className="p-1 rounded hover:bg-red-50 text-red-500"
                            title="삭제"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 온라인 동의서 접수 */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">온라인 동의서 접수</h3>
            <div className="space-y-4">
              <div>
                <label className="label">소유자 선택 *</label>
                <select
                  className="input"
                  value={selectedOwner}
                  onChange={(e) => setSelectedOwner(e.target.value)}
                >
                  <option value="">소유자를 선택하세요</option>
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} ({o.address})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">제출자 이름 확인 *</label>
                <input
                  className="input"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  placeholder="소유자 본인 이름 입력"
                />
              </div>
              <div>
                <label className="label">동의 구분 *</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="consent" checked={consentType === 'agreed'}
                      onChange={() => setConsentType('agreed')} className="text-primary-500" />
                    <span className="text-sm font-medium text-green-700">정비계획 입안에 동의합니다</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="consent" checked={consentType === 'opposed'}
                      onChange={() => setConsentType('opposed')} />
                    <span className="text-sm font-medium text-red-700">반대합니다</span>
                  </label>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                <AlertCircle size={14} className="inline mr-1" />
                본 온라인 접수는 의사 확인용이며, 법적 효력을 위해 서면 동의서를 추가로 제출하셔야 합니다.
              </div>
              <button onClick={handleConsentSubmit} className="btn-primary w-full">
                동의서 접수
              </button>
            </div>
          </div>

          {/* 동의서 양식 다운로드 */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">동의서 양식 다운로드</h3>
            <div className="space-y-3">
              {[
                { title: '정비계획 입안 동의서', desc: '사업에 동의하는 경우', required: true },
                { title: '정비계획 입안 반대 동의서', desc: '사업에 반대하는 경우', required: false },
                { title: '개인정보 수집 및 이용 동의서', desc: '모든 소유자 제출 필수', required: true },
                { title: '대표소유자 선임 동의서', desc: '공동소유 필지의 경우', required: false },
              ].map((doc) => (
                <div key={doc.title} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileCheck size={16} className="text-primary-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                      <p className="text-xs text-gray-500">{doc.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.required && <span className="badge-red">필수</span>}
                    <button
                      onClick={() => toast.success('다운로드 시작 (실제 환경에서 파일 제공)')}
                      className="flex items-center gap-1 text-primary-600 text-sm hover:underline"
                    >
                      <Download size={14} /> 다운로드
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
              <p className="font-medium mb-1">📮 서면 제출처</p>
              <p>구기빌딩 2층 추진위원회 사무실</p>
              <p>평일 09:00 ~ 18:00 (우편·방문 모두 가능)</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'verify' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-6">동의율 법정 기준 검증</h3>
            <div className="space-y-4">
              {[
                {
                  stage: '정비계획 입안 제안',
                  basis: '서울특별시 조례 제7조 – 토지등소유자 2/3 이상 동의',
                  required: 66.7,
                  current: consentRate,
                  note: '정비계획 입안 제안 시 필요한 동의율',
                },
                {
                  stage: '추진위원회 구성',
                  basis: '도정법 제35조 – 토지등소유자 과반수 동의',
                  required: 50,
                  current: consentRate,
                  note: '추진위원회 구성 승인 신청 시 필요',
                },
                {
                  stage: '조합 설립 인가',
                  basis: '도정법 제38조 – 토지등소유자 3/4 이상 + 토지면적 1/2 이상',
                  required: 75,
                  current: consentRate,
                  note: '조합 설립 인가 신청 시 필요 (별도 징구)',
                },
              ].map((item) => {
                const pct = Math.min(item.current / item.required * 100, 100)
                const ok = item.current >= item.required
                return (
                  <div key={item.stage} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.stage}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{item.basis}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.note}</p>
                      </div>
                      <span className={ok ? 'badge-green' : 'badge-red'}>
                        {ok ? '충족' : '미충족'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${ok ? 'bg-green-500' : 'bg-amber-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-sm font-bold w-28 text-right">
                        <span className={ok ? 'text-green-600' : 'text-gray-900'}>
                          {item.current.toFixed(1)}%
                        </span>
                        <span className="text-gray-400"> / {item.required}%</span>
                      </div>
                    </div>
                    {!ok && (
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <AlertCircle size={12} />
                        추가 {(item.required - item.current).toFixed(1)}% 필요
                        ({Math.ceil((item.required / 100 * total) - counts.agreed)}명 동의 추가 필요)
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
