<script lang="ts">
	import { appState } from '$lib'
	import type { PageProps } from './$types';
  
	let { data }: PageProps = $props();

	data.cur_user ? appState.login(data.cur_user) : undefined
</script>

<h1>Quiz: {appState.username}</h1>
<p>data: {JSON.stringify(data)}</p>