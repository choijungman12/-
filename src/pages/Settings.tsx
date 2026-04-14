import { useState } from 'react'
import { useAppStore } from '../store'
import { Save, RefreshCw, AlertTriangle, Building2, Phone, Mail, Clock, MapPin } from 'lucide-react'
import type { ProjectStage } from '../types'
import toast from 'react-hot-toast'

const stageOptions: { value: ProjectStage; label: string }[] = [
  { value: 'planning',       label: '정비계획 수립' },
  { value: 'committee',      label: '추진위원회 승인' },
  { value: 'association',    label: '조합 설립 인가' },
  { value: 'implementation', label: '사업시행계획 인가' },
  { value: 'management',     label: '관리처분계획 인가' },
  { value: 'construction',   label: '착공 및 준공' },
  { value: 'completion',     label: '이전고시 및 청산' },
]

interface ContactInfo {
  officeAddress: string
  phone: string
  email: string
  hours: string
  fax: string
}

const defaultContact: ContactInfo = {
  officeAddress: '서울특별시 종로구 구기동 123-45 구기빌딩 2층',
  phone: '010-5787-6695',
  email: 'guki@redevelopment.org',
  hours: '평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00)',
  fax: '02-123-4568',
}

const CONTACT_KEY = 'guki-contact-info'

function loadContact(): ContactInfo {
  try {
    const saved = localStorage.getItem(CONTACT_KEY)
    return saved ? { ...defaultContact, ...JSON.parse(saved) } : defaultContact
  } catch {
    return defaultContact
  }
}

export default function Settings() {
  const { project, updateProject, currentUser } = useAppStore()
  const [form, setForm] = useState({ ...project })
  const [contact, setContact] = useState<ContactInfo>(loadContact)
  const [activeTab, setActiveTab] = useState<'project' | 'contact' | 'system'>('project')

  const isAdmin = currentUser?.role === 'admin'

  function handleSaveProject() {
    updateProject(form)
    toast.success('사업 정보가 저장되었습니다.')
  }

  function handleSaveContact() {
    localStorage.setItem(CONTACT_KEY, JSON.stringify(contact))
    toast.success('연락처 정보가 저장되었습니다.')
  }

  const tabs = [
    { id: 'project', label: '사업 기본 정보', icon: Building2 },
    { id: 'contact', label: '연락처 정보',    icon: Phone },
    { id: 'system',  label: '시스템',         icon: RefreshCw },
  ] as const

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="section-title">설정</h2>
        <p className="section-subtitle">사업 기본 정보 및 시스템 설정을 관리합니다</p>
      </div>

      {!isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-700">관리자 권한이 필요합니다. 일부 항목은 읽기 전용으로 표시됩니다.</p>
        </div>
      )}

      {/* 탭 */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* 사업 기본 정보 */}
      {activeTab === 'project' && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Building2 size={16} className="text-primary-500" /> 사업 기본 정보
          </h3>

          <div>
            <label className="label">사업 명칭</label>
            <input className="input" value={form.name} disabled={!isAdmin}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div>
            <label className="label">사업 위치 (주소)</label>
            <input className="input" value={form.address} disabled={!isAdmin}
              onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">구역 면적 (m²)</label>
              <input className="input" type="number" step="0.1" value={form.totalArea} disabled={!isAdmin}
                onChange={(e) => setForm({ ...form, totalArea: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="label">필지 수</label>
              <input className="input" type="number" value={form.lotCount} disabled={!isAdmin}
                onChange={(e) => setForm({ ...form, lotCount: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="label">건축물 수 (동)</label>
              <input className="input" type="number" value={form.buildingCount} disabled={!isAdmin}
                onChange={(e) => setForm({ ...form, buildingCount: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="label">토지등소유자 총원</label>
              <input className="input" type="number" value={form.ownerCount} disabled={!isAdmin}
                onChange={(e) => setForm({ ...form, ownerCount: parseInt(e.target.value) || 0 })} />
              <p className="text-xs text-gray-400 mt-1">※ 실제 소유자 수는 소유자 관리 메뉴에서 확인</p>
            </div>
          </div>

          <div>
            <label className="label">현재 사업 단계</label>
            <select className="input" value={form.currentStage} disabled={!isAdmin}
              onChange={(e) => setForm({ ...form, currentStage: e.target.value as ProjectStage })}>
              {stageOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">사업 시작일</label>
              <input className="input" type="date" value={form.startDate} disabled={!isAdmin}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label">목표 완공일</label>
              <input className="input" type="date" value={form.targetEndDate || ''} disabled={!isAdmin}
                onChange={(e) => setForm({ ...form, targetEndDate: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="label">사업 설명 (선택)</label>
            <textarea className="input resize-none" rows={3} value={form.description || ''} disabled={!isAdmin}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="사업에 대한 간단한 설명을 입력하세요" />
          </div>

          {isAdmin && (
            <div className="flex justify-end pt-2">
              <button onClick={handleSaveProject} className="btn-primary flex items-center gap-2">
                <Save size={15} /> 사업 정보 저장
              </button>
            </div>
          )}
        </div>
      )}

      {/* 연락처 정보 */}
      {activeTab === 'contact' && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Phone size={16} className="text-primary-500" /> 추진위원회 연락처 정보
          </h3>
          <p className="text-xs text-gray-500">홈페이지 및 공지사항에 표시되는 연락처 정보입니다.</p>

          <div>
            <label className="label flex items-center gap-1"><MapPin size={13} /> 사무실 주소</label>
            <input className="input" value={contact.officeAddress} disabled={!isAdmin}
              onChange={(e) => setContact({ ...contact, officeAddress: e.target.value })}
              placeholder="서울특별시 종로구 구기동 123-45 구기빌딩 2층" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label flex items-center gap-1"><Phone size={13} /> 전화번호</label>
              <input className="input" value={contact.phone} disabled={!isAdmin}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                placeholder="02-123-4567" />
            </div>
            <div>
              <label className="label flex items-center gap-1"><Phone size={13} /> 팩스</label>
              <input className="input" value={contact.fax} disabled={!isAdmin}
                onChange={(e) => setContact({ ...contact, fax: e.target.value })}
                placeholder="02-123-4568" />
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-1"><Mail size={13} /> 이메일</label>
            <input className="input" type="email" value={contact.email} disabled={!isAdmin}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              placeholder="guki@redevelopment.org" />
          </div>

          <div>
            <label className="label flex items-center gap-1"><Clock size={13} /> 운영 시간</label>
            <input className="input" value={contact.hours} disabled={!isAdmin}
              onChange={(e) => setContact({ ...contact, hours: e.target.value })}
              placeholder="평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00)" />
          </div>

          {/* 미리보기 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">홈페이지 표시 미리보기</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { icon: '📌', label: '주소',    value: contact.officeAddress },
                { icon: '📞', label: '전화',    value: contact.phone },
                { icon: '📧', label: '이메일',  value: contact.email },
                { icon: '🕐', label: '운영시간', value: contact.hours },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-gray-400 text-xs mb-0.5">{item.icon} {item.label}</p>
                  <p className="font-medium text-gray-800 text-xs leading-snug">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="flex justify-end pt-2">
              <button onClick={handleSaveContact} className="btn-primary flex items-center gap-2">
                <Save size={15} /> 연락처 저장
              </button>
            </div>
          )}
        </div>
      )}

      {/* 시스템 */}
      {activeTab === 'system' && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">시스템 정보</h3>

          <div className="divide-y divide-gray-100">
            {[
              { label: '시스템 버전', value: 'v1.0.0' },
              { label: '데이터 저장 방식', value: '브라우저 로컬 스토리지 (localStorage)' },
              { label: '로그인 계정', value: `${currentUser?.name} (${currentUser?.role === 'admin' ? '관리자' : '일반 사용자'})` },
              { label: '이메일', value: currentUser?.email || '-' },
              { label: '최종 업데이트', value: '2026년 4월 13일' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-3 text-sm">
                <span className="font-medium text-gray-600">{item.label}</span>
                <span className="text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-800 mb-1">데이터 저장 안내</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              현재 모든 데이터는 이 브라우저의 로컬 스토리지에 저장됩니다.
              브라우저 캐시를 삭제하거나 다른 브라우저에서 접속하면 데이터가 초기화될 수 있습니다.
              중요한 데이터는 정기적으로 내보내기(CSV) 기능을 활용해 백업하세요.
            </p>
          </div>

          {isAdmin && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">데이터 관리</p>
              <button
                onClick={() => {
                  if (confirm('모든 데이터를 초기값으로 재설정하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
                    localStorage.removeItem('redevelopment-app-storage')
                    localStorage.removeItem(CONTACT_KEY)
                    toast.success('데이터가 초기화되었습니다. 페이지를 새로고침합니다.')
                    setTimeout(() => window.location.reload(), 1000)
                  }
                }}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw size={14} /> 데이터 초기화 (개발·테스트용)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
