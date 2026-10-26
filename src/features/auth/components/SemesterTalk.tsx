import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/features/forecast/weather";
import { AI_SEMESTER_MAX, toEstimateMessage, useParseSemester, type SemesterDraft } from "@/features/plans/ai";
import { PLAN_TYPE_LABEL } from "@/features/plans/defaults";

type Props = {
  /** AI 가 읽은 학기 설정·계획 → 폼에 채우기 */
  onDraft: (draft: SemesterDraft) => void;
  /** 읽어 온 계획 중 같이 넣을 것 (체크) */
  plans: SemesterDraft["plans"];
  picked: boolean[];
  onTogglePlan: (index: number) => void;
  /** 이 카드의 [넣고 다음으로] 버튼이 제출할 학기 설정 폼 id */
  formId: string;
  isPending: boolean;
  className?: string;
};

/**
 * 말로 한 번에 설정하기 (10/26 피드백: 칸을 하나하나 채우지 말고 자연어로).
 * "9월 1일 개강, 화목 알바, 운영체제 3학점…"처럼 쓰면 AI 가 개강일·시험 주차·요일별 시간·공부 스타일·계획을 채워요.
 * 채운 값은 아래 폼에서 확인하고 고친 뒤 저장해요.
 */
export function SemesterTalk({ onDraft, plans, picked, onTogglePlan, formId, isPending, className }: Props) {
  // 휴대폰은 접어 두고 눌러서 펼쳐요 — 펼쳐 두면 아래 폼(벼락치기 질문)이 두 화면 밑으로 밀려서 (10/26 UI 점검). PC 는 펼친 채로
  const [open, setOpen] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  const [text, setText] = useState("");
  const parse = useParseSemester();
  const pickedCount = plans.filter((_, i) => picked[i]).length;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
          className,
        )}
      >
        <Sparkles aria-hidden="true" className="size-5 shrink-0 text-primary" />
        <span className="grid gap-0.5">
          <span className="text-[15px] font-semibold">말로 한 번에 설정하기</span>
          <span className="text-[13px] text-muted-foreground">이번 학기를 글로 쓰면 AI가 아래 칸을 채워 드려요</span>
        </span>
        <ChevronDown aria-hidden="true" className="ml-auto size-5 shrink-0 text-muted-foreground" />
      </button>
    );
  }

  return (
    <section aria-labelledby="semester-talk" className={cn("grid gap-3 rounded-xl border border-primary/30 bg-primary/5 p-5", className)}>
      <h2 id="semester-talk" className="flex items-center gap-1.5 text-base font-semibold">
        <Sparkles aria-hidden="true" className="size-4 text-primary" />
        말로 한 번에 설정하기
      </h2>
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        이번 학기를 편하게 설명해 주세요. 개강일, 시험 주차, 요일별로 쓸 수 있는 시간, 듣는 수업과 활동까지 AI가 폼에 채워 드려요.
      </p>
      <textarea
        rows={5}
        maxLength={AI_SEMESTER_MAX}
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="이번 학기 설명"
        placeholder="예: 9월 1일 개강이고 중간고사 8주차, 기말 15주차예요. 화·목 저녁에 카페 알바 5시간 해요. 운영체제·데이터베이스·알고리즘 3학점씩 듣고, 코딩 동아리 하나 해요. 솔직히 시험 전에 몰아서 공부하는 편이에요."
        className="w-full resize-none rounded-md border border-input bg-card px-3 py-2 text-base outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 md:text-sm"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground tabular-nums">
          {text.length}/{AI_SEMESTER_MAX}
        </span>
        <Button type="button" size="sm" disabled={parse.isPending || text.trim().length < 5} onClick={() => parse.mutate(text.trim(), { onSuccess: onDraft })}>
          {parse.isPending ? "읽는 중… (몇 초 걸려요)" : "AI로 채우기"}
        </Button>
      </div>
      {parse.error ? <p className="text-[13px] text-destructive">{toEstimateMessage(parse.error)}</p> : null}
      {parse.data ? (
        <div className="grid gap-2" aria-live="polite">
          <p className="text-[13px]">
            <span className="font-semibold">채웠어요.</span> {parse.data.reason} 폼에서 확인하고 고칠 수 있어요.
          </p>
          {plans.length > 0 ? (
            <fieldset className="grid gap-1.5 rounded-lg bg-card p-3">
              <legend className="mb-1 text-[13px] font-semibold">계획에 넣을 것 (빼려면 체크 해제)</legend>
              {plans.map((p, i) => (
                <label key={`${p.title}-${i}`} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="size-4 accent-primary" checked={picked[i] ?? false} onChange={() => onTogglePlan(i)} />
                  <span className="font-medium">{p.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {PLAN_TYPE_LABEL[p.type]}
                    {p.credits ? ` · ${p.credits}학점` : ""}{p.no_exam ? " · 시험 없음" : ""} · 한 주 {formatDuration(p.hours_per_week)}
                  </span>
                </label>
              ))}
            </fieldset>
          ) : null}
          {/* 10/26 피드백: 추천받은 뒤 넣는 버튼이 안 보였음 → 카드 안에서 바로 학기 설정 저장 + 계획 넣기 */}
          <Button type="submit" form={formId} disabled={isPending} className="justify-self-start">
            {isPending ? "넣는 중…" : pickedCount > 0 ? `계획 ${pickedCount}개 넣고 다음으로` : "이대로 저장하고 다음으로"}
          </Button>
          <p className="text-xs text-muted-foreground">학기 설정이 같이 저장돼요. 개인정보 동의 체크가 필요해요.</p>
        </div>
      ) : null}
    </section>
  );
}
