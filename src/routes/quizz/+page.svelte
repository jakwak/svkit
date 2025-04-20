<script lang="ts">
	import type { PageProps } from './$types';
	import { appStore } from '$lib'
	
	let { data }: PageProps = $props();
</script>

<h1>Quiz Page - {appStore.username}</h1>
<p>data: {JSON.stringify(data)}</p>