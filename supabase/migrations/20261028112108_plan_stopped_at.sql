-- 계획 그만두기 (10/28) — 지우지 않고 그만둔 날만 저장해요.
-- 지난 기록·지난 주 예보는 그대로 두고, 그만둔 날 뒤로는 예보에서 빠져요. 비우면(null) 다시 시작.
alter table public.plans add column stopped_at date;
comment on column public.plans.stopped_at is '그만둔 날 (이날까지만 예보에 넣음). null 이면 계속하는 중';
