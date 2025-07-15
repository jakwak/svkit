import { redirect, type Handle } from '@sveltejs/kit'

const handleAuth: Handle = async ({ event, resolve }) => {
  // Chrome DevTools 관련 요청 필터링
  if (
    event.url.pathname.includes('/.well-known/') ||
    event.url.pathname.includes('com.chrome.devtools')
  ) {
    return new Response('Not Found', { status: 404 })
  }

  try {
    // Supabase 인증을 사용하여 현재 사용자 확인
    const meResponse = await event.fetch(`${process.env.VITE_API_URL || 'http://localhost:8000'}/supabase/me`)

    if (meResponse.ok) {
      event.locals.user = await meResponse.json()
    } else {
      const currentPath = event.url.pathname

      // /quizz/ 경로에서 자동 로그인 시도
      if (currentPath.startsWith('/quizz/')) {
        // URL에서 username 추출
        const pathParts = currentPath.split('/')
        const username = decodeURIComponent(pathParts[2]) // /quizz/username 형식에서 username 추출하고 디코딩

        if (username) {
          const loginResponse = await event.fetch(
            `${process.env.VITE_API_URL || 'http://localhost:8000'}/supabase/signin-username`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username, password: '900606Aa' }),
            }
          )

          if (loginResponse.ok) {
            const loginData = await loginResponse.json()
            event.locals.user = loginData.user
          } else {
            throw redirect(303, '/')
          }
        }
      }
    }

    const user = event.locals.user
    const routeId = event.route.id
    const protectedRoutes = ['/chat', '/profile', '/settings', '/game']
    const adminRoutes = ['/admin']

    // 로그인이 필요한 경로인데 로그인이 안 되어 있으면 로그인 페이지로 리다이렉트
    if (!user && protectedRoutes.some((route) => routeId?.startsWith(route))) {
      throw redirect(303, '/') // 303 See Other 리다이렉트
    }

    // 관리자 경로인데 관리자가 아니면 접근 금지 페이지 또는 홈으로 리다이렉트 (user 객체에 role 같은 속성이 있다고 가정)
    // if (user && !user.isAdmin && adminRoutes.some(route => routeId?.startsWith(route))) {
    //     throw redirect(303, '/unauthorized'); // 또는 throw error(403, 'Forbidden');
    // }

    const response = await resolve(event)
    return response
  } catch (error) {
    console.error('Auth hook error:', error)
    // 오류 발생 시 홈으로 리다이렉트
    throw redirect(303, '/')
  }
}

export const handle = handleAuth
