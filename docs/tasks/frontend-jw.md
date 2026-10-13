# 프론트 B 할 일 목록 — `feature/frontend-jw`

담당: 부담 예보(S-08), 계획 목록·등록·수정(S-09), 사전 검토 시트(S-11)
내 파일: `src/features/{forecast,plans,preview}`, `src/pages/{HomePage,PlansPage,PlanNewPage,PlanEditPage}.tsx`

- 순서대로 하나씩. 하나 끝나면 화면을 직접 눌러 확인 → `/save` → 다음 작업.
- 프롬프트는 회색 상자 안 내용을 **통째로 복사**해서 Claude Code에 붙여넣으세요.
- 다 끝낸 작업은 `[ ]` 를 `[x]` 로 바꿔 두면 Claude Code가 다음 작업을 알아요.

참고 코드 (먼저 만들어 본 버전, 그대로 복사 말고 참고만)
`origin/feature/frontend-session` 의 `src/features/plans/`, `src/pages/Plan*.tsx`, `src/features/forecast/components/ForecastPreview.tsx`, `src/features/forecast/preview-text.ts`

---

## [ ] 0. 실행 확인 (10/14)

`pnpm dev` → 로그인 화면 이메일 칸에 `yebo@hakgi.test` / 비밀번호 `hakgi1234` (프론트 A 1번 이후엔 데모 로그인 버튼) → 메뉴 "예보", "계획"에 🚧 상자가 보이면 끝.

## [ ] 1. 계획 데이터 불러오기·저장 (F-02, ~10/15)

```
docs/tasks/frontend-jw.md 의 1번 작업을 해줘.
src/features/plans/api.ts 에 TanStack Query 훅을 만들어줘:
usePlans(목록), useCreatePlan, useUpdatePlan, useDeletePlan.
- 타입은 src/types/database.ts 의 Plan 을 써. 새 타입을 만들지 마.
- 저장·수정·삭제 후 목록이 바로 다시 불러와지게 해줘.
- origin/feature/frontend-session 의 src/features/plans/api.ts 를 git show 로 읽고 참고해도 돼. 지금 main 구조에 맞게 고쳐서 써.
- 테스트(src/features/plans/plans.test.ts)도 간단히 만들어줘.
끝나면 무엇을 만들었는지 비전공자에게 설명하듯 3줄로 알려줘.
```

## [ ] 2. 계획 목록 화면 (S-09, ~10/15)

```
docs/tasks/frontend-jw.md 의 2번 작업을 해줘.
src/pages/PlansPage.tsx 의 🚧 상자를 실제 계획 목록으로 바꿔줘.
- 디자인은 docs/design-pc/PcPlanList.html 과 PcDeleteConfirm.html 을 열어서 최대한 비슷하게.
- 유형(수업·활동·프로젝트)별로 묶어서 보여주고, 각 계획에 수정 버튼(/plans/:id/edit)과 삭제 버튼.
- 삭제는 확인 창을 띄운 뒤에.
- 계획이 30개면 "계획 추가" 버튼을 막고 이유를 보여줘 (명세서: 화면에서 막기).
- 1번에서 만든 usePlans 훅을 써.
```

## [ ] 3. 계획 등록 화면 + 기본 시간 (S-09, F-02·F-03, ~10/15)

```
docs/tasks/frontend-jw.md 의 3번 작업을 해줘.
src/pages/PlanNewPage.tsx 에 계획 등록 폼을 만들어줘. 폼 부분은 src/features/plans/components/PlanForm.tsx 로 분리해서 수정 화면에서도 재사용할 수 있게.
- 디자인: docs/design-pc/PcPlan.html
- 입력: 계획명, 유형, (수업이면) 학점, 시작·종료 주차(1~16), 적음·보통·많음, 주당 시간
- 적음·보통·많음을 누르면 주당 시간이 자동으로 채워져야 해 (명세서 F-03, 3학점 수업 보통 = 6시간). 기준값은 docs/DUMMY_DATA.md 와 명세서 F-03 을 따라.
- React Hook Form + Zod 로 검사 (시작 주차 ≤ 종료 주차 등)
- 저장하면 /plans 로 이동
- 사전 검토 버튼 자리는 만들어 두기만 (6번에서 연결)
```

## [ ] 4. 계획 수정 화면 (S-09, ~10/15)

```
docs/tasks/frontend-jw.md 의 4번 작업을 해줘.
src/pages/PlanEditPage.tsx 에서 주소의 id 로 계획을 불러와 PlanForm 을 재사용해 수정·삭제할 수 있게 해줘.
디자인: docs/design-pc/PcPlanEdit.html. 없는 id 면 "계획을 찾을 수 없어요" 안내.
```

## [ ] 5. 부담 예보 그래프 — 홈 (S-08, F-05, ~10/17) ★ 발표 핵심

```
docs/tasks/frontend-jw.md 의 5번 작업을 해줘.
src/pages/HomePage.tsx 를 부담 예보 화면으로 만들어줘.
- 계산은 src/features/forecast/calc.ts 의 calculateForecast 만 써. 화면에서 따로 계산하지 마.
- 데이터: 내 profile, plans, user_certificates, certificates 를 불러오는 훅을 src/features/forecast/api.ts 에 만들어줘.
- 디자인: docs/design-pc/index.html (계획 없으면 PcEmptyMain.html, 실패하면 PcLoadError.html)
- 요약 문구 (예: "폭풍 2주 · 흐림 3주"), 16주 막대그래프(Recharts), 맑음·흐림·폭풍 색 구분, 가용 시간 점선
- 막대를 누르면 그 주의 상세 내역(무엇이 몇 시간인지)
- 데모 계정 yebo@hakgi.test 로 확인했을 때 명세서 4.5 검증 예시와 숫자가 맞는지 확인해줘.
```

## [ ] 6. 사전 검토 시트 (S-11, F-06, ~10/17) ★ 우리 서비스만의 차별점

```
docs/tasks/frontend-jw.md 의 6번 작업을 해줘.
src/features/preview/PreviewSheet.tsx 를 완성해줘.
- calc.ts 의 previewForecast, comparePreview 를 써서 '지금'과 '추가했을 때' 그래프를 겹쳐 보여줘.
- 변화 요약 문구는 comparePreview 가 만든 문장을 그대로 써 (명세서 FR-06-3, 예: "폭풍 1주 → 3주 (9, 10주차 추가)")
- [추가하기] 누르면 저장, [취소]면 DB에 아무것도 저장하지 않기
- 계획 등록 화면(3번)의 사전 검토 버튼과 연결해줘.
- 자격증 화면(프론트 A)도 이 시트를 쓸 거라, props 모양을 바꾸면 끝날 때 알려줘.
- 참고: origin/feature/frontend-session 의 src/features/forecast/components/ForecastPreview.tsx, preview-text.ts
```

## [ ] 7. 마무리 (~10/18)

```
docs/tasks/frontend-jw.md 의 7번 작업을 해줘.
내 담당 화면들을 휴대폰 폭(390px)에서도 깨지지 않게 다듬고, 로딩 중·에러·빈 목록 상태를 빠짐없이 넣어줘.
마지막으로 pnpm lint, typecheck, test, build 가 모두 통과하는지 확인해줘.
```
