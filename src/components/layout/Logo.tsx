import { cn } from "@/lib/utils";

/**
 * 학기예보 로고 — 파란 바탕 구름 안에 맑음·흐림·폭풍 막대 (10/24 C 시안).
 * 탭 아이콘은 같은 모양의 public/favicon.svg. 색을 바꾸면 두 곳을 같이 바꿔 주세요.
 */
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true" className={cn("shrink-0", className)}>
      <rect width="96" height="96" rx="22" fill="#3f6fd8" />
      <g fill="#ffffff">
        <circle cx="36" cy="50" r="16" />
        <circle cx="56" cy="42" r="20" />
        <circle cx="72" cy="54" r="12" />
        <rect x="20" y="50" width="64" height="20" rx="10" />
      </g>
      <rect x="38" y="56" width="7" height="8" rx="2" fill="#2f9e6b" />
      <rect x="49" y="51" width="7" height="13" rx="2" fill="#e59a2e" />
      <rect x="60" y="46" width="7" height="18" rx="2" fill="#d2453f" />
    </svg>
  );
}

/** 로고 그림 + "학기예보" 글자. 링크 안에 넣어 쓰세요 (글자가 링크 이름이 됨) */
export function Logo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} />
      <span>학기예보</span>
    </span>
  );
}
