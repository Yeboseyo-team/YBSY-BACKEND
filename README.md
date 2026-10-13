# vibe-coding-challenge

바이브코딩 챌린지 팀 프로젝트

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 프론트엔드 | React + Vite + TypeScript |
| 백엔드 | Supabase (DB, Auth, Storage) |
| 스타일 | Tailwind CSS + shadcn/ui |
| 서버 상태 | TanStack Query + supabase-js |
| 폼/검증 | React Hook Form + Zod |
| 패키지 매니저 | pnpm |
| 배포 | Vercel |

## 시작하기

### 필요한 것
- Node.js (버전은 `.nvmrc` 참고 → `nvm use`)
- pnpm (`corepack enable`)
- Docker (Supabase 로컬 DB용)
- Supabase CLI

### 로컬 실행
```bash
git clone <이 레포 주소>
cd vibe-coding-challenge
pnpm install

cp .env.example .env.local   # 값은 팀 채널에서 공유받기 (개발용 Supabase 서울 프로젝트)
pnpm dev                     # http://localhost:5173
```

로그인은 Google만 씁니다. 로컬에서는 `.env.local`에 `VITE_DEMO_LOGIN=true`를 넣으면 데모 계정(`yebo@hakgi.test` 등)으로 바로 들어갈 수 있습니다 ([docs/DUMMY_DATA.md](./docs/DUMMY_DATA.md))

## 문서

| 문서 | 내용 |
|---|---|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | ERD, 데이터 흐름, 보안 규칙(RLS) |
| [docs/AUTH.md](./docs/AUTH.md) | 로그인·세션 동작 방식, Supabase 인증 설정 방법 |
| [docs/DUMMY_DATA.md](./docs/DUMMY_DATA.md) | 데모 계정, 더미데이터, 명세서 기준값 |

## 협업 규칙

자세한 내용은 [CONTRIBUTING.md](./CONTRIBUTING.md)를 꼭 읽어주세요.

- `main`에 직접 push 금지 → 항상 `feature/*` 브랜치에서 작업 후 PR
- PR은 리뷰 1명 이상 + CI 통과 후 **Squash merge**
- DB 스키마 변경은 반드시 **migration 파일**로 (대시보드에서 직접 수정 금지)

## 팀원

| 이름 | GitHub | 역할 |
|---|---|---|
|  |  |  |
