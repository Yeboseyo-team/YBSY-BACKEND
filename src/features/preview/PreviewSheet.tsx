/**
 * S-11 사전 검토 시트 — 담당: 프론트 B (feature/frontend-jw)
 * 계획 등록 화면(S-09)과 자격증 선택 화면(S-10)에서 이 컴포넌트를 열어 씁니다.
 * - 기존 예보와 '추가했을 때' 예보를 겹친 그래프로 보여주기 (calc.ts 를 두 번 호출)
 * - 변화 요약 ("폭풍 주가 1개 → 3개")
 * - [추가하기] 누르면 onConfirm, [취소]면 onCancel. 취소하면 DB에 아무것도 저장되지 않아야 함
 * 할 일 목록: docs/tasks/frontend-jw.md
 *
 * 자격증 화면(프론트 A)도 이 컴포넌트를 쓰므로, 아래 props 모양을 바꾸면 A에게 알려주세요.
 */
export type PreviewSheetProps = {
  open: boolean;
  /** 시트 제목에 쓸 추가 대상 이름, 예: "운영체제", "정보처리기사 3회" */
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function PreviewSheet({ open, title, onConfirm, onCancel }: PreviewSheetProps) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-end bg-black/30 sm:place-items-center">
      <div className="w-full max-w-lg rounded-t-2xl bg-card p-6 sm:rounded-2xl">
        <p className="font-semibold">🚧 사전 검토: {title}</p>
        <p className="mt-2 text-sm text-muted-foreground">여기에 기존·추가 후 그래프와 변화 요약이 들어갑니다.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="h-10 rounded-md px-4 text-sm" onClick={onCancel}>
            취소
          </button>
          <button type="button" className="h-10 rounded-md bg-primary px-4 text-sm text-primary-foreground" onClick={onConfirm}>
            추가하기
          </button>
        </div>
      </div>
    </div>
  );
}
