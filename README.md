# Prompt Market

AI 프롬프트를 탐색·구매하고, 장바구니에 담아 결제하며, 프로필과 구매 내역을 관리할 수 있는 온라인 상점.

## 기술 스택

- **Framework:** Next.js 15 (App Router)
- **Auth:** Clerk
- **Database / Storage:** Supabase
- **Payment:** 토스페이먼츠 (위젯 SDK)
- **i18n:** next-intl (ko / en)
- **Styling:** Tailwind CSS 4, next-themes (다크 모드)
- **Deploy:** Vercel

## 사전 요구 사항

- Node.js 20+
- [pnpm](https://pnpm.io/) (패키지 매니저)
- Supabase, Clerk, 토스페이먼츠 개발자 계정

## 로컬 실행

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env.example`을 복사해 `.env.local`을 만든 뒤 값을 채웁니다.

```bash
cp .env.example .env.local
```

**필수 변수:**

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 공개 키 |
| `CLERK_SECRET_KEY` | Clerk 시크릿 키 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role 키 |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 토스 위젯 클라이언트 키 (`gck_` 접두사) |
| `TOSS_SECRET_KEY` | 토스 시크릿 키 |
| `ADMIN_CLERK_USER_ID` | 관리자 Clerk user ID (`/admin` 접근) |

### 3. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

### 4. (선택) 상품 시드

Supabase `prompts` 테이블에 32개 상품을 삽입합니다.

```bash
pnpm seed:prompts
```

## 주요 스크립트

| 명령 | 설명 |
|------|------|
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 프로덕션 서버 |
| `pnpm lint` | ESLint |
| `pnpm seed:prompts` | Supabase 상품 시드 |

## 주요 라우트

| 경로 | 설명 |
|------|------|
| `/` | 메인 (랜딩 + 미리보기) |
| `/prompts` | 전체 프롬프트 마켓 |
| `/prompt/[id]` | 프롬프트 상세 |
| `/cart` | 장바구니 |
| `/checkout` | 결제 (토스페이먼츠) |
| `/sign-in` | 로그인 (Clerk) |
| `/sign-up` | 회원가입 (Clerk) |
| `/profile` | 프로필 관리 (Auth) |
| `/my-page` | 구매 내역 (Auth) |
| `/admin` | 관리자 상품 관리 |
| `/en/...` | 영어 로케일 |

## 배포 (Vercel)

1. Vercel 프로젝트에 연결 (`coredxi-prompt-market`)
2. `.env.example`의 변수를 Production 환경에 등록
3. Clerk OAuth redirect URL에 배포 도메인 추가
4. 배포 후 `/ko/prompts`, `/checkout` 플로우 확인

## 문서

- [PRD](docs/PRD.md) — 제품 요구사항 (현재 구현 + 레거시)
- [TODO](docs/TODO.md) — 완료된 작업 체크리스트 (P0~P2)
- [PLAN](docs/PLAN.md) — 프로젝트 계획·마이그레이션 이력
