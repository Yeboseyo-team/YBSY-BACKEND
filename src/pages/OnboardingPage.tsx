import { useCallback, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { FullScreenSpinner } from "@/components/FullScreenSpinner";
import { LoadError } from "@/components/LoadError";
import { Logo } from "@/components/layout/Logo";
import { useAuth } from "@/features/auth/auth-context";
import { Button } from "@/components/ui/button";
import { useProfile, useSignOut } from "@/features/auth/api";
import { toAuthMessage } from "@/features/auth/errors";
import { isOnboardingDone } from "@/features/auth/onboarding";
import { ONBOARDING_PLANS_PATH, saveOnboardingDraft } from "@/features/auth/onboarding-draft";
import { toProfileMessage, useUpdateProfile } from "@/features/auth/profile-api";
import { SemesterForm, type SemesterFormValues } from "@/features/auth/components/SemesterForm";
import { OnboardingTexts, type OnboardingTextValues } from "@/features/auth/components/OnboardingTexts";
import { SemesterPreview } from "@/features/auth/components/SemesterPreview";
import { toStudyStyle, type SemesterValues } from "@/features/auth/schemas";
import { DEFAULT_SEMESTER, defaultSemesterStart } from "@/features/auth/semester";
import { splitWeeklyHours, todayInKorea } from "@/features/forecast/calc";
import { toEstimateMessage, useParseOnboarding } from "@/features/plans/ai";

/**
 * S-07 온보딩 1단계 (경로 /onboarding) — 10/27 온보딩 개편
 * 공부 스타일·개강일·시험 주차는 고르고, 쓸 수 있는 시간과 이번 학기 할 일(수업·프로젝트·자격증)은 글로 써요.
 * [AI로 예보 만들기]를 누르면 학기 설정·동의를 저장하고, AI 가 만든 계획·자격증 초안을 들고 2단계(/start/plans)로 가요.
 * 계획·자격증은 2단계에서 예상 예보를 보고 고친 뒤에 저장해요.
 */
/** AI 가 읽은 값 중 비어 있지 않은 것만 폼 기본값으로 */
function draftValues(draft: SemesterDraft | null): Partial<SemesterValues> {
  if (!draft) return {};
  const out: Partial<SemesterValues> = {};
  if (draft.semester_start && /^\d{4}-\d{2}-\d{2}$/.test(draft.semester_start)) out.semesterStart = draft.semester_start;
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
  const parse = useParseOnboarding();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<Partial<SemesterFormValues> | null>(null);
  const handleValuesChange = useCallback((v: Partial<SemesterFormValues>) => setPreview(v), []);
  const [texts, setTexts] = useState<OnboardingTextValues>({ classes: "", activities: "", certificates: "", image: null });
  // 저장하면 프로필이 "온보딩 끝"으로 바뀌어 아래 홈 이동이 먼저 일어나요. 방금 저장한 경우엔 2단계로 가도록 막아 둠
  const submitted = useRef(false);

  if (profile.isPending) return <FullScreenSpinner />;
  if (profile.isError) {
    return (
      <main className="mx-auto grid min-h-dvh max-w-md content-center px-4">
        <LoadError what="학기 설정" onRetry={() => profile.refetch()} retrying={profile.isFetching} />
      </main>
    );
  }
  // 이미 마쳤으면 홈으로 (바꾸기는 설정 화면에서)
  if (isOnboardingDone(profile.data) && !submitted.current) return <Navigate to="/" replace />;

  const defaults: SemesterValues = {
    semesterStart: profile.data?.semester_start ?? defaultSemesterStart(todayInKorea()),
    dailyHours: profile.data?.daily_hours ?? splitWeeklyHours(profile.data?.available_hours ?? DEFAULT_SEMESTER.availableHours),
    midtermWeek: profile.data?.midterm_week ?? DEFAULT_SEMESTER.midtermWeek,
    finalWeek: profile.data?.final_week ?? DEFAULT_SEMESTER.finalWeek,
    studyStyle: toStudyStyle(profile.data?.study_style),
  };
  const shown = { ...defaults, ...preview };
  const hasTexts = Boolean(texts.classes.trim() || texts.activities.trim() || texts.certificates.trim() || texts.image);
  const busy = update.isPending || parse.isPending;

  /** 학기 설정을 저장한 뒤: 글이 있으면 AI 초안을 만들어 2단계로, 없으면 빈 2단계로 */
  const toStep2 = (v: SemesterFormValues) => {
    const go = () => navigate(ONBOARDING_PLANS_PATH, { replace: true });
    if (!hasTexts) {
      saveOnboardingDraft(user?.id, { plans: [], certificates: [], reason: null, error: null });
      return go();
    }
    parse.mutate(
      {
        classes: texts.classes.trim(),
        activities: texts.activities.trim(),
        certificates: texts.certificates.trim(),
        ...(texts.image ? { image: { media_type: texts.image.media_type, data: texts.image.data } } : {}),
        semester_start: v.semesterStart,
        midterm_week: v.midtermWeek,
        final_week: v.finalWeek,
      },
      {
        onSuccess: (draft) => {
          saveOnboardingDraft(user?.id, { plans: draft.plans, certificates: draft.certificates, reason: draft.reason || null, error: null });
          go();
        },
        // AI 가 실패해도 학기 설정은 끝났으니 2단계에서 직접 넣게 해요
        onError: (error) => {
          saveOnboardingDraft(user?.id, { plans: [], certificates: [], reason: null, error: toEstimateMessage(error) });
          go();
        },
      },
    );
  };

  const finish = (semesterStart: string) => {
    const chosen = (draft?.plans ?? []).filter((_, i) => pickedPlans[i]);
    if (chosen.length === 0) return navigate(ONBOARDING_PLANS_PATH, { replace: true });
    const end = addDays(semesterStart, TOTAL_WEEKS * 7 - 1);
    createPlans.mutate(
      chosen.map((p) => ({
        title: p.title.slice(0, 30),
        type: p.type,
        credits: p.type === "class" ? Math.min(CREDITS_RANGE.max, Math.max(CREDITS_RANGE.min, Math.round(p.credits ?? 3))) : null,
        load_level: "custom",
        start_week: 1,
        end_week: TOTAL_WEEKS,
        hours_per_week: Math.min(60, Math.max(0.5, Math.round(p.hours_per_week * 2) / 2)),
        start_date: semesterStart,
        end_date: end,
        priority: "normal",
        category_id: null,
        no_exam: p.type === "class" && Boolean(p.no_exam),
      })),
      // 계획 저장이 실패해도 학기 설정은 끝났으니 다음 단계로 (거기서 다시 넣으면 돼요)
      {
        onSuccess: () => navigate(ONBOARDING_PLANS_PATH, { replace: true }),
        // 실패하면 다음 화면에서 알려 주고 거기서 다시 넣게 (조용히 0개로 보이지 않게)
        onError: (error) => navigate(ONBOARDING_PLANS_PATH, { replace: true, state: { planError: toPlanMessage(error), missed: chosen.map((p) => p.title) } }),
      },
    );
  };

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 pt-6 sm:px-10">
        <Logo className="text-lg font-extrabold tracking-tight" />
        <span className="text-sm text-muted-foreground tabular-nums">1 / 2 단계</span>
        {/* 다른 계정으로 바꾸고 싶을 때 (온보딩 전에는 설정 화면에 갈 수 없음) */}
        <div className="flex items-center gap-2">
          {signOut.error ? <p className="text-[13px] text-destructive">{toAuthMessage(signOut.error)}</p> : null}
          <Button variant="ghost" size="sm" disabled={signOut.isPending} onClick={() => signOut.mutate()}>
            {signOut.isPending ? "로그아웃하는 중…" : "다른 계정으로 로그인"}
          </Button>
        </div>
      </header>

      {/* 소개 → 폼. 폼은 PC 에서 왼쪽(스타일·개강일·쓸 수 있는 시간·시험 주차·미리보기), 오른쪽(수업·프로젝트·자격증 글 칸) (10/27) */}
      <main className="mx-auto grid max-w-6xl content-start gap-8 px-4 py-8 sm:px-10 lg:py-12">
        <div>
          <h1 className="text-3xl leading-tight font-bold tracking-tight text-balance lg:text-4xl">
            {profile.data?.display_name ? `${profile.data.display_name}님, ` : ""}
            이번 학기를
            <br />
            알려주세요
          </h1>
          <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
            고르고 쓰기만 하면 AI가 계획과 시간을 정해 예보를 만들어 드려요. 다음 단계에서 예보를 보고 고칠 수 있어요.
          </p>
        </div>

        <div>
          <SemesterForm
            columnClassName="rounded-xl border border-border bg-card p-5 sm:p-8"
            requirePrivacy
            aiDailyHours
            defaultValues={defaults}
            submitLabel={hasTexts ? "AI로 예보 만들기" : "다음: 계획 넣기"}
            pendingLabel={parse.isPending ? "AI가 예보를 만드는 중… (10초쯤 걸려요)" : "저장하는 중…"}
            isPending={busy}
            errorMessage={update.error ? toProfileMessage(update.error) : undefined}
            onValuesChange={handleValuesChange}
            extra={<OnboardingTexts value={texts} onChange={setTexts} disabled={busy} />}
            afterExams={<SemesterPreview semesterStart={shown.semesterStart} midtermWeek={shown.midtermWeek} finalWeek={shown.finalWeek} />}
            onSubmit={(v) => {
              submitted.current = true;
              update.mutate(
                {
                  daily_hours: v.dailyHours,
                  semester_start: v.semesterStart,
                  midterm_week: v.midtermWeek,
                  final_week: v.finalWeek,
                  study_style: v.studyStyle,
                  agree_privacy: true,
                },
                {
                  onSuccess: () => toStep2(v),
                  onError: () => {
                    submitted.current = false;
                  },
                },
              );
            }}
          />
        </div>
      </main>
    </div>
  );
}
