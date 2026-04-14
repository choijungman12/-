import ReactECharts from 'echarts-for-react'
import { useAppStore } from '../store'
import { MapPin, Building2, Users, Ruler, CheckCircle, XCircle } from 'lucide-react'

const zoningLabels: Record<string, string> = {
  exclusive_residential_1: '제1종전용주거지역',
  exclusive_residential_2: '제2종전용주거지역',
  general_residential_1:   '제1종일반주거지역',
  general_residential_2:   '제2종일반주거지역',
  general_residential_3:   '제3종일반주거지역',
  semi_residential:        '준주거지역',
  green_natural:           '자연녹지지역',
}

export default function ProjectOverview() {
  const { project, owners } = useAppStore()

  const buildingChartOption = {
    animation: false,
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', right: 10, top: 'middle', textStyle: { fontSize: 12 } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      itemStyle: { borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
      label: { show: false },
      emphasis: { label: { show: true, fontWeight: 'bold' } },
      data: [
        { value: 44, name: '단독주택 (48.9%)', itemStyle: { color: '#57b5e7' } },
        { value: 32, name: '공동주택 (35.6%)', itemStyle: { color: '#8dd3c7' } },
        { value: 12, name: '근린생활시설 (13.3%)', itemStyle: { color: '#fbba72' } },
        { value: 2, name: '기타 (2.2%)', itemStyle: { color: '#fc8d62' } },
      ],
    }],
  }

  const zoningChartOption = {
    animation: false,
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '65%',
      itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: '#fff' },
      label: { fontSize: 11, formatter: '{b}\n{d}%' },
      data: [
        { value: 35, name: '1종전용\n주거', itemStyle: { color: '#3b82f6' } },
        { value: 30, name: '1종일반\n주거', itemStyle: { color: '#22c55e' } },
        { value: 25, name: '2종일반\n주거', itemStyle: { color: '#f59e0b' } },
        { value: 10, name: '자연녹지', itemStyle: { color: '#94a3b8' } },
      ],
    }],
  }

  const requirements = [
    { label: '노후·불량 건축물 비율', value: '74.4%', standard: '60% 이상', met: true },
    { label: '과소필지 비율', value: '15.1%', standard: '40% 이상', met: false },
    { label: '접도율', value: '13.3%', standard: '40% 이하', met: true },
    { label: '호수밀도', value: '16.2호/ha', standard: '60호/ha 이상', met: false },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">사업 개요</h2>
        <p className="section-subtitle">{project.address}</p>
      </div>

      {/* 기본 정보 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '구역 면적', value: `${project.totalArea.toLocaleString()}m²`, sub: `약 ${(project.totalArea/10000).toFixed(2)}ha`, icon: Ruler, color: 'bg-blue-500' },
          { label: '필지 수', value: `${project.lotCount}필지`, icon: MapPin, color: 'bg-green-500' },
          { label: '건축물 수', value: `${project.buildingCount}동`, icon: Building2, color: 'bg-orange-500' },
          { label: '토지등소유자', value: `${owners.length}명`, icon: Users, color: 'bg-purple-500' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">{item.value}</p>
                  {item.sub && <p className="text-xs text-gray-400">{item.sub}</p>}
                </div>
                <div className={`${item.color} p-2.5 rounded-xl`}>
                  <Icon size={18} className="text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 건축물 현황 */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">현재 건축물 현황</h3>
          <ReactECharts option={buildingChartOption} style={{ height: 260 }} />
        </div>

        {/* 용도지역 현황 */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">용도지역 현황</h3>
          <ReactECharts option={zoningChartOption} style={{ height: 260 }} />
        </div>
      </div>

      {/* 추진 요건 검토 */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-2">재개발 추진 요건 검토 결과</h3>
        <p className="text-xs text-gray-500 mb-4">
          서울특별시 「도시 및 주거환경정비 조례」 제6조제1항제2호 기준
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="table-header">항목</th>
                <th className="table-header text-right">현황</th>
                <th className="table-header text-right">기준</th>
                <th className="table-header">충족 여부</th>
                <th className="table-header">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requirements.map((r) => (
                <tr key={r.label} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{r.label}</td>
                  <td className="table-cell text-right font-semibold">{r.value}</td>
                  <td className="table-cell text-right text-gray-500">{r.standard}</td>
                  <td className="table-cell">
                    <span className={r.met ? 'badge-green' : 'badge-red'}>
                      {r.met ? '충족' : '미충족'}
                    </span>
                  </td>
                  <td className="table-cell text-xs text-gray-400">
                    {!r.met ? '서울시 조례 제6조제2항 단서 조항으로 2개 이상 충족 시 입안 가능' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-start gap-2">
            <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800">종합 판정: 정비계획 입안 요건 충족</p>
              <p className="text-sm text-green-700 mt-1">
                한국부동산원 현황분석 검토의견서 결과, 서울특별시 「도시 및 주거환경정비 조례」
                제6조제1항제2호에 따른 주택정비형 재개발의 정비계획 입안 요건을 충족하는 것으로 확인됨
                (2026년 1월 검토 기준)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 사업 정보 */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">사업 기본 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
          {[
            { label: '사업 명칭', value: project.name },
            { label: '사업 유형', value: '주택정비형 재개발사업' },
            { label: '사업 위치', value: project.address },
            { label: '사업 시행자', value: '추진위원회 구성 후 조합 설립 예정' },
            { label: '구역 면적', value: `${project.totalArea.toLocaleString()}m² (약 ${(project.totalArea/10000).toFixed(2)}ha)` },
            { label: '필지 수', value: `${project.lotCount}필지` },
            { label: '건축물 수', value: `${project.buildingCount}동 (주건축물 기준)` },
            { label: '토지등소유자 수', value: `${owners.length}명` },
            { label: '용도지역', value: '제1종전용주거지역, 제1종·제2종일반주거지역, 자연녹지지역' },
            { label: '현황분석 검토', value: '한국부동산원 검토 완료 (2026.01)' },
            { label: '사업 추진 근거', value: '도시 및 주거환경정비법 (도정법)' },
            { label: '관할 기관', value: '서울특별시 종로구청 도시계획과' },
          ].map((item) => (
            <div key={item.label} className="flex gap-2">
              <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">{item.label}</span>
              <span className="text-sm text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
