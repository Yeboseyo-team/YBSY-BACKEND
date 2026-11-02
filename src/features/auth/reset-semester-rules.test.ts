import { describe, expect, it } from "vitest";
import { canResetSemester, toResetSemesterMessage } from "./reset-semester-rules";

describe("canResetSemester", () => {
  it("일반 계정과 체험 계정 정새내만 초기화할 수 있어요", () => {
    expect(canResetSemester("student@gmail.com")).toBe(true);
    expect(canResetSemester("newbie@hakgi.test")).toBe(true);
    expect(canResetSemester("yebo@hakgi.test")).toBe(false);
    expect(canResetSemester("empty@hakgi.test")).toBe(false);
  });
});

describe("toResetSemesterMessage", () => {
  it("데모 계정을 막은 오류면 그 이유를 알려 줍니다", () => {
    expect(toResetSemesterMessage({ code: "P0042" })).toBe("시연용 데모 계정은 초기화할 수 없어요.");
  });

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
