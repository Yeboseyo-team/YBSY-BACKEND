---
description: 저장 — 검사 통과 후 커밋하고 내 브랜치에 push
---
지금까지 한 작업을 저장하려고 해. 아래 순서대로 해줘.

1. `git branch --show-current` 로 브랜치를 확인해. `main` 이면 절대 커밋하지 말고 멈춰.
2. `git status` 와 `git diff --stat` 으로 바뀐 파일을 보여줘. CLAUDE.md 의 담당 구역 밖 파일이 있으면 무엇인지 알려주고 계속할지 물어봐.
3. `.env.local` 이나 비밀 키(service_role, secret, password 같은 값)가 들어가지 않았는지 확인해.
4. `pnpm lint && pnpm typecheck && pnpm test && pnpm build` 를 실행해. 실패하면 내 담당 파일 안에서 고치고 다시 실행해. 세 번 고쳐도 실패하면 멈추고 원인을 쉽게 설명해줘.
5. 커밋 메시지는 `feat/fix/test/chore: 한국어 설명` 형식으로 무엇을 했는지 한 줄로 써서 커밋해.
6. `git pull --rebase origin <내 브랜치>` 후 `git push origin <내 브랜치>` 해. force push 는 절대 하지 마.
7. docs/tasks 의 내 할 일 목록에서 끝난 작업을 `[x]` 로 바꿨는지 확인하고, 안 바꿨으면 바꿔서 같이 커밋해.
8. 마지막에 "무엇을 저장했는지" 2~3줄로 알려줘.
