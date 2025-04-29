import { redirect } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ locals}) => {
  return {
    cur_user: locals.user
  }  
}

export const actions = {
  default: async (event) => {
    // TODO log the user in
  },
} satisfies Actions
