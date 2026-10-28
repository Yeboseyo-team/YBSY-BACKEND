-- 10/26: 9학점 프로젝트형 수업(캡스톤 등) 지원
-- 1) 학점 상한 6 → 12
-- 2) 시험 없는 수업(발표·과제로 평가): 시험 주간 1.5배를 빼고, 벼락치기는 끝나는 날 전 2주에 몰림 (calc.ts)
alter table public.plans drop constraint plans_credits_check;
alter table public.plans add constraint plans_credits_check check (credits between 1 and 12);

alter table public.plans add column no_exam boolean not null default false;
alter table public.plans add constraint plans_no_exam_only_class check (not no_exam or type = 'class');
