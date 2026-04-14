import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAppStore } from '../../store'
import clsx from 'clsx'
import { Toaster } from 'react-hot-toast'

export default function Layout() {
  const { sidebarOpen } = useAppStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className={clsx('transition-all duration-300', sidebarOpen ? 'ml-60' : 'ml-16')}>
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}
