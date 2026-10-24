# 학기예보 — Claude Code 작업 규칙

## 프로젝트
- 대학생 학기 부담 예측 서비스. 바이브코딩챌린지, 10/18 필수 기능 완료, 10/20 배포, 10/27 발표
- 설명은 항상 쉬운 한국어로. 사용자가 맡은 역할은 아래 "담당 구역"과 사용자가 준 프롬프트를 따름
- 기준 문서: docs/REQUIREMENTS.md (요구사항 명세서 + 팀 결정 변경 이력). 4장 산출 규칙, 5장 데이터, 6장 화면

## 작업 시작할 때 (프론트 팀원은 개발이 처음 — 항상 이 순서)
- 먼저 `git branch --show-current` 로 브랜치를 보고 담당을 판단: `feature/frontend-ge` = 프론트 A, `feature/frontend-jw` = 프론트 B
- 할 일 목록: `docs/tasks/frontend-ge.md`, `docs/tasks/frontend-jw.md`. 사용자가 "N번 작업"이라고 하면 이 파일의 해당 항목을 따름. 끝나면 `[ ]` → `[x]`
- 사용자는 코드를 읽지 않음. 바꾼 내용은 "어느 화면에서 무엇이 달라졌는지, 어떻게 눌러서 확인하는지"로 3줄 이내 설명
- 한 번에 한 화면·한 기능만. 끝나면 직접 확인할 방법을 알려주고 `/save` 를 권하기
- 슬래시 커맨드: `/start`(최신화·main 합치기), `/save`(검사·커밋·push). 내용은 .claude/commands/
- 🚧 `ScreenPlaceholder` 가 있는 화면은 아직 안 만든 화면. 실제 화면을 만들면 지우기
- 화면 주소(라우트)는 src/App.tsx 에 이미 다 연결돼 있음. 프론트 B 는 App.tsx 를 고칠 필요 없음
- 참고 구현: `origin/feature/frontend-session` 에 먼저 만들어 본 계획·자격증·온보딩 화면이 있음. `git show origin/feature/frontend-session:<경로>` 로 읽고 참고만 하고, 브랜치째 merge 하지 않기 (main 과 충돌 많음)
- 팀원용 설치·실행 안내: docs/FRONTEND_GUIDE.md

## 기술
- React 19 + Vite + TS, Supabase(Auth·Postgres), TanStack Query, React Hook Form + Zod, Tailwind v4 + shadcn/ui, Recharts, Vitest, ESLint, pnpm
- Supabase 개발 프로젝트: hxnaobwybllgdcvnwimo (서울)
- 문서: docs/ARCHITECTURE.md(ERD·데이터 흐름·RLS), docs/AUTH.md(로그인·Supabase·Google 설정), docs/DUMMY_DATA.md(데모 계정·기준값), docs/design-pc/(화면 디자인)

## 담당 구역 (남의 구역 파일은 수정하지 말고 사용자에게 말하기)
| 담당 | 브랜치 | 화면·기능 | 파일 |
|---|---|---|---|
| 프론트 A | feature/frontend-ge | 앱 뼈대·라우트·가드, 레이아웃, 로그인·인증 처리·온보딩(S-01, S-06, S-07), 설정(S-12), 개인정보처리방침, 404, 자격증 선택(S-10) | package.json 등 루트 설정, src/App.tsx, src/main.tsx, src/routes, src/lib, src/components/layout, src/features/{auth,settings,certificates}, 해당 src/pages |
| 프론트 B | feature/frontend-jw | 부담 예보(S-08), 계획 목록·등록(S-09), 사전 검토 시트(S-11) | src/features/{forecast,plans,preview}, src/pages/{HomePage,PlansPage,PlanNewPage,PlanEditPage} |
| 백엔드 | feature/backend | DB·RLS, 더미데이터, 데이터 훅, Supabase·Google·Vercel 설정, 선택 기능 F-07~F-09 | supabase/, scripts/, src/types/database.ts, src/mocks/(생성 파일), src/features/auth/demo.ts, docs/, 아래 "데이터 훅" 파일들 |
- src/components/ui (shadcn 공용 컴포넌트)는 누구나 추가 가능. 기존 컴포넌트를 바꿀 땐 사용자에게 알리기
- src/features/forecast/calc.ts 는 B 폴더에 있지만 모두가 쓰는 산출 모듈. 고칠 땐 테스트 전부 통과 + 사용자에게 알리기
- **데이터 훅 (백엔드가 만듦, 10/14)**: 화면은 supabase 를 직접 부르지 말고 아래 훅만 씀. 각 폴더에 있어도 백엔드 파일이라 고치지 말고, 바꿔야 하면 사용자에게 말하기
  - `src/features/plans/api.ts`(계획 목록·추가·수정·삭제), `src/features/plans/defaults.ts`(F-03 기본 시간, 유형별 묶기, 30개 상한)
  - `src/features/certificates/api.ts`(회차·내 자격증 고르기·수정·해제), `src/features/certificates/search.ts`(검색·회차 상태·D-day)
  - `src/features/auth/profile-api.ts`(학기 설정·이름·동의 저장), `src/features/auth/onboarding.ts`(온보딩 완료 판정)
  - `src/features/forecast/api.ts`(예보 화면 데이터 한 번에: useForecastData)
  - `src/features/plans/ai.ts`(F-08 AI 시간 추천: useEstimateHours → Edge Function estimate-hours, 10/24)

## 브랜치·병합
- main이 팀 기준점. main에 직접 push·머지 금지
- 팀 결정(10/13): 프론트 작업은 **각자 브랜치에 push까지만**. main 으로 PR 은 팀장이 정할 때만 만들고, 팀원·Claude Code 는 PR 을 만들거나 머지하지 않기
- main 에 새로 들어온 작업은 git fetch origin && git merge origin/main 으로 받기 (main을 rebase 하지 않기)
- push 전 git pull --rebase origin <내 브랜치>, force push 금지
- push 전 pnpm lint && pnpm typecheck && pnpm test && pnpm build 통과

## 규칙
- 커밋 메시지: feat/fix/db/docs/test/chore: 한국어 설명
- DB 스키마 변경은 supabase/migrations/ 에 새 SQL 파일로. 대시보드에서 직접 수정 금지. 변경 후 src/types/database.ts 재생성
- 새 테이블은 RLS 필수. service_role/secret 키는 코드·커밋에 절대 넣지 않기
- .env.local 은 커밋 금지
- 타입은 src/types/database.ts 의 Profile·Plan·Certificate·UserCertificate 를 씀. 같은 타입을 따로 만들지 않기
- 더미데이터는 scripts/generate-dummy.mjs 만 고치고 node scripts/generate-dummy.mjs 로 재생성
- 부담 계산은 src/features/forecast/calc.ts 한 곳에서만. 단계 이름은 clear(맑음)/cloudy(흐림)/storm(폭풍)
- 접수 마감 회차 선택 불가는 화면에서 막기(DB 에서 막으면 마감 지난 뒤 시드가 실패). 계획 30개 상한은 화면에서 먼저 막고 DB 트리거(plans_limit)도 막음 (10/22)

## 로그인
- 팀 결정(10/13): 로그인은 Google만. 이메일 가입·비밀번호 찾기 화면은 만들지 않음 (docs/AUTH.md)
- 개인정보 동의는 온보딩에서 받고 profiles.privacy_agreed_at 에 기록. 가용 시간·학기 시작일·동의 중 하나라도 비면 온보딩으로

## 데모 계정 (비밀번호 hakgi1234, VITE_DEMO_LOGIN=true 인 로컬·프리뷰에서만 데모 로그인 버튼으로)
yebo@hakgi.test(시연 주인공), jiwon@, woonyoung@, empty@(계획 없음), newbie@(온보딩 전)
