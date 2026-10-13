# 프론트 A 할 일 목록 — `feature/frontend-ge`

담당: 앱 뼈대·라우트·가드, 레이아웃, 로그인(S-01)·인증 처리(S-06)·온보딩(S-07), 자격증 선택(S-10), 설정(S-12), 개인정보처리방침, 404
내 파일: 루트 설정 파일, `src/App.tsx`, `src/main.tsx`, `src/routes`, `src/lib`, `src/components/layout`, `src/features/{auth,settings,certificates}`, 내 화면의 `src/pages/*`

- 순서대로 하나씩. 하나 끝나면 화면을 직접 눌러 확인 → `/save` → 다음 작업.
- 프롬프트는 회색 상자 안 내용을 **통째로 복사**해서 Claude Code에 붙여넣으세요.
- 다 끝낸 작업은 `[ ]` 를 `[x]` 로 바꿔 두면 Claude Code가 다음 작업을 알아요.
- `src/App.tsx` 에는 두 사람 화면의 주소가 이미 다 연결돼 있어요. 프론트 B 화면 주소는 바꾸지 마세요.

참고 코드 (먼저 만들어 본 버전, 그대로 복사 말고 참고만)
`origin/feature/frontend-session` 의 `src/features/certificates/`, `src/pages/CertificateSearchPage.tsx`, `src/pages/OnboardingPage.tsx`, `src/features/auth/components/SemesterForm.tsx`, `src/features/auth/semester.ts`

---

## [ ] 0. 실행 확인 (10/14)

`pnpm dev` → 데모 로그인 `yebo@hakgi.test` → 메뉴 "자격증", 오른쪽 위 설정 아이콘에 🚧 상자가 보이면 끝.

## [ ] 1. 로그인 정리 — Google만 (S-01, F-01, ~10/14)

```
docs/tasks/frontend-ge.md 의 1번 작업을 해줘.
팀 결정(docs/REQUIREMENTS.md 변경 이력, docs/AUTH.md)대로 로그인은 Google만 남겨줘.
- src/pages/LoginPage.tsx: Google 버튼 + 개인정보처리방침 링크(/privacy). VITE_DEMO_LOGIN=true 일 때만 데모 로그인 버튼 (src/features/auth/demo.ts 사용)
- 이메일 회원가입·비밀번호 찾기·새 비밀번호 화면(S-02~S-05)과 App.tsx 의 해당 주소, 안 쓰게 되는 코드는 지워줘.
- 디자인: docs/design-pc/PcLogin.html
- 지우기 전에 무엇을 지울지 목록을 먼저 보여줘.
```

## [ ] 2. 온보딩 + 온보딩 가드 (S-07, F-01, ~10/14)

```
docs/tasks/frontend-ge.md 의 2번 작업을 해줘.
1) src/routes/guards.tsx 에 가드를 추가해줘: 로그인했지만 가용 시간·학기 시작일·개인정보 동의 중 하나라도 비어 있으면 /onboarding 으로 보내기. 판단은 src/features/forecast/calc.ts 의 isSemesterReady 와 profiles.privacy_agreed_at 을 써. App.tsx 의 TODO 위치에 연결.
2) src/pages/OnboardingPage.tsx 를 완성해줘: 주당 가용 시간, 학기 시작일, 중간·기말 주차, 개인정보 수집·이용 동의(필수). 저장하면 profiles 에 기록하고 홈(/)으로.
- 디자인: docs/design-pc/PcOnboarding.html
- 참고: origin/feature/frontend-session 의 src/features/auth/components/SemesterForm.tsx, semester.ts (git show 로 읽기)
- 데모 계정 newbie@hakgi.test(온보딩 전)로 들어가면 온보딩이 뜨는지 확인해줘.
```

## [ ] 3. 인증 처리 화면 확인 (S-06, ~10/14)

```
docs/tasks/frontend-ge.md 의 3번 작업을 해줘.
src/pages/AuthCallbackPage.tsx 가 Google 로그인 후 처리 중 표시, 실패 시 안내(docs/design-pc/PcAuthCallback.html)를 제대로 하는지 확인하고, 이메일 로그인 관련 남은 코드가 있으면 정리해줘.
```

## [ ] 4. 자격증 선택 (S-10, F-04, ~10/15) ★

```
docs/tasks/frontend-ge.md 의 4번 작업을 해줘.
src/pages/CertificatesPage.tsx 를 자격증 선택 화면으로 만들어줘. 데이터 훅은 src/features/certificates/api.ts 에.
- 디자인: docs/design-pc/PcCertificate.html, PcMyCertificates.html
- 자격증 검색, 회차별 접수 기간·시험일, D-day, 준비 기간·주당 학습 시간, 출처 링크(source_url)
- 회차를 고르면 user_certificates 에 저장, 내가 고른 자격증 목록과 삭제
- 접수 마감된 회차는 선택 못 하게 (화면에서 막기)
- 타입은 src/types/database.ts 의 Certificate, UserCertificate 를 써.
- 참고: origin/feature/frontend-session 의 src/features/certificates/, src/pages/CertificateSearchPage.tsx
```

## [ ] 5. 자격증에 사전 검토 연결 (F-06, ~10/17, 프론트 B 6번이 끝난 뒤)

```
docs/tasks/frontend-ge.md 의 5번 작업을 해줘.
먼저 git fetch origin && git merge origin/main 으로 프론트 B 의 사전 검토 시트를 받아와.
자격증 회차를 저장하기 전에 src/features/preview/PreviewSheet.tsx 를 열어 '추가했을 때' 예보를 보여주고, [추가하기]일 때만 저장해줘.
PreviewSheet 파일 자체는 프론트 B 담당이라 고치지 말고, 바꿔야 하면 나에게 말해줘.
```

## [ ] 6. 설정 (S-12, ~10/16)

```
docs/tasks/frontend-ge.md 의 6번 작업을 해줘.
src/pages/SettingsPage.tsx 에 학기 설정 수정(가용 시간·시작일·시험 주차), 이름 수정, 로그아웃을 만들어줘. 온보딩 폼을 재사용해.
디자인: docs/design-pc/PcSettings.html
```

## [ ] 7. 개인정보처리방침·404·레이아웃 다듬기 (~10/18)

```
docs/tasks/frontend-ge.md 의 7번 작업을 해줘.
- src/pages/PrivacyPage.tsx: docs/design-pc/PcPrivacy.html 과 명세서 NFR-LEGAL 내용으로 채우기
- 상단 메뉴(src/components/layout/AppShell.tsx)를 docs/design-pc/index.html 상단과 맞추고 휴대폰 폭(390px)에서도 깨지지 않게
- 마지막으로 pnpm lint, typecheck, test, build 가 모두 통과하는지 확인해줘.
```
