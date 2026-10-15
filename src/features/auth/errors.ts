import { isAuthError } from "@supabase/supabase-js";

/** Supabase Auth 에러를 사용자에게 보여줄 한국어 문장으로 바꿉니다 (Google 로그인·데모 로그인). */
export function toAuthMessage(error: unknown): string {
  if (isAuthError(error)) {
    switch (error.code) {
      case "invalid_credentials":
        return "데모 계정으로 로그인하지 못했어요. 데모 데이터가 만들어져 있는지 백엔드 담당에게 확인하세요.";
      case "over_request_rate_limit":
        return "요청이 너무 많아요. 잠시 뒤 다시 시도하세요.";
      case "otp_expired":
      case "flow_state_not_found":
      case "flow_state_expired":
      case "bad_code_verifier":
      case "bad_oauth_state":
        return "로그인 정보가 만료되었거나 다른 브라우저에서 열렸어요. 로그인 화면에서 다시 시도하세요.";
      case "session_not_found":
      case "refresh_token_not_found":
        return "로그인이 만료되었어요. 다시 로그인하세요.";
      case "provider_disabled":
        return "지금은 Google 로그인을 쓸 수 없어요. 잠시 뒤 다시 시도하세요.";
    }
  }
  if (error instanceof TypeError) {
    return "서버에 연결하지 못했어요. 인터넷 연결을 확인하세요.";
  }
  return "로그인하지 못했어요. 잠시 뒤 다시 시도하세요.";
}
