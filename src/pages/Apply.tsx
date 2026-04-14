import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

type Step = 1 | 2 | 3 | 4

export default function Apply() {
  const [step, setStep] = useState<Step>(1)
  const [experience, setExperience] = useState<'yes' | 'no'>('no')
  const [openAgreement, setOpenAgreement] = useState<string | null>(null)
  const [agreements, setAgreements] = useState({ privacy: false, activity: false, thirdParty: false })
  const [form, setForm] = useState({
    name: '', birthdate: '', phone: '', email: '',
    zipcode: '', address1: '', address2: '',
    propertyType: '', propertyAddress: '', propertyArea: '', acquisitionDate: '',
    experienceDescription: '',
  })

  const steps = ['신청서 작성', '서류 제출', '검토 및 승인', '최종 확정']
  const progress = (step / 4) * 100

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agreements.privacy || !agreements.activity || !agreements.thirdParty) {
      toast.error('모든 동의 사항에 체크해주세요.')
      return
    }
    toast.success('신청서가 성공적으로 제출되었습니다! 검토 후 연락드리겠습니다.')
    setStep(2)
  }

  const agreementDetails: Record<string, { title: string; content: string[] }> = {
    privacy: {
      title: '개인정보 수집 및 이용 동의',
      content: [
        '1. 수집항목: 이름, 생년월일, 연락처, 이메일, 주소, 소유 부동산 정보',
        '2. 수집목적: 추진위원회 신청자 확인 및 자격 검토, 추진위원회 구성 및 활동 관련 연락',
        '3. 보유기간: 추진위원회 활동 종료 후 3년간',
        '※ 동의를 거부할 권리가 있으며, 동의 거부 시 추진위원회 신청이 제한될 수 있습니다.',
      ],
    },
    activity: {
      title: '추진위원회 활동 동의',
      content: [
        '1. 추진위원회 구성원으로 선정될 경우, 월 1회 이상의 정기 회의에 참석해야 합니다.',
        '2. 추진위원회 활동 중 알게 된 정보에 대한 비밀유지 의무가 있습니다.',
        '3. 추진위원회 활동은 조합 설립 인가 시까지 계속되며, 중도 사퇴 시 사전에 통보해야 합니다.',
        '4. 추진위원회 활동에 필요한 경비는 추진위원회 규약에 따라 분담할 수 있습니다.',
      ],
    },
    thirdParty: {
      title: '제3자 정보제공 동의',
      content: [
        '1. 제공받는 자: 종로구청, 서울특별시, 용역업체(정비계획 수립 등)',
        '2. 제공항목: 이름, 연락처, 소유 부동산 정보',
        '3. 제공목적: 추진위원회 승인 및 정비사업 추진 관련 업무',
        '4. 보유기간: 제공 목적 달성 시까지',
        '※ 동의를 거부할 권리가 있으며, 동의 거부 시 추진위원회 신청이 제한될 수 있습니다.',
      ],
    },
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link to="/" className="flex items-center text-gray-700 hover:text-blue-600 mr-4 p-2 rounded-lg hover:bg-gray-100">
            ← 뒤로
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-center flex-1">추진위원회 모집 신청</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 진행 단계 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">신청 진행 단계</h2>
            <span className="text-sm text-gray-500">{step}/4 단계</span>
          </div>
          <div className="flex justify-between mb-4">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-1.5 text-sm transition-colors
                  ${i + 1 <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium text-center ${i + 1 === step ? 'text-blue-600' : 'text-gray-500'}`}>{s}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {step === 1 && (
          <>
            {/* 추진위원회 소개 */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg">👥</span>
                추진위원회 소개
              </h2>

              <div className="mb-8">
                <h3 className="font-bold text-lg mb-3">역할 및 책임</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  추진위원회는 구기동 재개발 사업의 초기 단계에서 핵심적인 역할을 담당하며, 조합 설립 이전까지 사업을 이끌어가는 중요한 주체입니다.
                </p>
                <ul className="space-y-2">
                  {[
                    '정비계획 수립 및 정비구역 지정 업무 지원',
                    '조합 설립을 위한 창립총회 개최 준비',
                    '토지등소유자 동의서 징구 및 관리',
                    '사업 관련 용역업체 선정 지원',
                    '주민 설명회 및 의견 수렴 활동',
                  ].map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-blue-500 flex-shrink-0 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-8">
                <h3 className="font-bold text-lg mb-3">자격 요건</h3>
                <ul className="space-y-2">
                  {[
                    '구기동 재개발 구역 내 토지 또는 건축물의 소유자',
                    '재개발 사업에 대한 이해와 관심이 있는 분',
                    '월 1회 이상 정기 회의 참석이 가능한 분',
                    '추진위원회 활동에 적극적으로 참여할 수 있는 분',
                  ].map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-blue-500 flex-shrink-0 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-4">활동 기간 및 주요 일정</h3>
                <div className="space-y-4">
                  {[
                    { period: '2026년 2월', desc: '추진위원회 발족 총회 및 임원 선출', done: true },
                    { period: '2026년 4~6월', desc: '정비계획 입안 동의서 징구 (목표: 50% 이상)', done: false },
                    { period: '2026년 7~9월', desc: '정비계획 입안 제안서 종로구청 제출', done: false },
                    { period: '2026년 10월~2027년', desc: '추진위원회 승인 및 조합 설립 준비', done: false },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                        ${item.done ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                        📅
                      </div>
                      <div className="flex-1 pb-4 border-b border-gray-100 last:border-0">
                        <h4 className="font-semibold text-gray-900">{item.period}</h4>
                        <p className="text-gray-600 text-sm mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 신청 양식 */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 기본 정보 */}
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">👤</span>
                  기본 정보
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">이름 <span className="text-red-500">*</span></label>
                    <input className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="이름을 입력하세요" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">생년월일 <span className="text-red-500">*</span></label>
                    <input type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={form.birthdate} onChange={(e) => setForm({ ...form, birthdate: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">연락처 <span className="text-red-500">*</span></label>
                    <input className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="010-0000-0000" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일</label>
                    <input type="email" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="example@email.com" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* 주소 및 부동산 정보 */}
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">🏠</span>
                  주소 및 소유 부동산 정보
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">현재 거주지 주소 <span className="text-red-500">*</span></label>
                    <div className="flex gap-2 mb-2">
                      <input className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm" placeholder="우편번호"
                        value={form.zipcode} readOnly />
                      <button
                        type="button"
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 text-sm whitespace-nowrap transition-colors"
                        onClick={() => {
                          const addr = prompt('거주지 주소를 입력하세요\n예) 서울특별시 종로구 구기동 138-1')
                          if (addr) setForm({ ...form, address1: addr, zipcode: '03016' })
                        }}
                      >
                        주소 검색
                      </button>
                    </div>
                    <input className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm mb-2" placeholder="기본 주소"
                      value={form.address1} readOnly />
                    <input className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm" placeholder="상세 주소"
                      value={form.address2} onChange={(e) => setForm({ ...form, address2: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">구기동 내 소유 부동산 정보 <span className="text-red-500">*</span></label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })} required>
                      <option value="">부동산 유형 선택</option>
                      <option value="land">토지</option>
                      <option value="building">건물</option>
                      <option value="both">토지 및 건물</option>
                    </select>
                    <input className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm mb-2" placeholder="부동산 소재지 주소"
                      value={form.propertyAddress} onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })} required />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">면적 (m²)</label>
                        <input className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm" placeholder="면적 입력"
                          value={form.propertyArea} onChange={(e) => setForm({ ...form, propertyArea: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">취득일자</label>
                        <input type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm"
                          value={form.acquisitionDate} onChange={(e) => setForm({ ...form, acquisitionDate: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">추진위원회 활동 경험</label>
                    <div className="flex gap-6">
                      {[{ value: 'no', label: '없음' }, { value: 'yes', label: '있음' }].map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="experience" value={opt.value}
                            checked={experience === opt.value}
                            onChange={() => setExperience(opt.value as 'yes' | 'no')}
                            className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                    {experience === 'yes' && (
                      <div className="mt-3">
                        <textarea className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3} placeholder="이전 추진위원회 활동 경험을 간략히 설명해주세요"
                          value={form.experienceDescription}
                          onChange={(e) => setForm({ ...form, experienceDescription: e.target.value })} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 첨부 서류 */}
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">📎</span>
                  첨부 서류
                </h2>
                <div className="space-y-5">
                  {[
                    { id: 'idCard', label: '신분증 사본', required: true, multiple: false },
                    { id: 'propertyDoc', label: '등기부등본', required: true, multiple: false },
                    { id: 'additionalDocs', label: '기타 증빙서류', required: false, multiple: true },
                  ].map((doc) => (
                    <div key={doc.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {doc.label} {doc.required && <span className="text-red-500">*</span>}
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
                          📁 파일 선택
                          <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" multiple={doc.multiple} />
                        </label>
                        <span className="text-xs text-gray-400">JPG, PNG, PDF (최대 5MB)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 동의 사항 */}
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">✅</span>
                  동의 사항
                </h2>
                <div className="space-y-4">
                  {(Object.keys(agreementDetails) as (keyof typeof agreements)[]).map((key) => {
                    const detail = agreementDetails[key]
                    return (
                      <div key={key} className="p-5 bg-gray-50 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium text-sm">
                            {detail.title} <span className="text-red-500">*</span>
                          </h3>
                          <button type="button" onClick={() => setOpenAgreement(openAgreement === key ? null : key)}
                            className="text-blue-600 text-xs hover:underline">
                            {openAgreement === key ? '접기' : '자세히 보기'}
                          </button>
                        </div>
                        {openAgreement === key && (
                          <div className="mb-3 bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                            {detail.content.map((c, i) => <p key={i}>{c}</p>)}
                          </div>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={agreements[key]}
                            onChange={(e) => setAgreements({ ...agreements, [key]: e.target.checked })}
                            className="w-4 h-4 rounded text-blue-600" />
                          <span className="text-sm text-gray-700">동의합니다.</span>
                        </label>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 제출 버튼 */}
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <p className="text-gray-600 text-sm mb-6">모든 필수 항목(*)을 작성하셨는지 확인해주세요.</p>
                <button type="submit"
                  className="bg-blue-600 text-white px-10 py-4 rounded-xl hover:bg-blue-700 font-medium text-lg transition-colors shadow-lg shadow-blue-200">
                  신청서 제출하기
                </button>
                <p className="text-xs text-gray-400 mt-4">제출 후에는 담당자 검토를 거쳐 개별 연락드립니다.</p>
              </div>
            </form>
          </>
        )}

        {step >= 2 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">신청이 완료되었습니다!</h2>
            <p className="text-gray-500 mb-8">담당자 검토 후 등록된 연락처로 개별 연락드립니다.<br />처리 기간은 영업일 기준 3~5일입니다.</p>
            <div className="bg-blue-50 rounded-xl p-6 text-left max-w-md mx-auto mb-8">
              <h3 className="font-bold text-blue-800 mb-3">다음 단계</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>✓ 제출된 서류 검토 (3~5 영업일)</li>
                <li>✓ 자격 요건 확인</li>
                <li>✓ 개별 연락 및 최종 확정</li>
              </ul>
            </div>
            <Link to="/" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium">
              메인 페이지로 돌아가기
            </Link>
          </div>
        )}

        {/* 문의 정보 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mt-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">📞</span>
            문의 안내
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '📍', title: '추진위원회 사무실', info: '서울특별시 종로구 구기동 123-45 구기빌딩 2층' },
              { icon: '📞', title: '연락처', info: '010-5787-6695' },
              { icon: '📧', title: '이메일', info: 'guki@redevelopment.org' },
              { icon: '🕐', title: '운영시간', info: '평일 09:00 ~ 18:00 (점심 12:00~13:00)' },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-medium text-sm text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.info}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2026 종로구 구기재개발추진위원회. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
            <a href="#" className="hover:text-white transition-colors">이용약관</a>
            <Link to="/" className="hover:text-white transition-colors">메인 페이지</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
