# 학기예보 더미데이터

## 파일 위치 (레포에 그대로 복사)

| 파일 | 용도 | 담당 |
|---|---|---|
| `supabase/migrations/20261013000000_init_schema.sql` | 테이블 4개 + RLS + 가입 시 profiles 자동 생성 | 백엔드 |
| `supabase/seed.sql` | `supabase db reset` 때 자동 실행되는 로컬 시드 | 백엔드 |
| `src/mocks/dummy-data.ts` | Supabase 없이 화면 개발용 목데이터 + 타입 + 예상 예보 결과 | 프론트 A·B |
| `scripts/generate-dummy.mjs` | **원본.** 위 seed.sql, dummy-data.ts를 같은 데이터로 생성 | 공용 |

데이터를 고칠 땐 `scripts/generate-dummy.mjs`만 수정하고 `node scripts/generate-dummy.mjs` 실행.
seed.sql과 dummy-data.ts는 직접 고치지 마세요 (둘이 어긋남).

## 데모 계정 (비밀번호 공통 `hakgi1234!`)

> 서울 프로젝트(`hxnaobwybllgdcvnwimo`)에도 이 시드가 들어가 있어서, 배포된 앱에서 바로 로그인해 시연할 수 있습니다.
> 공통 비밀번호라 더미 외의 실제 데이터는 이 계정에 넣지 마세요.

| 이메일 | 이름 | 유형 | 예보 결과 |
|---|---|---|---|
| yebo@hakgi.test | 김예보 | 취업 준비생, **시연 시나리오 주인공** | 과부하 1 (8주차) · 주의 4 |
| jiwon@hakgi.test | 이지원 | 대외활동 지원 예정자 | 과부하 1 · 주의 3 |
| woonyoung@hakgi.test | 박운영 | 학생회 운영진, SQLD+ADsP 준비 겹침 | 과부하 1 · 주의 3 |
| empty@hakgi.test | 최수강 | 계획 없음 (빈 화면 테스트) | 전부 0 |

## 시연 시나리오 (제안서 3장)과 맞춰둔 값

- 학기: 2026-08-31(월) 시작, 16주, 중간 8주차(10/19~25), 기말 15주차
- 김예보: 수업 5개 + 학회 + DB 팀플(6~10주) + 정보처리기사 4회 필기(11/28, 준비 7~12주, 주 8h)
- 8주차 = 중간고사(수업 ×1.5) + 정보처리기사 준비 → 53.5h / 50h = **107% 과부하**
- `previewPlan`(서포터즈, 9~14주, 주 10h)을 사전 검토로 넣으면 과부하 **1개 → 3개(8·9·10주)**
- 정보처리기사 접수 마감 10/22 → 마감 3일 전 알림(F-07) 테스트 가능
- 정보처리기사는 회차 3개(3회 실기·4회 필기·2027년 1회) → 회차 추천(F-09) 테스트용

## 프론트에서 쓰는 법

```ts
import { plans, certificates, expectedForecast, previewPlan, LEVEL_LABEL } from '@/mocks/dummy-data';

const YEBO = 'a0000000-0000-4000-8000-000000000001';
const myPlans = plans.filter((p) => p.user_id === YEBO);
const weeks = expectedForecast[YEBO].weeks; // Recharts BarChart data로 바로 사용 (week, total, level)
```

`expectedForecast`는 제안서 산출 기준으로 계산한 정답값이라, 산출 로직 모듈을 만들고 나면 단위 테스트 기대값으로 쓰면 됩니다.

## 주의

- **자격증 날짜는 전부 더미입니다.** 실제 배포 전 `source_url`의 공식 공고 기준으로 교체해야 합니다(제안서 8장 대응 방안).
- 제안서 대비 추가 컬럼: `profiles.display_name`, `profiles.midterm_week`, `profiles.final_week`, `certificates.default_study_hours`, `plans.updated_at`.
- `profiles.available_hours`, `semester_start`는 null 허용입니다. 가입 직후 null이면 온보딩 화면으로 보내는 용도입니다(데모 계정은 값이 채워져 있음).
- 중간·기말 주차는 `profiles.midterm_week`(기본 8), `profiles.final_week`(기본 15) 컬럼으로 저장됩니다.
- 확인: 실제 Postgres 16에서 migration + seed 2회 연속 실행 성공, RLS로 본인 계획만 조회됨을 검증.
