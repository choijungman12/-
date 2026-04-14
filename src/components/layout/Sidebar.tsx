import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, MapPin, Users, FileCheck, Calculator,
  TrendingUp, BookOpen, Bell, FolderOpen, Calendar,
  MessageSquare, Settings, ChevronRight, Building2
} from 'lucide-react'
import { useAppStore } from '../../store'
import clsx from 'clsx'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: '대시보드', exact: true },
  { to: '/admin/project', icon: Building2, label: '사업 개요' },
  { divider: true, label: '추진 관리' },
  { to: '/admin/owners', icon: MapPin, label: '토지등소유자 관리' },
  { to: '/admin/consent', icon: FileCheck, label: '동의서 관리' },
  { to: '/admin/committee', icon: Users, label: '추진위원회' },
  { to: '/admin/schedule', icon: Calendar, label: '일정 관리' },
  { divider: true, label: '분석 도구' },
  { to: '/admin/appraisal', icon: Calculator, label: '감정평가 계산기' },
  { to: '/admin/feasibility', icon: TrendingUp, label: '사업성 분석' },
  { divider: true, label: '정보·소통' },
  { to: '/admin/legal', icon: BookOpen, label: '법령·판례 DB' },
  { to: '/admin/notice', icon: Bell, label: '공지사항' },
  { to: '/admin/resources', icon: FolderOpen, label: '자료실' },
  { to: '/admin/qna', icon: MessageSquare, label: '문의·Q&A' },
  { divider: true, label: '시스템' },
  { to: '/admin/settings', icon: Settings, label: '설정' },
]

export default function Sidebar() {
  const { sidebarOpen } = useAppStore()

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-30 flex flex-col',
        sidebarOpen ? 'w-60' : 'w-16'
      )}
    >
      {/* 로고 영역 */}
      <div className="h-[61px] flex items-center px-4 border-b border-gray-700 flex-shrink-0">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 size={18} className="text-white" />
        </div>
        {sidebarOpen && (
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">도시정비시스템</p>
            <p className="text-xs text-gray-400 truncate">구기동 재개발</p>
          </div>
        )}
      </div>

      {/* 내비게이션 */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navItems.map((item, idx) => {
          if ('divider' in item && item.divider) {
            return sidebarOpen ? (
              <div key={idx} className="mt-4 mb-1 px-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {item.label}
                </p>
              </div>
            ) : (
              <div key={idx} className="my-2 mx-2 border-t border-gray-700" />
            )
          }

          if (!('to' in item)) return null
          const Icon = item.icon!

          return (
            <NavLink
              key={item.to}
              to={item.to!}
              end={item.exact}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-colors group relative',
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className="flex-shrink-0" />
                  {sidebarOpen ? (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  ) : (
                    /* 툴팁 */
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {item.label}
                    </div>
                  )}
                  {sidebarOpen && isActive && (
                    <ChevronRight size={14} className="ml-auto" />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* 하단 정보 */}
      {sidebarOpen && (
        <div className="p-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">v1.0.0 · 2025 구기재개발</p>
        </div>
      )}
    </aside>
  )
}
