import { redirect } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { Guest } from '$lib'

export const load: PageServerLoad = async ({ params, fetch }) => {
  await fetch('/api/logout', { method: 'POST' })
  
  const username = params.username  
  const res = await fetch(`/api/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password: '900606Aa' }),
  }).then(res => res.json());

  if (!res.username) {
    throw redirect(303, '/')
  }

  return {
    cur_user: res.username,
    cur_user_id: res.id
  }

  // if (res.ok) {
  //   const user = await res.json()
  //   return {
  //     cur_user: username,
  //     cur_user_id: user.id
  //   }
  // } else {
  //   return {
  //     cur_user: Guest,
  //   }
  // }
}

export const actions = {
  default: async (event) => {
    // TODO log the user in
  },
} satisfies Actions
