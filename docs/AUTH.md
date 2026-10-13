# 로그인·세션 (F-01)

## 한 줄 요약

- **로그인**: "나 맞아요"를 확인받는 순간 (이메일·비밀번호 또는 Google)
- **세션**: 확인 후 받는 입장 팔찌(토큰). 브라우저에 저장돼서 새로고침·재시작해도 로그인 유지, 만료 전에 자동 갱신
- 화면은 세션 상태 하나(`loading` / `authenticated` / `unauthenticated`)만 보고 어디로 보낼지 정합니다.

## 화면과 경로

| 화면 | 경로 | 누가 들어갈 수 있나 | 명세서 |
|---|---|---|---|
| 로그인 (이메일·Google) | `/login` | 로그아웃 상태만 | S-01, FR-01-4·5 |
| 회원가입 + 인증 메일 안내·재발송 | `/signup` | 로그아웃 상태만 | S-02·03, FR-01-1·2·3 |
| 비밀번호 찾기 | `/forgot-password` | 로그아웃 상태만 | S-04, FR-01-8 |
| 새 비밀번호 저장 | `/auth/reset-password` | 메일 링크로 진입 | S-05 |
| 인증 처리 (메일·Google 복귀) | `/auth/callback` | 메일·Google 링크로 진입 | S-06 |
| 홈 (임시, 세션 확인용) | `/` | 로그인 상태만 | S-08 자리 |

## 세션이 동작하는 방식

```
supabase-js  ── 세션을 localStorage에 저장, 만료 전 자동 갱신, PKCE 방식
   │  onAuthStateChange 이벤트: INITIAL_SESSION / SIGNED_IN / TOKEN_REFRESHED / SIGNED_OUT / PASSWORD_RECOVERY
   ▼
AuthProvider  →  useAuth() = { status, session, user, isRecovery }
   │
   ├─ ProtectedRoute   : loading이면 스피너, 로그아웃 상태면 /login 으로 (원래 가려던 경로 기억, FR-01-7)
   └─ PublicOnlyRoute  : 로그인되면 원래 경로 또는 / 로 이동
```

- 로그인 성공 후 이동은 각 페이지가 아니라 `PublicOnlyRoute`가 맡습니다. 세션 상태 하나로만 화면이 결정돼서 흐름이 꼬이지 않습니다.
- 로그아웃(SIGNED_OUT)하면 TanStack Query 캐시를 전부 비워서 다른 계정 데이터가 화면에 남지 않습니다 (FR-01-9).
- 가입하면 DB 트리거가 `profiles` 행을 자동으로 만듭니다 (FR-01-10). 이메일 가입은 `options.data.display_name`, Google 가입은 Google 프로필 이름을 씁니다.
- PKCE 방식이라 **인증·재설정 메일 링크는 요청한 브라우저에서 열어야** 합니다. (휴대폰에서 가입하고 PC에서 메일을 열면 실패 → 안내 문구 표시)
- 로그인 실패 시 "이메일 또는 비밀번호가 맞지 않습니다"만 보여 주고 계정 존재 여부는 드러내지 않습니다 (FR-01-4). 에러 문구는 `src/features/auth/errors.ts`.

## 아직 남은 F-01 작업 (프론트 A)

- [ ] **온보딩 가드 (FR-01-11)**: `profiles.available_hours` 또는 `semester_start`가 null이면 `/onboarding`으로 보내기. 데모 계정 `newbie@hakgi.test`로 테스트
- [ ] **온보딩 화면 (S-07)**, **설정 화면 (S-12, FR-01-12)**
- [ ] 개인정보처리방침 페이지와 회원가입 동의 문구 연결 (NFR-LEGAL-1)

## Supabase 대시보드 설정 (백엔드)

대시보드: https://supabase.com/dashboard/project/hxnaobwybllgdcvnwimo

### 1. 돌아올 주소 등록 — Authentication → URL Configuration

| 항목 | 지금 (로컬 개발) | 배포 후 추가 |
|---|---|---|
| Site URL | `http://localhost:5173` | 운영 도메인으로 교체 |
| Redirect URLs | `http://localhost:5173/**` | `https://<운영 도메인>/**`, `https://*-<vercel-팀>.vercel.app/**` |

등록하지 않은 주소로는 인증 메일·Google 로그인이 돌아오지 않습니다 (NFR-SEC-4).

### 2. 이메일 인증 켜기 — Authentication → Sign In / Providers → Email

- **Confirm email: 켜기** (인증 전에는 로그인 불가, FR-01-2)
- Minimum password length: **8** (명세서 FR-01-1과 맞춤)

### 3. 메일 발송

- Supabase 기본 메일은 **조직 팀원으로 등록된 이메일 주소에만** 보내지고, 시간당 발송량도 아주 적습니다. 개발 중에는 팀원 이메일로 테스트하세요.
- 데모 계정(`*@hakgi.test`)은 이미 인증된 상태라 메일 없이 바로 로그인됩니다. 비밀번호 `hakgi1234`
- 실제 사용자를 받기 전(시연 전)에 Authentication → Emails → SMTP Settings 에서 외부 메일 서비스(예: Resend)를 연결해야 합니다.
- 메일 문구 한국어로 바꾸기 — Authentication → Emails → Templates

**Confirm signup**
```
제목: [학기예보] 이메일 인증을 완료해 주세요
본문:
<h2>학기예보 가입을 환영해요</h2>
<p>아래 버튼을 누르면 가입이 끝나고 바로 로그인됩니다.</p>
<p><a href="{{ .ConfirmationURL }}">이메일 인증하기</a></p>
<p>가입을 진행한 브라우저에서 열어 주세요. 본인이 요청하지 않았다면 이 메일을 무시하세요.</p>
```

**Reset password**
```
제목: [학기예보] 비밀번호 재설정 안내
본문:
<h2>비밀번호를 다시 설정하세요</h2>
<p>아래 버튼을 눌러 새 비밀번호를 저장하세요.</p>
<p><a href="{{ .ConfirmationURL }}">비밀번호 재설정하기</a></p>
<p>요청한 브라우저에서 열어 주세요. 본인이 요청하지 않았다면 이 메일을 무시하세요.</p>
```

### 4. Google 로그인 연결 (FR-01-5)

1. https://console.cloud.google.com 에서 프로젝트 만들기 (이름 예: hakgi-yebo)
2. **API 및 서비스 → OAuth 동의 화면**: 사용자 유형 "외부", 앱 이름 "학기예보", 지원 이메일 입력. 테스트 중에는 "테스트 사용자"에 팀원 Gmail 추가
3. **API 및 서비스 → 사용자 인증 정보 → 사용자 인증 정보 만들기 → OAuth 클라이언트 ID**
   - 애플리케이션 유형: **웹 애플리케이션**
   - 승인된 JavaScript 원본: `http://localhost:5173`
   - 승인된 리디렉션 URI: `https://hxnaobwybllgdcvnwimo.supabase.co/auth/v1/callback`
4. 발급된 **클라이언트 ID**와 **클라이언트 보안 비밀번호**를 Supabase → Authentication → Sign In / Providers → **Google**에 붙여 넣고 켜기
5. 로컬에서 `/login` → "Google 계정으로 계속하기" → 돌아와서 홈에 이름이 보이면 성공

클라이언트 보안 비밀번호는 Supabase 대시보드에만 넣고, 코드·채팅·깃허브에는 절대 올리지 마세요.

### 5. 참고: 유출 비밀번호 차단

Supabase 보안 점검에 "Leaked Password Protection Disabled" 경고가 남아 있는데, 이 기능은 **Pro 플랜 이상**에서만 켤 수 있습니다. 무료 플랜에서는 무시해도 됩니다.

## 로컬 실행

```bash
pnpm install
cp .env.example .env.local   # URL·publishable 키는 팀 채널에서
pnpm dev                     # http://localhost:5173
```

## 직접 확인하는 시나리오 (명세서 9장 F-01 완료 기준)

1. `/signup`에서 팀원 이메일로 가입 → 인증 메일 링크 클릭 → 홈으로 이동, 이름 표시
2. 새로고침, 브라우저 껐다 켜기 → 로그인 유지
3. 로그아웃 → `/`로 가면 `/login`으로 이동, 로그인 후 원래 화면으로 복귀
4. `/forgot-password` → 메일 링크 → 새 비밀번호 저장 → 홈 이동
5. Google 로그인 → 홈에 Google 이름 표시
