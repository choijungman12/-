import { Menu, Bell, User, LogOut, ChevronDown, Home } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../../store'

export default function Header() {
  const { currentUser, logout, toggleSidebar, project } = useAppStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const stageLabel: Record<string, string> = {
    planning: '정비계획 수립',
    committee: '추진위원회 승인',
    association: '조합 설립',
    implementation: '사업시행계획 인가',
    management: '관리처분계획 인가',
    construction: '착공 및 준공',
    completion: '이전고시 및 청산',
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900 leading-tight">
            도시정비 사업 관리 시스템
          </h1>
          <p className="text-xs text-gray-500">{project.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* 홈페이지 링크 */}
        <Link to="/" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 text-sm">
          <Home size={15} /> 홈페이지
        </Link>

        {/* 현재 단계 뱃지 */}
        <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          현재 단계: {stageLabel[project.currentStage]}
        </span>

        {/* 알림 */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* 사용자 메뉴 */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
              {currentUser?.name[0] || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
              <p className="text-xs text-gray-500">
                {currentUser?.role === 'admin' ? '관리자' :
                 currentUser?.role === 'committee' ? '추진위원' : '소유자'}
              </p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
              <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <User size={16} />
                내 정보
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
