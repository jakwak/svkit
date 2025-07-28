import { redirect, type Handle } from '@sveltejs/kit'

// 토큰 캐싱 시스템
const tokenCache = new Map<string, { user: User; expires: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5분 캐시

// 보호된 경로 정의
const PROTECTED_ROUTES = ['/chat', '/admin', '/profile', '/settings']
const AUTO_LOGIN_ROUTES = ['/quizz/']

// 캐시 정리 함수
const cleanupExpiredCache = () => {
  const now = Date.now()
  for (const [key, value] of tokenCache.entries()) {
    if (value.expires < now) {
      tokenCache.delete(key)
    }
  }
}

// 주기적으로 캐시 정리 (5분마다)
setInterval(cleanupExpiredCache, 5 * 60 * 1000)

// 쿠키 헬퍼 함수들
const getStructuredCookie = (cookieValue: string | undefined) => {
  if (!cookieValue) return null
  try {
    return JSON.parse(cookieValue)
  } catch {
    return null
  }
}

const setStructuredCookie = (event: any, session: any) => {
  const cookieValue = JSON.stringify(session)
  console.log('🍪 쿠키 설정:', { 
    name: 'supabase-auth', 
    valueLength: cookieValue.length,
    user: session.user?.username 
  })
  
  event.cookies.set('supabase-auth', cookieValue, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24시간
    path: '/',
    sameSite: 'lax'
  })
}

const handleAuth: Handle = async ({ event, resolve }) => {
  // Chrome DevTools 관련 요청 필터링
  if (
    event.url.pathname.includes('/.well-known/') ||
    event.url.pathname.includes('com.chrome.devtools')
  ) {
    return new Response('Not Found', { status: 404 })
  }

  try {
    const currentPath = event.url.pathname
    const routeId = event.route.id
    
    // 구조화된 쿠키 파싱
    const rawAuthCookie = event.cookies.get('supabase-auth')
    console.log('🍪 쿠키 읽기:', { 
      hasCookie: !!rawAuthCookie, 
      cookieLength: rawAuthCookie?.length || 0 
    })
    
    const authCookie = getStructuredCookie(rawAuthCookie)
    let token = authCookie?.access_token || null
    let cachedUser = null
    
    if (token) {
      // 캐시에서 사용자 정보 확인
      const cacheKey = token.substring(0, 20)
      const cached = tokenCache.get(cacheKey)
      
      if (cached && cached.expires > Date.now()) {
        cachedUser = cached.user
        event.locals.user = cachedUser
      }
    }

    // 캐시된 사용자가 없고 토큰이 있는 경우에만 API 호출
    if (token && !cachedUser) {
      const meResponse = await event.fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/supabase/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (meResponse.ok) {
        const user = await meResponse.json()
        event.locals.user = user
        
        // 캐시에 저장
        const cacheKey = token.substring(0, 20)
        tokenCache.set(cacheKey, {
          user,
          expires: Date.now() + CACHE_DURATION
        })
      }
    }

    // 자동 로그인이 필요한 경로 처리 (이미 로그인된 경우 제외)
    if (!event.locals.user && AUTO_LOGIN_ROUTES.some(route => currentPath.startsWith(route))) {
      // URL에서 사용자명 추출 (더 안전한 방법)
      const urlMatch = currentPath.match(/^\/quizz\/([^\/]+)/)
      const username = urlMatch ? decodeURIComponent(urlMatch[1]) : null

      console.log('🔍 자동 로그인 시도:', { 
        currentPath, 
        urlMatch, 
        extractedUsername: username,
        pathParts: currentPath.split('/')
      })

      // 이미 로그인 시도 중인지 확인 (중복 방지)
      const isLoginAttempt = event.cookies.get('login-attempt')
      
      if (isLoginAttempt) {
        console.log('⚠️ 이미 로그인 시도 중, 홈으로 리다이렉트')
        event.cookies.delete('login-attempt', { path: '/' })
        throw redirect(303, '/')
      }

      if (username && username !== 'undefined' && username !== 'null' && username.trim() !== '') {
        console.log('📝 로그인 요청:', { username, password: '***' })
        
        // 로그인 시도 표시
        event.cookies.set('login-attempt', 'true', { 
          path: '/', 
          maxAge: 10, // 10초 후 자동 삭제
          httpOnly: false 
        })
        
        const loginResponse = await event.fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/supabase/signin-username`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              username, 
              password: import.meta.env.VITE_AUTO_LOGIN_PASSWORD || '900606Aa' 
            }),
          }
        )
        
        console.log('📡 로그인 응답 상태:', loginResponse.status)
        
        if (loginResponse.ok) {
          const loginData = await loginResponse.json()
          console.log('✅ 로그인 성공:', { 
            requestedUsername: username, 
            actualUsername: loginData.user?.username,
            userId: loginData.user?.id 
          })
          
          // 최적화된 세션 구조
          const session = {
            access_token: loginData.supabase_token,
            refresh_token: loginData.supabase_refresh_token || loginData.supabase_token,
            expires_at: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
            user: {
              username: loginData.user.username,
              id: loginData.user.id,
              score: loginData.user.score || { total_score: 0, today_gained_score: 0, today_lost_score: 0 }
            }
          }
          
          setStructuredCookie(event, session)
          event.locals.user = session.user
          
          // 로그인 시도 쿠키 삭제
          event.cookies.delete('login-attempt', { path: '/' })
          
          console.log('🍪 세션 설정 완료:', session.user.username)
          
          // 자동 로그인 성공 후 리다이렉트하지 않고 계속 진행
          console.log('✅ 자동 로그인 성공, 페이지 렌더링 계속')
          // 리다이렉트하지 않고 계속 진행
        } else {
          console.log('❌ 로그인 실패:', loginResponse.status, loginResponse.statusText)
          throw redirect(303, '/')
        }
      } else {
        console.log('⚠️ 유효하지 않은 사용자명:', username)
        throw redirect(303, '/')
      }
    }

    const user = event.locals.user

    // 보호된 경로에서만 로그인 검증
    if (!user && PROTECTED_ROUTES.some(route => routeId?.startsWith(route))) {
      throw redirect(303, '/')
    }

    const response = await resolve(event)
    return response
  } catch (error) {
    // 리다이렉트는 정상적인 동작이므로 오류로 로그하지 않음
    if (error instanceof Response && error.status === 303) {
      console.log('🔄 정상적인 리다이렉트:', error.headers.get('location'))
      throw error
    }
    
    console.error('Auth hook error:', error)
    throw redirect(303, '/')
  }
}

export const handle = handleAuth
