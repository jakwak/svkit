import { redirect, type Handle } from "@sveltejs/kit"

const handleAuth: Handle = async ({ event, resolve }) => {
  const res = await event.fetch('http://localhost:8000/me');

  if (res.ok) {
    const user = await res.json();
    event.locals.user = user;
  } else {
    event.locals.user = null;
  }

  const user = event.locals.user;
  const routeId = event.route.id;
  const protectedRoutes = ['/chat', '/profile', '/settings'];  
  const adminRoutes = ['/admin'];

  // 로그인이 필요한 경로인데 로그인이 안 되어 있으면 로그인 페이지로 리다이렉트
  if (!user && protectedRoutes.some(route => routeId?.startsWith(route))) {
    throw redirect(303, '/'); // 303 See Other 리다이렉트
  }

  // 관리자 경로인데 관리자가 아니면 접근 금지 페이지 또는 홈으로 리다이렉트 (user 객체에 role 같은 속성이 있다고 가정)
  // if (user && !user.isAdmin && adminRoutes.some(route => routeId?.startsWith(route))) {
  //     throw redirect(303, '/unauthorized'); // 또는 throw error(403, 'Forbidden');
  // }

  const response = await resolve(event)
  return response
}

export const handle = handleAuth;