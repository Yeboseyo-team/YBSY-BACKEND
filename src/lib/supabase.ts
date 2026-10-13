import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Supabase 환경변수가 없습니다. .env.local에 VITE_SUPABASE_URL과 VITE_SUPABASE_PUBLISHABLE_KEY를 설정하세요.",
  );
}

/**
 * 앱 전체에서 하나만 쓰는 Supabase 클라이언트.
 * - persistSession: 세션을 localStorage에 저장 → 새로고침해도 로그인 유지
 * - autoRefreshToken: access token 만료 전에 자동 갱신
 * - detectSessionInUrl + pkce: 이메일 인증/구글 로그인/비밀번호 재설정 링크의 ?code= 를 자동으로 세션으로 교환
 */
export const supabase = createClient<Database>(url, key, {
  auth: {
    flowType: "pkce",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
