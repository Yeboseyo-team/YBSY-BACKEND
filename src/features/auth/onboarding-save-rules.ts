// 온보딩 2단계 저장 오류 문구 (DB 호출 없음)

/** DB 함수 save_onboarding_plans 오류를 화면 문장으로. 실패하면 아무것도 저장되지 않아요 */
export function toOnboardingSaveMessage(error: unknown): string {
  const nothingSaved = "아무것도 저장되지 않았으니 고친 뒤 다시 눌러 주세요.";
  if (error instanceof TypeError) return `서버에 연결하지 못했어요. 인터넷 연결을 확인하세요. ${nothingSaved}`;
  const { code, message = "" } = (error ?? {}) as { code?: string; message?: string };
  if (code === "P0030") return `계획은 30개까지 넣을 수 있어요. ${nothingSaved}`;
  if (code === "P0033") return `자격증은 20개까지 직접 추가할 수 있어요. ${nothingSaved}`;
  if (code === "P0043") return `접수가 끝난 자격증 회차가 있어요. 빼거나 다른 회차를 골라 주세요. ${nothingSaved}`;
  if (code === "23514") {
    return message.includes("certificates")
      ? `자격증의 준비 기간은 1~16주, 한 주 공부 시간은 1~40시간이에요. ${nothingSaved}`
      : `계획 내용을 확인해 주세요 (이름 1~30자, 시간 0.5~60, 학점 1~12). ${nothingSaved}`;
  }
  return `저장하지 못했어요. 잠시 뒤 다시 시도하세요. ${nothingSaved}`;
}
