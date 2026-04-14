# CLAUDE.md

This file is auto-loaded by Claude Code whenever a session is opened in this repository. It contains project conventions, deployment gotchas, and domain context learned across multiple sessions — keep it up to date so future work stays consistent.

---

## Project overview

**종로구 구기동 재개발정비사업 관리 웹사이트** — 도시정비법 기반 재개발 사업의 주민용 공개 페이지 + 추진위 관리자 대시보드를 한 Vite 앱으로 제공.

- Repo: `https://github.com/choijungman12/-.git` (repo name is a single dash `-` — unusual but valid)
- Deployed: `https://choijungman12.github.io/-/`
- 사업 대상지: 서울특별시 종로구 구기동 138-1 일원 · 약 88,165.5m² · 179필지
- 문의: 010-5787-6695
- 현재 사업 단계: 정비계획 입안 제안 (동의율 목표 50%, 도정법 제35조)

## Tech stack

- **Vite 5** + **React 18** + **TypeScript** (strict)
- **Tailwind CSS** (utility-first)
- **Zustand** + persist middleware → state lives in `localStorage`
- **React Router v6** — **HashRouter** (not BrowserRouter, see "Deploy" below)
- **ECharts** via `echarts-for-react` for all charts
- `react-hot-toast` for notifications
- **No** `jspdf`, `html2canvas`, Kakao JS SDK, or backend. Do **not** add these without explicit approval.

### tsconfig highlights
- `strict: true`
- `noUnusedLocals: false`, `noUnusedParameters: false` — unused imports don't block the build, but still clean up when editing nearby code.

## Directory layout

```
src/
  App.tsx                  # HashRouter + routes (public + /admin/*)
  pages/
    PublicHome.tsx         # 주민용 홈 (hero slides + CTAs)
    Apply.tsx              # 일반 참여 신청
    ApplyConsent.tsx       # 동의서 전자제출 (Kakao/PASS 인증 + 서명)
    ProjectInfo.tsx        # 사업 안내
    MyShare.tsx            # 분담금 시뮬레이터 (KakaoMap 사용)
    Dashboard.tsx          # /admin 홈 — 전자동의서 요약 카드 포함
    Consent.tsx            # /admin/consent — 전자동의서 접수 탭
    Owners.tsx, Committee.tsx, Schedule.tsx, Appraisal.tsx,
    Feasibility.tsx, Legal.tsx, Notice.tsx, Resources.tsx, QnA.tsx, Settings.tsx
  components/
    common/KakaoMap.tsx    # 이름은 Kakao이지만 내부는 Google Maps iframe (see below)
    layout/Layout.tsx      # /admin 레이아웃
  utils/
    calculations.ts        # formatKRW, calculateConsentRate
    consentPDF.ts          # printable HTML generator + localStorage helpers
  store/                   # Zustand store + persist
```

## Deployment — **MUST READ before touching CI**

The repo deploys to GitHub Pages at `https://choijungman12.github.io/-/`. Multiple past sessions burned time on these gotchas:

1. **Pages must be auto-enabled from the workflow.** `peaceiris/actions-gh-pages` pushes the `gh-pages` branch but does **not** turn Pages on, so the site stays 404. Use this exact workflow shape:
   ```yaml
   permissions:
     contents: read
     pages: write
     id-token: write
   jobs:
     build:
       steps:
         - actions/checkout@v4
         - actions/setup-node@v4 (node 20)
         - npm install && npm run build
         - cp dist/index.html dist/404.html
         - touch dist/.nojekyll
         - actions/configure-pages@v5  # with enablement: true
         - actions/upload-pages-artifact@v3  # path: ./dist
     deploy:
       needs: build
       environment: github-pages
       steps:
         - actions/deploy-pages@v4
   ```
2. **`vite.config.ts` must have `base: './'`** so assets resolve correctly at any subpath (`/-/`).
3. **React Router must be `HashRouter`.** `BrowserRouter` breaks direct URLs and refreshes at `/-/admin` — you'll see a 404 from Pages itself. The `404.html` copy is a belt-and-suspenders fallback for the rare case.
4. **Static asset paths use `./images/...`, not `/images/...`**, so they resolve relative to the subpath.
5. **Never reference env vars in `index.html`.** A past `<script src="...%VITE_KAKAO_JS_KEY%...">` shipped the literal placeholder to prod and broke the page. Kakao SDK script tag has been removed — keep it out.
6. **Verification isn't done until the live URL returns 200.** Always finish a deploy task with:
   ```
   curl -sS -o /dev/null -w "%{http_code}\n" -L https://choijungman12.github.io/-/
   ```
   The user treats "CI green" as insufficient proof.

## Known-good workarounds

- **KakaoMap → Google Maps iframe.** The file `src/components/common/KakaoMap.tsx` keeps its name (many call sites import it) but renders `<iframe src="https://maps.google.com/maps?q=...&output=embed">`. Kakao JS SDK needs an API key that wasn't available — this was the reliable fallback. Don't rename or restore the SDK without re-verifying the key story.
- **PDF generation without jsPDF.** `src/utils/consentPDF.ts` builds a self-contained printable HTML string, wraps it in a `Blob`, opens via `window.open`, and lets the user print-to-PDF from the browser. This sidesteps jsPDF's Korean font embedding problems and keeps the bundle smaller.
- **Hero images are inline SVG**, not JPG. `PublicHome.tsx`'s `slides[i].visual` is a React node, rendered via `SlideItem`. This gives infinite resolution and zero asset loading. If asked to "improve image quality" further, build more SVGs rather than swapping in raster files.

## Data model

All persistent data lives in `localStorage`:

- `guki-consent-records` — electronic consent submissions (array of `ConsentRecord`, see `src/utils/consentPDF.ts`). Written by `ApplyConsent.handleFinalSubmit`, read by admin `Consent.tsx` (전자동의서 tab) and `Dashboard.tsx` (summary card).
- Zustand persist keys — owners, committeeMembers, schedules, notices, project metadata. No backend; resetting localStorage resets the app.

Cert ID format: `GK{YYYYMMDD}-{HHMMSS}-{RANDOM6}` generated in `ApplyConsent.tsx:generateCertId`.

## Domain: Korean urban redevelopment law

The UI contains real legal references. Don't paraphrase them away:

- **도정법 제13조제1항** — 정비계획 입안 제안 (동의서의 근거)
- **도정법 시행령 제8조** — 동의 방법, 제8조 제4항은 전자 동의서의 서면 동의서 동일 효력 근거
- **도정법 제35조** — 추진위원회 구성 (과반수 동의 = 사이트의 50% 타깃의 근거)
- **도정법 제38조** — 조합 설립 인가 (3/4 + 토지면적 1/2)
- **전자서명법 제3조**, **전자문서법 제4조** — 전자 동의서 법적 효력

7 stages in `Dashboard.tsx`: 정비계획 수립 → 추진위원회 승인 → 조합 설립 → 사업시행 → 관리처분 → 착공/준공 → 이전고시/청산. Current project stage: the first one. Don't shuffle the order.

## Working-style conventions

- **User speaks Korean; respond in Korean.**
- The user reviews by looking at the live site, not terminal output. A task is "done" when the deployed URL reflects the change.
- The user doesn't read code directly — when reporting, focus on *what changed visually / behaviorally*, not the diff.
- Prefer **fewer dependencies** and **in-repo solutions** over clean-but-heavy libraries. The user has not asked for bundle optimization and treats the 1.58MB chunk warning as acceptable.
- The CSS minify warning `Expected identifier but found "-"` is non-blocking and currently untouched — don't burn time chasing it unless asked.
- When the user asks for improvement suggestions, structure responses from three angles: **기획자 / 개발자 / 디자이너**.

## Build & verify commands

```bash
npm install
npm run build   # tsc && vite build
npm run dev     # local preview
# After push:
curl -sS -o /dev/null -w "%{http_code}\n" -L https://choijungman12.github.io/-/
```

---

*This file documents lessons learned across multiple Claude Code sessions. If you (a future Claude) make a decision that contradicts anything here, update this file as part of the same commit so the next session doesn't re-learn the same lesson.*
