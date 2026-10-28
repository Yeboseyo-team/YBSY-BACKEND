-- 중간고사만·기말고사만 보는 수업 (10/28) — 예: 중간은 발표로 대체하고 기말만 보는 수업.
-- null 이면 중간·기말 둘 다(또는 no_exam 이면 시험 없음). 시험 있는 수업에만 넣을 수 있어요.
alter table public.plans add column exam_only text;
alter table public.plans add constraint plans_exam_only_check
  check (exam_only is null or (exam_only in ('midterm', 'final') and type = 'class' and not no_exam));
comment on column public.plans.exam_only is '이 시험만 봐요: midterm(중간만) / final(기말만). null 이면 둘 다';
