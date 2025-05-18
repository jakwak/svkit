import { redirect, type Handle } from '@sveltejs/kit'

const handleAuth: Handle = async ({ event, resolve }) => {
  const res = await event.fetch('http://localhost:8000/me')

  if (res.ok) {
    event.locals.user = await res.json()
  } else {
    const currentPath = event.url.pathname

    if (currentPath.startsWith('/quizz/')) {
      const username = event.params.username
      const res = await fetch(`http://localhost:8000/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password: '900606Aa' }),
      })

      if (res.ok) {
        event.locals.user = await res.json()
      } else {
        throw redirect(303, '/')
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
}

export const handle = handleAuth
