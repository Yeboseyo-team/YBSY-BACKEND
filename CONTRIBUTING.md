# 협업 가이드

## 1. 작업 흐름

1. GitHub Issues에 할 일을 만든다 (템플릿 사용)
2. `main`에서 브랜치를 만든다
3. 작업 → 커밋 → push
4. PR을 열고 이슈를 연결한다 (`Closes #이슈번호`)
5. 리뷰 1명 승인 + CI 통과 → **Squash and merge**
6. 머지 후 브랜치 삭제

```bash
git switch main
git pull
git switch -c feature/12-login-page
# 작업...
git push -u origin feature/12-login-page
```

## 2. 브랜치 이름

`타입/이슈번호-짧은-설명`

| 타입 | 용도 | 예시 |
|---|---|---|
| `feature/` | 새 기능 | `feature/12-login-page` |
| `fix/` | 버그 수정 | `fix/20-signup-validation` |
| `chore/` | 설정, 빌드, 의존성 | `chore/5-eslint-setup` |
| `docs/` | 문서 | `docs/readme-update` |

## 3. 커밋 메시지 (Conventional Commits)

`타입: 무엇을 했는지`

| 타입 | 의미 |
|---|---|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `refactor` | 동작 변화 없는 코드 개선 |
| `style` | 포맷, 세미콜론 등 (로직 변화 없음) |
| `docs` | 문서 |
| `test` | 테스트 |
| `chore` | 빌드, 설정, 패키지 |
| `db` | Supabase migration |

예: `feat: 로그인 페이지 UI 추가`, `db: posts 테이블 생성`

## 4. PR 규칙

- PR 하나에는 **하나의 목적**만 (작게 자주 올리기)
- 화면 변경이 있으면 스크린샷 또는 Vercel 프리뷰 링크 첨부
- 리뷰 요청 후 하루 안에 리뷰해주기
- 충돌은 PR 올린 사람이 해결

## 5. Supabase 규칙 ⚠️

- **대시보드에서 테이블/컬럼을 직접 수정하지 않는다**
- 스키마 변경은 migration 파일로 만들어 PR에 포함한다
  ```bash
  supabase migration new create_posts_table
  # supabase/migrations/ 에 생긴 SQL 파일 작성
  supabase db reset        # 로컬에 적용해서 확인
  ```
- 스키마 변경 후 타입 재생성해서 같이 커밋
  ```bash
  supabase gen types typescript --local > src/types/database.ts
  ```
- 새 테이블은 **RLS를 처음부터 켠다**
- 프론트엔드에는 anon(publishable) 키만 사용. **service_role / secret 키는 절대 커밋·프론트 사용 금지**

## 6. 환경 변수

- `.env.example`에 키 이름만 적고, 실제 값은 팀 채널에서 공유
- `.env`, `.env.local`은 절대 커밋하지 않는다
