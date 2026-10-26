import { useState } from "react";
import { Sparkles } from "lucide-react";
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
};

/**
 * 말로 한 번에 설정하기 (10/26 피드백: 칸을 하나하나 채우지 말고 자연어로).
 * "9월 1일 개강, 화목 알바, 운영체제 3학점…"처럼 쓰면 AI 가 개강일·시험 주차·요일별 시간·공부 스타일·계획을 채워요.
 * 채운 값은 아래 폼에서 확인하고 고친 뒤 저장해요.
 */
export function SemesterTalk({ onDraft, plans, picked, onTogglePlan }: Props) {
  const [text, setText] = useState("");
  const parse = useParseSemester();

  return (
    <section aria-labelledby="semester-talk" className="grid gap-3 rounded-xl border border-primary/30 bg-primary/5 p-5">
      <h2 id="semester-talk" className="flex items-center gap-1.5 text-base font-semibold">
        <Sparkles aria-hidden="true" className="size-4 text-primary" />
        말로 한 번에 설정하기
      </h2>
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        이번 학기를 편하게 설명해 주세요. 개강일, 시험 주차, 요일별로 쓸 수 있는 시간, 듣는 수업과 활동까지 AI가 오른쪽 폼에 채워 드려요.
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
            <span className="font-semibold">채웠어요.</span> {parse.data.reason} 오른쪽 폼에서 확인하고 고칠 수 있어요.
          </p>
          {plans.length > 0 ? (
            <fieldset className="grid gap-1.5 rounded-lg bg-card p-3">
              <legend className="mb-1 text-[13px] font-semibold">같이 넣을 계획 (시작하기를 누르면 저장돼요)</legend>
              {plans.map((p, i) => (
                <label key={`${p.title}-${i}`} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="size-4 accent-primary" checked={picked[i] ?? false} onChange={() => onTogglePlan(i)} />
                  <span className="font-medium">{p.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {PLAN_TYPE_LABEL[p.type]}
                    {p.credits ? ` · ${p.credits}학점` : ""} · 한 주 {formatDuration(p.hours_per_week)}
                  </span>
                </label>
              ))}
            </fieldset>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
