import type { PageLoad } from './$types';

export const load: PageLoad = ({ params, data }) => {
  return {
    username: params.username, cur_user: data.cur_user, users: data.users
  };
};                                                                       