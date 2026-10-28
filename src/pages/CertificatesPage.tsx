import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadError } from "@/components/LoadError";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/features/auth/auth-context";
import { useProfile } from "@/features/auth/api";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { useCertificates, useMyCertificates } from "@/features/certificates/api";
import { CertificatePicker } from "@/features/certificates/components/CertificatePicker";
import { MyCertificateCard } from "@/features/certificates/components/MyCertificateCard";
import { OwnCertificateForm } from "@/features/certificates/components/OwnCertificateForm";
import { RoundSuggest } from "@/features/certificates/components/RoundSuggest";
import { semesterWeekOf, todayInKorea } from "@/features/forecast/calc";
import type { Certificate } from "@/types/database";

/**
 * S-10 자격증 선택 (경로 /certificates) — 담당: 프론트 A
 * - 기본: 내가 고른 회차 목록 (PcMyCertificates) — 준비 기간·시간 바꾸기, 선택 해제
 * - ?view=add: 검색·회차 선택 (PcCertificate) — 접수 마감 회차 선택 불가, 사전 검토 후 추가 (F-04, F-06)
 * - ?view=suggest&name=…: 폭풍이 가장 적은 회차 추천 (PcRoundSuggest, F-09)
 * - ?view=custom: 목록에 없는 자격증 직접 추가 (10/24 QA)
 */
export default function CertificatesPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const adding = params.get("view") === "add";
  const suggestName = params.get("view") === "suggest" ? params.get("name") : null;
  const [notice, setNotice] = useState<string | null>(null);

  const profile = useProfile(user?.id);
  const certificates = useCertificates();
  const mine = useMyCertificates();
  const queries = [profile, certificates, mine];
  const today = todayInKorea();

  if (params.get("view") === "custom") {
    return (
      <PageContainer>
        <PageHeader
          title="자격증 추가"
          description="목록에 없는 자격증이나 어학 시험도 넣을 수 있어요. 준비 기간이 예보에 들어가요."
          back={{ to: "/certificates?view=add", label: "자격증 추가" }}
        />
        <OwnCertificateForm
          onCancel={() => setParams({ view: "add" })}
          onCreated={(message) => {
            setNotice(message);
            setParams({}, { replace: false });
            window.scrollTo({ top: 0 });
          }}
        />
      </PageContainer>
    );
  }

  if (suggestName) {
    return (
      <PageContainer>
        <PageHeader
          title={`${suggestName}, 어느 회차가 좋을까요?`}
          description="폭풍 주가 가장 적은 회차를 먼저 보여 드려요."
          back={{ to: "/certificates", label: "내 자격증" }}
        />
        <RoundSuggest
          key={suggestName}
          name={suggestName}
          onChanged={(message) => {
            setNotice(message);
            setParams({}, { replace: false });
            window.scrollTo({ top: 0 });
          }}
        />
      </PageContainer>
    );
  }

  const header = adding ? (
    <PageHeader
      title="자격증 추가"
      description="회차를 고르면 접수·시험 일정과 준비 기간이 예보에 들어가요."
      back={{ to: "/certificates", label: "내 자격증" }}
      action={
        <Button asChild variant="outline">
          <Link to="/certificates?view=custom">
            <Plus aria-hidden="true" />
            목록에 없는 자격증 추가
          </Link>
        </Button>
      }
    />
  ) : (
    <PageHeader
      title="자격증"
      description="고른 회차의 준비 기간이 예보에 들어가요."
      action={
        <Button asChild size="lg">
          <Link to="/certificates?view=add" onClick={() => setNotice(null)}>
            <Plus aria-hidden="true" />
            자격증 추가
          </Link>
        </Button>
      }
    />
  );

  if (queries.some((q) => q.isPending)) {
    return (
      <PageContainer>
        {header}
        <div className="grid gap-4" aria-busy="true" aria-label="자격증을 불러오는 중">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </PageContainer>
    );
  }
  if (queries.some((q) => q.isError) || !profile.data?.semester_start) {
    return (
      <PageContainer>
        {header}
        <LoadError
          what="자격증 정보"
          retrying={queries.some((q) => q.isFetching)}
          onRetry={() => queries.filter((q) => q.isError).forEach((q) => q.refetch())}
        />
      </PageContainer>
    );
  }

  const semesterStart = profile.data.semester_start;
  const currentWeek = semesterWeekOf(today, semesterStart);
  const all = certificates.data ?? [];
  const myList = mine.data ?? [];

  if (adding) {
    return (
      <PageContainer>
        {header}
        <CertificatePicker
          key={params.get("name") ?? ""}
          certificates={all}
          mine={myList}
          semesterStart={semesterStart}
          today={today}
          currentWeek={currentWeek}
          initialName={params.get("name") ?? undefined}
          onAdded={(message) => {
            setNotice(message);
            setParams({}, { replace: false });
            window.scrollTo({ top: 0 });
          }}
        />
      </PageContainer>
    );
  }

  const byId = new Map<string, Certificate>(all.map((c) => [c.id, c]));
  const cards = myList
    .map((m) => ({ mine: m, certificate: byId.get(m.certificate_id) }))
    .filter((x): x is { mine: (typeof myList)[number]; certificate: Certificate } => Boolean(x.certificate))
    // 시험이 끝난 회차는 맨 뒤로 (10/26 UI 점검: 끝난 게 맨 앞에 크게 보였음)
    .sort(
      (a, b) =>
        Number(a.certificate.exam_date < today) - Number(b.certificate.exam_date < today) ||
        a.certificate.exam_date.localeCompare(b.certificate.exam_date),
    );

  return (
    <PageContainer>
      {header}
      {notice ? <FormAlert tone="info">{notice}</FormAlert> : null}

      {cards.length === 0 ? (
        <section className="grid justify-items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="font-semibold">아직 고른 자격증이 없어요</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            준비할 자격증 회차를 고르면 시험 전 준비 기간의 공부 시간이 예보에 더해져요.
          </p>
          <Button asChild className="mt-2">
            <Link to="/certificates?view=add">
              <Plus aria-hidden="true" />
              자격증 추가
            </Link>
          </Button>
        </section>
      ) : (
        <section aria-label="내 자격증" className="grid gap-4 lg:grid-cols-2">
          {cards.map(({ mine: m, certificate }) => (
            <div key={m.certificate_id} className={cn("grid", certificate.exam_date < today && "opacity-60 transition-opacity hover:opacity-100")}>
              <MyCertificateCard
                mine={m}
                certificate={certificate}
                semesterStart={semesterStart}
                today={today}
                currentWeek={currentWeek}
              />
            </div>
          ))}
        </section>
      )}

      <p className="text-[13px] text-muted-foreground">
        일정은 시행 기관 공고를 기준으로 팀이 입력해요(직접 추가한 자격증 제외). 최종 일정은 시행 기관에서 확인하세요.
      </p>
    </PageContainer>
  );
}
