import { AiHoursHelper } from "@/components/AiHoursHelper";
import type { PlanType } from "@/types/database";

type Props = {
  title: string;
  type: PlanType;
  credits: number | null;
  disabled?: boolean;
  /** 추천 시간을 폼의 "직접 입력"에 채움 (저장은 사용자가) */
  onApply: (hours: number) => void;
};

const PLACEHOLDER: Record<PlanType, string> = {
  class: "예: 매주 과제가 있고 중간에 팀플 발표가 한 번 있어요. 어렵다고 소문난 과목이에요.",
  activity: "예: 매주 목요일 2시간 모임, 한 달에 한 번 행사 준비가 있어요.",
  project: "예: 4명 팀플, 주 1회 회의하고 중간·최종 발표가 있어요.",
};

/** F-08 계획을 말로 설명하면 AI 가 주당 시간을 추천 (FR-08-1). 계획 폼의 "한 주에 쓰는 시간" 아래에 붙어요. */
export function AiEstimate({ title, type, credits, disabled, onApply }: Props) {
  return (
    <AiHoursHelper
      openLabel="AI로 시간 추천받기"
      label="계획을 설명하면 AI가 한 주 시간을 추천해요"
      placeholder={PLACEHOLDER[type]}
      toInput={(description) => ({ kind: "plan", title: title.trim(), type, credits, description })}
      onApply={onApply}
      appliedNote={'"직접 입력"에 채웠어요. 저장해야 반영돼요.'}
      disabled={disabled}
    />
  );
}
