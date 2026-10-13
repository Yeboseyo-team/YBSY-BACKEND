# 프론트엔드 시작 가이드 (처음 하는 사람용)

코드를 직접 쓰지 않아도 됩니다. **Claude Code에게 시키고, 화면을 눌러보며 확인하는 것**이 우리 일이에요.
막히면 에러 메시지를 통째로 복사해서 Claude Code에 붙여넣으세요.

| 담당 | 브랜치 | 할 일 목록 |
|---|---|---|
| 프론트 A | `feature/frontend-ge` | [docs/tasks/frontend-ge.md](./tasks/frontend-ge.md) |
| 프론트 B | `feature/frontend-jw` | [docs/tasks/frontend-jw.md](./tasks/frontend-jw.md) |

---

## 1. 처음 한 번만: 설치

순서대로 설치하고, 터미널(Windows는 PowerShell, Mac은 터미널)에서 확인 명령이 버전을 보여주면 성공이에요.

| 순서 | 설치 | 확인 명령 |
|---|---|---|
| 1 | **Node.js 24 LTS** (nodejs.org 에서 LTS 버튼) | `node -v` → v24.x |
| 2 | **pnpm**: 터미널에서 `corepack enable` 입력 | `pnpm -v` |
| 3 | **Git** (git-scm.com, Mac은 `git` 입력 시 뜨는 설치 창) | `git --version` |
| 4 | **Claude Code** (공식 안내: https://docs.claude.com/en/docs/claude-code/overview) | `claude --version` |
| 5 | **VS Code 또는 Cursor** (파일을 눈으로 보는 용도) | |

자주 막히는 곳
- Windows에서 `pnpm`·`npm` 실행 시 "스크립트를 실행할 수 없으므로…" → PowerShell에서 한 번만:
  `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
- `corepack enable` 이 권한 오류 → PowerShell을 **관리자 권한으로 실행**해서 다시
- Docker, Supabase CLI 는 **프론트는 설치 안 해도 됩니다** (개발용 Supabase 서버를 같이 씀)

## 2. 처음 한 번만: 프로젝트 받기

```bash
git clone https://github.com/Yeboseyo-team/ybsy-backend.git
cd ybsy-backend

# 내 브랜치로 이동 (둘 중 내 것 하나만)
git switch feature/frontend-ge     # 프론트 A
git switch feature/frontend-jw     # 프론트 B

pnpm install
```

그다음 `.env.example` 을 복사해서 `.env.local` 을 만들고, **팀 채널에서 받은 값**을 채워요.

```bash
cp .env.example .env.local      # Windows PowerShell: copy .env.example .env.local
```

## 3. 실행해서 화면 보기

```bash
pnpm dev
```

브라우저에서 http://localhost:5173 → 로그인 화면의 **데모 로그인**에서 `yebo@hakgi.test` 선택.
위쪽 메뉴(예보·계획·자격증·설정)를 눌러서 🚧 표시가 있는 화면이 나오면 준비 끝이에요.
서버를 끌 때는 터미널에서 `Ctrl + C`.

## 4. 매일 작업 흐름

터미널을 하나 더 열고 프로젝트 폴더에서 `claude` 를 입력하면 Claude Code가 시작돼요.
아래 명령어(슬래시 커맨드)를 입력하면 정해진 순서대로 Claude Code가 처리해요.

| 언제 | Claude Code에 입력 | 하는 일 |
|---|---|---|
| 작업 시작할 때 | `/start` | 내 브랜치 최신으로 받기 → 팀 main 작업 합치기 → 오늘 할 일 안내 |
| 작업 중 | 할 일 목록의 프롬프트 복사·붙여넣기 | 화면 만들기 |
| 기능 하나 끝날 때 | `/save` | 검사(lint·타입·테스트·빌드) → 커밋 → 내 브랜치에 push |

규칙 세 가지
1. **내 담당 파일만 고친다.** 다른 사람 파일을 고쳐야 하면 Claude Code가 먼저 물어봐요. 그때 팀원에게 말하기.
2. **잘 되면 바로 `/save`.** 작게 자주 저장해야 망가져도 되돌릴 수 있어요.
3. **내 브랜치에만 올린다.** main 에 올리거나 PR 을 만들지 않아요. main 에 합치는 건 팀장이 정해요.

## 5. 막혔을 때

| 증상 | 해결 |
|---|---|
| 화면이 하얗고 아무것도 없음 | 브라우저에서 F12 → Console 의 빨간 글씨를 복사해서 Claude Code에 붙여넣기 |
| "Supabase 환경변수가 없습니다" | `.env.local` 파일이 없거나 값이 비어 있음 → 2번 다시 |
| `/save` 에서 검사 실패 | Claude Code가 고치게 두고, 3번 넘게 실패하면 팀에 공유 |
| 같은 실수를 계속 반복함 | 대화가 길어진 것. `/clear` 로 새로 시작하고 할 일 목록의 프롬프트를 다시 붙여넣기 |
| push 가 거절됨 | `/start` 를 먼저 하고 다시 `/save` |

## 6. 참고: 먼저 만들어 둔 화면

`feature/frontend-session` 브랜치에 계획 목록·등록·수정, 자격증 검색, 온보딩 화면을 먼저 만들어 본 코드가 있어요.
main 과 구조가 조금 달라서 그대로 합치지 않고 **참고용**으로 둡니다. 할 일 목록의 프롬프트가 Claude Code에게 이 코드를 참고하라고 알려줘요.
