-- 보안 점검(2026-10-22) 반영: RLS 위에 한 겹 더 막기
-- 1) 테이블 권한 줄이기 — Supabase 기본값은 anon·authenticated 에게 모든 권한(TRUNCATE 포함)을 줍니다.
--    RLS 가 행 단위로 막고 있지만, 필요 없는 권한은 아예 빼서 실수나 새 정책 누락에도 안전하게 합니다.
--    · anon(로그인 안 함): 자격증 회차 SELECT 만 남김 (깨우기 워크플로가 씀. RLS 로 결과는 빈 목록)
--    · authenticated: 자기 데이터 읽기·쓰기에 필요한 것만
revoke all on public.profiles, public.plans, public.certificates, public.user_certificates from anon;
grant select on public.certificates to anon;

revoke truncate, references, trigger on public.profiles, public.plans, public.certificates, public.user_certificates from authenticated;
revoke insert, update, delete on public.certificates from authenticated;   -- 회차는 팀이 대시보드·시드로만
revoke insert, delete on public.profiles from authenticated;               -- 프로필은 가입 트리거가 만들고 계정 삭제 때 함께 지워짐

-- 2) 계획 30개 상한 (FR-02-5) — 화면에서 먼저 막고, API 로 직접 넣는 경우를 DB 가 한 번 더 막습니다.
create function public.enforce_plan_limit()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (select count(*) from public.plans where user_id = new.user_id) >= 30 then
    raise exception '계획은 30개까지 넣을 수 있어요. 끝난 계획을 지운 뒤 다시 추가하세요.'
      using errcode = 'P0030';
  end if;
  return new;
end;
$$;

create trigger plans_limit before insert on public.plans
  for each row execute function public.enforce_plan_limit();

revoke execute on function public.enforce_plan_limit() from public, anon, authenticated;
