# Prompt Market — 프로젝트 계획

> **마지막 업데이트:** 2026-07-01
> **상태:** P0~P2 완료, 문서 동기화 완료
> **상세 체크리스트:** `docs/TODO.md` · **제품 명세:** `docs/PRD.md`

---

## 현재 상태 요약

Prompt Market은 **프로토타입(P0)에서 실서비스 스택(P1~P2)으로 마이그레이션이 완료**된 상태이다.

| 영역 | 현재 구현 |
|------|-----------|
| 프레임워크 | Next.js 15 App Router, `app/[locale]/` |
| 인증 | Clerk (Sign In / Sign Up, 한국어 UI) |
| 데이터베이스 | Supabase — `prompts`, `profiles`, `carts`, `purchases` |
| 스토리지 | Supabase Storage — `avatars`, `prompts` |
| 결제 | 토스페이먼츠 위젯 SDK + 서버 승인 (`/api/payment/confirm`) |
| 상품 | Supabase 32개 시드 (`pnpm seed:prompts`) |
| i18n | next-intl — ko(기본) / en |
| 관리자 | `/admin` — `ADMIN_CLERK_USER_ID` 접근 제어 |
| 배포 | Vercel (`coredxi-prompt-market`) |

---

## 완료된 단계

### Phase 0 — 프론트엔드 + Mock (완료)

- R01~R07 라우트, AppContext + localStorage, 가상 결제 데모
- 이후 P1에서 대부분 교체됨 (`AppContext` 삭제)

### Phase 1 — Supabase·Clerk·실결제 (완료)

- Supabase 프로젝트, 테이블·RLS, Clerk JWT 통합
- 상품·장바구니·구매·프로필 Supabase 마이그레이션
- 토스페이먼츠 `/checkout` 플로우
- next-intl, 다크 모드, SEO 메타데이터

### Phase 2 — 부가 기능·배포 (완료)

- 상품 32개 시드, `/prompts` 페이지네이션
- i18n 전체 정리, 에러 바운더리, a11y, Vercel 배포

---

## 문서 동기화 이력

| 일자 | 작업 |
|------|------|
| 2026-06 (초기) | PRD AS-IS/TO-BE 분리, PLAN.md 프로토타입 기준 작성 |
| 2026-07-01 | PRD·PLAN·README를 **현재 구현** 기준으로 전면 갱신 |

**변경 내용:**
- `docs/PRD.md` — 섹션 3을 "현재 구현", 섹션 4를 "레거시 AS-IS"로 재구성. 라우트 레지스트리에 `/checkout`, `/sign-in`, `/admin` 등 추가.
- `docs/PLAN.md` — 마이그레이션 완료 상태로 갱신 (본 문서).
- `README.md` — AI Studio 템플릿 → 프로젝트 설정 가이드로 교체.

---

## 향후 개선 후보 (TODO 미등록)

아래는 `docs/TODO.md` 범위 밖의 선택적 개선 사항이다.

| 항목 | 설명 |
|------|------|
| Admin i18n | `/admin` UI 영어 번역 (현재 ko-only 의도) |
| Dead code 정리 | `components/cart/PaymentModal.tsx` 삭제 |
| 상품 DB 다국어 | `lib/promptLocalization.ts` 기반 title/description EN 지원 확장 |
| PRD 원본 TO-BE | Supabase Auth 대신 Clerk 채택 — 문서에 반영 완료 |

---

## 리스크 & 대응 (현재)

| 리스크 | 대응 |
|--------|------|
| 비로그인 localStorage와 Supabase 데이터 불일치 | 로그인 시 Supabase 우선, 비로그인은 데모용 fallback으로 명시 |
| 클라이언트 가격 조작 | 결제 승인은 서버 Route Handler에서 처리 |
| Clerk ↔ Supabase JWT 만료 | `createAuthenticatedClient`에서 세션 토큰 갱신 |
| Admin UI 한국어 only | 의도적 범위 제외, PRD 3.2.10에 명시 |
