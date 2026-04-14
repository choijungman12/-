import { useState } from 'react'
import { useAppStore } from '../store'
import { FolderOpen, Download, Trash2, Plus, Search, FileText, FileCog, FileCheck, BookOpen, BarChart2, Presentation } from 'lucide-react'
import type { Document, DocumentType } from '../types'
import toast from 'react-hot-toast'

const typeConfig: Record<DocumentType, { label: string; icon: React.ReactNode; cls: string }> = {
  consent_form: { label: '동의서', icon: <FileCheck size={16} />, cls: 'badge-green' },
  legal:        { label: '법령', icon: <BookOpen size={16} />, cls: 'badge-blue' },
  plan:         { label: '계획서', icon: <FileCog size={16} />, cls: 'badge-purple' },
  minutes:      { label: '회의록', icon: <FileText size={16} />, cls: 'badge-gray' },
  appraisal:    { label: '감정평가', icon: <BarChart2 size={16} />, cls: 'badge-yellow' },
  other:        { label: '기타', icon: <FileText size={16} />, cls: 'badge-gray' },
}

// Add badge-purple to CSS via inline style
const purpleBadge = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800'

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${bytes} B`
}

export default function Resources() {
  const { documents, addDocument, deleteDocument, currentUser } = useAppStore()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<Document>>({
    type: 'other', isPublic: true,
  })

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'committee'

  const filtered = documents.filter((d) => {
    const matchType = typeFilter === 'all' || d.type === typeFilter
    const matchSearch = !search || d.title.includes(search) || (d.description || '').includes(search)
    return matchType && matchSearch
  })

  // 유형별 그룹화
  const grouped = Object.keys(typeConfig).reduce((acc, type) => {
    const items = filtered.filter((d) => d.type === type)
    if (items.length > 0) acc[type as DocumentType] = items
    return acc
  }, {} as Record<DocumentType, Document[]>)

  function handleSave() {
    if (!form.title || !form.fileName) {
      toast.error('문서명과 파일명을 입력해주세요.')
      return
    }
    addDocument({
      id: `doc${Date.now()}`,
      title: form.title!,
      type: form.type || 'other',
      fileName: form.fileName!,
      fileSize: form.fileSize || 0,
      uploadedBy: currentUser?.name || '관리자',
      uploadedAt: new Date().toISOString().slice(0, 10),
      description: form.description,
      tags: form.tags,
      isPublic: form.isPublic !== false,
    })
    toast.success('문서가 등록되었습니다.')
    setShowForm(false)
    setForm({ type: 'other', isPublic: true })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">자료실</h2>
          <p className="section-subtitle">총 {documents.length}개 문서</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1.5 text-sm">
            <Plus size={15} /> 문서 등록
          </button>
        )}
      </div>

      {/* 필터 */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9 bg-white w-60" placeholder="문서 검색..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setTypeFilter('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${typeFilter === 'all' ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            전체 ({documents.length})
          </button>
          {(Object.keys(typeConfig) as DocumentType[]).map((t) => {
            const count = documents.filter((d) => d.type === t).length
            if (count === 0) return null
            return (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${typeFilter === t ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {typeConfig[t].label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* 그룹별 목록 */}
      {Object.entries(grouped).map(([type, docs]) => {
        const config = typeConfig[type as DocumentType]
        return (
          <div key={type} className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-gray-500">{config.icon}</span>
              {config.label}
              <span className="text-xs text-gray-400 font-normal">({docs.length}건)</span>
            </h3>
            <div className="space-y-2">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 group">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                    ${type === 'consent_form' ? 'bg-green-100 text-green-600' :
                      type === 'legal' ? 'bg-blue-100 text-blue-600' :
                      type === 'plan' ? 'bg-purple-100 text-purple-600' :
                      type === 'minutes' ? 'bg-gray-100 text-gray-600' :
                      type === 'appraisal' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-500 truncate">{doc.fileName}</p>
                      <span className="text-xs text-gray-400">·</span>
                      <p className="text-xs text-gray-400">{formatFileSize(doc.fileSize)}</p>
                      <span className="text-xs text-gray-400">·</span>
                      <p className="text-xs text-gray-400">{doc.uploadedAt}</p>
                    </div>
                    {doc.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{doc.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {!doc.isPublic && <span className="badge-yellow text-xs">비공개</span>}
                    {doc.tags?.map((tag) => (
                      <span key={tag} className="badge-gray text-xs">{tag}</span>
                    ))}
                    <button
                      onClick={() => toast.success(`${doc.fileName} 다운로드 (실제 환경에서 파일 제공)`)}
                      className="flex items-center gap-1 text-primary-600 text-sm hover:underline opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    >
                      <Download size={14} /> 다운로드
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => { deleteDocument(doc.id); toast.success('삭제됨') }}
                        className="p-1 rounded hover:bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div className="card text-center py-16 text-gray-400">
          <FolderOpen size={40} className="mx-auto mb-3 opacity-20" />
          <p>검색된 문서가 없습니다.</p>
        </div>
      )}

      {/* 문서 등록 모달 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold">문서 등록</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">문서명 *</label>
                <input className="input" value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="label">유형</label>
                <select className="input" value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as DocumentType })}>
                  {Object.entries(typeConfig).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">파일명 *</label>
                <input className="input" value={form.fileName || ''}
                  onChange={(e) => setForm({ ...form, fileName: e.target.value })} placeholder="파일명.pdf" />
              </div>
              <div>
                <label className="label">설명</label>
                <textarea className="input" rows={2} value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPublic !== false}
                  onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
                <span className="text-sm">공개 문서</span>
              </label>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="btn-secondary">취소</button>
              <button onClick={handleSave} className="btn-primary">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
