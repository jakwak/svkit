import type { PageServerLoad, Actions } from './$types';
import { NODE_ENV } from '$env/static/private';

export const load: PageServerLoad = async ({ params, fetch, cookies }) => {
  cookies.delete('access_token', {path: '/'});

  const username = params.username
  const { access_token } = await fetch(
    `/api/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password: '900606Aa' }),
    }
  ).then((res) => res.json())
  
  if (!access_token) {
    return {
      user: null,
    };
  } else {
    // 쿠키 설정
    cookies.set('access_token', access_token, {
      path: '/', // 쿠키를 전체 사이트에서 사용
      httpOnly: true, // 클라이언트 측 JavaScript에서 접근 불가
      secure: NODE_ENV === 'production', // HTTPS에서만 사용
      maxAge: 60 * 60 * 24 * 7, // 7일 동안 유효
      sameSite: 'strict'
    });
    return {
      user: {username,},
    };
  }
};


export const actions = {
	default: async (event) => {
		// TODO log the user in
	}
} satisfies Actions;