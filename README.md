# svkit

SvelteKit 기반 프론트엔드 애플리케이션

## 환경 변수 설정

프로젝트를 실행하기 전에 환경 변수를 설정해야 합니다:

1. `env.example` 파일을 `.env`로 복사:
```bash
cp env.example .env
```

2. `.env` 파일에서 다음 값들을 실제 값으로 수정:
   - `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase Anonymous Key
   - `VITE_SUPABASE_SERVICE_KEY`: Supabase Service Role Key
   - `VITE_API_URL`: FastAPI 백엔드 서버 URL
   - `VITE_ADMIN_NAME`: 관리자 사용자명 (기본값: 선생님)
   - `VITE_ADMIN_EMAIL`: 관리자 이메일 (기본값: teacher@gxg.kro.kr)
   - `VITE_DEBUG`: 디버그 모드 (true/false)

## 개발 서버 실행

```bash
npm install
npm run dev
```

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
