import { Guest } from '$lib'
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ( { fetch, url } ) => {
  const cur_user = await fetch('/api/me').then(res => res.json());
  
  if (cur_user.id) return {cur_user}

  return {
    cur_user:  Guest
  };
};