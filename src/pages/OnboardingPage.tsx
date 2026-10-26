import { useCallback, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { FullScreenSpinner } from "@/components/FullScreenSpinner";
import { LoadError } from "@/components/LoadError";
import { Logo } from "@/components/layout/Logo";
import { useAuth } from "@/features/auth/auth-context";
import { Button } from "@/components/ui/button";
import { useProfile, useSignOut } from "@/features/auth/api";
import { toAuthMessage } from "@/features/auth/errors";
import { isOnboardingDone } from "@/features/auth/onboarding";
import { toProfileMessage, useUpdateProfile } from "@/features/auth/profile-api";
import { SemesterForm, type SemesterFormValues } from "@/features/auth/components/SemesterForm";
import { SemesterTalk } from "@/features/auth/components/SemesterTalk";
import { useCreatePlans } from "@/features/plans/api";
import type { SemesterDraft } from "@/features/plans/ai";
import { SemesterPreview } from "@/features/auth/components/SemesterPreview";
import { toStudyStyle } from "@/features/auth/schemas";
import { DEFAULT_SEMESTER, defaultSemesterStart } from "@/features/auth/semester";
import type { SemesterValues } from "@/features/auth/schemas";
import { addDays, splitWeeklyHours, todayInKorea, TOTAL_WEEKS } from "@/features/forecast/calc";

/**
 * S-07 온보딩 (경로 /onboarding) — 담당: 프론트 A
 * 첫 로그인 뒤 학기 설정 + 개인정보 수집·이용 동의 (FR-01-11, NFR-LEGAL-1). 저장하면 예보 홈으로 갑니다.
 */
/** AI 가 읽은 값 중 비어 있지 않은 것만 폼 기본값으로 */
function draftValues(draft: SemesterDraft | null): Partial<SemesterValues> {
  if (!draft) return {};
  const out: Partial<SemesterValues> = {};
  if (draft.semester_start && /^d{4}-d{2}-d{2}$/.test(draft.semester_start)) out.semesterStart = draft.semester_start;
  if (draft.daily_hours && draft.daily_hours.length === 7 && draft.daily_hours.reduce((a, b) => a + b, 0) >= 1) out.dailyHours = draft.daily_hours;
  if (draft.midterm_week && draft.final_week && draft.midterm_week < draft.final_week) {
    out.midtermWeek = draft.midterm_week;
    out.finalWeek = draft.final_week;
  }
  if (draft.study_style) out.studyStyle = draft.study_style;
  return out;
}

export default function OnboardingPage() {
  const { user } = useAuth();
  const profile = useProfile(user?.id);
  const update = useUpdateProfile();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<Partial<SemesterFormValues> | null>(null);
  const handleValuesChange = useCallback((v: Partial<SemesterFormValues>) => setPreview(v), []);
  // 10/26: 말로 한 번에 설정하기 — AI 가 읽은 값으로 폼을 다시 채우고(key 로 새로 그림), 읽은 계획은 시작할 때 같이 저장
  const [draft, setDraft] = useState<SemesterDraft | null>(null);
  const [pickedPlans, setPickedPlans] = useState<boolean[]>([]);
  const [formKey, setFormKey] = useState(0);
  const createPlans = useCreatePlans();

  if (profile.isPending) return <FullScreenSpinner />;
  if (profile.isError) {
    return (
      <main className="mx-auto grid min-h-dvh max-w-md content-center px-4">
        <LoadError what="학기 설정" onRetry={() => profile.refetch()} retrying={profile.isFetching} />
      </main>
    );
  }
  // 이미 마쳤으면 홈으로 (바꾸기는 설정 화면에서)
  if (isOnboardingDone(profile.data)) return <Navigate to="/" replace />;

  const defaults: SemesterValues = {
    semesterStart: profile.data?.semester_start ?? defaultSemesterStart(todayInKorea()),
    dailyHours: profile.data?.daily_hours ?? splitWeeklyHours(profile.data?.available_hours ?? DEFAULT_SEMESTER.availableHours),
    midtermWeek: profile.data?.midterm_week ?? DEFAULT_SEMESTER.midtermWeek,
    finalWeek: profile.data?.final_week ?? DEFAULT_SEMESTER.finalWeek,
    studyStyle: toStudyStyle(profile.data?.study_style),
    ...draftValues(draft),
  };
  const shown = { ...defaults, ...preview };

  const finish = (semesterStart: string) => {
    const chosen = (draft?.plans ?? []).filter((_, i) => pickedPlans[i]);
    if (chosen.length === 0) return navigate("/", { replace: true });
    const end = addDays(semesterStart, TOTAL_WEEKS * 7 - 1);
    createPlans.mutate(
      chosen.map((p) => ({
        title: p.title.slice(0, 30),
        type: p.type,
        credits: p.type === "class" ? Math.min(6, Math.max(1, Math.round(p.credits ?? 3))) : null,
        load_level: "custom",
        start_week: 1,
        end_week: TOTAL_WEEKS,
        hours_per_week: Math.min(60, Math.max(0.5, Math.round(p.hours_per_week * 2) / 2)),
        start_date: semesterStart,
        end_date: end,
        priority: "normal",
        category_id: null,
      })),
      // 계획 저장이 실패해도 학기 설정은 끝났으니 홈으로 (계획은 홈에서 다시 넣으면 돼요)
      { onSettled: () => navigate("/", { replace: true }) },
    );
  };

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 pt-6 sm:px-10">
        <Logo className="text-lg font-extrabold tracking-tight" />
        {/* 다른 계정으로 바꾸고 싶을 때 (온보딩 전에는 설정 화면에 갈 수 없음) */}
        <div className="flex items-center gap-2">
          {signOut.error ? <p className="text-[13px] text-destructive">{toAuthMessage(signOut.error)}</p> : null}
          <Button variant="ghost" size="sm" disabled={signOut.isPending} onClick={() => signOut.mutate()}>
            {signOut.isPending ? "로그아웃하는 중…" : "다른 계정으로 로그인"}
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-12 lg:py-14">
        <div className="grid content-start gap-8">
          <div>
            <h1 className="text-3xl leading-tight font-bold tracking-tight text-balance lg:text-4xl">
              {profile.data?.display_name ? `${profile.data.display_name}님, ` : ""}
              이번 학기를
              <br />
              알려주세요
            </h1>
            <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
              처음 한 번만 입력하면 돼요. 이 값으로 주차를 세고, 시험 주간과 가용 시간을 기준으로 바쁜 주를 판정해요.
              나중에 설정에서 바꿀 수 있어요.
            </p>
          </div>
          <SemesterTalk
            plans={draft?.plans ?? []}
            picked={pickedPlans}
            onTogglePlan={(i) => setPickedPlans((all) => all.map((v, j) => (j === i ? !v : v)))}
            onDraft={(d) => {
              setDraft(d);
              setPickedPlans(d.plans.map(() => true));
              setPreview(null);
              setFormKey((k) => k + 1);
            }}
          />
          <SemesterPreview semesterStart={shown.semesterStart} midtermWeek={shown.midtermWeek} finalWeek={shown.finalWeek} />
        </div>

        <div className="rounded-xl border border-border bg-card p-5 sm:p-8">
          <SemesterForm
            key={formKey}
            requirePrivacy
            defaultValues={defaults}
            submitLabel="예보 시작하기"
            pendingLabel="저장하는 중…"
            isPending={update.isPending || createPlans.isPending}
            errorMessage={update.error ? toProfileMessage(update.error) : undefined}
            onValuesChange={handleValuesChange}
            onSubmit={(v) =>
              update.mutate(
                {
                  daily_hours: v.dailyHours,
                  semester_start: v.semesterStart,
                  midterm_week: v.midtermWeek,
                  final_week: v.finalWeek,
                  study_style: v.studyStyle,
                  agree_privacy: true,
                },
                { onSuccess: () => finish(v.semesterStart) },
              )
            }
          />
        </div>
      </main>
    </div>
  );
}
