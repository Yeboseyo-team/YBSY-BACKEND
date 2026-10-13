import { useCallback, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { FullScreenSpinner } from "@/components/FullScreenSpinner";
import { useAuth } from "@/features/auth/auth-context";
import { useProfile, useUpdateProfile } from "@/features/auth/api";
import { toAuthMessage } from "@/features/auth/errors";
import { SemesterForm } from "@/features/auth/components/SemesterForm";
import { SemesterPreview } from "@/features/auth/components/SemesterPreview";
import type { SemesterValues } from "@/features/auth/schemas";
import { defaultSemesterStart } from "@/features/auth/semester";

/** 첫 로그인 뒤 학기 설정 (S-07, FR-01-11). 저장하면 예보 홈으로 갑니다. */
export default function OnboardingPage() {
  const { user } = useAuth();
  const profile = useProfile(user?.id);
  const update = useUpdateProfile(user?.id);
  const navigate = useNavigate();
  const [preview, setPreview] = useState<Partial<SemesterValues> | null>(null);
  const handleValuesChange = useCallback((v: Partial<SemesterValues>) => setPreview(v), []);

  if (profile.isPending) return <FullScreenSpinner />;
  // 이미 학기 설정을 마쳤으면 홈으로 (설정 변경은 설정 화면에서)
  if (profile.data?.available_hours && profile.data.semester_start) return <Navigate to="/" replace />;

  const defaults: SemesterValues = {
    semesterStart: profile.data?.semester_start ?? defaultSemesterStart(),
    availableHours: profile.data?.available_hours ?? 50,
    midtermWeek: profile.data?.midterm_week ?? 8,
    finalWeek: profile.data?.final_week ?? 15,
  };
  const shown = { ...defaults, ...preview };

  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-6xl px-6 pt-6 sm:px-10">
        <span className="text-lg font-extrabold tracking-tight">학기예보</span>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-12 lg:py-14">
        <div className="grid content-start gap-8">
          <div>
            <h1 className="text-3xl leading-tight font-bold tracking-tight text-balance lg:text-4xl">
              이번 학기를
              <br />
              알려주세요
            </h1>
            <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
              처음 한 번만 입력하면 돼요. 이 값으로 주차를 세고, 시험 주간과 가용 시간을 기준으로 바쁜 주를 판정해요.
              나중에 설정에서 바꿀 수 있어요.
            </p>
          </div>
          <SemesterPreview
            semesterStart={shown.semesterStart}
            midtermWeek={shown.midtermWeek}
            finalWeek={shown.finalWeek}
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <SemesterForm
            defaultValues={defaults}
            submitLabel="예보 시작하기"
            pendingLabel="저장하는 중…"
            isPending={update.isPending}
            errorMessage={update.error ? toAuthMessage(update.error) : undefined}
            onValuesChange={handleValuesChange}
            onSubmit={(values) => update.mutate(values, { onSuccess: () => navigate("/", { replace: true }) })}
          />
        </div>
      </main>
    </div>
  );
}
