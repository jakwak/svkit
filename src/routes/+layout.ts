import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ data }) => {
  return {
    cur_user: data.cur_user?.username,
    result: data.result
  };
};