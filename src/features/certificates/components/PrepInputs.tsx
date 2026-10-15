import { FormField } from "@/features/auth/components/FormField";
import { NumberStepper } from "@/features/auth/components/NumberStepper";
import { PREP_WEEKS_RANGE, STUDY_HOURS_RANGE, validatePrep } from "../display";

type Props = {
  idPrefix: string;
  prepWeeks: number;
  studyHours: number;
  onPrepWeeksChange: (v: number) => void;
  onStudyHoursChange: (v: number) => void;
};

/** 준비 기간(주)·한 주 공부 시간 입력 (FR-04-3). 오류는 입력란 바로 아래 한 문장 */
export function PrepInputs({ idPrefix, prepWeeks, studyHours, onPrepWeeksChange, onStudyHoursChange }: Props) {
  const errors = validatePrep(prepWeeks, studyHours);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField id={`${idPrefix}-prep`} label="준비 기간" error={errors?.prep}>
        <NumberStepper
          id={`${idPrefix}-prep`}
          value={prepWeeks}
          onChange={onPrepWeeksChange}
          min={PREP_WEEKS_RANGE.min}
          max={PREP_WEEKS_RANGE.max}
          unit="주"
          invalid={Boolean(errors?.prep)}
          describedBy={errors?.prep ? `${idPrefix}-prep-message` : undefined}
          className="justify-self-start"
        />
      </FormField>
      <FormField id={`${idPrefix}-study`} label="한 주 공부 시간" error={errors?.study}>
        <NumberStepper
          id={`${idPrefix}-study`}
          value={studyHours}
          onChange={onStudyHoursChange}
          min={STUDY_HOURS_RANGE.min}
          max={STUDY_HOURS_RANGE.max}
          unit="시간"
          invalid={Boolean(errors?.study)}
          describedBy={errors?.study ? `${idPrefix}-study-message` : undefined}
          className="justify-self-start"
        />
      </FormField>
    </div>
  );
}
