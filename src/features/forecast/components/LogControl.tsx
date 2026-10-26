import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StudyLogRow } from "@/types/database";
import type { DayItem } from "../calc";
import { toLogMessage, useDeleteLog, useSaveLog } from "../logs";
import { formatDuration } from "../weather";

type Props = {
  item: DayItem;
  date: string;
  /** 이 일·이날의 저장된 기록 (있으면) */
  log: StudyLogRow | undefined;
  /** 오늘보다 뒤인 날이면 기록할 수 없어요 */
  future: boolean;
};

/**
 * 하루 할 일 한 줄의 "실제로 한 시간" 기록 (10/26 피드백).
 * 계획보다 더 하면 같은 계획의 남은 날에서 빼고, 덜 하면 남은 날에 더해 예보가 다시 계산돼요.
 */
export function LogControl({ item, date, log, future }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(() => String(log ? Number(log.hours) : Math.round(item.hours * 2) / 2));
  const [notice, setNotice] = useState<string | null>(null);
  const save = useSaveLog();
  const remove = useDeleteLog();

  if (!item.plan_id && !item.certificate_id) return null;
  if (future) return <p className="text-xs text-muted-foreground">아직 오지 않은 날이라 기록은 그날 이후에 할 수 있어요.</p>;

  const submit = () => {
    const hours = Number(value);
    if (!Number.isFinite(hours) || hours < 0 || hours > 24) {
      setNotice("0~24시간 사이로 넣어 주세요.");
      return;
    }
    // 저장 전 이날 예상(기록이 있으면 그 기록이 아닌 원래 계획은 알 수 없어 현재 값과 비교)
    const planned = item.logged ? null : item.hours;
    save.mutate(
      { plan_id: item.plan_id ?? null, certificate_id: item.certificate_id ?? null, date, hours },
      {
        onSuccess: () => {
          setOpen(false);
          if (planned === null) return setNotice("기록을 고쳤어요. 남은 일정이 다시 계산됐어요.");
          const diff = hours - planned;
          setNotice(
            Math.abs(diff) < 1 / 60
              ? "계획대로 했어요."
              : diff > 0
                ? `계획보다 ${formatDuration(diff)} 더 했어요. 남은 일정에서 그만큼 줄였어요.`
                : `계획보다 ${formatDuration(-diff)} 덜 했어요. 남은 날에 그만큼 더했어요.`,
          );
        },
      },
    );
  };

  return (
    <div className="grid gap-1.5">
      {open ? (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <label className="flex items-center gap-1.5 text-[13px]">
            실제로 한 시간
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              max={24}
              step={0.5}
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-8 w-20 text-sm"
            />
            시간
          </label>
          <Button type="submit" size="sm" disabled={save.isPending}>
            {save.isPending ? "저장하는 중…" : "기록"}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
            취소
          </Button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          {item.logged ? <span className="rounded bg-primary/10 px-1.5 py-px text-xs font-semibold text-primary">기록함</span> : null}
          <button type="button" className="font-semibold text-primary underline-offset-[3px] hover:underline" onClick={() => setOpen(true)}>
            {item.logged ? "기록 고치기" : "실제로 한 시간 기록"}
          </button>
          {log ? (
            <button
              type="button"
              className="text-muted-foreground underline-offset-[3px] hover:underline"
              disabled={remove.isPending}
              onClick={() => remove.mutate(log.id, { onSuccess: () => setNotice("기록을 지웠어요. 계획대로 다시 계산했어요.") })}
            >
              기록 지우기
            </button>
          ) : null}
        </div>
      )}
      {save.error || remove.error ? (
        <p className="text-xs text-destructive">{toLogMessage(save.error ?? remove.error)}</p>
      ) : notice ? (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {notice}
        </p>
      ) : null}
    </div>
  );
}
