import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types';
import { appStore } from '$lib';

export const load: PageLoad = async ({ data }) => {
  // if (appStore.username === 'Guest')
  //   throw redirect(303, '/')

  return {
    data
  };
}