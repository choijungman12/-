import { useState } from 'react'
import { useAppStore } from '../store'
import { Plus, Edit2, Trash2, Calendar, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react'
import type { Schedule, ProjectStage } from '../types'
import toast from 'react-hot-toast'

const stageLabels: Record<ProjectStage, string> = {
  planning:       '정비계획 수립',
  committee:      '추진위원회 승인',
  association:    '조합 설립',
  implementation: '사업시행계획 인가',
  management:     '관리처분계획 인가',
  construction:   '착공 및 준공',
  completion:     '이전고시 및 청산',
}

const statusConfig = {
  completed:   { label: '완료', cls: 'badge-green', icon: CheckCircle, color: 'text-green-500' },
  in_progress: { label: '진행중', cls: 'badge-blue', icon: Clock, color: 'text-blue-500' },
  planned:     { label: '예정', cls: 'badge-gray', icon: Calendar, color: 'text-gray-400' },
  delayed:     { label: '지연', cls: 'badge-red', icon: AlertTriangle, color: 'text-red-500' },
}

export default function Schedule() {
  const { schedules, addSchedule, updateSchedule, deleteSchedule } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline')
  const [form, setForm] = useState<Partial<Schedule>>({
    stage: 'planning', status: 'planned',
  })

  function handleSave() {
    if (!form.title || !form.startDate) {
      toast.error('일정 제목과 시작일을 입력해주세요.')
      return
    }
    if (editingId) {
      updateSchedule(editingId, form)
      toast.success('일정이 수정되었습니다.')
    } else {
      addSchedule({
        id: `s${Date.now()}`,
        title: form.title!,
        description: form.description,
        startDate: form.startDate!,
        endDate: form.endDate,
        stage: form.stage || 'planning',
        status: form.status || 'planned',
        responsibleParty: form.responsibleParty,
      })
      toast.success('일정이 등록되었습니다.')
    }
    setShowForm(false)
    setEditingId(null)
    setForm({ stage: 'planning', status: 'planned' })
  }

  // 단계별 일정 그룹화
  const stageGroups = Object.keys(stageLabels).map((stage) => ({
    stage: stage as ProjectStage,
    label: stageLabels[stage as ProjectStage],
    items: schedules.filter((s) => s.stage === stage),
  })).filter((g) => g.items.length > 0)

  const stats = {
    total: schedules.length,
    completed: schedules.filter((s) => s.status === 'completed').length,
    in_progress: schedules.filter((s) => s.status === 'in_progress').length,
    delayed: schedules.filter((s) => s.status === 'delayed').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">일정 관리</h2>
          <p className="section-subtitle">총 {stats.total}건 · 완료 {stats.completed}건 · 진행중 {stats.in_progress}건</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['timeline', 'table'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors
                  ${viewMode === mode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {mode === 'timeline' ? '타임라인' : '목록'}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ stage: 'planning', status: 'planned' }) }}
            className="btn-primary flex items-center gap-1.5 text-sm"
          >
            <Plus size={15} /> 일정 추가
          </button>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '전체', value: stats.total, color: 'text-gray-900' },
          { label: '완료', value: stats.completed, color: 'text-green-600' },
          { label: '진행중', value: stats.in_progress, color: 'text-blue-600' },
          { label: '지연', value: stats.delayed, color: 'text-red-600' },
        ].map((item) => (
          <div key={item.label} className="card text-center p-3">
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {viewMode === 'timeline' ? (
        <div className="space-y-6">
          {stageGroups.map((group) => (
            <div key={group.stage} className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-500" />
                {group.label}
              </h3>
              <div className="space-y-3">
                {group.items.map((item) => {
                  const status = statusConfig[item.status]
                  const Icon = status.icon
                  return (
                    <div key={item.id} className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 group">
                      <Icon size={18} className={`${status.color} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <span className={status.cls}>{status.label}</span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-500">{item.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span>{item.startDate} ~ {item.endDate || '미정'}</span>
                          {item.responsibleParty && <span>담당: {item.responsibleParty}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setForm(item); setEditingId(item.id); setShowForm(true) }}
                          className="p-1 rounded hover:bg-white text-gray-500"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => { deleteSchedule(item.id); toast.success('일정이 삭제되었습니다.') }}
                          className="p-1 rounded hover:bg-red-50 text-red-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="table-header">일정명</th>
                  <th className="table-header">단계</th>
                  <th className="table-header">시작일</th>
                  <th className="table-header">종료일</th>
                  <th className="table-header">담당</th>
                  <th className="table-header">상태</th>
                  <th className="table-header">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {schedules.map((item) => {
                  const status = statusConfig[item.status]
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">
                        <div>
                          <p>{item.title}</p>
                          {item.description && <p className="text-xs text-gray-400">{item.description}</p>}
                        </div>
                      </td>
                      <td className="table-cell text-sm text-gray-500">{stageLabels[item.stage]}</td>
                      <td className="table-cell text-sm">{item.startDate}</td>
                      <td className="table-cell text-sm text-gray-500">{item.endDate || '-'}</td>
                      <td className="table-cell text-sm text-gray-500">{item.responsibleParty || '-'}</td>
                      <td className="table-cell">
                        <span className={status.cls}>{status.label}</span>
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-1">
                          <button onClick={() => { setForm(item); setEditingId(item.id); setShowForm(true) }}
                            className="p-1.5 rounded hover:bg-primary-50 text-primary-500"><Edit2 size={13} /></button>
                          <button onClick={() => { deleteSchedule(item.id); toast.success('삭제되었습니다.') }}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 일정 등록/수정 모달 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold">{editingId ? '일정 수정' : '일정 추가'}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">일정명 *</label>
                <input className="input" value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="label">설명</label>
                <input className="input" value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">시작일 *</label>
                  <input className="input" type="date" value={form.startDate || ''}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="label">종료일</label>
                  <input className="input" type="date" value={form.endDate || ''}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">사업 단계</label>
                  <select className="input" value={form.stage}
                    onChange={(e) => setForm({ ...form, stage: e.target.value as ProjectStage })}>
                    {Object.entries(stageLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">상태</label>
                  <select className="input" value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Schedule['status'] })}>
                    {Object.entries(statusConfig).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">담당</label>
                <input className="input" value={form.responsibleParty || ''}
                  onChange={(e) => setForm({ ...form, responsibleParty: e.target.value })} placeholder="추진위원회" />
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
