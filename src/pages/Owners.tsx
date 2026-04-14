import { useState } from 'react'
import { useAppStore } from '../store'
import { Search, Plus, Filter, Download, Upload, Edit2, Trash2, Check, X, Clock, ChevronDown } from 'lucide-react'
import type { Owner, ConsentStatus } from '../types'
import toast from 'react-hot-toast'

const consentLabels: Record<ConsentStatus, { label: string; cls: string }> = {
  agreed:    { label: '동의', cls: 'badge-green' },
  opposed:   { label: '반대', cls: 'badge-red' },
  pending:   { label: '미결정', cls: 'badge-yellow' },
  withdrawn: { label: '철회', cls: 'badge-gray' },
}

const ownerTypeLabels = {
  land:     '토지',
  building: '건물',
  both:     '토지+건물',
}

export default function Owners() {
  const { owners, addOwner, updateOwner, deleteOwner, updateConsentStatus } = useAppStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ConsentStatus | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Owner>>({
    ownerType: 'both', consentStatus: 'pending', landArea: 0, buildingArea: 0,
  })

  const filtered = owners.filter((o) => {
    const matchSearch = o.name.includes(search) || o.address.includes(search)
    const matchFilter = filter === 'all' || o.consentStatus === filter
    return matchSearch && matchFilter
  })

  const counts = {
    all: owners.length,
    agreed: owners.filter((o) => o.consentStatus === 'agreed').length,
    opposed: owners.filter((o) => o.consentStatus === 'opposed').length,
    pending: owners.filter((o) => o.consentStatus === 'pending').length,
    withdrawn: owners.filter((o) => o.consentStatus === 'withdrawn').length,
  }
  const consentRate = owners.length ? (counts.agreed / owners.length * 100).toFixed(1) : '0.0'

  function handleSave() {
    if (!form.name || !form.address || !form.phone) {
      toast.error('이름, 주소, 연락처는 필수입니다.')
      return
    }
    const now = new Date().toISOString().slice(0, 10)
    if (editingId) {
      updateOwner(editingId, { ...form, updatedAt: now })
      toast.success('소유자 정보가 수정되었습니다.')
    } else {
      const newOwner: Owner = {
        id: `o${Date.now()}`,
        name: form.name!,
        residentId: form.residentId || '',
        phone: form.phone!,
        address: form.address!,
        ownerType: form.ownerType || 'both',
        landArea: form.landArea || 0,
        buildingArea: form.buildingArea || 0,
        consentStatus: form.consentStatus || 'pending',
        publicLandPrice: form.publicLandPrice || 0,
        buildingAge: form.buildingAge || 0,
        notes: form.notes,
        createdAt: now,
        updatedAt: now,
      }
      addOwner(newOwner)
      toast.success('소유자가 등록되었습니다.')
    }
    setShowForm(false)
    setEditingId(null)
    setForm({ ownerType: 'both', consentStatus: 'pending', landArea: 0, buildingArea: 0 })
  }

  function handleEdit(o: Owner) {
    setForm(o)
    setEditingId(o.id)
    setShowForm(true)
  }

  function handleDelete(id: string) {
    if (confirm('이 소유자를 삭제하시겠습니까?')) {
      deleteOwner(id)
      toast.success('삭제되었습니다.')
    }
  }

  function handleConsentChange(id: string, status: ConsentStatus) {
    const date = new Date().toISOString().slice(0, 10)
    updateConsentStatus(id, status, status === 'agreed' ? date : undefined)
    toast.success('동의 상태가 변경되었습니다.')
  }

  function exportCSV() {
    const headers = ['이름', '주소', '연락처', '소유유형', '토지면적(m²)', '건물면적(m²)', '공시지가(원/m²)', '건축년도', '동의상태', '동의일자']
    const rows = owners.map((o) => [
      o.name, o.address, o.phone,
      ownerTypeLabels[o.ownerType],
      o.landArea, o.buildingArea,
      o.publicLandPrice, o.buildingAge,
      consentLabels[o.consentStatus].label,
      o.consentDate || '',
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `소유자명부_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    toast.success('CSV 파일이 다운로드되었습니다.')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">토지등소유자 관리</h2>
          <p className="section-subtitle">총 {owners.length}명 | 동의율 {consentRate}%</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-1.5 text-sm">
            <Download size={15} /> 내보내기
          </button>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ ownerType: 'both', consentStatus: 'pending' }) }}
            className="btn-primary flex items-center gap-1.5 text-sm"
          >
            <Plus size={15} /> 소유자 등록
          </button>
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'agreed', 'pending', 'opposed', 'withdrawn'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${filter === s
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            {s === 'all' ? '전체' : consentLabels[s].label} ({counts[s]})
          </button>
        ))}
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9 bg-white"
          placeholder="이름 또는 주소로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 테이블 */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="table-header">이름</th>
                <th className="table-header">주소</th>
                <th className="table-header">소유유형</th>
                <th className="table-header text-right">토지(m²)</th>
                <th className="table-header text-right">건물(m²)</th>
                <th className="table-header text-right">공시지가</th>
                <th className="table-header">건축년도</th>
                <th className="table-header">동의상태</th>
                <th className="table-header">동의일</th>
                <th className="table-header">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell font-medium">{o.name}</td>
                  <td className="table-cell text-gray-500 max-w-[160px] truncate">{o.address}</td>
                  <td className="table-cell">
                    <span className="badge-blue">{ownerTypeLabels[o.ownerType]}</span>
                  </td>
                  <td className="table-cell text-right">{o.landArea.toLocaleString()}</td>
                  <td className="table-cell text-right">{o.buildingArea.toLocaleString()}</td>
                  <td className="table-cell text-right text-xs">
                    {o.publicLandPrice ? `${(o.publicLandPrice / 10000).toFixed(0)}만` : '-'}
                  </td>
                  <td className="table-cell">{o.buildingAge || '-'}</td>
                  <td className="table-cell">
                    <div className="relative group">
                      <button className={`${consentLabels[o.consentStatus].cls} cursor-pointer flex items-center gap-1`}>
                        {consentLabels[o.consentStatus].label}
                        <ChevronDown size={10} />
                      </button>
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden group-hover:block min-w-[80px]">
                        {(['agreed', 'pending', 'opposed', 'withdrawn'] as ConsentStatus[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => handleConsentChange(o.id, s)}
                            className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50"
                          >
                            {consentLabels[s].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-xs text-gray-500">{o.consentDate || '-'}</td>
                  <td className="table-cell">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(o)}
                        className="p-1.5 rounded hover:bg-primary-50 text-primary-500"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(o.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Search size={32} className="mx-auto mb-2 opacity-30" />
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 소유자 등록/수정 모달 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold">{editingId ? '소유자 정보 수정' : '소유자 신규 등록'}</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="label">이름 *</label>
                <input className="input" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="홍길동" />
              </div>
              <div>
                <label className="label">연락처 *</label>
                <input className="input" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="010-0000-0000" />
              </div>
              <div className="col-span-2">
                <label className="label">주소 *</label>
                <input className="input" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="구기동 138-X" />
              </div>
              <div>
                <label className="label">주민등록번호 앞 6자리</label>
                <input className="input" value={form.residentId || ''} onChange={(e) => setForm({ ...form, residentId: e.target.value })} placeholder="000000" maxLength={6} />
              </div>
              <div>
                <label className="label">소유 유형</label>
                <select className="input" value={form.ownerType} onChange={(e) => setForm({ ...form, ownerType: e.target.value as Owner['ownerType'] })}>
                  <option value="both">토지+건물</option>
                  <option value="land">토지만</option>
                  <option value="building">건물만</option>
                </select>
              </div>
              <div>
                <label className="label">토지 면적 (m²)</label>
                <input className="input" type="number" value={form.landArea || ''} onChange={(e) => setForm({ ...form, landArea: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="label">건물 연면적 (m²)</label>
                <input className="input" type="number" value={form.buildingArea || ''} onChange={(e) => setForm({ ...form, buildingArea: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="label">공시지가 (원/m²)</label>
                <input className="input" type="number" value={form.publicLandPrice || ''} onChange={(e) => setForm({ ...form, publicLandPrice: parseFloat(e.target.value) || 0 })} placeholder="2800000" />
              </div>
              <div>
                <label className="label">건축년도</label>
                <input className="input" type="number" value={form.buildingAge || ''} onChange={(e) => setForm({ ...form, buildingAge: parseInt(e.target.value) || 0 })} placeholder="1990" />
              </div>
              <div>
                <label className="label">동의 상태</label>
                <select className="input" value={form.consentStatus} onChange={(e) => setForm({ ...form, consentStatus: e.target.value as ConsentStatus })}>
                  <option value="pending">미결정</option>
                  <option value="agreed">동의</option>
                  <option value="opposed">반대</option>
                  <option value="withdrawn">철회</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">메모</label>
                <textarea className="input" rows={2} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="특이사항 입력" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => { setShowForm(false); setEditingId(null) }} className="btn-secondary">취소</button>
              <button onClick={handleSave} className="btn-primary">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
