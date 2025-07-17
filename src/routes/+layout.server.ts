import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ( { locals } ) => {
  return {
    currentUser: locals.user || null,
    users: [] // 빈 배열로 초기화
  };
};