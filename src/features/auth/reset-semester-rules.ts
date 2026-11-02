// 이번 학기 초기화 규칙·문구 (DB 호출 없음)
/** 테스트용 체험 계정 정새내만 데모 계정 중 초기화할 수 있어요 (DB 함수도 같은 기준) */
const RESETTABLE_DEMO_EMAIL = "newbie@hakgi.test";

/** 이번 학기 초기화를 쓸 수 있는 계정인지 — 시연 데이터가 지워지지 않게 다른 데모 계정(@hakgi.test)은 막아요 */
export function canResetSemester(email: string | undefined): boolean {
  return !email?.endsWith("@hakgi.test") || email === RESETTABLE_DEMO_EMAIL;
}

/** 초기화 오류를 화면 안내 문구로 변환 */
export function toResetSemesterMessage(error: unknown): string {
  if (error instanceof TypeError) return "서버에 연결하지 못했어요. 인터넷 연결을 확인하세요.";
  if ((error as { code?: string } | null)?.code === "P0042") return "시연용 데모 계정은 초기화할 수 없어요.";
  return "이번 학기를 초기화하지 못했어요. 잠시 뒤 다시 시도하세요.";
}
