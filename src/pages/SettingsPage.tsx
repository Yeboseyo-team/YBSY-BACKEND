import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, LogOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadError } from "@/components/LoadError";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/features/auth/auth-context";
import { useProfile, useSignOut } from "@/features/auth/api";
import { useResetMyData } from "@/features/auth/reset-data";
import { usePlans, useSyncPlanWeeks } from "@/features/plans/api";
import { toAuthMessage } from "@/features/auth/errors";
import { toProfileMessage, useUpdateProfile } from "@/features/auth/profile-api";
import { displayNameSchema, type DisplayNameValues } from "@/features/auth/schemas";
import { STUDY_STYLE_LABEL, toStudyStyle } from "@/features/auth/schemas";
import { DEFAULT_SEMESTER, longDate } from "@/features/auth/semester";
import { splitWeeklyHours, WEEKDAY_LABELS } from "@/features/forecast/calc";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { FormField } from "@/features/auth/components/FormField";
import { SemesterForm } from "@/features/auth/components/SemesterForm";
import type { Profile } from "@/types/database";

/**
 * S-12 설정 (경로 /settings) — 담당: 프론트 A
 * 학기 설정 수정(FR-01-12), 이름 수정, 로그아웃(FR-01-9). 로그인은 Google만 (팀 결정 10/13).
 */
export default function SettingsPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const profile = useProfile(userId);

  return (
    <PageContainer>
      <PageHeader title="설정" />
      {profile.isPending ? (
        <SettingsSkeleton />
      ) : profile.isError || !profile.data ? (
        <LoadError what="설정" onRetry={() => profile.refetch()} retrying={profile.isFetching} />
      ) : (
        // PC: 왼쪽 칸에 계정·이름·안내, 오른쪽 칸에 학기 설정 (휴대폰은 지금처럼 한 줄로)
        // 마지막 줄(1fr)이 남는 높이를 받아서, 학기 설정이 길어도 왼쪽 카드 사이가 벌어지지 않아요
        <div className="grid max-w-2xl gap-6 lg:max-w-none lg:grid-cols-2 lg:grid-rows-[auto_auto_1fr] lg:items-start">
          <div className="lg:col-start-1 lg:row-start-1">
            <AccountCard profile={profile.data} email={user?.email} />
          </div>
          <div className="lg:col-start-2 lg:row-span-3 lg:row-start-1">
            <SemesterSection profile={profile.data} />
          </div>
          <div className="lg:col-start-1 lg:row-start-2">
            <NameSection profile={profile.data} />
          </div>
          <div className="grid gap-6 lg:col-start-1 lg:row-start-3">
            <Section title="데이터">
              <Row label="데이터 초기화">
                <ResetDataButton userId={userId} />
              </Row>
              <p className="px-5 py-3 text-[13px] text-muted-foreground">계획·자격증·기록·학기 설정을 모두 지우고 초기 설정부터 다시 해요.</p>
            </Section>
            <Section title="안내">
              <Row label="자격증 일정 출처">
                <span className="text-sm text-muted-foreground">각 회차의 시행 기관 공고 (자격증 화면에서 링크 확인)</span>
              </Row>
              <Row label="개인정보처리방침">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/privacy">
                    보기 <ExternalLink aria-hidden="true" />
                  </Link>
                </Button>
              </Row>
            </Section>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

function AccountCard({ profile, email }: { profile: Profile; email?: string }) {
  const signOut = useSignOut();
  const name = profile.display_name?.trim() || "이름 없음";
  return (
    <section className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-5">
      <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-ink text-lg font-bold text-white">
        {name.slice(0, 1)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{name}</p>
        <p className="truncate text-sm text-muted-foreground">{email}</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {email?.endsWith("@hakgi.test") ? "데모 계정으로 로그인 중" : "Google 계정으로 로그인 중"}
        </p>
      </div>
      <div className="grid w-full gap-2 sm:w-auto">
        <Button variant="outline" disabled={signOut.isPending} onClick={() => signOut.mutate()}>
          <LogOut aria-hidden="true" />
          {signOut.isPending ? "로그아웃하는 중…" : "로그아웃"}
        </Button>
        {signOut.error ? <p className="text-[13px] text-destructive">{toAuthMessage(signOut.error)}</p> : null}
      </div>
    </section>
  );
}

/** 데이터 초기화 (10/27) — 확인 창 뒤 계획·자격증·기록·학기 설정을 지우고 초기 설정으로 */
function ResetDataButton({ userId }: { userId?: string }) {
  const reset = useResetMyData(userId);
  return (
    <div className="grid justify-items-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        disabled={reset.isPending}
        onClick={() => {
          if (window.confirm("계획·자격증·기록·학기 설정을 모두 지우고 초기 설정으로 돌아가요. 지운 데이터는 되돌릴 수 없어요. 초기화할까요?")) reset.mutate();
        }}
      >
        <RotateCcw aria-hidden="true" />
        {reset.isPending ? "초기화하는 중…" : "초기화"}
      </Button>
      {reset.error ? <p className="text-[13px] text-destructive">초기화하지 못했어요. 잠시 뒤 다시 시도하세요.</p> : null}
    </div>
  );
}

function SemesterSection({ profile }: { profile: Profile }) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  /** 개강일을 바꿔 학기 밖으로 벗어난 계획 수 (10/28) */
  const [outside, setOutside] = useState(0);
  const update = useUpdateProfile();
  const plans = usePlans();
  const syncWeeks = useSyncPlanWeeks();

  if (editing) {
    return (
      <Section title="학기 설정">
        <div className="p-5">
          <SemesterForm
            defaultValues={{
              semesterStart: profile.semester_start ?? "",
              dailyHours: profile.daily_hours ?? splitWeeklyHours(profile.available_hours ?? DEFAULT_SEMESTER.availableHours),
              midtermWeek: profile.midterm_week,
              finalWeek: profile.final_week,
              studyStyle: toStudyStyle(profile.study_style),
            }}
            submitLabel="저장"
            pendingLabel="저장하는 중…"
            isPending={update.isPending}
            errorMessage={update.error ? toProfileMessage(update.error) : undefined}
            onSubmit={(v) =>
              update.mutate(
                {
                  semester_start: v.semesterStart,
                  daily_hours: v.dailyHours,
                  midterm_week: v.midtermWeek,
                  final_week: v.finalWeek,
                  study_style: v.studyStyle,
                },
                {
                  onSuccess: () => {
                    setEditing(false);
                    setSaved(true);
                    setOutside(0);
                    // 개강일이 바뀌면 날짜로 정한 계획의 주차를 새 개강일 기준으로 다시 맞춰요 (10/28 버그 수정)
                    if (v.semesterStart !== profile.semester_start && plans.data?.length) {
                      syncWeeks.mutate({ plans: plans.data, semesterStart: v.semesterStart }, { onSuccess: (r) => setOutside(r.outside) });
                    }
                  },
                },
              )
            }
            secondaryAction={
              <Button type="button" size="lg" variant="outline" onClick={() => setEditing(false)} disabled={update.isPending}>
                취소
              </Button>
            }
          />
        </div>
      </Section>
    );
  }

  const edit = () => {
    update.reset();
    setSaved(false);
    setEditing(true);
  };
  return (
    <Section title="학기 설정" notice={
        syncWeeks.isError
          ? "저장했지만 계획 주차를 새 개강일에 맞추지 못했어요. 새로고침한 뒤 다시 저장해 주세요."
          : saved
            ? `저장했어요. 예보에 바로 반영돼요.${outside > 0 ? ` 날짜가 새 학기 밖인 계획 ${outside}개는 [계획]에서 기간을 고쳐 주세요.` : ""}`
            : undefined
      }>
      {/* 10/26 UI 점검: 고른 공부 스타일이 요약에 안 보였음 */}
      <Row label="공부 스타일" onEdit={edit}>
        {STUDY_STYLE_LABEL[toStudyStyle(profile.study_style)]}
      </Row>
      <Row label="개강일" onEdit={edit}>
        {profile.semester_start ? longDate(profile.semester_start) : "-"}
      </Row>
      <Row label="한 주에 쓸 수 있는 시간" onEdit={edit}>
        {profile.available_hours ?? "-"}시간
        {profile.daily_hours ? <span className="block text-xs text-muted-foreground">{profile.daily_hours.map((h, i) => `${WEEKDAY_LABELS[i]} ${h}`).join(" · ")}</span> : null}
      </Row>
      <Row label="시험 주간" onEdit={edit}>
        중간 {profile.midterm_week}주차, 기말 {profile.final_week}주차
      </Row>
    </Section>
  );
}

function NameSection({ profile }: { profile: Profile }) {
  const [editing, setEditing] = useState(false);
  const update = useUpdateProfile();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DisplayNameValues>({
    resolver: zodResolver(displayNameSchema),
    defaultValues: { displayName: profile.display_name ?? "" },
  });

  if (!editing) {
    return (
      <Section title="계정">
        <Row
          label="이름"
          onEdit={() => {
            update.reset();
            reset({ displayName: profile.display_name ?? "" });
            setEditing(true);
          }}
        >
          {profile.display_name || "-"}
        </Row>
      </Section>
    );
  }

  return (
    <Section title="계정">
      <form
        noValidate
        className="grid gap-4 p-5"
        onSubmit={handleSubmit((v) => update.mutate({ display_name: v.displayName }, { onSuccess: () => setEditing(false) }))}
      >
        {update.error ? <FormAlert>{toProfileMessage(update.error)}</FormAlert> : null}
        <FormField id="displayName" label="이름" error={errors.displayName?.message}>
          <Input
            id="displayName"
            autoComplete="name"
            maxLength={40}
            className="h-11"
            aria-invalid={errors.displayName ? true : undefined}
            aria-describedby={errors.displayName ? "displayName-message" : undefined}
            {...register("displayName")}
          />
        </FormField>
        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "저장하는 중…" : "저장"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setEditing(false)} disabled={update.isPending}>
            취소
          </Button>
        </div>
      </form>
    </Section>
  );
}

function Section({ title, notice, children }: { title: string; notice?: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="overflow-hidden rounded-xl border border-border bg-card">
      <h2 className="border-b border-border px-5 py-3 text-sm font-semibold">{title}</h2>
      {notice ? (
        <p role="status" className="border-b border-border bg-accent px-5 py-2.5 text-sm">
          {notice}
        </p>
      ) : null}
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function Row({ label, onEdit, children }: { label: string; onEdit?: () => void; children: ReactNode }) {
  return (
    <div className="flex min-h-14 flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3">
      <span className="w-28 shrink-0 text-sm text-muted-foreground sm:w-32">{label}</span>
      <span className="min-w-0 flex-1 text-[15px]">{children}</span>
      {onEdit ? (
        <Button variant="ghost" size="sm" onClick={onEdit} aria-label={`${label} 변경`}>
          변경
        </Button>
      ) : null}
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="grid max-w-2xl gap-6" aria-busy="true" aria-label="설정을 불러오는 중">
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-52 rounded-xl" />
      <Skeleton className="h-28 rounded-xl" />
    </div>
  );
}
