import { appState } from '$lib/app_state.svelte'
import type { PageLoad } from './$types';

export const load: PageLoad = ({ data }) => {
  data.cur_user ? appState.login(data.cur_user) : undefined
};                                                                       