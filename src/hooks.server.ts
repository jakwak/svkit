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
    // 쿠키에서 토큰 가져오기
    const supabaseAuthCookie = event.cookies.get('supabase-auth');
    let token = null;
    
    if (supabaseAuthCookie) {
      try {
        const authData = JSON.parse(supabaseAuthCookie);
        token = authData.access_token;
      } catch (e) {
        // 쿠키 파싱 오류 무시
      }
    }

    // 토큰이 있으면 서버 인증 호출
    if (token) {
      const meResponse = await event.fetch(`${process.env.VITE_API_URL || 'http://localhost:8000'}/supabase/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (meResponse.ok) {
        event.locals.user = await meResponse.json()
      }
    } else {
      // 토큰이 없을 때 /quizz/ 경로에서 자동 로그인 시도
      const currentPath = event.url.pathname
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
            
            // 쿠키에 세션 저장
            const session = {
              access_token: loginData.supabase_token,
              refresh_token: loginData.supabase_refresh_token || loginData.supabase_token,
              expires_at: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24시간 후 만료
              user: loginData.user
            }
            
            event.cookies.set('supabase-auth', JSON.stringify(session), {
              httpOnly: false, // 클라이언트에서도 접근 가능하도록
              secure: process.env.NODE_ENV === 'production',
              maxAge: 60 * 60 * 24, // 24시간
              path: '/',
              sameSite: 'lax'
            });
            
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
