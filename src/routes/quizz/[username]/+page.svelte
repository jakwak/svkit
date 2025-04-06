<script lang="ts">
	import { appState, wsStore } from '$lib'
  import { onMount } from 'svelte'
	import type { PageProps } from './$types';
  
	let { data }: PageProps = $props();

	onMount(() => {
		appState.login(data.cur_user)
		wsStore.connect()		
		return () => {
			wsStore.close()
			appState.logout()
		}
	})
</script>

<h1>Quiz: {appState.username}</h1>
<p>data: {JSON.stringify(data)}</p>