import { useRef, useState } from "react";
import { BookOpen, ImageUp, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AI_ONBOARDING_MAX } from "@/features/plans/ai";
import { imageFileProblem, toJpegBase64 } from "@/lib/image";

export interface OnboardingTextValues {
  classes: string;
  activities: string;
  certificates: string;
  image: { name: string; media_type: string; data: string } | null;
}

type Props = {
  value: OnboardingTextValues;
  onChange: (next: OnboardingTextValues) => void;
  disabled?: boolean;
};

const FIELDS = [
  {
    key: "classes",
    icon: BookOpen,
    label: "무슨 수업을 듣나요?",
    hint: "과목과 학점, 과제가 많은지·시험이 없는지 같은 걸 쓰면 더 정확해요. 시간표 캡처를 올려도 돼요.",
    placeholder: "예: 운영체제·데이터베이스 3학점, 알고리즘은 과제가 매주 있어요. 캡스톤디자인 9학점은 시험 없이 발표로 평가해요.",
  },
  {
    key: "activities",
    icon: Users,
    label: "어떤 프로젝트·활동을 하나요?",
    hint: "팀플·공모전·동아리·대외활동과 언제까지 하는지 써 주세요.",
    placeholder: "예: 코딩 동아리 매주 1번 모여요. 11월 말까지 공모전 팀 프로젝트가 있어요.",
  },
  {
    key: "certificates",
    icon: Trophy,
    label: "어떤 자격증을 따려고 하나요?",
    hint: "자격증 이름과 언제 볼지 써 주세요. 목록에 있는 회차는 알아서 골라요.",
    placeholder: "예: 이번 학기에 SQLD 보고, 12월에 토익도 볼 거예요.",
  },
] as const;

/**
 * 온보딩 1단계 글 칸 3개 (10/27 온보딩 개편). 사용자는 하나씩 설명만 하고,
 * [AI로 예보 만들기]를 누르면 AI 가 계획·자격증 초안을 만들어 2단계에서 확인·수정해요.
 */
export function OnboardingTexts({ value, onChange, disabled = false }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    setFileError(null);
    if (!file) return;
    const problem = imageFileProblem(file);
    if (problem) return setFileError(problem);
    try {
      onChange({ ...value, image: { name: file.name, ...(await toJpegBase64(file)) } });
    } catch {
      setFileError("이미지를 읽지 못했어요. 다른 캡처로 해 보세요.");
    }
  };

  return (
    <fieldset className="grid gap-5" disabled={disabled}>
      <legend className="mb-2 text-sm font-medium">이번 학기에 할 일</legend>
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        편하게 설명해 주세요. AI가 계획마다 기간과 쓰는 시간을 정해서 다음 단계에서 예보로 보여 드려요. 비워 둔 칸은 건너뛰어요.
      </p>
      {FIELDS.map(({ key, icon: Icon, label, hint, placeholder }) => (
        <div key={key} className="grid gap-1.5">
          <label htmlFor={`onboarding-${key}`} className="flex items-center gap-1.5 text-sm font-semibold">
            <Icon aria-hidden="true" className="size-4 text-primary" />
            {label}
          </label>
          <p id={`onboarding-${key}-hint`} className="text-[13px] leading-relaxed text-muted-foreground">
            {hint}
          </p>
          <textarea
            id={`onboarding-${key}`}
            rows={3}
            maxLength={AI_ONBOARDING_MAX}
            value={value[key]}
            aria-describedby={`onboarding-${key}-hint`}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
            placeholder={placeholder}
            className="w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-base outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 md:text-sm"
          />
          {key === "classes" ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <ImageUp aria-hidden="true" />
                {value.image ? "다른 시간표 캡처 올리기" : "시간표 캡처 올리기"}
              </Button>
              {value.image ? (
                <span className="text-[13px] text-muted-foreground">
                  {value.image.name}{" "}
                  <button type="button" className="underline" onClick={() => onChange({ ...value, image: null })}>
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
              {fileError ? <p className="w-full text-[13px] text-destructive">{fileError}</p> : null}
            </div>
          ) : null}
        </div>
      ))}
    </fieldset>
  );
}
