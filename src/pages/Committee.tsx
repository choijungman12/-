import { useState } from 'react'
import { useAppStore } from '../store'
import { Plus, Edit2, UserX, Phone, Mail, Calendar, Users, FileText, ChevronDown } from 'lucide-react'
import type { CommitteeMember, CommitteeRole, MeetingType } from '../types'
import toast from 'react-hot-toast'

const roleLabels: Record<CommitteeRole, { label: string; cls: string }> = {
  chairperson: { label: '위원장', cls: 'badge-blue' },
  vice_chair:  { label: '부위원장', cls: 'badge-blue' },
  secretary:   { label: '간사', cls: 'badge-green' },
  auditor:     { label: '감사', cls: 'badge-yellow' },
  member:      { label: '위원', cls: 'badge-gray' },
}

const meetingTypeLabels: Record<MeetingType, string> = {
  regular: '정기회의',
  special: '임시회의',
  general: '총회',
}

export default function Committee() {
  const {
    committeeMembers, addCommitteeMember, updateCommitteeMember, removeCommitteeMember,
    meetings, addMeeting, updateMeeting, owners,
  } = useAppStore()
  const [activeTab, setActiveTab] = useState<'members' | 'meetings' | 'minutes'>('members')
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [showMeetingForm, setShowMeetingForm] = useState(false)
  const [editingMember, setEditingMember] = useState<string | null>(null)
  const [memberForm, setMemberForm] = useState<Partial<CommitteeMember>>({ role: 'member', isActive: true })
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null)
  const [meetingForm, setMeetingForm] = useState({
    title: '', type: 'regular' as MeetingType, date: '', location: '',
    agenda: [''], minutes: '', resolutions: [''],
  })

  const activeMembers = committeeMembers.filter((m) => m.isActive)

  function handleSaveMember() {
    if (!memberForm.name || !memberForm.phone) {
      toast.error('이름과 연락처는 필수입니다.')
      return
    }
    if (editingMember) {
      updateCommitteeMember(editingMember, memberForm)
      toast.success('위원 정보가 수정되었습니다.')
    } else {
      const member: CommitteeMember = {
        id: `cm${Date.now()}`,
        ownerId: memberForm.ownerId || '',
        name: memberForm.name!,
        phone: memberForm.phone!,
        email: memberForm.email,
        role: memberForm.role || 'member',
        appointedDate: memberForm.appointedDate || new Date().toISOString().slice(0, 10),
        isActive: true,
        notes: memberForm.notes,
      }
      addCommitteeMember(member)
      toast.success('위원이 등록되었습니다.')
    }
    setShowMemberForm(false)
    setEditingMember(null)
    setMemberForm({ role: 'member', isActive: true })
  }

  function handleSaveMeeting() {
    if (!meetingForm.title || !meetingForm.date) {
      toast.error('회의명과 날짜는 필수입니다.')
      return
    }
    const meeting = {
      id: `mt${Date.now()}`,
      title: meetingForm.title,
      type: meetingForm.type,
      date: meetingForm.date,
      location: meetingForm.location,
      attendees: activeMembers.map((m) => m.id),
      agenda: meetingForm.agenda.filter(Boolean),
      minutes: meetingForm.minutes,
      resolutions: meetingForm.resolutions.filter(Boolean),
      createdAt: new Date().toISOString().slice(0, 10),
    }
    addMeeting(meeting)
    toast.success('회의록이 등록되었습니다.')
    setShowMeetingForm(false)
    setMeetingForm({ title: '', type: 'regular', date: '', location: '', agenda: [''], minutes: '', resolutions: [''] })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">추진위원회 관리</h2>
          <p className="section-subtitle">위원 {activeMembers.length}명 구성 | 회의 {meetings.length}회 개최</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'members' && (
            <button
              onClick={() => { setShowMemberForm(true); setEditingMember(null); setMemberForm({ role: 'member', isActive: true }) }}
              className="btn-primary flex items-center gap-1.5 text-sm"
            >
              <Plus size={15} /> 위원 등록
            </button>
          )}
          {activeTab === 'meetings' && (
            <button
              onClick={() => setShowMeetingForm(true)}
              className="btn-primary flex items-center gap-1.5 text-sm"
            >
              <Plus size={15} /> 회의 등록
            </button>
          )}
        </div>
      </div>

      {/* 탭 */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {[
            { key: 'members', label: '위원 명단' },
            { key: 'meetings', label: '회의 이력' },
            { key: 'minutes', label: '회의록 조회' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`pb-3 text-sm font-medium border-b-2 -mb-px transition-colors
                ${activeTab === tab.key ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* 역할별 요약 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(['chairperson', 'vice_chair', 'secretary', 'auditor', 'member'] as CommitteeRole[]).map((role) => {
              const count = activeMembers.filter((m) => m.role === role).length
              return (
                <div key={role} className="card text-center p-3">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <span className={`${roleLabels[role].cls} mt-1`}>{roleLabels[role].label}</span>
                </div>
              )
            })}
          </div>

          {/* 위원 카드 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {committeeMembers.map((member) => (
              <div key={member.id} className={`card ${!member.isActive ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                      {member.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{member.name}</p>
                      <span className={roleLabels[member.role].cls}>{roleLabels[member.role].label}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setMemberForm(member); setEditingMember(member.id); setShowMemberForm(true) }}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                    >
                      <Edit2 size={14} />
                    </button>
                    {member.isActive && (
                      <button
                        onClick={() => { removeCommitteeMember(member.id); toast.success('위원이 해임되었습니다.') }}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500"
                      >
                        <UserX size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-gray-600">
                  <p className="flex items-center gap-2"><Phone size={13} /> {member.phone}</p>
                  {member.email && <p className="flex items-center gap-2"><Mail size={13} /> {member.email}</p>}
                  <p className="flex items-center gap-2"><Calendar size={13} /> 선임일: {member.appointedDate}</p>
                  {member.notes && (
                    <p className="text-xs text-gray-400 mt-2 p-2 bg-gray-50 rounded">{member.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 운영 규정 요약 */}
          <div className="card bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">추진위원회 구성 법적 요건</h3>
            <div className="text-xs text-gray-600 space-y-1.5">
              <p>• <strong>구성 요건</strong>: 토지등소유자 과반수 동의 (도정법 제35조)</p>
              <p>• <strong>위원 구성</strong>: 위원장 포함 5명 이상, 토지등소유자 중에서 선정</p>
              <p>• <strong>역할</strong>: 정비계획 입안 제안, 조합 설립 준비, 업무 대행자 선정</p>
              <p>• <strong>승인</strong>: 구성 동의 후 시장·군수에게 승인 신청</p>
              <p>• <strong>운영비</strong>: 추진위원회 운영 비용은 나중에 조합이 부담</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'meetings' && (
        <div className="space-y-4">
          {meetings.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">
              <FileText size={32} className="mx-auto mb-2 opacity-30" />
              <p>등록된 회의가 없습니다.</p>
            </div>
          ) : (
            meetings.map((m) => (
              <div key={m.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge-blue">{meetingTypeLabels[m.type]}</span>
                      <span className="text-xs text-gray-400">{m.date}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{m.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                      <Calendar size={13} /> {m.location}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <Users size={13} /> 참석 {m.attendees.length}명
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMeeting(selectedMeeting === m.id ? null : m.id)}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                  >
                    <ChevronDown size={16} className={selectedMeeting === m.id ? 'rotate-180 transition-transform' : 'transition-transform'} />
                  </button>
                </div>

                {selectedMeeting === m.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1.5">안건</p>
                      <ul className="space-y-1">
                        {m.agenda.map((a, i) => (
                          <li key={i} className="flex gap-2 text-sm text-gray-700">
                            <span className="text-gray-400">{i + 1}.</span> {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {m.minutes && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1.5">회의 요약</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{m.minutes}</p>
                      </div>
                    )}
                    {m.resolutions && m.resolutions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1.5">의결 사항</p>
                        <ul className="space-y-1">
                          {m.resolutions.map((r, i) => (
                            <li key={i} className="flex gap-2 text-sm text-gray-700">
                              <span className="text-primary-500 font-bold">✓</span> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'minutes' && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">회의록 통합 조회</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="table-header">회의명</th>
                  <th className="table-header">유형</th>
                  <th className="table-header">일자</th>
                  <th className="table-header">장소</th>
                  <th className="table-header">참석</th>
                  <th className="table-header">의결 건수</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {meetings.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => { setSelectedMeeting(m.id); setActiveTab('meetings') }}>
                    <td className="table-cell font-medium text-primary-600">{m.title}</td>
                    <td className="table-cell"><span className="badge-blue">{meetingTypeLabels[m.type]}</span></td>
                    <td className="table-cell text-sm">{m.date}</td>
                    <td className="table-cell text-sm text-gray-500">{m.location}</td>
                    <td className="table-cell text-sm">{m.attendees.length}명</td>
                    <td className="table-cell text-sm">{m.resolutions?.length || 0}건</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 위원 등록 모달 */}
      {showMemberForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold">{editingMember ? '위원 정보 수정' : '위원 신규 등록'}</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="label">이름 *</label>
                <input className="input" value={memberForm.name || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} />
              </div>
              <div>
                <label className="label">연락처 *</label>
                <input className="input" value={memberForm.phone || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="label">이메일</label>
                <input className="input" type="email" value={memberForm.email || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} />
              </div>
              <div>
                <label className="label">역할</label>
                <select className="input" value={memberForm.role}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value as CommitteeRole })}>
                  {Object.entries(roleLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">선임일</label>
                <input className="input" type="date" value={memberForm.appointedDate || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, appointedDate: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="label">소유자 연결 (선택)</label>
                <select className="input" value={memberForm.ownerId || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, ownerId: e.target.value })}>
                  <option value="">-- 선택 안함 --</option>
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} ({o.address})</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">메모</label>
                <textarea className="input" rows={2} value={memberForm.notes || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, notes: e.target.value })} />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => { setShowMemberForm(false); setEditingMember(null) }} className="btn-secondary">취소</button>
              <button onClick={handleSaveMember} className="btn-primary">저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 회의 등록 모달 */}
      {showMeetingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold">회의 등록</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">회의명 *</label>
                  <input className="input" value={meetingForm.title}
                    onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })} placeholder="제3회 추진위원회 정기회의" />
                </div>
                <div>
                  <label className="label">회의 유형</label>
                  <select className="input" value={meetingForm.type}
                    onChange={(e) => setMeetingForm({ ...meetingForm, type: e.target.value as MeetingType })}>
                    {Object.entries(meetingTypeLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">일자 *</label>
                  <input className="input" type="date" value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="label">장소</label>
                  <input className="input" value={meetingForm.location}
                    onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })} placeholder="구기빌딩 2층 회의실" />
                </div>
              </div>
              <div>
                <label className="label">안건 (항목별 입력)</label>
                {meetingForm.agenda.map((a, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input className="input flex-1" value={a} placeholder={`안건 ${i + 1}`}
                      onChange={(e) => {
                        const updated = [...meetingForm.agenda]
                        updated[i] = e.target.value
                        setMeetingForm({ ...meetingForm, agenda: updated })
                      }} />
                    {i === meetingForm.agenda.length - 1 && (
                      <button onClick={() => setMeetingForm({ ...meetingForm, agenda: [...meetingForm.agenda, ''] })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">+</button>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <label className="label">회의 요약</label>
                <textarea className="input" rows={3} value={meetingForm.minutes}
                  onChange={(e) => setMeetingForm({ ...meetingForm, minutes: e.target.value })} placeholder="회의 진행 내용을 요약하여 입력하세요." />
              </div>
              <div>
                <label className="label">의결 사항</label>
                {meetingForm.resolutions.map((r, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input className="input flex-1" value={r} placeholder={`의결 ${i + 1}`}
                      onChange={(e) => {
                        const updated = [...meetingForm.resolutions]
                        updated[i] = e.target.value
                        setMeetingForm({ ...meetingForm, resolutions: updated })
                      }} />
                    {i === meetingForm.resolutions.length - 1 && (
                      <button onClick={() => setMeetingForm({ ...meetingForm, resolutions: [...meetingForm.resolutions, ''] })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">+</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowMeetingForm(false)} className="btn-secondary">취소</button>
              <button onClick={handleSaveMeeting} className="btn-primary">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
