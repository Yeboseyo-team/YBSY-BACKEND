# 로그인·세션 (F-01)

> **팀 결정 (2026-10-13): 로그인은 Google만 씁니다.**
> 명세서의 이메일 가입·인증 메일·비밀번호 찾기(FR-01-1~4, FR-01-8, S-02~S-05)는 만들지 않습니다.
> 개인정보 동의(NFR-LEGAL-1)는 회원가입 화면 대신 온보딩(S-07)에서 받습니다.
> 데모 계정(`*@hakgi.test`)은 로컬·프리뷰에서만 데모 로그인 버튼으로 씁니다.

## 한 줄 요약

- **로그인**: Google이 "이 사람 맞아요"를 확인해 주는 순간. 우리 앱은 구글과 직접 통신하지 않고, Supabase가 중간에서 처리합니다.
- **세션**: 확인 후 받는 입장 팔찌(토큰). 브라우저에 저장돼서 새로고침·재시작해도 로그인 유지, 만료 전에 자동 갱신
- 화면은 세션 상태 하나(`loading` / `authenticated` / `unauthenticated`)만 보고 어디로 보낼지 정합니다.

## Google 로그인 흐름

```
[로그인 화면] "Google 계정으로 계속하기" 클릭
   │  supabase.auth.signInWithOAuth({ provider: "google" })   ← src/features/auth/api.ts 의 useGoogleSignIn
   ▼
[Google] 계정 선택·동의
   ▼
[Supabase] https://hxnaobwybllgdcvnwimo.supabase.co/auth/v1/callback  (구글이 확인 결과를 넘겨줌)
   ▼
[우리 앱] /auth/callback?code=...  → supabase-js가 code를 세션으로 교환 (PKCE)
   ▼
처음 온 사람이면 DB 트리거가 profiles 행을 만들고 이름은 Google 프로필 이름 (FR-01-5, FR-01-10)
   ▼
온보딩 가드: 학기 설정·개인정보 동의가 비어 있으면 /onboarding, 아니면 원래 가려던 화면
```

## 화면과 경로

| 화면 | 경로 | 누가 들어갈 수 있나 | 명세서 |
|---|---|---|---|
| 로그인 (Google 버튼만, 개발 환경에선 데모 로그인 버튼 추가) | `/login` | 로그아웃 상태만 | S-01, FR-01-5 |
| 인증 처리 (Google 복귀) | `/auth/callback` | Google 로그인 후 | S-06 |
| 온보딩 (학기 설정 + 개인정보 동의) | `/onboarding` | 로그인, 설정·동의 미완료 | S-07, FR-01-11, NFR-LEGAL-1 |
| 개인정보처리방침 | `/privacy` | 누구나 | NFR-LEGAL-1 |
| 홈 | `/` | 로그인, 설정·동의 완료 | S-08 |

없어지는 화면: `/signup`, `/forgot-password`, `/auth/reset-password` (S-02~S-05)

## 세션이 동작하는 방식

```
supabase-js  ── 세션을 localStorage에 저장, 만료 전 자동 갱신, PKCE 방식
   │  onAuthStateChange 이벤트: INITIAL_SESSION / SIGNED_IN / TOKEN_REFRESHED / SIGNED_OUT
   ▼
AuthProvider  →  useAuth() = { status, session, user }
   │
   ├─ ProtectedRoute   : loading이면 스피너, 로그아웃 상태면 /login 으로 (원래 가려던 경로 기억, FR-01-7)
   ├─ OnboardingGuard  : 학기 설정·개인정보 동의가 비어 있으면 /onboarding 으로 (FR-01-11)
   └─ PublicOnlyRoute  : 로그인되면 원래 경로 또는 / 로 이동
```

- Google 로그인은 페이지를 떠났다 돌아오므로, 원래 가려던 경로는 `returnTo`(sessionStorage)에 보관합니다.
- 로그아웃(SIGNED_OUT)하면 TanStack Query 캐시를 전부 비워서 다른 계정 데이터가 화면에 남지 않습니다 (FR-01-9).

## 개인정보 동의 (NFR-LEGAL-1)

- `profiles.privacy_agreed_at` (timestamptz). **null이면 미동의 → 온보딩으로 보냅니다.**
- 온보딩 저장 시 학기 설정과 함께 `privacy_agreed_at`에 아무 시각이나 보내면 됩니다.
  DB 트리거가 **서버 시각으로 바꿔 기록**하고, 한 번 기록되면 바꾸거나 지울 수 없습니다 (`supabase/migrations/20261013103836_privacy_consent.sql`).

```ts
await supabase.from("profiles").update({
  available_hours, semester_start, midterm_week, final_week,
  privacy_agreed_at: new Date().toISOString(), // 서버가 now()로 덮어씀
}).eq("user_id", userId);
```

- 동의 문구에는 **항목·목적·보유 기간**이 들어가야 합니다: 수집 항목(Google 계정 이메일, 이름), 목적(학기 계획 저장과 예보 제공), 보유 기간(회원 탈퇴 시까지 — 명세서 9.1 미결 사항, 팀 확정 필요)

## 데모 로그인 (개발 환경 전용)

- `.env.local`(로컬)과 Vercel **Preview** 환경변수에만 `VITE_DEMO_LOGIN=true`. **Production에는 넣지 않습니다.**
- `src/features/auth/demo.ts`: `DEMO_LOGIN_ENABLED`, `demoAccounts`(이메일·이름·용도), `useDemoSignIn()`
- 데모 계정 비밀번호 로그인을 위해 Supabase의 **Email provider는 켜 둡니다.** 화면에 이메일 가입이 없을 뿐, API로 이메일 가입을 직접 호출하는 것까지 막지는 않습니다 (인증 메일 확인은 필요). 개발 기간 동안 감수하는 부분입니다.

## 프론트 담당에게 넘길 할 일 (Google 전용 전환)

- [ ] `/login`: 이메일·비밀번호 입력, "비밀번호를 잊었나요?", "회원가입" 링크 제거 → Google 버튼만. 버튼 아래 개인정보처리방침 링크
- [ ] `/login`: `DEMO_LOGIN_ENABLED`일 때만 데모 계정 버튼 목록 표시 (`demoAccounts`, `useDemoSignIn`)
- [ ] `/signup`, `/forgot-password`, `/auth/reset-password` 라우트와 페이지, 관련 훅·스키마(`useSignUp`, `useSignIn`, `useResendSignUpEmail`, `useRequestPasswordReset`, `useUpdatePassword`) 제거
- [ ] 온보딩: 개인정보 수집·이용 동의 체크박스(필수, "내용 보기" → `/privacy`). 저장 시 `privacy_agreed_at` 함께 저장
- [ ] `OnboardingGuard`·온보딩 페이지의 "설정 완료" 판정에 `privacy_agreed_at` 추가 (`available_hours && semester_start && privacy_agreed_at`)
- [ ] `/privacy` 개인정보처리방침 페이지 (디자인 `PcPrivacy.html`)
- [ ] 설정 화면(S-12): "이메일로 로그인", 비밀번호 변경 항목 제거 → "Google 계정으로 로그인 중"
- [ ] `errors.ts`: 이메일·비밀번호 관련 문구 정리

## Supabase·Google 설정 (백엔드)

대시보드: https://supabase.com/dashboard/project/hxnaobwybllgdcvnwimo

### 1. 돌아올 주소 등록 — Authentication → URL Configuration

| 항목 | 지금 (로컬 개발) | 배포 후 추가 |
|---|---|---|
| Site URL | `http://localhost:5173` | 운영 도메인으로 교체 |
| Redirect URLs | `http://localhost:5173/**` | `https://<운영 도메인>/**`, `https://*-<vercel-팀>.vercel.app/**` |

등록하지 않은 주소로는 Google 로그인이 돌아오지 않습니다 (NFR-SEC-4).

### 2. Google Cloud에서 OAuth 클라이언트 만들기

1. https://console.cloud.google.com 에서 프로젝트 만들기 (이름 예: hakgi-yebo)
2. **API 및 서비스 → OAuth 동의 화면**
   - 사용자 유형 **외부**, 앱 이름 "학기예보", 사용자 지원 이메일·개발자 연락처 입력
   - 범위(scope)는 기본값(`email`, `profile`, `openid`)만. 추가하지 않습니다
   - **테스트 사용자**에 팀원 Gmail 추가 (테스트 상태에서는 여기 등록된 계정만 로그인 가능)
3. **API 및 서비스 → 사용자 인증 정보 → 사용자 인증 정보 만들기 → OAuth 클라이언트 ID**
   - 애플리케이션 유형: **웹 애플리케이션**
   - 승인된 JavaScript 원본: `http://localhost:5173` (배포 후 운영 도메인 추가)
   - 승인된 리디렉션 URI: `https://hxnaobwybllgdcvnwimo.supabase.co/auth/v1/callback` ← **우리 앱 주소가 아니라 Supabase 주소**
4. 발급된 **클라이언트 ID**와 **클라이언트 보안 비밀번호**를 복사

### 3. Supabase에 Google 켜기 — Authentication → Sign In / Providers → Google

- Enable 켜기, 클라이언트 ID·보안 비밀번호 붙여 넣기, 저장
- **클라이언트 보안 비밀번호는 Supabase 대시보드에만** 넣습니다. 코드·`.env`·채팅·깃허브에 올리지 마세요.
- Email provider는 데모 로그인 때문에 **켜 둡니다** (위 "데모 로그인" 참고)

### 4. 시연 전 (10/19)

- OAuth 동의 화면에서 **앱 게시(프로덕션으로 푸시)** → 테스트 사용자가 아닌 사람도 로그인 가능. 기본 범위만 쓰면 구글 검토 없이 게시됩니다
- 운영 도메인을 Google 승인된 JavaScript 원본, Supabase Redirect URLs에 추가

### 5. 참고: 보안 점검 경고

Supabase 보안 점검의 "Leaked Password Protection Disabled" 경고는 비밀번호 로그인용 기능이고 **Pro 플랜 이상**에서만 켤 수 있습니다. Google 전용이라 무시해도 됩니다.

## 로컬 실행

```bash
pnpm install
cp .env.example .env.local   # URL·publishable 키는 팀 채널에서
pnpm dev                     # http://localhost:5173
```

## 직접 확인하는 시나리오 (명세서 9장 F-01 완료 기준, Google 전용으로 수정)

1. `/login` → Google 계정 선택 → 처음이면 온보딩으로 이동, 이름이 Google 이름으로 표시
2. 온보딩에서 동의 체크 없이 저장 → 막힘. 체크 후 저장 → 홈 이동
3. 새로고침, 브라우저 껐다 켜기 → 로그인 유지
4. 로그아웃 → `/`로 가면 `/login`으로 이동, 로그인 후 원래 화면으로 복귀
5. 데모 로그인(`newbie@hakgi.test`) → 온보딩으로 이동 / (`yebo@hakgi.test`) → 홈 바로 이동
