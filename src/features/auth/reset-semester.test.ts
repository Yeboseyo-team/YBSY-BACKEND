import { describe, expect, it } from "vitest";
import { toResetSemesterMessage } from "./reset-semester";

describe("toResetSemesterMessage", () => {
  it("네트워크 오류(TypeError)일 때 알맞은 메시지를 반환합니다", () => {
    expect(toResetSemesterMessage(new TypeError("Failed to fetch"))).toBe(
      "서버에 연결하지 못했어요. 인터넷 연결을 확인하세요.",
    );
  });

  it("일반 오류일 때 기본 오류 메시지를 반환합니다", () => {
    expect(toResetSemesterMessage(new Error("RPC failed"))).toBe(
      "이번 학기를 초기화하지 못했어요. 잠시 뒤 다시 시도하세요.",
    );
  });
});
