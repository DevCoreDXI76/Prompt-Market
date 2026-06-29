# TODO

> 마지막 업데이트: 2026-06-29
> 기준 문서: `docs/PRD.md`
> 우선순위: P0 (프론트엔드+Mock) → P1 (Supabase 연동) → P2 (부가 기능)

---

## P0

> 프론트엔드 구현 + localStorage/Mock 데이터 연동 — 백엔드 없이 UX 완성

- [x] 전역 헤더 컴포넌트 구현
  - Acceptance: 로고→`/`, 프롬프트→`/prompts`, 장바구니 뱃지→`/cart`, 프로필 드롭다운(로그인/비로그인 분기) 동작
  - Note: `localStorage` `pm_user` 기준 로그인 상태 판단

- [x] R01 `/` — 메인 랜딩 + 미리보기 페이지
  - Acceptance: Hero CTA, 3D 마퀴 쇼케이스, 카테고리 탭 필터, 키워드 검색(제목·태그·설명), 상품 카드(태그 ≤2, 담기·상세보기), 검색 결과 없음 안내 표시
  - Note: `lib/promptData.ts` 정적 데이터 사용, `pm_cart` localStorage 연동

- [x] R02 `/prompts` — 전체 프롬프트 마켓 페이지
  - Acceptance: 카테고리 필터, 키워드 검색, author 검색, 정렬(인기/평점/낮은가격/높은가격), 결과 카운트, 필터 초기화, 상품 카드 전체 태그 표시
  - Note: `lib/promptData.ts` 정적 데이터 사용

- [x] R03 `/prompt/[id]` — 프롬프트 상세 페이지
  - Acceptance: 이미지 갤러리(섬네일 전환), 좌측 상세 설명, 우측 sticky 사이드바(카테고리·제작자·평점·조회수·가격), 구매 전/후 UI 분기, 바로 구매 확인 모달, 프롬프트 잠금/열람·복사, 상품 없음 안내
  - Note: `pm_purchases` 기준 구매 여부 판단, 바로 구매 시 `addPurchases([id])` 즉시 실행

- [x] R04 `/cart` — 장바구니 페이지
  - Acceptance: 빈 상태 안내, 상품 목록(이미지·카테고리·제목·가격·삭제 애니메이션), 결제 요약(상품금액·수수료 0원·총 주문금액), 모의 Toss UI(1.5s 딜레이→성공 모달→`/my-page`), 데모 안내 문구 표시
  - Note: 결제 시 로그인 필요, `pm_cart` localStorage 연동

- [x] R05 `/login` — 프로토타입 이메일 로그인 페이지
  - Acceptance: 이메일 입력(형식 검증, 기본값 `devcoredxi00@coredxi.com`), 로그인 후 `pm_user` 저장·토스트·`/` 이동, 프로토타입 안내 문구 표시
  - Note: 비밀번호 없음, 닉네임은 `@` 앞부분, 프로필 이미지는 picsum 시드 URL

- [x] R06 `/profile` — 프로필 관리 페이지
  - Acceptance: 미로그인 시 안내+`/login` 이동, 아바타 클릭/드래그앤드롭→base64 즉시 저장+토스트, 이메일 읽기 전용, 닉네임 수정(≤15자)·저장/취소+토스트
  - Note: `pm_user` localStorage 기준, Auth 라우트 보호

- [x] R07 `/my-page` — 구매 내역 페이지
  - Acceptance: 미로그인 시 안내+`/login` 이동, 빈 상태 안내+"마켓 구경 가기"→`/`, 구매 목록(썸네일·제목·구매일·"내용 다시보기"→`/prompt/[id]`), "평생 무제한 접근" 안내
  - Note: `pm_purchases` localStorage 기준, Auth 라우트 보호

- [x] AppContext + localStorage 상태 관리
  - Acceptance: `pm_user`·`pm_cart`·`pm_purchases` 읽기/쓰기, `addToCart`(중복 방지)·`removeFromCart`·`addPurchases`(중복 스킵·cart 자동 제거) 동작
  - Note: 로그아웃 시 `pm_user`만 삭제, `pm_cart`·`pm_purchases` 유지

- [x] 첫 방문 데모 사용자 자동 로그인
  - Acceptance: `pm_user` 없으면 `devcoredxi00@coredxi.com` 데모 사용자 자동 생성·로그인
  - Note: AS-IS 프로토타입 전용, P1에서 제거

- [x] 토스트 알림 시스템
  - Acceptance: 장바구니 추가·결제·프로필 저장·프롬프트 복사 피드백 토스트 동작
  - Note: 세션 메모리, localStorage 미저장

- [x] 공통 레이아웃 (Header, Footer, globals.css)
  - Acceptance: 푸터 `© {연도} Prompt Market. Powered by Google AI Studio.` 표시, 전역 스타일 적용
  - Note: `app/layout.tsx` 기준

- [x] `lib/promptData.ts` — 정적 상품 데이터 4개
  - Acceptance: `id`, `title`, `price`, `category`, `description`, `images`, `prompt_text`, `tags`, `rating`, `author`, `views`, `salesCount` 필드 포함
  - Note: AS-IS Mock 데이터, P1에서 Supabase 쿼리로 교체

---

## P1

> Supabase(DB, Auth, Storage) 연결 및 localStorage/Mock 데이터 점진적 마이그레이션

### Supabase 기반 세팅

- [x] Supabase 프로젝트 생성 및 환경 변수 설정
  - Acceptance: `.env`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 설정 완료
  - Note: Supabase 프로젝트 `xvmeyeixzbfqoofriliw` 생성됨

- [x] Supabase 클라이언트 생성 (`lib/supabase/`)
  - Acceptance: `client.ts`(공개/인증), `server.ts`(서버 컴포넌트), `admin.ts`(service_role) 분리 생성
  - Note: Clerk JWT 토큰 주입 방식 (`accessToken` 옵션)으로 RLS 통과

- [x] `prompts` 테이블 생성 및 RLS 정책 설정
  - Acceptance: `prompts` 테이블 생성, 읽기는 public, 쓰기는 service_role(admin)만 허용
  - Note: `category`, `tags`, `author`, `rating`, `views`, `sales_count` 등 전체 필드 포함

- [ ] `profiles`, `carts`, `purchases` 테이블 생성
  - Acceptance: PRD 4.4 스키마에 맞게 3개 테이블 생성됨, `carts`의 `unique(user_id, prompt_id)` 제약 포함
  - Note: 추후 Supabase SQL 에디터에서 적용

- [ ] `profiles` 자동 생성 트리거
  - Acceptance: Clerk 신규 사용자 등록 시 또는 첫 로그인 시 `profiles` 레코드 자동 생성
  - Note: Clerk Webhook 또는 Supabase Trigger 활용

### 인증 (Clerk)

- [x] Clerk 설치 및 기본 인증 연동
  - Acceptance: `@clerk/nextjs` 설치, `ClerkProvider` 설정, Sign In / Sign Up 페이지 동작
  - Note: AS-IS 프로토타입 이메일 로그인 → Clerk 실인증으로 완전 교체
  - Routes: `/sign-in/[[...sign-in]]`, `/sign-up/[[...sign-up]]` (Clerk hosted UI)

- [x] Clerk + Supabase JWT 통합
  - Acceptance: Clerk 세션 토큰을 Supabase `accessToken`으로 주입, RLS 정책 통과 확인
  - Note: Supabase JWT 시크릿에 Clerk 공개 키 등록 필요

- [x] Clerk 한국어 로컬라이제이션
  - Acceptance: Sign In / Sign Up UI가 한국어로 표시됨 (`koKR` 로케일 적용)
  - Note: `@clerk/localizations` 패키지의 `koKR` 사용

- [x] Auth 라우트 보호 (`/profile`, `/my-page`)
  - Acceptance: 미로그인 상태에서 해당 라우트 접근 시 `/sign-in`으로 리다이렉트
  - Note: Next.js 미들웨어(`middleware.ts`)에서 Clerk `clerkMiddleware` 사용

- [x] 데모 자동 로그인 제거
  - Acceptance: 첫 방문 시 자동 로그인 없음, Clerk 세션 기준으로 인증 상태 관리
  - Note: `AppContext`의 `pm_user` 자동 생성 로직 제거, Clerk `useUser()` 훅으로 대체

### 상품 데이터 마이그레이션 (R01, R02, R03)

- [x] `prompts` 테이블 필드 확장 및 Supabase 쿼리 연동
  - Acceptance: `lib/supabase/prompts.ts` — `getPrompts()`, `getPromptById()` 함수가 Supabase 조회, 오류 시 정적 데이터 폴백
  - Note: `rowToProduct`, `productToRow` 변환 함수로 snake_case ↔ camelCase 매핑

- [x] 기존 4개 상품 데이터 Supabase `prompts` 테이블로 이관
  - Acceptance: `lib/promptData.ts`의 4개 상품이 Supabase에 시드됨
  - Note: Supabase 대시보드 또는 Admin API로 직접 삽입

- [x] Admin CRUD 연동 (`/admin` 페이지)
  - Acceptance: 어드민 페이지에서 Supabase `prompts` 테이블 생성·수정·삭제 동작, `ADMIN_CLERK_USER_ID` 환경변수로 접근 제어
  - Note: `lib/supabase/prompts.ts`의 `createPrompt`, `updatePrompt`, `deletePrompt` 사용, service_role 키 적용

- [ ] Supabase Storage 버킷 생성 및 상품 이미지 업로드
  - Acceptance: `prompts` 버킷 생성, 기존 상품 이미지를 Storage에 업로드, `image_urls` 필드에 Storage URL 저장
  - Note: 현재 외부 URL(picsum 등) 사용 중 → Storage로 이관 예정

### 장바구니 마이그레이션 (R04)

- [ ] `pm_cart` localStorage → Supabase `carts` 테이블로 교체
  - Acceptance: 로그인 사용자의 장바구니가 Supabase에 저장·조회됨, 중복 담기 방지(`unique` 제약) 동작
  - Note: 기존 `CartContext`의 `addToCart`·`removeFromCart` 로직을 Supabase CRUD로 교체

- [ ] 로그인 사용자 기준 장바구니 CRUD API
  - Acceptance: 담기·삭제·목록 조회 API(서버 액션 또는 Route Handler)가 RLS 통과 후 동작
  - Note: 비로그인 상태 장바구니는 로그인 시 병합 처리(선택)

### 구매 내역 마이그레이션 (R07)

- [ ] `pm_purchases` localStorage → Supabase `purchases` 테이블로 교체
  - Acceptance: 구매 내역이 Supabase에 저장됨, R07 `/my-page`가 Supabase 데이터 기준으로 렌더링
  - Note: 결제 승인 성공 후 `purchases` INSERT 연동 필요

### 실결제 (Checkout, R03)

- [x] 토스페이먼츠 SDK 설치 및 설정
  - Acceptance: `@tosspayments/tosspayments-sdk` 설치, 위젯 클라이언트 키(`test_gck_...`) 환경 변수 설정
  - Note: API 개별 연동 키(`ck_`)가 아닌 위젯 전용 키(`gck_`) 사용해야 함

- [x] 결제 페이지 구현 (`/checkout`)
  - Acceptance: 장바구니 상품 기준 토스페이먼츠 위젯 렌더링, 주문자명·결제 금액 표시, 결제하기 버튼 동작
  - Note: `app/[locale]/checkout/page.tsx`, Clerk `useUser()`로 customerKey 설정

- [x] 결제 승인 Route Handler (`/api/payment/confirm`)
  - Acceptance: `paymentKey`, `orderId`, `amount` 수신 → 토스페이먼츠 승인 API 호출 → 성공/실패 응답
  - Note: `app/api/payment/confirm/route.ts`, `TOSS_SECRET_KEY` 환경변수 사용

- [x] 결제 성공·실패 페이지 구현
  - Acceptance: `/checkout/success`, `/checkout/fail` 페이지에서 결과 표시
  - Note: `app/[locale]/checkout/success/page.tsx`, `app/[locale]/checkout/fail/page.tsx`

- [ ] 결제 성공 시 `purchases` 테이블 INSERT 연동
  - Acceptance: 결제 승인 성공 후 `purchases` 테이블에 구매 내역 저장, `/my-page`에 반영
  - Note: 현재 결제 성공 후 localStorage `pm_purchases`에만 저장됨 → Supabase 연동 필요

- [ ] 바로 구매 단건 결제 (R03)
  - Acceptance: R03 상세 페이지에서 "바로 구매" 클릭 시 Checkout 페이지로 이동, 단건 결제 처리
  - Note: 현재 AS-IS 즉시 처리 방식 → 토스페이먼츠 결제창 호출로 교체 예정

### i18n 다국어 (next-intl)

- [x] next-intl 설치 및 `/[locale]/` 라우팅 구조 적용
  - Acceptance: `ko`(기본) / `en` 두 로케일 지원, URL이 `/ko/...` 또는 `/en/...` 형태로 동작
  - Note: `i18n/routing.ts`, `i18n/navigation.ts`, `i18n/request.ts` 설정, `middleware.ts` 통합

- [x] 한국어·영어 메시지 파일 생성
  - Acceptance: `messages/ko.json`, `messages/en.json` — 주요 UI 텍스트 번역 키 포함
  - Note: 상품 데이터(title, description)는 DB에 저장된 단일 언어 그대로 사용

- [x] 언어 전환 UI 구현
  - Acceptance: 헤더에 언어 전환 버튼 표시, 클릭 시 로케일 전환 동작
  - Note: `components/LanguageSwitcher.tsx`

- [ ] 미번역 UI 텍스트 정리
  - Acceptance: 모든 페이지의 하드코딩된 한국어 텍스트를 번역 키로 교체, `/en/` 접근 시 영어 표시
  - Note: 번역 누락 분석 완료, 실제 키 교체 작업 남아있음

### 다크 모드

- [x] 다크 모드 구현
  - Acceptance: 헤더에 라이트/다크 토글 버튼 표시, 시스템 테마 기본 적용, 전환 시 즉시 반영
  - Note: `next-themes` + `components/ModeToggle.tsx`, shadcn 다크 모드 가이드 기반

### SEO·성능 최적화

- [x] 메타데이터 정비 (Next.js `generateMetadata`)
  - Acceptance: R01~R03 라우트에 적절한 `title`, `description`, OG 태그 설정
  - Note: R03은 상품 제목 기반 동적 메타데이터

- [x] Lighthouse 성능 개선
  - Acceptance: Lighthouse 검사 결과 기반 Performance·Accessibility·SEO 항목 개선
  - Note: `next/image` 전환, 폰트 최적화 등 적용

### 프로필 마이그레이션 (R06)

- [ ] 프로필 이미지 base64 → Supabase Storage 업로드로 교체
  - Acceptance: 아바타 변경 시 Storage에 업로드, `profiles.avatar_url`에 Storage URL 저장
  - Note: 현재 `pm_user` localStorage base64 방식 사용 중

- [ ] 닉네임·아바타 변경을 `profiles` 테이블에 반영
  - Acceptance: 닉네임 저장 시 `profiles` 테이블 UPDATE, 변경 후 UI 즉시 반영
  - Note: `pm_user` localStorage → Supabase `profiles` 쿼리로 교체

---

## P2

> 부가 기능 — 최적화, 추가 기능, 성능 개선, 배포 자동화

- [ ] 상품 데이터 확충 (4개 → 실서비스 수준)
  - Acceptance: 충분한 수의 상품 데이터가 Supabase `prompts` 테이블에 존재, 카테고리별 분포 균형
  - Note: Admin 페이지 또는 시드 스크립트로 등록

- [ ] 페이지네이션 또는 무한 스크롤 (R02 `/prompts`)
  - Acceptance: 상품이 일정 수 이상이면 페이지 분리 또는 스크롤 시 추가 로드
  - Note: Supabase `range` 쿼리 활용

- [ ] 미번역 UI 텍스트 전체 정리 (i18n 완성)
  - Acceptance: `/en/` 접근 시 모든 UI 텍스트 영어 표시, 하드코딩된 한국어 텍스트 없음
  - Note: 번역 누락 분석 완료 상태 — 실제 코드에서 `t('key')` 교체 작업 필요

- [ ] 에러 바운더리 및 `not-found.tsx`, `error.tsx` 추가
  - Acceptance: 존재하지 않는 `/prompt/[id]` 접근 시 `not-found.tsx` 렌더링, 서버 에러 시 `error.tsx` 렌더링
  - Note: Next.js App Router 파일 기반 에러 처리

- [ ] 접근성(a11y) 점검
  - Acceptance: 주요 인터랙티브 요소에 `aria-label` 및 키보드 접근 가능, Lighthouse 접근성 점수 90 이상
  - Note: 장바구니 담기·삭제·모달 등 집중 점검

- [ ] Vercel 배포 및 환경 변수 등록
  - Acceptance: Vercel 프로젝트 연결, 프로덕션 환경 변수 등록 (Supabase, Clerk, Toss 키), 자동 배포 동작
  - Note: `.vercel/project.json` 이미 존재 — 환경 변수 등록 및 배포 확인 필요

---

## 제약

- PRD(`docs/PRD.md`)에 명시된 요구사항 기반으로 항목을 관리한다.
- P0 완료 후 P1 진행, P1 안정화 후 P2 진행을 원칙으로 한다.
- 라우트 레지스트리(R01~R07)는 TO-BE에서도 변경하지 않는다. (R05만 기능 확장)
- 클라이언트 측 가격 데이터는 결제 검증에 사용하지 않는다. (서버 검증 필수)
