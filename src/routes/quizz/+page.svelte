<script lang="ts">
	import type { PageProps } from './$types';
	import { appState } from '$lib'
	
	let { data }: PageProps = $props();
</script>

<h1>Quiz Page - {appState.username}</h1>
<p>data: {JSON.stringify(data)}</p>