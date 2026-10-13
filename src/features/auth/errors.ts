import { isAuthError } from "@supabase/supabase-js";

/** Supabase Auth 에러 코드를 사용자에게 보여줄 한국어 문장으로 바꿉니다. */
export function toAuthMessage(error: unknown): string {
  if (isAuthError(error)) {
    switch (error.code) {
      case "invalid_credentials":
        return "이메일 또는 비밀번호가 맞지 않습니다.";
      case "email_not_confirmed":
        return "이메일 인증이 아직 끝나지 않았습니다. 받은편지함에서 인증 메일의 링크를 눌러 주세요.";
      case "user_already_exists":
      case "email_exists":
        return "이미 가입된 이메일입니다. 로그인하거나 비밀번호를 재설정하세요.";
      case "weak_password":
        return "비밀번호가 너무 단순합니다. 8자 이상, 영문과 숫자를 섞어 주세요.";
      case "same_password":
        return "지금 쓰는 비밀번호와 다른 비밀번호를 입력하세요.";
      case "over_email_send_rate_limit":
        return "메일 발송 한도를 넘었습니다. 몇 분 뒤 다시 시도하세요.";
      case "over_request_rate_limit":
        return "요청이 너무 많습니다. 잠시 뒤 다시 시도하세요.";
      case "otp_expired":
      case "flow_state_not_found":
      case "flow_state_expired":
      case "bad_code_verifier":
        return "링크가 만료되었거나 다른 브라우저에서 열렸습니다. 같은 브라우저에서 다시 요청하세요.";
      case "session_not_found":
      case "refresh_token_not_found":
        return "로그인이 만료되었습니다. 다시 로그인하세요.";
      case "signup_disabled":
        return "지금은 신규 가입을 받지 않습니다.";
    }
  }
  if (error instanceof TypeError) {
    return "서버에 연결하지 못했습니다. 인터넷 연결을 확인하세요.";
  }
  return "요청을 처리하지 못했습니다. 잠시 뒤 다시 시도하세요.";
}
