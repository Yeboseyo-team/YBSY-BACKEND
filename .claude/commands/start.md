---
description: 작업 시작 — 내 브랜치 최신화, main 합치기, 오늘 할 일 안내
---
오늘 작업을 시작하려고 해. 아래 순서대로 해주고, 각 단계 결과를 쉬운 한국어로 짧게 알려줘.

1. `git branch --show-current` 로 지금 브랜치를 확인해. `feature/frontend-ge` 또는 `feature/frontend-jw` 가 아니면 멈추고 어느 브랜치로 바꿀지 물어봐.
2. `git status` 로 저장 안 한 변경이 있는지 봐. 있으면 무엇인지 보여주고, 먼저 `/save` 할지 물어봐.
3. `git pull --rebase origin <내 브랜치>` 로 내 브랜치를 최신으로 받아.
4. `git fetch origin && git merge origin/main` 으로 팀 main 의 작업을 합쳐. 충돌이 나면 내 담당 파일인지 확인하고, 남의 파일이면 고치지 말고 나에게 알려줘.
5. `package.json` 이나 `pnpm-lock.yaml` 이 바뀌었으면 `pnpm install` 을 해줘.
6. `docs/tasks/<내 브랜치 이름의 마지막 부분>.md` (예: frontend-jw.md) 를 읽고, 아직 `[ ]` 인 작업 중 가장 앞의 것을 알려줘. 그 작업의 프롬프트를 그대로 실행할지 물어봐.
