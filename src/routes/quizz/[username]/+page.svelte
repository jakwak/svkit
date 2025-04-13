<script lang="ts">
	import { appState, wsStore } from '$lib'
  import { onMount } from 'svelte'
	import type { PageProps } from './$types';
  
	let { data }: PageProps = $props();

	onMount(() => {
		appState.login(data.cur_user)
		return () => {
			appState.logout()
		}
	})

</script>