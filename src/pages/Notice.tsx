import { useState } from 'react'
import { useAppStore } from '../store'
import { Plus, Pin, Eye, Edit2, Trash2, Search, Bell } from 'lucide-react'
import type { Notice } from '../types'
import toast from 'react-hot-toast'

const catConfig = {
  general: { label: '일반', cls: 'badge-gray' },
  urgent:  { label: '긴급', cls: 'badge-red' },
  event:   { label: '행사', cls: 'badge-blue' },
}

export default function NoticePage() {
  const { notices, addNotice, updateNotice, deleteNotice, incrementViews, currentUser } = useAppStore()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<'all' | Notice['category']>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Notice>>({ category: 'general', isPinned: false })

  const filtered = notices.filter((n) => {
    const matchCat = catFilter === 'all' || n.category === catFilter
    const matchSearch = !search || n.title.includes(search) || n.content.includes(search)
    return matchCat && matchSearch
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return b.createdAt.localeCompare(a.createdAt)
  })

  const selectedNotice = notices.find((n) => n.id === selectedId)
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'committee'

  function handleSelect(id: string) {
    setSelectedId(id)
    incrementViews(id)
  }

  function handleSave() {
    if (!form.title || !form.content) {
      toast.error('제목과 내용을 입력해주세요.')
      return
    }
    if (editingId) {
      updateNotice(editingId, form)
      toast.success('공지사항이 수정되었습니다.')
    } else {
      addNotice({
        id: `n${Date.now()}`,
        title: form.title!,
        content: form.content!,
        category: form.category || 'general',
        authorId: currentUser?.id || 'admin',
        authorName: currentUser?.name || '관리자',
        createdAt: new Date().toISOString().slice(0, 10),
        views: 0,
        isPinned: form.isPinned || false,
      })
      toast.success('공지사항이 등록되었습니다.')
    }
    setShowForm(false)
    setEditingId(null)
    setForm({ category: 'general', isPinned: false })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">공지사항</h2>
          <p className="section-subtitle">총 {notices.length}건</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ category: 'general', isPinned: false }) }}
            className="btn-primary flex items-center gap-1.5 text-sm"
          >
            <Plus size={15} /> 공지 작성
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9 bg-white" placeholder="제목, 내용 검색..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['all', 'urgent', 'general', 'event'] as const).map((c) => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${catFilter === c ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {c === 'all' ? '전체' : catConfig[c].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 목록 */}
        <div className={selectedNotice ? 'lg:col-span-2' : 'lg:col-span-5'}>
          <div className="card p-0 overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="table-header">구분</th>
                  <th className="table-header">제목</th>
                  <th className="table-header text-right">조회</th>
                  <th className="table-header">날짜</th>
                  {isAdmin && <th className="table-header">관리</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((n) => (
                  <tr key={n.id}
                    onClick={() => handleSelect(n.id)}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors
                      ${selectedId === n.id ? 'bg-primary-50' : ''}
                      ${n.isPinned ? 'bg-yellow-50/50' : ''}`}>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        {n.isPinned && <Pin size={12} className="text-amber-500" />}
                        <span className={catConfig[n.category].cls}>{catConfig[n.category].label}</span>
                      </div>
                    </td>
                    <td className="table-cell max-w-[200px]">
                      <p className="truncate text-sm font-medium text-gray-900 hover:text-primary-600">{n.title}</p>
                    </td>
                    <td className="table-cell text-right text-xs text-gray-400">
                      <span className="flex items-center justify-end gap-1">
                        <Eye size={11} /> {n.views}
                      </span>
                    </td>
                    <td className="table-cell text-xs text-gray-500">{n.createdAt}</td>
                    {isAdmin && (
                      <td className="table-cell" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <button onClick={() => { setForm(n); setEditingId(n.id); setShowForm(true) }}
                            className="p-1 rounded hover:bg-primary-50 text-primary-500"><Edit2 size={12} /></button>
                          <button onClick={() => { deleteNotice(n.id); if (selectedId === n.id) setSelectedId(null); toast.success('삭제됨') }}
                            className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                <p>공지사항이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* 상세 보기 */}
        {selectedNotice && (
          <div className="lg:col-span-3 card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {selectedNotice.isPinned && <Pin size={14} className="text-amber-500" />}
                  <span className={catConfig[selectedNotice.category].cls}>{catConfig[selectedNotice.category].label}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{selectedNotice.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{selectedNotice.authorName}</span>
                  <span>{selectedNotice.createdAt}</span>
                  <span className="flex items-center gap-1"><Eye size={11} /> {selectedNotice.views}</span>
                </div>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="border-t border-gray-100 pt-4 prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                {selectedNotice.content}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* 작성/수정 모달 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold">{editingId ? '공지사항 수정' : '공지사항 작성'}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="label">구분</label>
                  <select className="input" value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Notice['category'] })}>
                    <option value="general">일반</option>
                    <option value="urgent">긴급</option>
                    <option value="event">행사</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input type="checkbox" checked={form.isPinned || false}
                      onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} />
                    <span className="text-sm">상단 고정</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="label">제목 *</label>
                <input className="input" value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="공지 제목을 입력하세요" />
              </div>
              <div>
                <label className="label">내용 *</label>
                <textarea className="input" rows={10} value={form.content || ''}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="공지 내용을 입력하세요..." />
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
