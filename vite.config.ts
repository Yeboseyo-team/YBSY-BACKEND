import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  // 데모 로그인 (10/27): VITE_DEMO_LOGIN=true 여도 Vercel 운영 배포(VERCEL_ENV=production)에서는 항상 꺼요.
  // 빌드 때 상수로 박아서, 운영 번들에는 데모 계정 이메일·비밀번호가 아예 들어가지 않아요.
  const demoLogin = env.VITE_DEMO_LOGIN === "true" && env.VERCEL_ENV !== "production";
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    define: {
      __DEMO_LOGIN__: JSON.stringify(demoLogin),
    },
  };
});
