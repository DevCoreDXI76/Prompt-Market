# [PRD] 프롬프트 스토어 "Prompt Market"

> **문서 구조:** 본 PRD는 **표준 라우팅**을 기준으로 화면을 정의하고, **현재 구현**과 **레거시(프로토타입)** 를 분리하여 기술한다.
>
> **마지막 동기화:** 2026-07-01 — P0~P2 완료 기준 (`docs/TODO.md` 참조)

---

## 1. 서비스 개요

- **컨셉:** AI 프롬프트를 탐색·구매하고, 장바구니에 담아 결제하며, 프로필과 구매 내역을 관리할 수 있는 온라인 상점.
- **제품명:** Prompt Market
- **문서 범위:** 화면 명세, 라우팅, 데이터 모델, 핵심 로직 (현재 구현 / 레거시)

| 구분 | 요약 |
|------|------|
| **현재 구현** | Next.js 15 + Clerk 인증 + Supabase(DB·Storage) + 토스페이먼츠 실결제 + 관리자 CRUD + i18n(ko/en) + 다크 모드 |
| **레거시 (AS-IS)** | 클라이언트 프로토타입 — 정적 상품 4개, `localStorage` 상태, 가상 결제 데모 (섹션 4 참조) |

---

## 2. 표준 라우팅 (Standard Routing)

앱의 **공식 라우트 레지스트리**이다. 신규 화면 추가·리팩터링 시 본 표를 우선 갱신한다.

### 2.1. 로케일 접두사

- **기본 로케일 `ko`:** 접두사 없음 — `/`, `/prompts`, `/cart` …
- **영어 `en`:** `/en` 접두사 — `/en`, `/en/prompts`, `/en/cart` …
- **설정:** `i18n/routing.ts` (`localePrefix: "as-needed"`)

### 2.2. 라우트 레지스트리

| # | 경로 | 화면명 | 접근 | 상태 |
|---|------|--------|------|------|
| R01 | `/` | 메인 (랜딩 + 미리보기) | Public | 구현됨 |
| R02 | `/prompts` | 전체 프롬프트 마켓 | Public | 구현됨 (페이지네이션) |
| R03 | `/prompt/[id]` | 프롬프트 상세 | Public | 구현됨 |
| R04 | `/cart` | 장바구니 | Public (결제 시 로그인) | 구현됨 |
| R05 | `/sign-in` | 로그인 (Clerk) | Public | 구현됨 |
| R05b | `/sign-up` | 회원가입 (Clerk) | Public | 구현됨 |
| R05c | `/login` | 로그인 (레거시) | Public | `/sign-in` 리다이렉트 |
| R06 | `/profile` | 프로필 관리 | Auth | 구현됨 |
| R07 | `/my-page` | 구매 내역 | Auth | 구현됨 |
| R08 | `/checkout` | 결제 (토스페이먼츠) | Auth | 구현됨 |
| R08a | `/checkout/success` | 결제 성공 | Auth | 구현됨 |
| R08b | `/checkout/fail` | 결제 실패 | Auth | 구현됨 |
| R09 | `/admin` | 관리자 상품 관리 | Admin | 구현됨 |

- **Public:** 비로그인 접근 가능.
- **Auth:** Clerk 로그인 필요. 미들웨어(`middleware.ts`)에서 `/profile`, `/my-page` 보호.
- **Admin:** `ADMIN_CLERK_USER_ID` 환경 변수와 일치하는 Clerk 사용자만 접근.
- **동적 세그먼트:** `[id]` = Supabase `prompts.id` (UUID). 조회 실패 시 `lib/promptData.ts` 정적 데이터 폴백.

### 2.3. 네비게이션 맵

```
Header (전역)
├── 로고 ──────────────────────────────→ /
├── "프롬프트" ────────────────────────→ /prompts
├── 언어 전환 (ko ↔ en) ───────────────→ 동일 경로, 로케일만 변경
├── 다크/라이트 모드 토글
├── 장바구니 아이콘 (뱃지) ────────────→ /cart
└── 프로필 영역
    ├── [비로그인] "로그인" ───────────→ /sign-in
    └── [로그인] 드롭다운
        ├── "프로필 관리" ─────────────→ /profile
        ├── "구매 내역" ───────────────→ /my-page
        └── "로그아웃" ────────────────→ / (이동)

페이지 내부 주요 링크
├── / Hero CTA "프롬프트 둘러보기" ────→ /prompts
├── / 상품 카드 "상세보기" ────────────→ /prompt/[id]
├── /prompts 상품 카드 "상세보기" ───→ /prompt/[id]
├── /prompt/[id] "돌아가기" ───────────→ /
├── /prompt/[id] "바로 구매" ──────────→ /checkout?type=direct&productId=...
├── /cart "결제하기" ──────────────────→ /checkout?type=cart
├── /cart 빈 상태 "쇼핑 계속하기" ─────→ /
├── /checkout 결제 성공 ───────────────→ /checkout/success → /my-page
├── /my-page 빈 상태 "마켓 구경 가기" ─→ /
└── /my-page "내용 다시보기" ──────────→ /prompt/[id]
```

### 2.4. `/` vs `/prompts` 역할 분리

| 기능 | R01 `/` | R02 `/prompts` |
|------|---------|----------------|
| Hero / 3D 마퀴 쇼케이스 | O | X |
| 카테고리 필터 | O | O |
| 키워드 검색 (제목·태그·설명) | O | O |
| author 검색 | X | O |
| 정렬 (인기/평점/가격) | X | O |
| 결과 카운트 | X | O |
| 필터 초기화 | X | O |
| 페이지네이션 | X | O (pageSize 12) |
| 상품 카드 태그 표시 | 최대 2개 | 전체 |

### 2.5. 결제 플로우 라우팅

| 플로우 | 진입 | 경유 | 종료 |
|--------|------|------|------|
| 장바구니 결제 | R04 `/cart` | R08 `/checkout?type=cart` (토스 위젯) | R08a → R07 `/my-page` |
| 바로 구매 | R03 `/prompt/[id]` | R08 `/checkout?type=direct&productId=...` | R08a → R07 `/my-page` |

- 결제 승인: `POST /api/payment/confirm` → 토스페이먼츠 승인 API → Supabase `purchases` INSERT
- 서버가 결제 금액·상품 ID를 검증하며, 클라이언트 가격은 신뢰하지 않는다.

---

## 3. 현재 구현

### 3.1. 아키텍처 요약

| 항목 | 구현 |
|------|------|
| 프레임워크 | Next.js 15 App Router (`app/[locale]/`) |
| 인증 | Clerk (`@clerk/nextjs`) — Sign In / Sign Up, 한국어 로컬라이제이션 |
| 데이터베이스 | Supabase PostgreSQL — `prompts`, `profiles`, `carts`, `purchases` |
| 스토리지 | Supabase Storage — `avatars`(5MB), `prompts`(10MB) 버킷 |
| RLS | Clerk JWT를 Supabase `accessToken`으로 주입하여 통과 |
| 상태 관리 | `AuthContext` + `CartContext` + `ToastContext` |
| 결제 | 토스페이먼츠 위젯 SDK (`@tosspayments/tosspayments-sdk`) |
| i18n | next-intl — `ko`(기본) / `en` |
| 테마 | next-themes — 라이트/다크/시스템 |
| 상품 데이터 | Supabase `prompts` (32개 시드) + `lib/promptData.ts` 오류 시 폴백 |
| 관리자 | `/admin` — `ADMIN_CLERK_USER_ID` 기반 접근 제어, CRUD |
| 배포 | Vercel (`coredxi-prompt-market`) |

**비로그인 fallback:** 장바구니·구매 내역은 `pm_cart` / `pm_purchases` localStorage에 임시 저장. 로그인 후 Supabase와 동기화.

---

### 3.2. 화면 명세

#### 3.2.1. 헤더 (공통)

- **로고** → R01 `/`
- **"프롬프트"** → R02 `/prompts`
- **언어 전환** — `LanguageSwitcher` (ko ↔ en)
- **다크 모드 토글** — `ModeToggle`
- **장바구니 아이콘** — 뱃지, 클릭 → R04 `/cart`
- **프로필 드롭다운**
    - 비로그인: "로그인" → R05 `/sign-in`
    - 로그인: 프로필 이미지/닉네임 → 드롭다운
        - "프로필 관리" → R06 `/profile`
        - "구매 내역" → R07 `/my-page`
        - "로그아웃" → `/` 이동

#### 3.2.2. 메인 — 랜딩 + 미리보기 (R01 `/`)

- **데이터:** Supabase `prompts` (클라이언트 필터/검색)
- **Hero:** 슬로건, "프롬프트 둘러보기" CTA → `/prompts`
- **3D 마퀴 쇼케이스:** 장식용 데모 카드 (실제 catalog 아님)
- **필터/검색:** 카테고리 탭, 제목·태그·설명 검색
- **상품 카드:** 태그 ≤2, 담기·상세보기

#### 3.2.3. 전체 프롬프트 마켓 (R02 `/prompts`)

- **데이터:** Supabase `getPromptsPaginated` (pageSize 12, URL `?page=`)
- **기능:** R01 필터 + author 검색, 정렬, 결과 카운트, 필터 초기화, 전체 태그 표시, 페이지네이션

#### 3.2.4. 프롬프트 상세 (R03 `/prompt/[id]`)

- **구매 완료 시:** `prompt_text` 터미널 UI + 복사 버튼
- **구매 전:** 이미지 갤러리, sticky 사이드바, 장바구니 담기, 바로 구매 → `/checkout?type=direct&productId=...`
- **상품 없음:** `not-found.tsx` 렌더링

#### 3.2.5. 장바구니 (R04 `/cart`)

- **데이터:** 로그인 → Supabase `carts` / 비로그인 → `pm_cart` localStorage
- **결제하기:** 로그인 필요 → R08 `/checkout?type=cart`

#### 3.2.6. 결제 (R08 `/checkout`)

- **토스페이먼츠 위젯** 렌더링, 주문자명·결제 금액 표시
- **type=cart:** 장바구니 전체 상품 결제
- **type=direct:** 단건 상품 결제 (`productId` 쿼리 파라미터)
- **성공:** `/checkout/success` → `POST /api/payment/confirm` → `/my-page`
- **실패:** `/checkout/fail`

#### 3.2.7. 프로필 관리 (R06 `/profile`)

- **접근:** Auth. 미로그인 → 안내 + `/sign-in`
- **아바타:** Supabase Storage `avatars` 업로드 → `profiles.avatar_url` 저장
- **닉네임:** Clerk + `profiles.nickname` 병행 업데이트 (≤15자)

#### 3.2.8. 구매 내역 (R07 `/my-page`)

- **데이터:** 로그인 → Supabase `purchases` / 비로그인 → `pm_purchases` localStorage
- **구매 목록:** 썸네일, 제목, 구매일, "내용 다시보기" → `/prompt/[id]`

#### 3.2.9. 로그인·회원가입 (R05 `/sign-in`, `/sign-up`)

- **Clerk hosted UI** — 한국어 로컬라이제이션 (`koKR`)
- **레거시 `/login`:** `/sign-in`으로 리다이렉트

#### 3.2.10. 관리자 (R09 `/admin`)

- **접근:** `ADMIN_CLERK_USER_ID`와 일치하는 Clerk 사용자
- **기능:** 상품 CRUD, 이미지 Storage 업로드 (`POST /api/storage/upload`)
- **UI:** 한국어 전용 (i18n 미적용)

#### 3.2.11. 공통 UI

- **토스트:** 장바구니·프로필·결제·복사 피드백 (세션 메모리)
- **에러 처리:** `error.tsx`, `not-found.tsx`
- **푸터:** `© {연도} Prompt Market. Powered by Google AI Studio.`

---

### 3.3. 데이터/상태 모델

#### Supabase 테이블

**`profiles`**

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | text, PK | Clerk user ID |
| `nickname` | text | 닉네임 |
| `avatar_url` | text, nullable | 프로필 이미지 URL (Storage) |
| `updated_at` | timestamp | 수정일 |

**`prompts`**

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid, PK | 프롬프트 ID |
| `created_at` | timestamp | 생성일 |
| `title` | text | 제목 |
| `description` | text | 상세 설명 |
| `price` | integer | 가격 (원) |
| `category` | text | ChatGPT \| Midjourney \| Stable Diffusion \| Claude |
| `prompt_text` | text | 프롬프트 원문 |
| `image_urls` | text[] | Storage 이미지 URL |
| `tags` | text[] | 태그 |
| `rating` | numeric | 평점 |
| `author` | text | 제작자 |
| `views` | integer | 조회수 |
| `sales_count` | integer | 판매수 |

**`carts`**

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | bigint, PK | 항목 ID |
| `created_at` | timestamp | 생성일 |
| `user_id` | text | Clerk user ID |
| `prompt_id` | uuid, FK → `prompts.id` |
| — | unique(`user_id`, `prompt_id`) | 중복 담기 방지 |

**`purchases`**

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid, PK | 구매 ID |
| `created_at` | timestamp | 구매일 |
| `buyer_id` | text | Clerk user ID |
| `prompt_id` | uuid, FK → `prompts.id` |
| `payment_order_id` | text, unique | 토스페이먼츠 주문 ID |

#### localStorage (비로그인 fallback)

| 키 | 타입 | 설명 |
|----|------|------|
| `pm_cart` | JSON (`string[]`) | 장바구니 상품 ID 배열 |
| `pm_purchases` | JSON (`PurchaseItem[]`) | 구매 내역 (데모/비로그인) |

#### 핵심 로직

| 로직 | 동작 |
|------|------|
| `addToCart` | 로그인 → Supabase `carts` upsert / 비로그인 → `pm_cart` |
| `removeFromCart` | 로그인 → Supabase DELETE / 비로그인 → `pm_cart` |
| `addPurchases` | 결제 승인 후 Supabase `purchases` INSERT (서버) |
| 프롬프트 잠금 | 미구매 시 `prompt_text` 숨김, 구매 후 열람·복사 |
| 프로필 upsert | Clerk 로그인 시 `POST /api/profile/upsert` 자동 호출 |
| 장바구니 결제 | `/checkout?type=cart` → 토스 위젯 → 승인 → `purchases` |
| 바로 구매 | `/checkout?type=direct&productId=...` → 동일 승인 플로우 |

#### API Route Handlers

| 경로 | 역할 |
|------|------|
| `POST /api/payment/confirm` | 토스 결제 승인 + `purchases` INSERT |
| `POST /api/profile/upsert` | `profiles` 생성·갱신 |
| `POST /api/storage/upload` | Storage 이미지 업로드 |
| `POST /api/prompts/by-ids` | ID 목록으로 상품 batch 조회 |

---

## 4. 레거시 — AS-IS 프로토타입 (참고용)

> 아래 내용은 **초기 프로토타입(P0)** 시점의 구현이다. P1 마이그레이션으로 대체되었으며, 코드베이스에 일부 흔적만 남아 있다.

| 영역 | AS-IS (레거시) | 현재 구현 |
|------|----------------|-----------|
| 상품 데이터 | `lib/promptData.ts` 정적 4개 | Supabase `prompts` 32개 + 폴백 |
| 인증 | 이메일 프로토타입 + 데모 자동 로그인 | Clerk |
| 장바구니 | `pm_cart` localStorage only | Supabase `carts` (+ 비로그인 fallback) |
| 구매 내역 | `pm_purchases` localStorage only | Supabase `purchases` (+ 비로그인 fallback) |
| 프로필 | `pm_user` localStorage, base64 아바타 | `profiles` + Storage |
| 결제 | 모의 Toss UI / 즉시 처리 | 토스페이먼츠 실결제 |
| 상태 관리 | `AppContext.tsx` (삭제됨) | `AuthContext` + `CartContext` |
| 관리자 | 없음 | `/admin` |

**제거된 동작:**
- 첫 방문 시 `devcoredxi00@coredxi.com` 데모 사용자 자동 로그인
- 비밀번호 없는 이메일 로그인 (`/login` 페이지)
- `components/cart/PaymentModal.tsx` 모의 결제 오버레이 (미사용 dead code)

---

## 부록: 화면–라우트–데이터 대조표 (현재 구현)

| 라우트 ID | 경로 | 주요 데이터 소스 |
|-----------|------|------------------|
| R01 | `/` | Supabase `prompts`, `carts` / `pm_cart` |
| R02 | `/prompts` | Supabase `prompts` (paginated) |
| R03 | `/prompt/[id]` | Supabase `prompts`, `purchases`, `carts` |
| R04 | `/cart` | `carts` / `pm_cart`, Supabase `prompts` |
| R05 | `/sign-in` | Clerk |
| R06 | `/profile` | Clerk + `profiles` + Storage `avatars` |
| R07 | `/my-page` | `purchases` / `pm_purchases` |
| R08 | `/checkout` | `carts` / direct `productId`, Toss SDK |
| R09 | `/admin` | Supabase `prompts` (service_role CRUD) |
