import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// 공개 페이지 (주민용)
import PublicHome from './pages/PublicHome'
import Apply from './pages/Apply'
import ApplyConsent from './pages/ApplyConsent'
import ProjectInfo from './pages/ProjectInfo'
import MyShare from './pages/MyShare'

// 관리자 레이아웃 + 페이지
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import ProjectOverview from './pages/ProjectOverview'
import Owners from './pages/Owners'
import Consent from './pages/Consent'
import Committee from './pages/Committee'
import Schedule from './pages/Schedule'
import Appraisal from './pages/Appraisal'
import Feasibility from './pages/Feasibility'
import Legal from './pages/Legal'
import NoticePage from './pages/Notice'
import Resources from './pages/Resources'
import QnAPage from './pages/QnA'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* ── 공개 페이지 (주민용) ── */}
        <Route path="/" element={<PublicHome />} />
        <Route path="/apply" element={<Apply />} />
        {/* 동의서 전자제출 (카카오/PASS 인증) */}
        <Route path="/apply-consent" element={<ApplyConsent />} />
        {/* 사업 안내 (입지·수지·분양자격·감정평가·이익극대화) */}
        <Route path="/project-info" element={<ProjectInfo />} />
        {/* 내 분담금 시뮬레이터 (지도 + 평형 선택 + 자동 산출) */}
        <Route path="/my-share" element={<MyShare />} />

        {/* ── 관리자 대시보드 ── */}
        <Route path="/admin" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="project" element={<ProjectOverview />} />
          <Route path="owners" element={<Owners />} />
          <Route path="consent" element={<Consent />} />
          <Route path="committee" element={<Committee />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="appraisal" element={<Appraisal />} />
          <Route path="feasibility" element={<Feasibility />} />
          <Route path="legal" element={<Legal />} />
          <Route path="notice" element={<NoticePage />} />
          <Route path="resources" element={<Resources />} />
          <Route path="qna" element={<QnAPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 404 → 홈으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
