-- Supabase 보안·성능 점검(advisors) 결과 반영
-- 1) handle_new_user 는 가입 트리거 전용인데 /rest/v1/rpc 로도 호출 가능하게 열려 있음 → 실행 권한 회수
--    (트리거는 실행 권한과 무관하게 동작하므로 가입 시 profiles 자동 생성에는 영향 없음)
-- 2) set_updated_at 도 트리거 전용이라 같은 처리
-- 3) user_certificates.certificate_id 외래키에 인덱스 추가 (자격증 회차 삭제·조인 시 전체 스캔 방지)

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

create index if not exists user_certificates_certificate_id_idx
  on public.user_certificates (certificate_id);
