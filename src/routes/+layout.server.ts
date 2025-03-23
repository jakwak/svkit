import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ( { cookies, fetch} ) => {
	const access_token = cookies.get('access_token');

  if (!access_token) {
    return {
      cur_user: null, result: "no token"
    };
  } 
  
  const res = await fetch('/api/users/me', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (res.status === 200) {
    const data = await res.json();
    return {
      cur_user: {username: data.username}, result: "valid token"
    };
  } else {
    return {
      cur_user: null, result: "invalid token"
    };
  }
};