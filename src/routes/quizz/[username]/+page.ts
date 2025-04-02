import { appState } from '$lib'
import type { PageLoad } from './$types';

export const load: PageLoad = ({ data }) => {
  if(data.cur_user) appState.login(data.cur_user)
  return data
};                                                                       