import { useRef, useState } from "react";
import { Download, FileUp, Printer } from "lucide-react";
import { LoadError } from "@/components/LoadError";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { NextSemesterButton } from "@/features/auth/components/NextSemesterButton";
import { longDate } from "@/features/auth/semester";
import { useForecastData } from "@/features/forecast/api";
import { addDays, summarizeSemester, TOTAL_WEEKS } from "@/features/forecast/calc";
import { formatDuration, WEATHER_ORDER, WEATHER_STYLE } from "@/features/forecast/weather";
import { usePlanCategories } from "@/features/plans/categories";
import {
  buildSemesterFile,
  downloadSemesterFile,
  parseSemesterFile,
  toImportMessage,
  useImportSemesterFile,
  type SemesterFile,
} from "@/features/review/semester-file";
import { cn } from "@/lib/utils";

/**
 * 학기 회고 (경로 /review) — 10/24 QA
 * 이번 학기 예보를 한 장으로 요약하고, PDF(인쇄)·파일로 내보내 다음 학기에 다시 불러올 수 있어요.
 */
export default function ReviewPage() {
  const data = useForecastData();
  const categories = usePlanCategories();
  const importFile = useImportSemesterFile();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<SemesterFile | null>(null);
  const [withSettings, setWithSettings] = useState(true);
  const [parseError, setParseError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const header = (
    <PageHeader
      title="학기 회고"
      description="이번 학기 예보를 한눈에 보고, 파일로 남겨 다음 학기에 다시 불러올 수 있어요."
    />
  );

  if (data.status === "loading" || categories.isPending) {
    return (
      <PageContainer>
        {header}
        <Skeleton className="h-64 rounded-2xl" />
      </PageContainer>
    );
  }
  if (data.status === "error" || categories.isError || !data.profile) {
    return (
      <PageContainer>
        {header}
        <LoadError what="학기 데이터" onRetry={data.refetch} />
      </PageContainer>
    );
  }

  const { profile, forecast, plans } = data;
  const summary = forecast ? summarizeSemester(forecast) : null;
  const semesterEnd = profile.semester_start ? addDays(profile.semester_start, TOTAL_WEEKS * 7 - 1) : null;
  const max = forecast ? Math.max(...forecast.weeks.map((w) => w.total_hours), profile.available_hours ?? 1, 1) : 1;

  const onPick = async (file: File | undefined) => {
    setParseError(null);
    setDone(null);
    importFile.reset();
    if (!file) return;
    try {
      setPending(parseSemesterFile(await file.text()));
    } catch (e) {
      setParseError(toImportMessage(e));
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <PageContainer>
      {header}

      {/* 내보내기·불러오기 — 인쇄할 때는 숨김 */}
      <section className="flex flex-wrap gap-2 print:hidden" aria-label="내보내기와 불러오기">
        <Button onClick={() => window.print()}>
          <Printer aria-hidden="true" />
          PDF로 저장 (인쇄)
        </Button>
        <Button
          variant="outline"
          onClick={() => downloadSemesterFile(buildSemesterFile(profile, plans, categories.data ?? [], forecast))}
        >
          <Download aria-hidden="true" />
          다음 학기용 파일 내려받기
        </Button>
        <Button variant="outline" onClick={() => fileInput.current?.click()}>
          <FileUp aria-hidden="true" />
          파일 불러오기
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-label="학기 회고 파일 고르기"
          onChange={(e) => void onPick(e.target.files?.[0])}
        />
        {/* 10/28: 파일을 내려받은 뒤 바로 다음 학기로 */}
        <NextSemesterButton size="default" />
      </section>

      {parseError ? <FormAlert>{parseError}</FormAlert> : null}
      {importFile.error ? <FormAlert>{toImportMessage(importFile.error)}</FormAlert> : null}
      {done ? <FormAlert tone="info">{done}</FormAlert> : null}

      {pending ? (
        <section role="alertdialog" aria-labelledby="import-title" className="grid gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5 print:hidden">
          <h2 id="import-title" className="font-semibold">
            {pending.semester.semester_start ? `${longDate(pending.semester.semester_start)} 학기` : "이전 학기"} 파일을 불러올까요?
          </h2>
          <p className="text-sm text-muted-foreground">
            계획 {pending.plans.length}개가 지금 학기의 같은 주차에 더해져요 (지금 계획은 지우지 않아요).
            {pending.categories.length > 0 ? ` 내 유형 ${pending.categories.length}개도 없으면 만들어요.` : ""}
          </p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-primary" checked={withSettings} onChange={(e) => setWithSettings(e.target.checked)} />
            요일별 쓸 수 있는 시간·시험 주차도 파일 값으로 바꾸기
          </label>
          <div className="flex gap-2">
            <Button
              disabled={importFile.isPending}
              onClick={() =>
                importFile.mutate(
                  { file: pending, existingPlans: plans.length, withSettings },
                  {
                    onSuccess: (count) => {
                      setPending(null);
                      setDone(`계획 ${count}개를 불러왔어요. 예보에 바로 반영됐어요.`);
                    },
                  },
                )
              }
            >
              {importFile.isPending ? "불러오는 중…" : "불러오기"}
            </Button>
            <Button variant="outline" onClick={() => setPending(null)} disabled={importFile.isPending}>
              취소
            </Button>
          </div>
        </section>
      ) : null}

      {!forecast || !summary ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          학기 설정을 마치면 회고를 볼 수 있어요.
        </p>
      ) : (
        <article className="grid gap-5 rounded-2xl border border-border bg-card p-5 sm:p-7 print:border-0 print:p-0">
          <header className="grid gap-1">
            <p className="text-sm text-muted-foreground">
              {profile.display_name ? `${profile.display_name}님의 ` : ""}학기 요약 ·{" "}
              {profile.semester_start && semesterEnd ? `${longDate(profile.semester_start)} ~ ${longDate(semesterEnd)}` : ""}
            </p>
            <h2 className="text-2xl font-bold tracking-tight">
              {summary.summary.storm > 0
                ? `폭풍 ${summary.summary.storm}주를 지나는 학기`
                : summary.summary.cloudy > 0
                  ? `흐린 주 ${summary.summary.cloudy}주, 대체로 괜찮은 학기`
                  : "맑은 학기"}
            </h2>
          </header>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="16주 예상 합계" value={`${formatDuration(summary.total_hours)}`} />
            <Stat label="한 주 평균" value={`${formatDuration(summary.average_hours)}`} sub={`쓸 수 있는 시간 ${profile.available_hours ?? "-"}시간`} />
            <Stat
              label="가장 바쁜 주"
              value={`${summary.busiest.week}주차`}
              sub={`${formatDuration(summary.busiest.total_hours)} · ${Math.round(summary.busiest.ratio * 100)}%`}
            />
            <Stat
              label="날씨"
              // 항목 중간에서 줄이 바뀌지 않게 (10/26 UI 점검: "· 맑음 4"가 따로 떨어졌음)
              value={WEATHER_ORDER.map((l) => `${WEATHER_STYLE[l].label}\u00a0${summary.summary[l]}`).join("\u00a0· ")}
            />
          </dl>

          {/* PC: 주차별 그래프와 시간 쓴 곳을 나란히. 휴대폰·인쇄는 위아래로 */}
          <div className="grid gap-5 lg:grid-cols-2 lg:items-start lg:gap-8">
            <section aria-labelledby="weeks-title" className="grid gap-2">
              <h3 id="weeks-title" className="text-base font-semibold">
                주차별 예상 시간
              </h3>
              <ol className="grid h-[120px] grid-cols-16 items-end gap-1 lg:h-[220px]">
                {forecast.weeks.map((w) => (
                  <li key={w.week} className="flex h-full flex-col justify-end" title={`${w.week}주차 ${formatDuration(w.total_hours)}`}>
                    <span
                      className={cn("block rounded-t-[3px] print:[print-color-adjust:exact]", WEATHER_STYLE[w.level].dot)}
                      style={{ height: `${(w.total_hours / max) * 100}%` }}
                    />
                  </li>
                ))}
              </ol>
              <ol className="grid grid-cols-16 gap-1 text-center text-[10px] text-muted-foreground" aria-hidden="true">
                {forecast.weeks.map((w) => (
                  <li key={w.week}>{w.week}</li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="items-title" className="grid gap-2">
              <h3 id="items-title" className="text-base font-semibold">
                어디에 시간을 썼나요 (학기 전체)
              </h3>
              <ul className="text-sm">
                {summary.by_item.slice(0, 10).map((item) => (
                  <li key={`${item.source}-${item.title}`} className="flex justify-between gap-3 border-t border-border/60 py-2">
                    <span>
                      {item.title}
                      {item.source === "certificate" ? <span className="ml-1.5 text-xs text-muted-foreground">자격증</span> : null}
                    </span>
                    <span className="font-semibold tabular-nums">
                      {formatDuration(item.hours)}
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                        {Math.round((item.hours / Math.max(summary.total_hours, 1)) * 100)}%
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <p className="text-[13px] text-muted-foreground">
            다음 학기에는 "다음 학기용 파일 내려받기"로 저장한 파일을 이 화면에서 불러오면 같은 계획으로 바로 시작할 수 있어요.
          </p>
        </article>
      )}
    </PageContainer>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="grid gap-0.5 rounded-xl bg-muted/50 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-bold tabular-nums">{value}</dd>
      {sub ? <dd className="text-xs text-muted-foreground">{sub}</dd> : null}
    </div>
  );
}
