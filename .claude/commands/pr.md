---
description: 하루 마무리 — 내 브랜치를 main 으로 PR
---
오늘 작업을 main 에 합치려고 PR 을 만들려고 해.

1. 저장 안 한 변경이 있으면 먼저 `/save` 와 같은 순서로 저장해.
2. `git fetch origin && git merge origin/main` 으로 main 을 한 번 더 합치고, 충돌이 있으면 해결한 뒤 검사(`pnpm lint && pnpm typecheck && pnpm test && pnpm build`)를 다시 통과시켜 push 해.
3. `gh` 명령이 있으면 `gh pr create --base main` 으로 PR 을 만들어. 본문은 .github/pull_request_template.md 형식으로, 오늘 한 일과 확인 방법을 쉬운 한국어로 채워. 이미 열린 PR 이 있으면 새로 만들지 말고 링크만 알려줘.
4. `gh` 가 없으면 https://github.com/Yeboseyo-team/ybsy-backend/compare/main...<내 브랜치>?expand=1 주소와 PR 본문으로 붙여넣을 내용을 알려줘.
5. 마지막에 "리뷰어에게 리뷰 요청하고, CI 통과 + 승인 후 Squash and merge" 라고 알려줘. 내가 직접 main 에 merge 하지는 마.
