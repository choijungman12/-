import { useState } from 'react'
import { useAppStore } from '../store'
import { Plus, MessageSquare, CheckCircle, Clock, ChevronDown } from 'lucide-react'
import type { QnA } from '../types'
import toast from 'react-hot-toast'

export default function QnAPage() {
  const { qnaList, addQnA, answerQnA, currentUser } = useAppStore()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all')
  const [form, setForm] = useState({ question: '', authorName: '', authorPhone: '', isAnonymous: false })
  const [answerText, setAnswerText] = useState<Record<string, string>>({})

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'committee'

  const filtered = qnaList.filter((q) =>
    filter === 'all' || q.status === filter
  )

  function handleSubmitQuestion() {
    if (!form.question.trim()) {
      toast.error('질문 내용을 입력해주세요.')
      return
    }
    if (!form.isAnonymous && (!form.authorName || !form.authorPhone)) {
      toast.error('이름과 연락처를 입력해주세요.')
      return
    }
    addQnA({
      id: `q${Date.now()}`,
      question: form.question,
      authorName: form.isAnonymous ? '익명' : form.authorName,
      authorPhone: form.isAnonymous ? '***' : form.authorPhone,
      isAnonymous: form.isAnonymous,
      status: 'pending',
      createdAt: new Date().toISOString().slice(0, 10),
    })
    toast.success('질문이 등록되었습니다. 빠른 시간 내에 답변드리겠습니다.')
    setShowForm(false)
    setForm({ question: '', authorName: '', authorPhone: '', isAnonymous: false })
  }

  function handleAnswer(id: string) {
    const answer = answerText[id]
    if (!answer?.trim()) {
      toast.error('답변 내용을 입력해주세요.')
      return
    }
    answerQnA(id, answer, currentUser?.name || '추진위원회')
    setAnswerText({ ...answerText, [id]: '' })
    toast.success('답변이 등록되었습니다.')
  }

  const faqItems = [
    {
      q: '재개발 사업의 추진 절차는 어떻게 되나요?',
      a: '재개발 사업은 ① 정비계획 수립 및 정비구역 지정 → ② 추진위원회 승인 → ③ 조합 설립 인가 → ④ 사업시행계획 인가 → ⑤ 관리처분계획 인가 → ⑥ 착공 및 준공 → ⑦ 이전고시 및 청산의 단계로 진행됩니다.',
    },
    {
      q: '동의서를 제출했다가 취소할 수 있나요?',
      a: '정비계획 입안 단계에서는 동의서를 제출한 이후에도 추진위원회 승인 전까지 철회가 가능합니다. 다만, 조합 설립 동의서는 인가 신청 후에는 철회가 제한될 수 있습니다.',
    },
    {
      q: '재개발 사업에 반대하는 소유자는 어떻게 되나요?',
      a: '반대하는 소유자는 사업 추진 요건(동의율)에 영향을 미칩니다. 조합 설립 후에도 반대하는 경우, 사업 시행 단계에서 매도청구(도정법 제64조)를 통해 강제 편입될 수 있습니다.',
    },
    {
      q: '세입자도 보상을 받을 수 있나요?',
      a: '네, 세입자(임차인)도 보상을 받을 수 있습니다. 주거용 세입자는 이주정착금과 주거이전비를 받을 수 있으며(최소 600만원+주거이전비), 상가 세입자는 영업손실 보상과 이전비용을 받을 수 있습니다.',
    },
    {
      q: '추진위원회 위원이 되려면 어떻게 해야 하나요?',
      a: '추진위원회 위원은 토지등소유자 중에서 선정됩니다. 참여 신청 페이지 또는 추진위원회 사무실에 방문하여 신청서를 제출하시면 됩니다. 모집기간 내에 신청하셔야 합니다.',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">문의·Q&A</h2>
          <p className="section-subtitle">주민 질문 및 추진위원회 답변</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus size={15} /> 질문하기
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 자주 묻는 질문 */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">자주 묻는 질문 (FAQ)</h3>
            <div className="space-y-2">
              {faqItems.map((item, i) => (
                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpanded(expanded === `faq-${i}` ? null : `faq-${i}`)}
                    className="flex items-start justify-between w-full p-3 text-left hover:bg-gray-50 gap-2"
                  >
                    <span className="text-sm font-medium text-gray-800">{item.q}</span>
                    <ChevronDown size={14} className={`flex-shrink-0 text-gray-400 mt-0.5 transition-transform
                      ${expanded === `faq-${i}` ? 'rotate-180' : ''}`} />
                  </button>
                  {expanded === `faq-${i}` && (
                    <div className="px-3 pb-3 text-sm text-gray-600 border-t border-gray-100 pt-2">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 질문 목록 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2">
            {(['all', 'pending', 'answered'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${filter === f ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {f === 'all' ? `전체 (${qnaList.length})` :
                 f === 'pending' ? `미답변 (${qnaList.filter(q => q.status === 'pending').length})` :
                 `답변완료 (${qnaList.filter(q => q.status === 'answered').length})`}
              </button>
            ))}
          </div>

          {filtered.map((q) => (
            <div key={q.id} className="card">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0
                  ${q.status === 'answered' ? 'bg-green-500' : 'bg-amber-400'}`}>
                  Q
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={q.status === 'answered' ? 'badge-green' : 'badge-yellow'}>
                      {q.status === 'answered' ? '답변완료' : '미답변'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {q.isAnonymous ? '익명' : q.authorName} · {q.createdAt}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{q.question}</p>
                </div>
              </div>

              {q.status === 'answered' && q.answer && (
                <div className="mt-3 ml-11 p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs font-semibold text-blue-700 mb-1">
                    A. 추진위원회 답변 ({q.answeredBy} · {q.answeredAt})
                  </p>
                  <p className="text-sm text-blue-800">{q.answer}</p>
                </div>
              )}

              {isAdmin && q.status === 'pending' && (
                <div className="mt-3 ml-11">
                  <textarea
                    className="input w-full text-sm"
                    rows={2}
                    placeholder="답변을 입력하세요..."
                    value={answerText[q.id] || ''}
                    onChange={(e) => setAnswerText({ ...answerText, [q.id]: e.target.value })}
                  />
                  <button
                    onClick={() => handleAnswer(q.id)}
                    className="btn-primary mt-2 text-sm py-1.5"
                  >
                    답변 등록
                  </button>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="card text-center py-12 text-gray-400">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
              <p>질문이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 질문 작성 모달 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold">질문하기</h3>
            </div>
            <div className="p-6 space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isAnonymous}
                  onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })} />
                <span className="text-sm">익명으로 질문하기</span>
              </label>
              {!form.isAnonymous && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">이름 *</label>
                    <input className="input" value={form.authorName}
                      onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">연락처 *</label>
                    <input className="input" value={form.authorPhone}
                      onChange={(e) => setForm({ ...form, authorPhone: e.target.value })} />
                  </div>
                </div>
              )}
              <div>
                <label className="label">질문 내용 *</label>
                <textarea className="input" rows={5} value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="궁금하신 사항을 자유롭게 작성해주세요." />
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
                * 답변은 평일 기준 2~3일 내에 드립니다.
                * 개인정보는 질문 처리 목적으로만 사용됩니다.
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="btn-secondary">취소</button>
              <button onClick={handleSubmitQuestion} className="btn-primary">질문 등록</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
