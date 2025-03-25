import { appState } from '$lib/app_state.svelte'
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ data }) => {
  if(data.cur_user) appState.login(data.cur_user)
  return data
};                                                                       