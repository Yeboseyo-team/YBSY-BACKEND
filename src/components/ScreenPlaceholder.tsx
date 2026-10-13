import type { ReactNode } from "react";

type Props = {
  /** 화면 번호 (명세서 6장), 예: "S-09" */
  screen: string;
  /** 담당: "프론트 A (ge)" / "프론트 B (jw)" */
  owner: string;
  /** 참고할 디자인 파일 (docs/design-pc/) */
  design?: string;
  /** 이 화면에서 만들 것 (명세서 기능 번호) */
  todo: string[];
  children?: ReactNode;
};

/**
 * 아직 만들지 않은 화면 자리 표시.
 * 화면을 다 만들면 이 컴포넌트를 지우고 실제 화면으로 바꾸세요.
 */
export function ScreenPlaceholder({ screen, owner, design, todo, children }: Props) {
  return (
    <section className="rounded-xl border border-dashed border-border bg-card p-6 text-sm">
      <p className="font-semibold">
        🚧 {screen} 작업 예정 · 담당 {owner}
      </p>
      <ul className="mt-3 grid gap-1.5 text-muted-foreground">
        {todo.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
      {design ? <p className="mt-3 text-muted-foreground">디자인: docs/design-pc/{design}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
