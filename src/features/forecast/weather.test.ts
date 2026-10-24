import { describe, expect, it } from "vitest";
import { formatDuration } from "./weather";

describe("시간 표시는 시간·분 정수로 (10/24 QA)", () => {
  it("1시간 안 되면 분만, 딱 떨어지면 시간만, 아니면 시간+분", () => {
    expect(formatDuration(0.6)).toBe("36분");
    expect(formatDuration(0.7)).toBe("42분");
    expect(formatDuration(6)).toBe("6시간");
    expect(formatDuration(4.5)).toBe("4시간 30분");
    expect(formatDuration(10.1)).toBe("10시간 6분");
    expect(formatDuration(0)).toBe("0분");
  });
});
