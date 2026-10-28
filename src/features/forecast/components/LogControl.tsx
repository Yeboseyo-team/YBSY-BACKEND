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
  // 화면은 "N시간 M분"으로 보여 주니 입력도 시간·분으로 (10/26 UI 점검: 1시간 17분인데 1.5 로 넣어야 했음)
  const [start] = useState(() => {
    const total = Math.round((log ? Number(log.hours) : item.hours) * 60 / 5) * 5;
    return { h: Math.floor(total / 60), m: total % 60 };
  });
  const [hoursText, setHoursText] = useState(String(start.h));
  const [minutesText, setMinutesText] = useState(String(start.m));
  const [notice, setNotice] = useState<string | null>(null);
  const save = useSaveLog();
  const remove = useDeleteLog();

  if (!item.plan_id && !item.certificate_id) return null;
  if (future) return <p className="text-xs text-muted-foreground">아직 오지 않은 날이라 기록은 그날 이후에 할 수 있어요.</p>;

  const submit = () => {
    const h = Number(hoursText || 0);
    const m = Number(minutesText || 0);
    const hours = Math.round((h + m / 60) * 100) / 100;
    if (!Number.isInteger(h) || !Number.isInteger(m) || m < 0 || m > 59 || h < 0 || hours > 24) {
      setNotice("0~24시간 사이로, 분은 0~59로 넣어 주세요.");
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
          <span className="text-[13px]">실제로 한 시간</span>
          <label className="flex items-center gap-1 text-[13px]">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={24}
              step={1}
              autoFocus
              aria-label="시간"
              value={hoursText}
              onChange={(e) => setHoursText(e.target.value)}
              className="h-10 w-16 text-center"
            />
            시간
          </label>
          <label className="flex items-center gap-1 text-[13px]">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={59}
              step={5}
              aria-label="분"
              value={minutesText}
              onChange={(e) => setMinutesText(e.target.value)}
              className="h-10 w-16 text-center"
            />
            분
          </label>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "저장하는 중…" : "기록"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            취소
          </Button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          {item.logged ? <span className="rounded bg-primary/10 px-1.5 py-px text-xs font-semibold text-primary">기록함</span> : null}
          {/* 글자 링크는 휴대폰에서 누르기 작아서 버튼으로 (10/26 UI 점검) */}
          <Button type="button" variant="outline" size="sm" className="h-9" onClick={() => setOpen(true)}>
            {item.logged ? "기록 고치기" : "실제로 한 시간 기록"}
          </Button>
          {log ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 text-muted-foreground"
              disabled={remove.isPending}
              onClick={() => remove.mutate(log.id, { onSuccess: () => setNotice("기록을 지웠어요. 계획대로 다시 계산했어요.") })}
            >
              기록 지우기
            </Button>
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
