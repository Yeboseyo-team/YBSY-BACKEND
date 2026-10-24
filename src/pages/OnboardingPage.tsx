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
import { SemesterPreview } from "@/features/auth/components/SemesterPreview";
import { DEFAULT_SEMESTER, defaultSemesterStart } from "@/features/auth/semester";
import type { SemesterValues } from "@/features/auth/schemas";
import { splitWeeklyHours, todayInKorea } from "@/features/forecast/calc";

/**
 * S-07 온보딩 (경로 /onboarding) — 담당: 프론트 A
 * 첫 로그인 뒤 학기 설정 + 개인정보 수집·이용 동의 (FR-01-11, NFR-LEGAL-1). 저장하면 예보 홈으로 갑니다.
 */
export default function OnboardingPage() {
  const { user } = useAuth();
  const profile = useProfile(user?.id);
  const update = useUpdateProfile();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<Partial<SemesterFormValues> | null>(null);
  const handleValuesChange = useCallback((v: Partial<SemesterFormValues>) => setPreview(v), []);

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
  };
  const shown = { ...defaults, ...preview };

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
          <SemesterPreview semesterStart={shown.semesterStart} midtermWeek={shown.midtermWeek} finalWeek={shown.finalWeek} />
        </div>

        <div className="rounded-xl border border-border bg-card p-5 sm:p-8">
          <SemesterForm
            requirePrivacy
            defaultValues={defaults}
            submitLabel="예보 시작하기"
            pendingLabel="저장하는 중…"
            isPending={update.isPending}
            errorMessage={update.error ? toProfileMessage(update.error) : undefined}
            onValuesChange={handleValuesChange}
            onSubmit={(v) =>
              update.mutate(
                {
                  daily_hours: v.dailyHours,
                  semester_start: v.semesterStart,
                  midterm_week: v.midtermWeek,
                  final_week: v.finalWeek,
                  agree_privacy: true,
                },
                { onSuccess: () => navigate("/", { replace: true }) },
              )
            }
          />
        </div>
      </main>
    </div>
  );
}
