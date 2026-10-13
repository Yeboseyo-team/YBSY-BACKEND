-- 개인정보 수집·이용 동의 기록 (NFR-LEGAL-1)
-- 팀 결정(2026-10-13): 로그인은 Google만 씁니다. 회원가입 화면이 없어져서 동의는 온보딩(S-07)에서 받습니다.
-- privacy_agreed_at 이 null 이면 아직 동의하지 않은 사용자 → 온보딩으로 보냅니다 (FR-01-11과 같은 가드).

alter table public.profiles
  add column privacy_agreed_at timestamptz;

comment on column public.profiles.privacy_agreed_at is
  '개인정보 수집·이용 동의 시각. null 이면 미동의(온보딩 필요). 서버 시각으로 한 번만 기록';

-- 동의 시각은 화면이 보낸 값 대신 서버 시각으로 기록하고, 한 번 기록되면 바꾸거나 지울 수 없게 고정합니다.
-- 화면에서는 update({ privacy_agreed_at: new Date().toISOString() }) 처럼 아무 시각이나 보내면 됩니다.
create function public.stamp_privacy_agreed_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  if old.privacy_agreed_at is not null then
    new.privacy_agreed_at := old.privacy_agreed_at;
  elsif new.privacy_agreed_at is not null then
    new.privacy_agreed_at := now();
  end if;
  return new;
end;
$$;

create trigger profiles_privacy_agreed_at before update of privacy_agreed_at on public.profiles
  for each row execute function public.stamp_privacy_agreed_at();

-- 트리거 전용 함수라 /rest/v1/rpc 로 호출되지 않게 막습니다 (20261013090859_harden_functions 와 같은 처리)
revoke execute on function public.stamp_privacy_agreed_at() from public, anon, authenticated;
