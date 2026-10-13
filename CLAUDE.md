# 학기예보 — Claude Code 작업 규칙

## 프로젝트
- 대학생 학기 부담 예측 서비스. 바이브코딩챌린지, 10/18 필수 기능 완료, 10/27 발표
- 나는 백엔드 담당. 설명은 항상 쉬운 한국어로
- 기준 문서: 요구사항 명세서(2026-10-13). 4장 산출 규칙, 5장 데이터

## 기술
- React 19 + Vite + TS, Supabase(Auth·Postgres), TanStack Query, React Hook Form + Zod, Tailwind v4 + shadcn/ui, pnpm
- Supabase 개발 프로젝트: hxnaobwybllgdcvnwimo (서울)
- 문서: docs/ARCHITECTURE.md(ERD·데이터 흐름·RLS), docs/AUTH.md(세션·Supabase 설정), docs/DUMMY_DATA.md(데모 계정·기준값)

## 규칙
- main에 직접 push·머지 금지. feature/* 브랜치 → PR (CONTRIBUTING.md 참고)
- 커밋 메시지: feat/fix/db/docs/test/chore: 한국어 설명
- DB 스키마 변경은 supabase/migrations/ 에 새 SQL 파일로. 대시보드에서 직접 수정 금지. 변경 후 src/types/database.ts 재생성
- 새 테이블은 RLS 필수. service_role/secret 키는 코드·커밋에 절대 넣지 않기
- .env.local 은 커밋 금지
- 더미데이터는 scripts/generate-dummy.mjs 만 고치고 node scripts/generate-dummy.mjs 로 재생성
- 부담 계산은 src/features/forecast/calc.ts 한 곳에서만
- 접수 마감 회차 선택 불가, 계획 30개 상한은 DB가 아닌 화면에서 막기

## 데모 계정 (비밀번호 hakgi1234)
yebo@hakgi.test(시연 주인공), jiwon@, woonyoung@, empty@(계획 없음), newbie@(온보딩 전)
