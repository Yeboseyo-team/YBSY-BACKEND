# 학기예보 더미데이터

요구사항 명세서(2026-10-13)의 4장 부담 산출 규칙과 5장 데이터 요구사항에 맞춘 데이터입니다.

## 파일 위치

| 파일 | 용도 | 담당 |
|---|---|---|
| `supabase/migrations/20261013082220_init_schema.sql` | 테이블 4개, RLS, 가입 시 profiles 자동 생성 | 백엔드 |
| `supabase/migrations/20261013090000_align_requirements.sql` | 명세서 5장 반영 (학점·단계 컬럼, 30개 상한, 마감 회차 차단 등) | 백엔드 |
| `supabase/seed.sql` | `supabase db reset` 때 자동 실행되는 시드 | 백엔드 |
| `src/mocks/dummy-data.ts` | Supabase 없이 화면 개발용 목데이터, 타입, 예상 예보 결과 | 프론트 A·B |
| `scripts/generate-dummy.mjs` | **원본.** 위 seed.sql, dummy-data.ts를 같은 데이터로 생성 | 공용 |

데이터를 고칠 땐 `scripts/generate-dummy.mjs`만 수정하고 `node scripts/generate-dummy.mjs`를 실행하세요.
생성기는 DB 제약(계획명 30자, 주당 0.5~60시간 0.5 단위, 수업 학점 1~4 등)에 어긋나는 더미가 있으면 바로 실패합니다.
seed.sql과 dummy-data.ts는 직접 고치지 마세요 (둘이 어긋남).

## 데모 계정 (비밀번호 공통 `hakgi1234!`)

> 서울 프로젝트(`hxnaobwybllgdcvnwimo`)에도 이 시드가 들어가 있어서 배포된 앱에서 바로 로그인해 시연할 수 있습니다.
> 공통 비밀번호라 더미 외의 실제 데이터는 이 계정에 넣지 마세요.

| 이메일 | 이름 | 유형 | 예보 결과 | 테스트 포인트 |
|---|---|---|---|---|
| yebo@hakgi.test | 김예보 | 취업 준비생, **시연 주인공** | 폭풍 1 (8주차) · 흐림 6 | 명세서 4.5 검증 예시와 동일 |
| jiwon@hakgi.test | 이지원 | 대외활동 지원 예정자 | 폭풍 1 · 흐림 7 | 적음·많음·직접 입력 단계, 1학점 수업 |
| woonyoung@hakgi.test | 박운영 | 학생회 운영진, SQLD+ADsP 겹침 | 폭풍 0 · 흐림 4 | **8주차 부담률 정확히 1.00 → 흐림** (경계값) |
| empty@hakgi.test | 최수강 | 계획 없음 | 전부 0 | 빈 상태 화면 (FR-05-6) |

## 명세서와 맞춰둔 값

- 학기: 2026-08-31(월) 시작, 16주, 중간 8주차(10/19~25), 기말 15주차
- **김예보 = 명세서 4.5 검증 예시**: 3학점 수업 5과목(보통, 각 6h) + 프로그래밍 학회(보통, 4h) + 정보처리기사 4회 필기(주 8h), 가용 50h
  - 정보처리기사 시험 11/28 = 13주차, 준비 6주 → **8~13주차** (4.2: 시험 주 포함 E−N+1 ~ E)
  - 8주차 = 6×5×1.5 + 4 + 8 = **57h, 57÷50 = 1.14 폭풍**
- `previewPlan`(대외 공모전 출전, 9~10주, 주 10h)을 사전 검토로 넣으면 **폭풍 1주 → 3주 (9, 10주차 추가)** (FR-06-3 예시와 같은 형식)
- 정보처리기사 접수 마감 10/22 → 마감 3일 전 알림(F-07) 테스트
- 정보처리기사 회차 3개(3회 실기·4회 필기·2027년 1회) → 회차 추천(F-09) 테스트. 3회 실기는 접수 마감이 지나서 앱에서는 선택 불가(FR-04-2)
- 2027년 1회 필기는 시험이 학기 밖이라 "이번 학기 범위 밖" 표시(FR-04-6) 테스트

## F-03 기본값 (명세서 3장 표, 팀 확정 필요)

| 유형 | 적음 | 보통 | 많음 |
|---|---|---|---|
| 수업 (학점당) | 1.5 | 2 | 3 |
| 활동 | 2 | 4 | 8 |
| 프로젝트 | 3 | 6 | 10 |

`defaultHours(type, level, credits)`로 계산하세요. 3학점 수업 보통 = 6시간입니다.
기본값과 다른 시간을 직접 넣으면 `load_level = 'custom'`입니다.

## 프론트에서 쓰는 법

```ts
import { plans, expectedForecast, expectedForecastWithPreview, previewPlan, defaultHours, LEVEL_LABEL } from '@/mocks/dummy-data';

const YEBO = 'a0000000-0000-4000-8000-000000000001';
const myPlans = plans.filter((p) => p.user_id === YEBO);
const weeks = expectedForecast[YEBO].weeks; // Recharts BarChart data로 바로 사용 (week, total, level)
```

`expectedForecast`는 명세서 4장 규칙으로 계산한 정답값입니다. `src/features/forecast/calc.ts`를 만들면 단위 테스트 기대값으로 쓰세요(NFR-MAINT-1).
판정은 반올림 전 값으로 하고(4.4), `total`·`ratio`는 화면 표시용으로 소수점 첫째 자리까지 반올림돼 있습니다.

## DB가 막아 주는 것 (앱에서 에러 처리 필요)

| 상황 | 에러 | `hint` |
|---|---|---|
| 계획 31번째 추가 (FR-02-5) | 계획은 최대 30개까지 등록할 수 있어요… | `plan_limit` |
| 접수 마감된 회차 선택 (FR-04-2) | 접수가 마감된 회차예요… | `round_closed` |

supabase-js 에러 객체의 `error.hint`로 구분하면 됩니다.

## 주의

- **자격증 날짜는 전부 더미입니다.** 실제 배포 전 `source_url`의 공식 공고 기준으로 교체해야 합니다(NFR-LEGAL-2).
- `profiles.available_hours`, `semester_start`는 null 허용입니다. null이면 온보딩으로 보냅니다(FR-01-11, 데모 계정은 값이 채워져 있음).
- 자격증 목록(`certificates`)은 로그인한 사용자만 읽을 수 있습니다(5.5). 로그인 화면에서는 조회하지 마세요.
