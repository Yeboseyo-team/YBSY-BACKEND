import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ForecastChart } from "./ForecastChart";
import { DEMO_TODAY, LEVEL_STYLE, LOAD_LEVEL_LABEL, PLAN_TYPE_LABEL, personas, previewPlan, type Persona } from "./data";

/**
 * 서비스 흐름 확인용 데모 (/demo). 로그인·DB 없이 데모 계정 목업 데이터로 화면을 눌러 봅니다.
 * 숫자는 실제 산출 모듈(src/features/forecast/calc.ts)이 계산합니다.
 */
export default function DemoPage() {
  const [personaId, setPersonaId] = useState(personas[0].id);
  const [selectedWeek, setSelectedWeek] = useState(8);
  const [previewOn, setPreviewOn] = useState(false);
  const persona = personas.find((p) => p.id === personaId)!;

  const choosePersona = (id: string) => {
    setPersonaId(id);
    setPreviewOn(false);
    setSelectedWeek(8);
  };

  return (
    <div className="min-h-dvh">
      <header className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-xl font-extrabold tracking-tight">학기예보 데모</h1>
            <p className="text-xs text-white/70">
              목업 데이터 · 오늘 {DEMO_TODAY} (7주차) 기준 · 계산은 실제 calc.ts ·{" "}
              <Link to="/login" className="underline">
                실제 로그인 화면
              </Link>
            </p>
          </div>
          <FlowStrip persona={persona} previewOn={previewOn} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
        <section aria-label="데모 계정 선택" className="flex gap-2 overflow-x-auto pb-2">
          {personas.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => choosePersona(p.id)}
              className={cn(
                "min-w-44 shrink-0 rounded-lg border px-3 py-2 text-left transition-colors",
                p.id === personaId ? "border-primary bg-accent" : "border-border bg-card hover:bg-muted",
              )}
            >
              <span className="block text-sm font-semibold">{p.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{p.persona}</span>
            </button>
          ))}
        </section>

        {persona.ready && persona.forecast ? (
          <ReadyView persona={persona} selectedWeek={selectedWeek} onSelectWeek={setSelectedWeek} previewOn={previewOn} onTogglePreview={setPreviewOn} />
        ) : (
          <OnboardingView persona={persona} />
        )}
      </main>
    </div>
  );
}

function FlowStrip({ persona, previewOn }: { persona: Persona; previewOn: boolean }) {
  const steps = [
    { label: "Google 로그인", done: true },
    { label: "온보딩 (학기 설정·동의)", done: persona.ready, active: !persona.ready },
    { label: "예보 홈", done: persona.ready, active: persona.ready && !previewOn },
    { label: "계획·자격증 추가", done: persona.plans.length > 0 },
    { label: "사전 검토 → 저장", active: previewOn },
  ];
  return (
    <ol className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs">
      {steps.map((s, i) => (
        <li key={s.label} className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-1",
              s.active ? "bg-white font-semibold text-ink" : s.done ? "bg-white/15 text-white" : "bg-white/5 text-white/50",
            )}
          >
            {i + 1}. {s.label}
          </span>
          {i < steps.length - 1 && <span className="text-white/40">→</span>}
        </li>
      ))}
    </ol>
  );
}

function OnboardingView({ persona }: { persona: Persona }) {
  return (
    <section className="mt-6 rounded-xl border border-border bg-card p-6 sm:p-8">
      <p className="text-sm font-semibold text-primary">S-07 온보딩</p>
      <h2 className="mt-1 text-2xl font-bold">이번 학기를 알려주세요</h2>
      <p className="mt-2 max-w-xl text-muted-foreground">
        {persona.name}님은 아직 학기 설정을 하지 않아서, 로그인하면 예보 대신 이 화면으로 오게 돼요. 처음 한 번만 입력하면 돼요.
      </p>
      <dl className="mt-6 grid max-w-lg gap-3 text-sm sm:grid-cols-2">
        {[
          ["개강일 (1주차 월요일)", "예: 2026-08-31"],
          ["한 주에 쓸 수 있는 시간", "예: 50시간"],
          ["중간·기말고사 주차", "기본 8주차, 15주차"],
          ["개인정보 수집·이용 동의", "필수 체크"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-muted px-4 py-3">
            <dt className="font-medium">{k}</dt>
            <dd className="text-muted-foreground">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-sm text-muted-foreground">다른 계정을 골라 예보 화면을 확인해 보세요.</p>
    </section>
  );
}

interface ReadyProps {
  persona: Persona;
  selectedWeek: number;
  onSelectWeek: (week: number) => void;
  previewOn: boolean;
  onTogglePreview: (on: boolean) => void;
}

function ReadyView({ persona, selectedWeek, onSelectWeek, previewOn, onTogglePreview }: ReadyProps) {
  const forecast = persona.forecast!;
  const shown = previewOn ? persona.withPreview! : forecast;
  const hours = persona.profile.available_hours!;
  const isEmpty = persona.plans.length === 0 && persona.myCertificates.length === 0;
  const firstStorm = shown.weeks.find((w) => w.level === "storm");

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <p className="text-sm font-semibold text-primary">S-08 부담 예보 (홈){previewOn && " + S-11 사전 검토"}</p>

        {isEmpty && !previewOn ? (
          <div className="py-16 text-center">
            <p className="text-lg font-semibold">계획을 추가하면 예보가 나타납니다</p>
            <p className="mt-1 text-sm text-muted-foreground">FR-05-6 빈 상태 · 아래 사전 검토로 계획을 하나 넣어 볼 수 있어요</p>
            <Button className="mt-4" onClick={() => onTogglePreview(true)}>
              계획 추가해 보기
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold">
                  폭풍 {shown.summary.storm}주 · 흐림 {shown.summary.cloudy}주
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {firstStorm
                    ? `${firstStorm.week}주차에 폭풍이 예보돼요. 가용 시간보다 ${Math.round((firstStorm.total_hours - hours) * 10) / 10}시간 많아요.`
                    : "이번 학기에는 폭풍 주가 없어요."}
                </p>
              </div>
              <Legend />
            </div>

            {previewOn && persona.previewDiff && (
              <div className="mt-4 rounded-lg border border-primary/30 bg-accent px-4 py-3 text-sm">
                <p className="font-semibold">사전 검토: {previewPlan.title} 을(를) 추가하면</p>
                <p className="mt-0.5">
                  {persona.previewDiff.message}
                  <span className="text-muted-foreground"> · 빗금 부분이 늘어나는 시간이에요. 아직 저장되지 않았어요.</span>
                </p>
              </div>
            )}

            <div className="mt-4">
              <ForecastChart
                forecast={forecast}
                preview={previewOn ? persona.withPreview : null}
                availableHours={hours}
                currentWeek={persona.currentWeek}
                selectedWeek={selectedWeek}
                onSelectWeek={onSelectWeek}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">막대를 누르면 오른쪽에 그 주의 내역이 나와요. 파란 점은 이번 주({persona.currentWeek}주차)예요.</p>
          </>
        )}

        <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
          {previewOn ? (
            <>
              <Button onClick={() => onTogglePreview(false)}>추가하기 (데모라 저장 안 함)</Button>
              <Button variant="outline" onClick={() => onTogglePreview(false)}>
                취소
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onTogglePreview(true)}>
              사전 검토: "{previewPlan.title}" ({previewPlan.start_week}~{previewPlan.end_week}주, 주 {previewPlan.hours_per_week}시간) 넣어 보기
            </Button>
          )}
        </div>
      </section>

      <WeekDetail persona={persona} week={selectedWeek} previewOn={previewOn} />

      <PlanList persona={persona} />
      <CertificateList persona={persona} />
    </div>
  );
}

function Legend() {
  return (
    <ul className="flex gap-3 text-xs">
      {(["clear", "cloudy", "storm"] as const).map((l) => (
        <li key={l} className="flex items-center gap-1">
          <span className="inline-block size-2.5 rounded-full" style={{ background: LEVEL_STYLE[l].color }} />
          {LEVEL_STYLE[l].text}·{LEVEL_STYLE[l].level}
        </li>
      ))}
    </ul>
  );
}

function WeekDetail({ persona, week, previewOn }: { persona: Persona; week: number; previewOn: boolean }) {
  const w = (previewOn ? persona.withPreview! : persona.forecast!).weeks[week - 1];
  const style = LEVEL_STYLE[w.level];
  return (
    <aside className="rounded-xl border border-border bg-card p-5 lg:row-span-1">
      <p className="text-sm font-semibold text-primary">주차 상세 (FR-05-4)</p>
      <div className="mt-2 flex items-center justify-between">
        <h3 className="text-lg font-bold">
          {week}주차{w.is_exam_week && <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-medium">시험 주간</span>}
        </h3>
        <span className="rounded-full px-2.5 py-1 text-xs font-semibold text-white" style={{ background: style.color }}>
          {style.icon} {style.text}
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold">
        {w.total_hours}
        <span className="ml-1 text-base font-medium text-muted-foreground">시간</span>
      </p>
      <p className="text-sm text-muted-foreground">
        가용 {persona.profile.available_hours}시간 대비 {Math.round(w.ratio * 1000) / 10}%
      </p>
      {w.items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">이 주에는 계획이 없어요.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border text-sm">
          {w.items.map((item, i) => {
            const isNew = previewOn && item.title === previewPlan.title;
            return (
              <li key={`${item.title}-${i}`} className={cn("flex items-center justify-between gap-2 py-2", isNew && "font-semibold text-primary")}>
                <span className="min-w-0">
                  <span className="block truncate">
                    {isNew && "＋ "}
                    {item.title}
                  </span>
                  {item.weighted && <span className="text-xs text-storm">시험 주 ×1.5 ({item.base_hours}시간 → {item.hours}시간)</span>}
                </span>
                <span className="shrink-0 tabular-nums">{item.hours}시간</span>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

function PlanList({ persona }: { persona: Persona }) {
  const groups = (["class", "activity", "project"] as const)
    .map((type) => ({ type, items: persona.plans.filter((p) => p.type === type) }))
    .filter((g) => g.items.length > 0);
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm font-semibold text-primary">S-09 계획 목록 ({persona.plans.length}개 / 최대 30개)</p>
      {groups.length === 0 && <p className="mt-3 text-sm text-muted-foreground">등록된 계획이 없어요.</p>}
      {groups.map((g) => (
        <div key={g.type} className="mt-3">
          <h4 className="text-xs font-semibold text-muted-foreground">{PLAN_TYPE_LABEL[g.type]}</h4>
          <ul className="mt-1 divide-y divide-border text-sm">
            {g.items.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 py-2">
                <span className="min-w-0 truncate">
                  {p.title}
                  {p.credits && <span className="text-muted-foreground"> · {p.credits}학점</span>}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {p.start_week}~{p.end_week}주 · 주 {p.hours_per_week}시간 · {LOAD_LEVEL_LABEL[p.load_level]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function CertificateList({ persona }: { persona: Persona }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm font-semibold text-primary">S-10 내 자격증</p>
      {persona.myCertificates.length === 0 && <p className="mt-3 text-sm text-muted-foreground">고른 자격증이 없어요.</p>}
      <ul className="mt-2 divide-y divide-border text-sm">
        {persona.myCertificates.map((c) => {
          const { range } = c;
          const reflected =
            range.coverage === "out"
              ? "이번 학기 범위 밖"
              : range.coverage === "partial"
                ? `${range.weeks[0]}~${range.weeks[range.weeks.length - 1]}주차만 반영 (일부 학기 밖)`
                : `${range.from_week}~${range.to_week}주차 반영`;
          return (
            <li key={c.certificate.id} className="py-2.5">
              <p className="font-medium">
                {c.certificate.name} <span className="font-normal text-muted-foreground">{c.certificate.round}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {c.applyDday >= 0 ? `접수 마감 D-${c.applyDday}` : "접수 마감됨"} · 시험 D-{c.examDday} · 준비 {c.prepWeeks}주 × 주 {c.studyHours}시간
              </p>
              <p className={cn("mt-0.5 text-xs", range.coverage === "full" ? "text-clear" : "text-caution")}>{reflected}</p>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">최종 일정은 시행 기관에서 확인하세요. (자격증 날짜는 더미)</p>
    </section>
  );
}
