import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ( { locals } ) => {
  return {
    cur_user: null // Supabase 클라이언트에서 처리
  };
};