# 프론트 B 할 일 목록 — `feature/frontend-jw`

담당: 부담 예보(S-08), 계획 목록·등록·수정(S-09), 사전 검토 시트(S-11)
내 파일: `src/features/{forecast,plans,preview}`, `src/pages/{HomePage,PlansPage,PlanNewPage,PlanEditPage}.tsx`

- 순서대로 하나씩. 하나 끝나면 화면을 직접 눌러 확인 → `/save` → 다음 작업.
- 프롬프트는 회색 상자 안 내용을 **통째로 복사**해서 Claude Code에 붙여넣으세요.
- 다 끝낸 작업은 `[ ]` 를 `[x]` 로 바꿔 두면 Claude Code가 다음 작업을 알아요.

참고 코드 (먼저 만들어 본 버전, 그대로 복사 말고 참고만)
`origin/feature/frontend-session` 의 `src/features/plans/`, `src/pages/Plan*.tsx`, `src/features/forecast/components/ForecastPreview.tsx`, `src/features/forecast/preview-text.ts`

---

## [x] 0. 실행 확인 (10/14)

`pnpm dev` → 로그인 화면 이메일 칸에 `yebo@hakgi.test` / 비밀번호 `hakgi1234` (프론트 A 1번 이후엔 데모 로그인 버튼) → 메뉴 "예보", "계획"에 🚧 상자가 보이면 끝.

## [x] 1. 계획 데이터 불러오기·저장 (F-02) — 백엔드가 만들어 둠 (10/14)

할 일 없음. 아래 파일을 가져다 쓰면 돼요 (테스트·DB 시험 완료).
- `src/features/plans/api.ts`: `usePlans()`(목록), `usePlan(id)`(하나), `useCreatePlan()`, `useUpdatePlan()`, `useDeletePlan()`, 오류 문구 `toPlanMessage(error)`, 입력 타입 `PlanInput`
  - 저장·수정·삭제하면 목록과 예보 그래프가 바로 바뀌어요. 수정·삭제는 화면에 먼저 반영되고 실패하면 되돌아가요.
  - 30개가 차 있으면 추가가 `PlanLimitError` 로 막혀요. 수업이 아니면 학점은 자동으로 비워져요.
- `src/features/plans/defaults.ts`: `defaultHoursPerWeek(유형, 단계, 학점)`(F-03), `groupPlansByType(plans)`(FR-02-2), `canAddPlan(개수)`·`MAX_PLANS`, `PLAN_TYPE_LABEL`·`LOAD_LEVEL_LABEL`(화면 글자)

## [ ] 2. 계획 목록 화면 (S-09, ~10/15)

```
docs/tasks/frontend-jw.md 의 2번 작업을 해줘.
src/pages/PlansPage.tsx 의 🚧 상자를 실제 계획 목록으로 바꿔줘.
- 디자인은 docs/design-pc/PcPlanList.html 과 PcDeleteConfirm.html 을 열어서 최대한 비슷하게.
- 유형(수업·활동·프로젝트)별로 묶어서 보여주고, 각 계획에 수정 버튼(/plans/:id/edit)과 삭제 버튼.
- 삭제는 확인 창을 띄운 뒤에.
- 계획이 30개면 "계획 추가" 버튼을 막고 이유를 보여줘 (명세서: 화면에서 막기). 판단은 canAddPlan(plans.length).
- 데이터는 src/features/plans/api.ts 의 usePlans, 삭제는 useDeletePlan, 오류 문구는 toPlanMessage 를 써. 묶기·정렬은 src/features/plans/defaults.ts 의 groupPlansByType, 글자는 PLAN_TYPE_LABEL·LOAD_LEVEL_LABEL.
- 이 파일들은 백엔드가 만든 거라 고치지 말고, 바꿔야 하면 나에게 말해줘.
```

## [ ] 3. 계획 등록 화면 + 기본 시간 (S-09, F-02·F-03, ~10/15)

```
docs/tasks/frontend-jw.md 의 3번 작업을 해줘.
src/pages/PlanNewPage.tsx 에 계획 등록 폼을 만들어줘. 폼 부분은 src/features/plans/components/PlanForm.tsx 로 분리해서 수정 화면에서도 재사용할 수 있게.
- 디자인: docs/design-pc/PcPlan.html
- 입력: 계획명, 유형, (수업이면) 학점, 시작·종료 주차(1~16), 적음·보통·많음, 주당 시간
- 적음·보통·많음을 누르면 주당 시간이 자동으로 채워져야 해 (명세서 F-03, 3학점 수업 보통 = 6시간). 값은 src/features/plans/defaults.ts 의 defaultHoursPerWeek(유형, 단계, 학점) 를 써 (직접 계산하지 마). 사용자가 시간을 직접 고치면 단계를 "custom"(직접 입력)으로 (FR-03-3).
- React Hook Form + Zod 로 검사 (계획명 1~30자, 시작 주차 ≤ 종료 주차, 1~16주차, 주당 0.5~60시간 0.5 단위, 수업이면 학점 1~4)
- 저장은 src/features/plans/api.ts 의 useCreatePlan, 오류 문구는 toPlanMessage. 저장하면 /plans 로 이동
- 사전 검토 버튼 자리는 만들어 두기만 (6번에서 연결)
```

## [ ] 4. 계획 수정 화면 (S-09, ~10/15)

```
docs/tasks/frontend-jw.md 의 4번 작업을 해줘.
src/pages/PlanEditPage.tsx 에서 주소의 id 로 계획을 불러와 PlanForm 을 재사용해 수정·삭제할 수 있게 해줘.
불러오기는 usePlan(id) (없는 id 면 data 가 null), 저장은 useUpdatePlan, 삭제는 useDeletePlan (모두 src/features/plans/api.ts).
디자인: docs/design-pc/PcPlanEdit.html. 없는 id 면 "계획을 찾을 수 없어요" 안내.
```

## [x] 5. 부담 예보 그래프 — 홈 (S-08, F-05, ~10/17) ★ 발표 핵심

```
docs/tasks/frontend-jw.md 의 5번 작업을 해줘.
src/pages/HomePage.tsx 를 부담 예보 화면으로 만들어줘.
- 데이터와 계산은 src/features/forecast/api.ts 의 useForecastData() 하나로 끝나 (백엔드가 만들어 둠). 화면에서 따로 계산하지 마.
  돌려주는 값: status("loading" → 화면 틀, "error" → 다시 시도 버튼(refetch), "empty" → 빈 상태, "ready"), forecast(16주 예보), deadlines(마감 알림), currentWeek(이번 주), profile.available_hours(점선), input(사전 검토용)
- 디자인: docs/design-pc/index.html (계획 없으면 PcEmptyMain.html, 실패하면 PcLoadError.html)
- 요약 문구 (예: "폭풍 2주 · 흐림 3주"), 16주 막대그래프(Recharts), 맑음·흐림·폭풍 색 구분, 가용 시간 점선
- 막대를 누르면 그 주의 상세 내역(무엇이 몇 시간인지)
- 그래프 위에 접수 마감 알림 배너 (F-07, 팀 결정: 이메일 대신 화면 알림): useForecastData() 의 deadlines(= calc.ts 의 upcomingDeadlines 결과)가 있으면 "SQLD 제63회 접수 마감 D-3" 처럼 마감이 가까운 순서로 보여주고 [접수하러 가기]는 source_url 로. D-day 글자는 formatDday 사용. 없으면 배너 숨김. 데모 계정 woonyoung@hakgi.test(박운영)는 SQLD(10/16 접수 마감)가 마감 전까지 떠야 해 (오늘 날짜로 계산하므로 D-숫자는 날마다 바뀜).
- 데모 계정 yebo@hakgi.test 로 확인했을 때 명세서 4.5 검증 예시와 숫자가 맞는지 확인해줘.
```

## [ ] 6. 사전 검토 시트 (S-11, F-06, ~10/17) ★ 우리 서비스만의 차별점

```
docs/tasks/frontend-jw.md 의 6번 작업을 해줘.
src/features/preview/PreviewSheet.tsx 를 완성해줘.
- calc.ts 의 previewForecast(useForecastData().input, [초안 계획]), comparePreview 를 써서 '지금'과 '추가했을 때' 그래프를 겹쳐 보여줘. 서버 호출 없이 계산만 (NFR-PERF-2).
- [추가하기]의 실제 저장은 계획이면 useCreatePlan, 자격증이면 useAddCertificate (src/features/certificates/api.ts) 를 써.
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
