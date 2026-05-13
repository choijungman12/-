// 단일 필지 통합조회 리포트 PDF 생성
// printable HTML → 사용자가 브라우저 인쇄 → PDF 저장 (jsPDF 없이 동작)

import type { Parcel } from '../data/gukiParcels'
import {
  appraise, gradeAge, AGE_GRADE_META,
  gradeRoad, ROAD_GRADE_META,
  isRedevelopable,
  formatKRW, formatPyeong,
} from './appraisal'

export function buildParcelReportHTML(p: Parcel): string {
  const a = appraise(p)
  const age = gradeAge(p)
  const road = gradeRoad(p)
  const redev = isRedevelopable(p)
  const today = new Date().toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })

  const row = (k: string, v: string | number) =>
    `<tr><th>${k}</th><td>${v}</td></tr>`

  const priceHistory = p.landRegistry.noticedPriceHistory.map((h, i, arr) => {
    const prev = arr[i - 1]
    const change = prev ? ((h.pricePerM2 - prev.pricePerM2) / prev.pricePerM2 * 100) : null
    const ch = change !== null ? `<span style="color:${change > 0 ? '#dc2626' : '#2563eb'};font-size:11px"> (${change > 0 ? '+' : ''}${change.toFixed(1)}%)</span>` : ''
    return `<tr><td>${h.year}년</td><td style="font-family:monospace">${h.pricePerM2.toLocaleString('ko-KR')}원${ch}</td></tr>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<title>지적도 통합조회 리포트 · ${p.jibun}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: 'Malgun Gothic', 'Noto Sans KR', sans-serif;
    color: #111; line-height: 1.55; margin: 0; padding: 18px;
    background: #fff;
  }
  .wrap { max-width: 820px; margin: 0 auto; }
  .title { text-align: center; border-bottom: 3px double #111; padding-bottom: 14px; margin-bottom: 18px; }
  .title h1 { font-size: 22px; font-weight: 900; letter-spacing: 4px; margin: 0 0 4px; }
  .title p { font-size: 11px; color: #666; margin: 0; }
  .meta { font-size: 11px; color: #888; text-align: right; margin-bottom: 6px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
  h2.section { font-size: 13px; font-weight: 700; margin: 18px 0 6px; padding: 6px 10px; background: #1e3a8a; color: #fff; border-radius: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 0 0 6px; font-size: 12px; }
  table th, table td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
  table th { background: #f1f5f9; width: 28%; font-weight: 600; color: #475569; }
  .grade-row { display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8fafc; border-radius: 4px; margin: 4px 0; }
  .dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
  .alert-red { background: #fef2f2; border: 1px solid #fecaca; padding: 8px 10px; border-radius: 4px; margin: 4px 0; }
  .alert-yellow { background: #fefce8; border: 1px solid #fef08a; padding: 8px 10px; border-radius: 4px; margin: 4px 0; }
  .alert-green { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 8px 10px; border-radius: 4px; margin: 4px 0; }
  .alert-blue { background: #eff6ff; border: 1px solid #bfdbfe; padding: 8px 10px; border-radius: 4px; margin: 4px 0; }
  ul { margin: 4px 0; padding-left: 22px; font-size: 12px; }
  .total-box { background: #1d4ed8; color: #fff; padding: 14px 18px; border-radius: 6px; margin: 10px 0; display: flex; justify-content: space-between; align-items: center; }
  .total-box .lbl { font-size: 13px; font-weight: 600; }
  .total-box .val { font-size: 24px; font-weight: 900; }
  .footer { margin-top: 24px; font-size: 10px; color: #666; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; }
  .cert-id { font-family: 'Courier New', monospace; font-size: 10px; color: #555; }
  @media print {
    body { padding: 0; }
    .noprint { display: none; }
  }
  .noprint { text-align: center; margin-bottom: 14px; }
  .noprint button { padding: 10px 22px; font-size: 14px; background: #1d4ed8; color: #fff; border: 0; border-radius: 8px; cursor: pointer; font-weight: 700; }
</style>
</head>
<body>
<div class="wrap">
  <div class="noprint">
    <button onclick="window.print()">📄 PDF로 저장 / 인쇄하기</button>
  </div>
  <div class="meta">발급일시: ${today} · 발급번호 <span class="cert-id">GKR-${p.id}-${Date.now().toString().slice(-6)}</span></div>
  <div class="title">
    <h1>지적도 통합조회 리포트</h1>
    <p>토지대장 + 건축물대장 + 토지이용계획 + 감정평가</p>
  </div>

  <h2 class="section">기본 정보</h2>
  <table>
    ${row('지번', `<strong style="font-size:14px">${p.fullJibun}</strong>`)}
    ${row('도로명주소', p.roadAddr)}
    ${row('필지 유형', `${p.bldgType} · ${p.shape}`)}
    ${row('대지면적', `${p.areaM2}㎡ (${formatPyeong(p.areaM2)})`)}
  </table>

  <h2 class="section">① 토지대장</h2>
  <table>
    ${row('소유자', `${p.landRegistry.owner} (${p.landRegistry.ownerType})`)}
    ${row('소유자 주소', p.landRegistry.ownerAddr)}
    ${row('소유구분', `${p.landRegistry.shareType}${p.landRegistry.shareRatio ? ' (지분 ' + p.landRegistry.shareRatio + ')' : ''}`)}
    ${row('지목', p.landRegistry.jimok)}
    ${row('취득일·사유', `${p.landRegistry.acquireDate} (${p.landRegistry.acquireReason})`)}
    ${row('등기번호', p.landRegistry.registrationNumber)}
    ${row('도로조건', p.roadAccess)}
    ${row('형상', p.shape)}
  </table>
  <p style="font-size:11px;color:#666;margin:8px 0 4px"><strong>개별공시지가 5년 추이</strong></p>
  <table>${priceHistory}</table>

  <h2 class="section">② 건축물대장</h2>
  ${p.buildingRegistry ? `
  <table>
    ${row('주용도', p.buildingRegistry.mainUse)}
    ${row('세부용도', p.buildingRegistry.detailUse)}
    ${row('구조', p.structure)}
    ${row('층수', `지상 ${p.buildingRegistry.totalFloors}층 · 지하 ${p.buildingRegistry.basement}층`)}
    ${row('연면적', `${p.bldgAreaM2}㎡`)}
    ${row('건폐율', `${p.buildingRegistry.bcr}%`)}
    ${row('용적률', `${p.buildingRegistry.far}%`)}
    ${row('세대·호수', `${p.buildingRegistry.households}세대 · ${p.buildingRegistry.rooms}호`)}
    ${row('주차', `${p.buildingRegistry.parkingSpaces}대 (법정 ${p.buildingRegistry.parkingRequired}대)`)}
    ${row('승강기', p.buildingRegistry.hasElevator ? '있음' : '없음')}
    ${row('에너지등급', p.buildingRegistry.energyGrade)}
    ${row('사용승인일', `${p.buildingRegistry.approvalDate} (${p.buildingRegistry.approvalNumber})`)}
  </table>
  ${p.buildingRegistry.illegalExpansion
    ? `<div class="alert-red"><strong style="color:#b91c1c">⚠️ 위반 건축물:</strong> ${p.buildingRegistry.illegalNote ?? '위반사항 있음'}</div>`
    : `<div class="alert-green"><strong style="color:#15803d">✓ 위반사항 없음</strong></div>`}
  <div class="grade-row">
    <span class="dot" style="background:${AGE_GRADE_META[age].color}"></span>
    <strong>건물 노후도:</strong> ${AGE_GRADE_META[age].label} —
    ${AGE_GRADE_META[age].description} (경과 ${a.buildingAge}년)
  </div>
  ` : `<div class="alert-yellow"><strong>등재된 건축물 없음 (나대지)</strong></div>`}

  <h2 class="section">③ 토지이용계획</h2>
  <table>
    ${row('용도지역 (주요)', `<strong>${p.landUsePlan.primaryZone}</strong>`)}
    ${p.landUsePlan.secondaryZones.length ? row('용도지구', p.landUsePlan.secondaryZones.join(', ')) : ''}
    ${p.landUsePlan.districts.length ? row('용도구역', p.landUsePlan.districts.join(', ')) : ''}
    ${p.landUsePlan.altitudeRestriction ? row('고도지구', `최고높이 ${p.landUsePlan.altitudeRestriction}m 이하`) : ''}
    ${row('지정된 정비계획', p.landUsePlan.designatedPlan)}
  </table>
  ${p.landUsePlan.planningRestrictions.length ? `
    <div class="alert-red">
      <strong style="color:#b91c1c">⚠️ 도시계획 저촉 사항</strong>
      <ul>${p.landUsePlan.planningRestrictions.map(r => `<li>${r}</li>`).join('')}</ul>
    </div>` : ''}
  ${p.landUsePlan.buildPermitRestrictions.length ? `
    <div class="alert-yellow">
      <strong style="color:#a16207">건축 허가 제한</strong>
      <ul>${p.landUsePlan.buildPermitRestrictions.map(r => `<li>${r}</li>`).join('')}</ul>
    </div>` : ''}
  <div class="grade-row">
    <span class="dot" style="background:${ROAD_GRADE_META[road].color}"></span>
    <strong>접도율 등급:</strong> ${ROAD_GRADE_META[road].label}
  </div>
  <div class="${redev.yes ? 'alert-red' : 'alert-blue'}">
    <strong style="color:${redev.yes ? '#b91c1c' : '#1e40af'}">
      ${redev.yes ? '✓ 재개발 적격 필지' : '○ 재개발 기준 미달'} (도정법 시행령 제8조)
    </strong>
    <p style="margin:4px 0 0;font-size:11px;color:#475569">${redev.reason}</p>
  </div>

  <h2 class="section">④ 감정평가 산출</h2>
  <table>
    ${row('토지가액 (공시지가기준법)', `<strong>${formatKRW(a.landValue)}</strong>`)}
    ${row('  └ 적용 보정계수', `${a.landAdjustments.final.toFixed(2)} = 도로 ${a.landAdjustments.road} × 형상 ${a.landAdjustments.shape} × 용도 ${a.landAdjustments.zoning}`)}
    ${row('건물가액 (원가법)', `<strong>${formatKRW(a.buildingValue)}</strong>`)}
    ${row('  └ 감가상각률', `${(a.depreciation * 100).toFixed(1)}%`)}
  </table>
  <div class="total-box">
    <span class="lbl">종합 감정평가액</span>
    <span class="val">${formatKRW(a.totalValue)}</span>
  </div>

  <h2 class="section">⑤ 분담금 시뮬레이션 (전용 84㎡ 신축)</h2>
  <table>
    ${row('새 아파트 분양가', formatKRW(a.shareSimulation.newApartmentPrice))}
    ${row('본인 평가액', formatKRW(a.totalValue))}
    ${row('예상 분담금',
      `<strong style="color:${a.shareSimulation.yourShare > 0 ? '#db2777' : '#059669'}">
        ${a.shareSimulation.yourShare > 0
          ? '+' + formatKRW(a.shareSimulation.yourShare) + ' (추가 부담)'
          : formatKRW(-a.shareSimulation.yourShare) + ' (환급)'}
       </strong>`)}
    ${row('무상지분율', `${(a.shareSimulation.freeShareRatio * 100).toFixed(1)}%`)}
  </table>

  <div class="footer">
    <p><strong>⚖️ 법적 근거</strong></p>
    <p>「감정평가에 관한 규칙」 제14조 (공시지가기준법) · 제15조 (원가법)</p>
    <p>「도시 및 주거환경정비법」 제13조·제74조 / 「도정법 시행령」 제8조</p>
    <p style="margin-top:8px">본 리포트는 시뮬레이션 산출치이며, 실제 사업 단계에서는 지정 감정평가법인이 산출한 평가액이 효력을 갖습니다.</p>
    <p style="margin-top:8px;font-size:9px;color:#94a3b8">© 2026 종로구 구기재개발추진위원회 · 지적도 통합조회 시스템</p>
  </div>
</div>
</body>
</html>`
}

export function openParcelReport(p: Parcel) {
  const html = buildParcelReportHTML(p)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (!win) {
    const a = document.createElement('a')
    a.href = url
    a.download = `지적도조회_${p.jibun}_${p.id}.html`
    a.click()
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
