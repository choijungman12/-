import { useState } from 'react'
import { Search, BookOpen, ExternalLink, Scale, FileText, BookMarked, ChevronDown } from 'lucide-react'
import { legalDatabase } from '../data/mockData'

const categories = ['전체', '법률', '조례', '판례', '지침']

export default function Legal() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('전체')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = legalDatabase.filter((item) => {
    const matchCat = category === '전체' || item.category === category
    const matchSearch = !search ||
      item.title.includes(search) ||
      item.article.includes(search) ||
      item.content.includes(search)
    return matchCat && matchSearch
  })

  const catIcon: Record<string, React.ReactNode> = {
    '법률': <Scale size={16} className="text-blue-500" />,
    '조례': <BookOpen size={16} className="text-green-500" />,
    '판례': <BookMarked size={16} className="text-purple-500" />,
    '지침': <FileText size={16} className="text-orange-500" />,
  }

  const catBadge: Record<string, string> = {
    '법률': 'badge-blue',
    '조례': 'badge-green',
    '판례': 'bg-purple-100 text-purple-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    '지침': 'badge-yellow',
  }

  // 주요 법령 절차 가이드
  const procedureGuide = [
    {
      step: 1, title: '정비계획 수립 및 정비구역 지정',
      basis: '도정법 제8조~제20조',
      details: [
        '입안권자: 특별자치시장, 특별자치도지사, 시장·군수 또는 구청장',
        '주민설명회 개최 및 주민 의견 청취',
        '서울시 도시계획위원회 심의',
        '정비구역 지정 고시',
      ],
    },
    {
      step: 2, title: '추진위원회 구성 및 승인',
      basis: '도정법 제35조~제36조',
      details: [
        '토지등소유자 과반수 동의 필요',
        '위원장 포함 5명 이상 위원 구성',
        '시장·군수에게 승인 신청',
        '위원회 업무: 창립총회 준비, 정관 초안 작성',
      ],
    },
    {
      step: 3, title: '조합 설립 인가',
      basis: '도정법 제38조',
      details: [
        '토지등소유자 3/4 이상 + 토지면적 1/2 이상 동의',
        '창립총회 개최 (조합장, 이사, 감사 선출)',
        '정관 확정',
        '시장·군수에게 인가 신청',
      ],
    },
    {
      step: 4, title: '사업시행계획 수립 및 인가',
      basis: '도정법 제50조~제62조',
      details: [
        '사업시행계획서 작성 (건축설계 포함)',
        '조합원 2/3 이상 동의 (총회)',
        '시장·군수에게 인가 신청',
        '관계 기관 협의 및 심의',
      ],
    },
    {
      step: 5, title: '관리처분계획 수립 및 인가',
      basis: '도정법 제74조~제88조',
      details: [
        '분양신청 공고 및 접수',
        '관리처분계획 수립 (개인별 권리가액 산정)',
        '조합원 2/3 이상 동의 (총회)',
        '시장·군수에게 인가 신청 및 고시',
      ],
    },
    {
      step: 6, title: '이전고시 및 청산',
      basis: '도정법 제86조~제89조',
      details: [
        '공사 완료 후 준공인가',
        '이전고시 (분양받은 토지·건축물 권리 이전)',
        '청산금 납부 및 수령',
        '조합 해산',
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">법령·판례 데이터베이스</h2>
        <p className="section-subtitle">도시정비 관련 법령, 조례, 판례 및 업무 지침</p>
      </div>

      {/* 검색 */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9 bg-white"
            placeholder="법령명, 조문, 내용으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${category === c
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 법령 DB 목록 */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-sm text-gray-500">{filtered.length}건 검색됨</p>
          {filtered.map((item) => (
            <div key={item.id} className="card">
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-0.5">{catIcon[item.category]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={catBadge[item.category]}>{item.category}</span>
                    </div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-primary-600 font-medium">{item.article}</p>
                    {item.category === '판례' && item.caseSummary && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.caseSummary}</p>
                    )}
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 flex-shrink-0 ml-2 transition-transform
                    ${expanded === item.id ? 'rotate-180' : ''}`}
                />
              </div>

              {expanded === item.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">
                    {item.content}
                  </pre>
                  {item.relatedArticles && item.relatedArticles.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      관련 조문:
                      {item.relatedArticles.map((a) => (
                        <span key={a} className="badge-gray">{a}</span>
                      ))}
                    </div>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center gap-1.5 text-sm text-primary-600 hover:underline"
                    >
                      <ExternalLink size={13} /> 원문 보기 (법제처)
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="card text-center py-12 text-gray-400">
              <Search size={32} className="mx-auto mb-2 opacity-30" />
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
        </div>

        {/* 사이드: 업무 절차 가이드 */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">재개발 업무 절차 가이드</h3>
            <div className="space-y-3">
              {procedureGuide.map((step) => (
                <div key={step.step}
                  className="cursor-pointer"
                  onClick={() => setExpanded(`guide-${step.step}`)}>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                      <p className="text-xs text-primary-600">{step.basis}</p>
                    </div>
                  </div>
                  {expanded === `guide-${step.step}` && (
                    <div className="ml-9 mt-2">
                      <ul className="space-y-1">
                        {step.details.map((d, i) => (
                          <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                            <span className="text-primary-400">·</span> {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {step.step < procedureGuide.length && (
                    <div className="ml-3 w-0.5 h-3 bg-gray-200 mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">관련 기관 링크</h3>
            <div className="space-y-2">
              {[
                { name: '국가법령정보센터', url: 'https://www.law.go.kr', desc: '도정법, 토지보상법 원문' },
                { name: '서울시 도시정비 포털', url: 'https://cleanup.seoul.go.kr', desc: '서울시 정비사업 정보' },
                { name: '종로구청 도시계획과', url: 'https://www.jongno.go.kr', desc: '구역 지정 상담' },
                { name: '한국부동산원', url: 'https://www.kab.co.kr', desc: '현황분석 검토 신청' },
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 group"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600">{link.name}</p>
                    <p className="text-xs text-gray-400">{link.desc}</p>
                  </div>
                  <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
