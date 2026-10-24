import { useSyncExternalStore } from "react";

/** CSS 미디어 쿼리가 맞는지 (화면 크기가 바뀌면 다시 그려요) */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** PC 화면(1024px 이상, Tailwind lg) */
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
