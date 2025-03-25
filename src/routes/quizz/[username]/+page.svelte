<script lang="ts">
  import { appState } from '$lib/app_state.svelte'
	import type { PageProps } from './$types';
  
	let { data }: PageProps = $props();
</script>

<h1>Quiz: {appState.username}</h1>
<p>data: {JSON.stringify(data)}</p>