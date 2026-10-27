-- 10/27: 계획마다 주로 공부·과제를 하는 요일 (0=월 … 6=일). null 이면 아무 요일이나 (쓸 수 있는 시간 비율대로)
alter table public.plans add column study_days smallint[];
alter table public.plans add constraint plans_study_days_check
  check (study_days is null or (cardinality(study_days) between 1 and 7 and study_days <@ array[0,1,2,3,4,5,6]::smallint[]));
