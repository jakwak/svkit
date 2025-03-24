<script lang="ts">
	import type { PageProps } from './$types';
  
	let { data }: PageProps = $props();
</script>

<h1>Home ===> {data.cur_user}</h1>
<p>data: {JSON.stringify(data)}</p>