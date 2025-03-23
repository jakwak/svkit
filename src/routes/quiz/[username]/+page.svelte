<script lang="ts">
	import type { PageProps } from './$types';
  
	let { data }: PageProps = $props();
</script>

<h1>Quiz: {data.user?.username}</h1>
<p>data: {JSON.stringify(data)}</p>