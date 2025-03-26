import { redirect } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
  const username = params.username
  const res = await fetch(
    `/api/login`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password: '900606Aa' }),
    }
  )
  
  if (res.ok) {
    redirect(303, '/')
    // return {
    //   cur_user: username,
    //   result: 'success',
    // };
  } else {
    return {
      cur_user: "Guest",
      result: 'error',
    };
  }
};


export const actions = {
	default: async (event) => {
		// TODO log the user in
	}
} satisfies Actions;