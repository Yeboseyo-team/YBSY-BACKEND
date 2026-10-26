import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ImageUp, Sparkles } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/auth-context";
import { useProfile } from "@/features/auth/api";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { addDays, TOTAL_WEEKS } from "@/features/forecast/calc";
import { formatDuration } from "@/features/forecast/weather";
import { AI_TIMETABLE_MAX, toEstimateMessage, useParseTimetable, type TimetableClass } from "@/features/plans/ai";
import { toPlanMessage, useCreatePlans, usePlans, type PlanInput } from "@/features/plans/api";
import { CREDITS_RANGE, defaultHoursPerWeek, MAX_PLANS } from "@/features/plans/defaults";
import { cn } from "@/lib/utils";

type Row = TimetableClass & { picked: boolean; creditsInput: string };

/** 이미지를 가로 1600px 이하 JPEG 로 줄여 base64 로 (서버로 보내는 크기를 줄이려고) */
async function toJpegBase64(file: File): Promise<{ media_type: string; data: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const url = canvas.toDataURL("image/jpeg", 0.85);
  return { media_type: "image/jpeg", data: url.slice(url.indexOf(",") + 1) };
}

/**
 * 시간표로 수업 한 번에 추가 (경로 /plans/import) — 10/26 피드백
 * 에브리타임·학교 포털 시간표를 복사해 붙여 넣거나 캡처 이미지를 올리면 AI 가 과목명·학점을 읽어 수업 계획을 만들어요.
 * 크롤링은 하지 않아요 (이용약관·로그인 문제). 읽은 결과는 저장 전에 고칠 수 있어요.
 */
export default function TimetableImportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = useProfile(user?.id);
  const plans = usePlans();
  const parse = useParseTimetable();
  const create = useCreatePlans();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [image, setImage] = useState<{ name: string; media_type: string; data: string } | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const semesterStart = profile.data?.semester_start ?? null;
  const left = MAX_PLANS - (plans.data?.length ?? 0);
  const picked = (rows ?? []).filter((r) => r.picked);

  const read = () => {
    setRows(null);
    parse.mutate(
      { ...(text.trim() ? { text: text.trim() } : {}), ...(image ? { image: { media_type: image.media_type, data: image.data } } : {}) },
      {
        onSuccess: (result) =>
          setRows(result.classes.map((c) => ({ ...c, picked: true, creditsInput: String(c.credits ?? 3) }))),
      },
    );
  };

  const onFile = async (file: File | undefined) => {
    setFileError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) return setFileError("이미지 파일(캡처)만 올릴 수 있어요.");
    if (file.size > 8 * 1024 * 1024) return setFileError("8MB 이하 이미지로 올려 주세요.");
    try {
      setImage({ name: file.name, ...(await toJpegBase64(file)) });
    } catch {
      setFileError("이미지를 읽지 못했어요. 다른 캡처로 해 보세요.");
    }
  };

  const save = () => {
    if (!semesterStart) return;
    const end = addDays(semesterStart, TOTAL_WEEKS * 7 - 1);
    const inputs: PlanInput[] = picked.map((r) => {
      const credits = Math.min(CREDITS_RANGE.max, Math.max(CREDITS_RANGE.min, Math.round(Number(r.creditsInput) || 3)));
      return {
        title: r.title.trim().slice(0, 30),
        type: "class",
        credits,
        load_level: "normal",
        start_week: 1,
        end_week: TOTAL_WEEKS,
        hours_per_week: defaultHoursPerWeek("class", "normal", credits) ?? 4.5,
        start_date: semesterStart,
        end_date: end,
        priority: "normal",
        category_id: null,
      };
    });
    create.mutate(inputs, { onSuccess: () => navigate("/plans") });
  };

  return (
    <PageContainer>
      <PageHeader
        title="시간표로 수업 추가"
        description="에브리타임·학교 포털 시간표를 복사해 붙여 넣거나 캡처를 올리면 수업을 한 번에 넣어 드려요."
        back={{ to: "/plans/new", label: "계획 추가" }}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[520px_minmax(0,1fr)]">
        <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <label htmlFor="timetable-text" className="text-sm font-semibold">
            시간표 붙여 넣기
          </label>
          <textarea
            id="timetable-text"
            rows={7}
            maxLength={AI_TIMETABLE_MAX}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"예:\n운영체제 3학점 월3 수3\n데이터베이스 3학점 화4 목4\n대학영어 2학점 금1"}
            className="w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-base outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 md:text-sm"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <ImageUp aria-hidden="true" />
              {image ? "다른 캡처 올리기" : "시간표 캡처 올리기"}
            </Button>
            {image ? (
              <span className="text-[13px] text-muted-foreground">
                {image.name}{" "}
                <button type="button" className="underline" onClick={() => setImage(null)}>
                  빼기
                </button>
              </span>
            ) : null}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label="시간표 캡처 이미지"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
          </div>
          {fileError ? <p className="text-[13px] text-destructive">{fileError}</p> : null}
          <Button type="button" size="lg" disabled={parse.isPending || (!text.trim() && !image)} onClick={read}>
            <Sparkles aria-hidden="true" />
            {parse.isPending ? "읽는 중… (몇 초 걸려요)" : "AI로 수업 읽어 오기"}
          </Button>
          {parse.error ? <FormAlert>{toEstimateMessage(parse.error)}</FormAlert> : null}
          <p className="text-xs leading-relaxed text-muted-foreground">
            학교 사이트에 로그인하거나 몰래 가져오지 않아요. 붙여 넣은 글·캡처만 읽고, 저장 전에 고칠 수 있어요.
          </p>
        </section>

        <section className="grid gap-3 rounded-2xl border border-border bg-card p-5 sm:p-6" aria-live="polite">
          <h2 className="text-base font-semibold">읽어 온 수업</h2>
          {rows === null ? (
            <p className="text-sm text-muted-foreground">왼쪽에서 시간표를 넣고 [AI로 수업 읽어 오기]를 누르면 여기에 나와요.</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">수업을 찾지 못했어요. 과목명과 학점이 보이게 다시 붙여 넣어 보세요.</p>
          ) : (
            <>
              <ul className="grid gap-2">
                {rows.map((r, i) => {
                  const credits = Number(r.creditsInput);
                  const hours = Number.isInteger(credits) && credits >= 1 && credits <= 6 ? defaultHoursPerWeek("class", "normal", credits) : null;
                  const update = (patch: Partial<Row>) => setRows((all) => all!.map((x, j) => (j === i ? { ...x, ...patch } : x)));
                  return (
                    <li key={i} className={cn("grid gap-2 rounded-lg border p-3", r.picked ? "border-border" : "border-dashed opacity-60")}>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={r.picked}
                          aria-label={`${r.title} 넣기`}
                          onChange={(e) => update({ picked: e.target.checked })}
                        />
                        <Input value={r.title} maxLength={30} aria-label="과목명" onChange={(e) => update({ title: e.target.value })} className="h-9" />
                        <Input
                          type="number"
                          min={1}
                          max={6}
                          aria-label="학점"
                          value={r.creditsInput}
                          onChange={(e) => update({ creditsInput: e.target.value })}
                          className="h-9 w-16"
                        />
                        <span className="text-sm text-muted-foreground">학점</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {r.schedule ? `${r.schedule} · ` : ""}
                        {hours !== null ? `과제·복습 한 주 ${formatDuration(hours)} (보통)로 넣어요` : "학점을 1~6으로 넣어 주세요"}
                      </p>
                    </li>
                  );
                })}
              </ul>
              {picked.length > left ? (
                <FormAlert>계획은 {MAX_PLANS}개까지예요. 지금 {left}개 더 넣을 수 있어요.</FormAlert>
              ) : null}
              {create.error ? <FormAlert>{toPlanMessage(create.error)}</FormAlert> : null}
              <Button
                type="button"
                size="lg"
                className="bg-ink hover:bg-ink/90"
                disabled={create.isPending || picked.length === 0 || picked.length > left || !semesterStart}
                onClick={save}
              >
                {create.isPending ? "넣는 중…" : `수업 ${picked.length}개 추가하기`}
              </Button>
              <p className="text-xs text-muted-foreground">학기 전체(1~16주차), 보통 시간으로 넣어요. 추가한 뒤 계획 목록에서 하나씩 고칠 수 있어요.</p>
            </>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
