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
  })

  if (res.ok) {
    return {
      cur_user: username,
    }
  } else {
    return {
      cur_user: Guest,
    }
  }
}

export const actions = {
  default: async (event) => {
    // TODO log the user in
  },
} satisfies Actions
