import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  CheckCircle, Shield, FileText, User, Smartphone,
  Download, ChevronRight, ArrowLeft, Lock, Clock,
  AlertCircle, Copy, Building2,
} from 'lucide-react'
import { openConsentPDF, type ConsentRecord } from '../utils/consentPDF'

type Step = 'document' | 'form' | 'auth' | 'complete'
type AuthMethod = 'kakao' | 'pass' | null
type Carrier = 'skt' | 'kt' | 'lgu' | null
type AuthStage = 'select' | 'confirm' | 'processing' | 'done'

interface OwnerForm {
  name: string
  birthdate: string
  phone: string
  propertyAddress: string
  propertyType: string
  propertyArea: string
}

const STEPS = ['동의서 확인', '소유자 정보', '본인인증', '제출 완료']

function formatPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
}

function maskPhone(phone: string) {
  const d = phone.replace(/\D/g, '')
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 5)}**-**${d.slice(9)}`
  return phone
}

function generateCertId() {
  const now = new Date()
  const ymd = now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 8)
  const hms = now.toISOString().replace(/[-:T.Z]/g, '').slice(8, 14)
  const r = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `GK${ymd}-${hms}-${r}`
}

// ── Kakao Auth Modal ────────────────────────────────────────────────────────
function KakaoAuthModal({
  phone, name, countdown, onConfirm, onCancel,
}: { phone: string; name: string; countdown: number; onConfirm: () => void; onCancel: () => void }) {
  const mm = String(Math.floor(countdown / 60)).padStart(2, '0')
  const ss = String(countdown % 60).padStart(2, '0')
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Kakao header */}
      <div className="bg-[#FEE500] px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#3C1E1E] rounded-full flex items-center justify-center">
              <span className="text-[#FEE500] font-black text-sm">K</span>
            </div>
            <span className="text-[#3C1E1E] font-black text-xl tracking-tight">kakao</span>
          </div>
          <span className="text-xs bg-[#3C1E1E]/10 text-[#3C1E1E] px-3 py-1 rounded-full font-semibold">인증서 서명</span>
        </div>
        <h2 className="text-[#3C1E1E] font-bold text-lg leading-snug">
          카카오 인증서로<br />전자서명 요청
        </h2>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
          {[
            ['요청 기관', '구기재개발추진위원회'],
            ['서명 문서', '정비계획 입안 동의서'],
            ['수 신 자', `${name}  ${phone}`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center">
              <span className="text-gray-400 text-xs w-20 flex-shrink-0">{k}</span>
              <span className="font-semibold text-gray-800 text-right">{v}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 py-3 bg-amber-50 rounded-xl">
          <Clock size={15} className="text-amber-500" />
          <span className="text-sm text-amber-700">유효 시간 <strong className="font-mono">{mm}:{ss}</strong></span>
        </div>

        <p className="text-xs text-center text-gray-400 leading-relaxed">
          카카오톡 앱의 알림에서 확인하거나<br />아래 버튼으로 바로 서명할 수 있습니다.
        </p>
      </div>

      <div className="px-6 pb-6 space-y-2.5">
        <button onClick={onConfirm}
          className="w-full py-4 bg-[#FEE500] hover:bg-[#f5dc00] active:bg-[#e6d000] text-[#3C1E1E] font-bold rounded-2xl transition-colors text-base shadow-md shadow-yellow-100">
          카카오로 서명하기
        </button>
        <button onClick={onCancel}
          className="w-full py-2.5 text-gray-400 hover:text-gray-600 text-sm transition-colors">
          취소
        </button>
      </div>
    </div>
  )
}

// ── PASS Auth Modal ─────────────────────────────────────────────────────────
const carrierMeta: Record<string, { label: string; color: string }> = {
  skt: { label: 'SKT',   color: '#E5002B' },
  kt:  { label: 'KT',    color: '#E5002B' },
  lgu: { label: 'LG U+', color: '#E5002B' },
}

function PassAuthModal({
  phone, name, carrier, countdown, onConfirm, onCancel,
}: { phone: string; name: string; carrier: Carrier; countdown: number; onConfirm: () => void; onCancel: () => void }) {
  const mm = String(Math.floor(countdown / 60)).padStart(2, '0')
  const ss = String(countdown % 60).padStart(2, '0')
  const c = carrierMeta[carrier ?? 'skt']
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* PASS header */}
      <div className="bg-gradient-to-br from-[#1A3ADB] to-[#0F2199] px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow">
              <span className="text-[#1A3ADB] font-black text-xs tracking-widest">PASS</span>
            </div>
            <span className="text-white/70 text-sm font-medium">by {c.label}</span>
          </div>
          <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-semibold">인증서 서명</span>
        </div>
        <h2 className="text-white font-bold text-lg leading-snug">
          PASS 인증서로<br />전자서명 요청
        </h2>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
          {[
            ['요청 기관', '구기재개발추진위원회'],
            ['서명 문서', '정비계획 입안 동의서'],
            ['수 신 자', `${name}  ${phone}`],
            ['통  신  사', c.label],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center">
              <span className="text-gray-400 text-xs w-20 flex-shrink-0">{k}</span>
              <span className="font-semibold text-gray-800 text-right">{v}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 py-3 bg-blue-50 rounded-xl">
          <Clock size={15} className="text-blue-500" />
          <span className="text-sm text-blue-700">유효 시간 <strong className="font-mono">{mm}:{ss}</strong></span>
        </div>

        <p className="text-xs text-center text-gray-400 leading-relaxed">
          PASS 앱의 알림에서 확인하거나<br />아래 버튼으로 바로 서명할 수 있습니다.
        </p>
      </div>

      <div className="px-6 pb-6 space-y-2.5">
        <button onClick={onConfirm}
          className="w-full py-4 bg-gradient-to-r from-[#1A3ADB] to-[#0F2199] hover:from-[#1530c0] hover:to-[#0a1a85] text-white font-bold rounded-2xl transition-all text-base shadow-lg shadow-blue-200">
          PASS로 서명하기
        </button>
        <button onClick={onCancel}
          className="w-full py-2.5 text-gray-400 hover:text-gray-600 text-sm transition-colors">
          취소
        </button>
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function ApplyConsent() {
  const [step, setStep] = useState<Step>('document')
  const [docRead, setDocRead] = useState(false)
  const [docAgreed, setDocAgreed] = useState(false)
  const [form, setForm] = useState<OwnerForm>({
    name: '', birthdate: '', phone: '',
    propertyAddress: '', propertyType: '', propertyArea: '',
  })
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null)
  const [carrier, setCarrier] = useState<Carrier>(null)
  const [authStage, setAuthStage] = useState<AuthStage>('select')
  const [countdown, setCountdown] = useState(180)
  const [certId, setCertId] = useState('')
  const [signedAt, setSignedAt] = useState('')
  const docRef = useRef<HTMLDivElement>(null)

  const stepIndex = ['document', 'form', 'auth', 'complete'].indexOf(step)

  // Countdown when confirm modal is open
  useEffect(() => {
    if (authStage !== 'confirm') return
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t)
          toast.error('인증 시간이 초과되었습니다. 다시 시도해주세요.')
          setAuthStage('select')
          return 180
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [authStage])

  function handleDocScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) {
      setDocRead(true)
    }
  }

  function handleStartAuth() {
    if (!authMethod) { toast.error('인증 방법을 선택해주세요.'); return }
    if (authMethod === 'pass' && !carrier) { toast.error('통신사를 선택해주세요.'); return }
    setAuthStage('confirm')
    setCountdown(180)
  }

  function handleConfirmAuth() {
    setAuthStage('processing')
    setTimeout(() => {
      const id = generateCertId()
      const now = new Date().toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
      setCertId(id)
      setSignedAt(now)
      setAuthStage('done')
      toast.success('본인인증이 완료되었습니다.')
    }, 2500)
  }

  function buildRecord(): ConsentRecord {
    return {
      certId, name: form.name, phone: form.phone,
      birthdate: form.birthdate, propertyAddress: form.propertyAddress,
      propertyType: form.propertyType, propertyArea: form.propertyArea,
      authMethod, carrier: carrier ?? null,
      signedAt,
      signature: form.name,
      document: '정비계획 입안 동의서',
      project: '종로구 구기동 재개발정비사업',
    }
  }

  function handleFinalSubmit() {
    const record = buildRecord()
    const prev = JSON.parse(localStorage.getItem('guki-consent-records') || '[]')
    localStorage.setItem('guki-consent-records', JSON.stringify([...prev, record]))
    setStep('complete')
    toast.success('동의서가 제출되었습니다. 관리자 페이지에 자동 저장됩니다.')
  }

  function handleDownloadPDF() {
    openConsentPDF(buildRecord())
    toast.success('동의서 PDF 창이 열렸습니다. 인쇄 → PDF로 저장하세요.')
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── 헤더 ── */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">정비계획 입안 동의서</h1>
            <p className="text-xs text-gray-400">전자문서 · 법적 효력 인정</p>
          </div>
          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <Shield size={13} />
            <span className="text-xs font-semibold">보안 인증</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 pb-16 space-y-5">
        {/* ── 진행 단계 ── */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                    ${i < stepIndex ? 'bg-green-500 text-white' : i === stepIndex ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-400'}`}>
                    {i < stepIndex ? <CheckCircle size={16} /> : i + 1}
                  </div>
                  <span className={`text-xs mt-1.5 font-medium text-center leading-tight
                    ${i === stepIndex ? 'text-blue-600' : i < stepIndex ? 'text-green-600' : 'text-gray-400'}`}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-shrink-0 w-4 mx-0.5 rounded-full transition-colors duration-300
                    ${i < stepIndex ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────────
            STEP 1: 동의서 내용 확인
        ──────────────────────────────────────────────────────────────── */}
        {step === 'document' && (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-0.5 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" /> 정비계획 입안 동의서
              </h2>
              <p className="text-xs text-gray-400 mb-5">
                「도시 및 주거환경정비법」 제13조제1항에 의한 토지등소유자 동의서
              </p>

              {/* Scrollable document */}
              <div
                ref={docRef}
                onScroll={handleDocScroll}
                className="border border-gray-200 rounded-xl h-96 overflow-y-auto p-5 text-sm text-gray-700 leading-relaxed space-y-4 bg-gray-50"
              >
                <div className="text-center border-b border-gray-300 pb-4">
                  <h3 className="text-xl font-bold text-gray-900 tracking-wide mb-1">정비계획 입안 동의서</h3>
                  <p className="text-xs text-gray-400">도시 및 주거환경정비법 제13조제1항 · 동법 시행령 제8조</p>
                </div>

                <p className="font-semibold text-gray-800 text-base">제1조 (사업 개요)</p>
                <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                  <tbody>
                    {[
                      ['사업 명칭', '종로구 구기동 재개발정비사업'],
                      ['정비사업 종류', '주택정비형 재개발사업'],
                      ['위 치', '서울특별시 종로구 구기동 138-1 일원'],
                      ['면 적', '약 88,165.5m² (약 2.67ha, 27,000평)'],
                      ['필 지 수', '179필지'],
                      ['관 할 기 관', '서울특별시 종로구청 도시계획과'],
                    ].map(([k, v]) => (
                      <tr key={k} className="border-b border-gray-100 last:border-0">
                        <td className="bg-gray-100 px-3 py-2 font-semibold text-gray-600 w-28 border-r border-gray-200">{k}</td>
                        <td className="px-3 py-2 text-gray-800">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className="font-semibold text-gray-800 text-base mt-4">제2조 (동의 내용)</p>
                <p>
                  본인은 위 정비사업 구역 내의 토지 또는 건물을 소유한 자로서,
                  「도시 및 주거환경정비법」 제13조제1항에 따라 정비계획 입안 제안을 위하여
                  아래 각 호에 동의합니다.
                </p>
                <ol className="space-y-3 pl-4">
                  {[
                    '서울특별시 종로구 구기동 138-1 일원을 주택정비형 재개발사업 정비구역으로 지정하기 위한 정비계획 입안을 종로구청장에게 제안하는 것에 동의합니다.',
                    '정비계획 입안 제안에 필요한 현황조사, 측량, 정비구역 지정 및 정비계획 수립 관련 용역 수행에 동의합니다.',
                    '본 동의서 제출 후 추진위원회 구성 및 조합 설립 이전까지 추진위원회가 사업을 대표하여 진행하는 것에 동의합니다.',
                    '사업 추진 과정에서 불가피하게 발생하는 소송 또는 행정절차에서 추진위원회가 동의자를 대리하는 것에 동의합니다.',
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2.5 text-sm">
                      <span className="text-blue-500 font-semibold flex-shrink-0">({i + 1})</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>

                <p className="font-semibold text-gray-800 text-base mt-4">제3조 (개인정보 수집·이용 동의)</p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs space-y-2">
                  {[
                    ['수집 항목', '성명, 생년월일, 연락처, 현 거주지, 소유 부동산 소재지·면적·취득일, 전자서명 인증 기록'],
                    ['수집 목적', '정비계획 입안 동의자 확인, 정비구역 지정 신청 서류 작성, 추진위원회 동의자 명부 관리'],
                    ['보유 기간', '정비구역 지정 고시일로부터 5년 (목적 달성 후 즉시 파기)'],
                    ['제공 기관', '서울특별시 종로구청, 서울특별시청, 한국부동산원, 정비계획 수립 용역업체'],
                  ].map(([k, v]) => (
                    <p key={k}><span className="font-semibold text-blue-700">{k}:</span> <span className="text-blue-900">{v}</span></p>
                  ))}
                  <p className="text-blue-600 font-medium pt-1">※ 개인정보 수집·이용을 거부할 권리가 있으며, 거부 시 동의서 제출이 제한될 수 있습니다.</p>
                </div>

                <p className="font-semibold text-gray-800 text-base mt-4">제4조 (전자서명의 법적 효력)</p>
                <p>
                  본 동의서는 「전자서명법」 제3조 및 「전자문서 및 전자거래 기본법」 제4조에 따라
                  공인 전자서명(카카오 인증서 또는 이동통신사 PASS 인증서)을 통해 서명된 전자문서로서,
                  「도시 및 주거환경정비법 시행령」 제8조 제4항에 따른 서면 동의서와 동일한 법적 효력을 가집니다.
                </p>

                <p className="font-semibold text-gray-800 text-base mt-4">제5조 (동의 철회)</p>
                <p>
                  동의 후 철회를 원하는 경우, 추진위원회 사무소에 서면 철회 신청서를 제출함으로써 철회할 수 있습니다.
                  단, 종로구청에 정비계획 입안 제안서가 제출된 이후에는 관련 법령에 따라 철회의 효력이 제한될 수 있습니다.
                </p>

                <p className="font-semibold text-gray-800 text-base mt-4">제6조 (동의서 보관)</p>
                <p>
                  제출된 전자 동의서 및 전자서명 기록은 보안이 적용된 서버에 암호화하여 보관되며,
                  보유 기간 만료 후 「개인정보보호법」에 따라 즉시 파기됩니다.
                </p>

                <div className="text-center pt-6 pb-2 mt-4 border-t-2 border-dashed border-gray-200">
                  <p className="text-sm font-medium text-gray-700">
                    본인은 위 모든 내용을 충분히 읽고 이해하였으며, 이에 동의하여 정비계획 입안 동의서를 제출합니다.
                  </p>
                  <div className="mt-4 text-gray-500 text-xs space-y-1">
                    <p>종로구 구기재개발추진위원회 귀중</p>
                    <p>서울특별시 종로구청장 귀중</p>
                  </div>
                </div>
              </div>

              {!docRead && (
                <p className="text-xs text-amber-600 mt-3 flex items-center gap-1.5">
                  <AlertCircle size={13} />
                  동의서 전문을 끝까지 스크롤하여 확인하세요.
                </p>
              )}

              <label className={`flex items-start gap-3 mt-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${docRead ? 'border-blue-300 bg-blue-50 hover:bg-blue-100' : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'}`}>
                <input type="checkbox" checked={docAgreed} disabled={!docRead}
                  onChange={(e) => setDocAgreed(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 leading-snug">
                  동의서 내용을 모두 읽었으며, 정비계획 입안에{' '}
                  <strong className="text-blue-600">동의합니다.</strong>
                  <br />
                  <span className="text-xs text-gray-400 font-normal">개인정보 수집·이용 및 제3자 제공에 동의합니다.</span>
                </span>
              </label>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                동의서는 본인이 직접 제출해야 합니다. 대리 제출 시 별도의 위임장(공증 포함)이 필요합니다.
                허위·대리 동의서 제출 시 「도시 및 주거환경정비법」 제136조에 따라 처벌받을 수 있습니다.
              </p>
            </div>

            <button
              onClick={() => { if (!docAgreed) { toast.error('동의서를 확인 후 체크해주세요.'); return } setStep('form') }}
              disabled={!docAgreed}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base shadow-lg shadow-blue-200"
            >
              다음: 소유자 정보 입력 <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* ────────────────────────────────────────────────────────────────
            STEP 2: 소유자 정보 입력
        ──────────────────────────────────────────────────────────────── */}
        {step === 'form' && (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-0.5 flex items-center gap-2">
                <User size={20} className="text-blue-600" /> 소유자 정보 입력
              </h2>
              <p className="text-xs text-gray-400 mb-6">동의서에 기재될 정보를 정확히 입력해주세요. 허위 입력 시 법적 책임이 있습니다.</p>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">성명 <span className="text-red-500">*</span></label>
                    <input
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
                      placeholder="홍길동"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">생년월일 <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
                      value={form.birthdate}
                      onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    휴대폰 번호 <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-400 font-normal ml-1">(본인인증에 사용)</span>
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
                    placeholder="010-0000-0000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                    maxLength={13}
                  />
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Building2 size={15} className="text-blue-500" /> 소유 부동산 정보
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">소재지 (구기동 내 소유 부동산) <span className="text-red-500">*</span></label>
                      <input
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
                        placeholder="서울특별시 종로구 구기동 OOO-O"
                        value={form.propertyAddress}
                        onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">소유 구분 <span className="text-red-500">*</span></label>
                        <select
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
                          value={form.propertyType}
                          onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                        >
                          <option value="">선택하세요</option>
                          <option value="토지">토지</option>
                          <option value="건물">건물 (무허가 포함)</option>
                          <option value="토지+건물">토지 및 건물</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">면적 (m²)</label>
                        <input
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
                          placeholder="예: 132.5"
                          value={form.propertyArea}
                          onChange={(e) => setForm({ ...form, propertyArea: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('document')}
                className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-colors">
                이전
              </button>
              <button
                onClick={() => {
                  if (!form.name || !form.birthdate || !form.phone || !form.propertyAddress || !form.propertyType) {
                    toast.error('필수 항목(*)을 모두 입력해주세요.')
                    return
                  }
                  setStep('auth')
                  setAuthStage('select')
                }}
                className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                다음: 본인인증 <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* ────────────────────────────────────────────────────────────────
            STEP 3: 본인인증
        ──────────────────────────────────────────────────────────────── */}
        {step === 'auth' && (
          <>
            {/* 인증 방법 선택 */}
            {authStage === 'select' && (
              <>
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-0.5 flex items-center gap-2">
                    <Lock size={20} className="text-blue-600" /> 본인인증 방법 선택
                  </h2>
                  <p className="text-xs text-gray-400 mb-6">
                    「전자서명법」에 따라 공인된 전자서명 수단으로 본인을 확인합니다.
                  </p>

                  <div className="space-y-3">
                    {/* Kakao */}
                    <button
                      onClick={() => { setAuthMethod('kakao'); setCarrier(null) }}
                      className={`w-full p-5 rounded-2xl border-2 flex items-center gap-4 transition-all
                        ${authMethod === 'kakao' ? 'border-yellow-400 bg-yellow-50 shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-gray-50'}`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-[#FEE500] flex items-center justify-center flex-shrink-0 shadow">
                        <span className="text-2xl font-black text-[#3C1E1E]">K</span>
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-gray-900 text-base">카카오 인증서</p>
                        <p className="text-xs text-gray-500 mt-0.5">카카오톡 앱으로 간편하게 전자서명</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <CheckCircle size={11} className="text-green-500" />
                          <span className="text-xs text-green-600 font-medium">공인 전자서명 · 법적 효력 인정</span>
                        </div>
                      </div>
                      {authMethod === 'kakao' && <CheckCircle size={22} className="text-yellow-500 flex-shrink-0" />}
                    </button>

                    {/* PASS */}
                    <button
                      onClick={() => setAuthMethod('pass')}
                      className={`w-full p-5 rounded-2xl border-2 flex items-center gap-4 transition-all
                        ${authMethod === 'pass' ? 'border-blue-400 bg-blue-50 shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-gray-50'}`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A3ADB] to-[#0F2199] flex items-center justify-center flex-shrink-0 shadow">
                        <span className="text-sm font-black text-white tracking-widest">PASS</span>
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-gray-900 text-base">PASS 인증서</p>
                        <p className="text-xs text-gray-500 mt-0.5">SKT · KT · LG U+ PASS 앱으로 전자서명</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <CheckCircle size={11} className="text-green-500" />
                          <span className="text-xs text-green-600 font-medium">공인 전자서명 · 법적 효력 인정</span>
                        </div>
                      </div>
                      {authMethod === 'pass' && <CheckCircle size={22} className="text-blue-500 flex-shrink-0" />}
                    </button>
                  </div>

                  {/* 통신사 선택 */}
                  {authMethod === 'pass' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm font-semibold text-gray-700 mb-3">통신사 선택 <span className="text-red-500">*</span></p>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { id: 'skt', label: 'SKT', sub: 'T월드' },
                          { id: 'kt',  label: 'KT',  sub: 'olleh' },
                          { id: 'lgu', label: 'LG U+', sub: 'U+' },
                        ].map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setCarrier(c.id as Carrier)}
                            className={`py-3.5 rounded-xl border-2 transition-all
                              ${carrier === c.id
                                ? 'border-blue-500 bg-white text-blue-700 shadow-sm'
                                : 'border-blue-200 text-gray-600 hover:border-blue-300 bg-white/60'}`}
                          >
                            <p className="font-bold text-sm">{c.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 확인 정보 */}
                  <div className="mt-5 p-4 bg-gray-50 rounded-xl text-xs space-y-1.5">
                    <p className="font-semibold text-gray-600 mb-2 flex items-center gap-1">
                      <Shield size={11} /> 인증 진행 정보 확인
                    </p>
                    <p className="text-gray-500">성  명: <strong className="text-gray-800">{form.name}</strong></p>
                    <p className="text-gray-500">연락처: <strong className="text-gray-800">{maskPhone(form.phone)}</strong></p>
                    <p className="text-gray-400 mt-1">* 위 정보가 다를 경우 이전 단계에서 수정해주세요.</p>
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button onClick={() => setStep('form')}
                      className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-colors">
                      이전
                    </button>
                    <button
                      onClick={handleStartAuth}
                      disabled={!authMethod || (authMethod === 'pass' && !carrier)}
                      className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                    >
                      <Smartphone size={18} /> 인증 요청하기
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* 카카오 인증 모달 */}
            {authStage === 'confirm' && authMethod === 'kakao' && (
              <KakaoAuthModal
                phone={maskPhone(form.phone)}
                name={form.name}
                countdown={countdown}
                onConfirm={handleConfirmAuth}
                onCancel={() => { setAuthStage('select'); setCountdown(180) }}
              />
            )}

            {/* PASS 인증 모달 */}
            {authStage === 'confirm' && authMethod === 'pass' && (
              <PassAuthModal
                phone={maskPhone(form.phone)}
                name={form.name}
                carrier={carrier}
                countdown={countdown}
                onConfirm={handleConfirmAuth}
                onCancel={() => { setAuthStage('select'); setCountdown(180) }}
              />
            )}

            {/* 처리 중 */}
            {authStage === 'processing' && (
              <div className="bg-white rounded-2xl shadow-sm p-14 text-center">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-5 animate-pulse">
                  <Shield size={32} className="text-blue-600" />
                </div>
                <p className="text-xl font-bold text-gray-900 mb-2">전자서명 적용 중…</p>
                <p className="text-sm text-gray-400">동의서에 전자서명을 적용하고 있습니다. 잠시만 기다려주세요.</p>
              </div>
            )}

            {/* 인증 완료 - 최종 제출 전 미리보기 */}
            {authStage === 'done' && (
              <>
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center gap-4 mb-5 p-4 bg-green-50 rounded-xl">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-green-800 text-base">본인인증 완료</p>
                      <p className="text-xs text-green-600">
                        {authMethod === 'kakao' ? '카카오 인증서' : `PASS 인증서 (${carrier?.toUpperCase()})`}로 인증되었습니다.
                      </p>
                    </div>
                  </div>

                  {/* 서명 전 동의서 미리보기 */}
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm">제출될 동의서 내용 확인</h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                      <p className="font-bold text-center text-base">정비계획 입안 동의서</p>
                      <p className="text-xs text-gray-400 text-center">도시 및 주거환경정비법 제13조제1항</p>
                    </div>
                    <div className="p-4 space-y-2">
                      {[
                        ['동의 일시', new Date().toLocaleString('ko-KR')],
                        ['성      명', form.name],
                        ['생 년 월 일', form.birthdate],
                        ['연 락 처', maskPhone(form.phone)],
                        ['소유 부동산', form.propertyAddress],
                        ['소유 구분', form.propertyType],
                        ['면      적', form.propertyArea ? `${form.propertyArea}m²` : '미기재'],
                      ].map(([k, v]) => (
                        <div key={k} className="flex gap-2 text-xs">
                          <span className="text-gray-400 w-24 flex-shrink-0">{k}</span>
                          <span className="font-semibold text-gray-800">{v}</span>
                        </div>
                      ))}
                      <div className="pt-3 mt-1 border-t border-dashed border-gray-200 space-y-1">
                        <p className="text-xs text-gray-400">
                          인증 수단: <span className="font-medium text-gray-600">{authMethod === 'kakao' ? '카카오 인증서' : `PASS 인증서 (${carrier?.toUpperCase()})`}</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          인증 번호: <span className="font-mono text-gray-600">{certId}</span>
                        </p>
                      </div>
                      <div className="pt-3 mt-1 border-t border-dashed border-gray-200 text-center">
                        <p className="text-xs text-gray-600">위 내용에 동의하며 전자서명합니다.</p>
                        <div className="mt-3 mx-auto max-w-xs border-2 border-blue-300 bg-blue-50/50 rounded-xl py-3 px-4">
                          <p className="text-[10px] text-blue-500 font-medium mb-1">서 명 란 (본인인증으로 자동 등록)</p>
                          <p className="text-2xl font-black text-gray-900 tracking-widest" style={{ fontFamily: '"Nanum Pen Script", cursive, serif' }}>
                            {form.name}
                          </p>
                        </div>
                        <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-green-100 rounded-full text-xs text-green-700 font-medium">
                          <CheckCircle size={11} /> 전자서명 완료
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleFinalSubmit}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-base shadow-lg shadow-blue-200"
                >
                  동의서 최종 제출 <ChevronRight size={18} />
                </button>
              </>
            )}
          </>
        )}

        {/* ────────────────────────────────────────────────────────────────
            STEP 4: 제출 완료
        ──────────────────────────────────────────────────────────────── */}
        {step === 'complete' && (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                <CheckCircle size={44} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">동의서 제출 완료!</h2>
              <p className="text-gray-500 text-sm mb-1">정비계획 입안 동의서가 정상적으로 접수되었습니다.</p>
              <p className="text-xs text-gray-400 mb-7">
                본 동의서는 「전자서명법」에 따라 법적 효력이 있는 전자문서로 보관됩니다.
              </p>

              {/* 접수증 */}
              <div className="bg-gray-50 rounded-2xl p-5 text-left text-sm space-y-3 border border-gray-100 mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-3">접 수 확 인 증</p>
                {[
                  ['제출자', form.name],
                  ['제출 일시', signedAt],
                  ['인증 수단', authMethod === 'kakao' ? '카카오 인증서' : `PASS 인증서 (${carrier?.toUpperCase()})`],
                  ['문서 종류', '정비계획 입안 동의서'],
                  ['접수 번호', certId],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-start gap-3">
                    <span className="text-gray-400 text-xs flex-shrink-0">{k}</span>
                    <span className="font-semibold text-gray-800 text-right text-xs break-all">{v}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(certId).then(() => toast.success('접수번호가 복사되었습니다.'))
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-semibold transition-colors text-sm"
                >
                  <Copy size={15} /> 접수번호 복사
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-semibold transition-colors text-sm"
                >
                  <Download size={15} /> PDF 저장
                </button>
                <Link to="/"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold transition-colors text-sm">
                  메인 페이지로
                </Link>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <h3 className="font-bold text-blue-800 text-sm mb-3 flex items-center gap-2">
                <Shield size={15} /> 안내 사항
              </h3>
              <ul className="text-xs text-blue-700 space-y-2 leading-relaxed">
                <li>• 제출된 동의서는 추진위원회에서 소유자 정보를 확인한 후 최종 처리됩니다.</li>
                <li>• 동의 철회를 원하시면 추진위원회 사무소에 <strong>서면 철회 신청서</strong>를 제출하세요.</li>
                <li>• 접수번호를 보관하시면 추후 접수 여부 확인에 활용할 수 있습니다.</li>
                <li>• 문의: <strong>010-5787-6695</strong> (평일 09:00 ~ 18:00)</li>
              </ul>
            </div>
          </>
        )}
      </main>

      <footer className="bg-gray-900 text-white py-6 mt-4">
        <div className="max-w-3xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2026 종로구 구기재개발추진위원회. All rights reserved.</p>
          <p className="text-xs mt-1 text-gray-500">본 전자문서는 「전자서명법」 및 「전자문서 및 전자거래 기본법」에 따라 법적 효력이 있습니다.</p>
        </div>
      </footer>
    </div>
  )
}
