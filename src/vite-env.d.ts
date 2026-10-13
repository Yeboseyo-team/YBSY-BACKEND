/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  /** "true"면 로그인 화면에 데모 계정 로그인 버튼 표시 (로컬·프리뷰 전용) */
  readonly VITE_DEMO_LOGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
