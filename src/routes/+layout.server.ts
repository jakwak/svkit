import { Guest } from '$lib'
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ( { locals } ) => {
  return {
    cur_user:  locals.user
  };
};