import { useMemo, useState } from "react";
import { Check, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDday } from "@/features/forecast/calc";
import { searchCertificates } from "@/features/certificates/search";
import type { Certificate } from "@/types/database";

type Props = {
  certificates: Certificate[];
  today: string;
  /** 이미 넣은 회차 id (목록에서 "넣음"으로) */
  pickedIds: Set<string>;
  onPick: (certificate: Certificate) => void;
  /** 목록에 없어서 직접 쓰기 */
  onWriteOwn: () => void;
  onClose: () => void;
};

const monthDay = (date: string) => `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`;

/**
 * 온보딩 2단계 자격증 고르기 (10/27) — 정기 시험 일정 목록에서 검색해서 접수 중·예정 회차를 바로 넣어요.
 * 목록에 없으면 [직접 쓰기]로 지금처럼 이름·시험일을 써요. 저장은 [이대로 예보 시작] 때 한꺼번에.
 */
export function CatalogQuickPick({ certificates, today, pickedIds, onPick, onWriteOwn, onClose }: Props) {
  const [query, setQuery] = useState("");
  const rounds = useMemo(
    () =>
      searchCertificates(
        certificates.filter((c) => c.owner_id === null),
        query,
        today,
      ).flatMap((g) => g.rounds.filter((r) => r.selectable)),
    [certificates, query, today],
  );

  return (
    <div className="grid gap-2 rounded-xl border border-border bg-muted/40 p-3">
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          autoFocus
          aria-label="자격증 이름 검색"
          placeholder="자격증 이름 검색 (예: 정보처리)"
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 bg-card pl-9"
        />
      </div>
      {rounds.length > 0 ? (
        <ul className="grid max-h-72 gap-1.5 overflow-y-auto overscroll-contain">
          {rounds.map(({ certificate: c, apply_dday }) => {
            const picked = pickedIds.has(c.id);
            return (
              <li key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
                <div className="min-w-0 text-sm">
                  <p className="truncate">
                    <span className="font-semibold">{c.name}</span> {c.round}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    시험 {monthDay(c.exam_date)} · 접수 마감 {monthDay(c.apply_end)} ({formatDday(apply_dday)})
                  </p>
                </div>
                <Button type="button" size="sm" variant={picked ? "ghost" : "outline"} disabled={picked} onClick={() => onPick(c)}>
                  {picked ? (
                    <>
                      <Check aria-hidden="true" />
                      넣음
                    </>
                  ) : (
                    "넣기"
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-1 text-[13px] text-muted-foreground">
          {query.trim() ? `'${query.trim()}'로 찾은 접수 가능한 회차가 없어요.` : "지금 접수할 수 있는 회차가 없어요."}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onWriteOwn}>
          <Plus aria-hidden="true" />
          목록에 없어요 · 직접 쓰기
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          닫기
        </Button>
      </div>
    </div>
  );
}
